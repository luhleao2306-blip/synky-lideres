import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const config = resolve(root, "dist/server/wrangler.json");
const persist = process.env.SYNKY_LOCAL_DB_PERSIST || resolve(root, ".wrangler/state");
const wrangler = resolve(root, "node_modules/wrangler/bin/wrangler.js");

function run(args) {
  const result = spawnSync(process.execPath, [wrangler, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Wrangler failed").trim());
  }
  return result.stdout;
}

if (!existsSync(config)) {
  process.stdout.write("Building the local Worker first...\n");
  const build = spawnSync("npm", ["run", "build"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (build.status !== 0) process.exit(build.status || 1);
}

const base = ["d1", "execute", "DB", "--local", "--config", config, "--persist-to", persist];
function existingTables() {
  const output = run([...base, "--command", "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('members','mirror_action_checkins') ORDER BY name", "--json"]);
  return new Set(JSON.parse(output)[0].results.map(row => row.name));
}

const tables = existingTables();
if (tables.has("members") && tables.has("mirror_action_checkins")) {
  process.stdout.write("Local D1 database is already initialized.\n");
  process.exit(0);
}
if (tables.size > 0) {
  throw new Error("Local D1 database has only part of the schema. Restore it or apply the remaining migrations before retrying.");
}

const migrations = readdirSync(resolve(root, "drizzle")).filter(name => name.endsWith(".sql")).sort();
for (const name of migrations) {
  run([...base, "--file", resolve(root, "drizzle", name), "--yes", "--json"]);
  process.stdout.write(`Applied ${name}\n`);
}
const completed = existingTables();
if (!completed.has("members") || !completed.has("mirror_action_checkins")) {
  throw new Error("Local D1 schema verification failed.");
}
process.stdout.write("Local D1 database is ready.\n");
