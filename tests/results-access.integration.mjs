import assert from "node:assert/strict";
import { test } from "node:test";

const base = process.env.TEST_BASE_URL || "http://localhost:5175";

class Visitor {
  cookie = "";
  async get(path) {
    const response = await fetch(base + path, { headers: this.cookie ? { cookie: this.cookie } : {} });
    const issued = response.headers.get("set-cookie");
    if (issued) this.cookie = issued.split(";")[0];
    return { status: response.status, body: await response.json() };
  }
  async post(action, payload = {}) {
    const response = await fetch(base + "/api/app", { method: "POST", headers: { cookie: this.cookie, "content-type": "application/json" }, body: JSON.stringify({ action, ...payload }) });
    return { status: response.status, body: await response.json() };
  }
}

test("resultados individuais não atravessam pessoas ou espaços", async () => {
  const first = new Visitor(), second = new Visitor();
  const firstApp = await first.get("/api/app"), secondApp = await second.get("/api/app");
  assert.equal(firstApp.status, 200);
  assert.equal(secondApp.status, 200);
  const firstId = firstApp.body.membership.id;
  const secondId = secondApp.body.membership.id;
  assert.notEqual(firstId, secondId);
  const decision = await first.post("complete_decision", { scenarioId: "erro-entrega", choices: [0, 1, 2] });
  assert.equal(decision.status, 200, JSON.stringify(decision.body));
  const own = await first.get(`/api/results?member=${firstId}`);
  assert.equal(own.status, 200);
  assert.equal(own.body.subject.id, firstId);
  assert.equal(own.body.decisions.length, 1);
  assert.equal(own.body.decisions[0].feedback.length, 3);
  assert.equal((await second.get(`/api/results?member=${firstId}`)).status, 403);
  assert.equal((await first.get(`/api/results?member=${secondId}`)).status, 403);
  assert.equal((await second.get(`/api/results?company=${firstApp.body.membership.companyId}`)).status, 404);
  assert.equal((await second.get("/api/results?scope=directory")).status, 403);
  const secondOwn = await second.get(`/api/results?member=${secondId}`);
  assert.equal(secondOwn.status, 200);
  assert.equal(secondOwn.body.decisions.length, 0);
  const invite = await first.post("invite_member", { email: `result-${crypto.randomUUID().slice(0, 8)}@example.com`, role: "participant" });
  assert.equal(invite.status, 200);
  const token = new URL(invite.body.link).searchParams.get("invite");
  const joined = await second.post("join", { token });
  assert.equal(joined.status, 200);
  assert.equal((await second.get(`/api/results?member=${firstId}`)).status, 403);
});

test("respostas de colegas só aparecem como médias após o mínimo", async () => {
  const leader = new Visitor();
  const app = await leader.get("/api/app");
  const cycle = await leader.post("create_mirror", { scores: [3, 3, 3, 3, 3, 3] });
  assert.equal(cycle.status, 200);
  const result = await leader.get(`/api/results?member=${app.body.membership.id}`);
  assert.equal(result.status, 200);
  assert.equal(result.body.mirrors[0].teamScores, null);
  assert.equal(JSON.stringify(result.body).includes("respondentId"), false);
});
