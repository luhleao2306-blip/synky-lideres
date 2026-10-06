import { env } from "cloudflare:workers";
import { getAppUser } from "../../guest-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";

type Row = Record<string, unknown>;
const all = async (sql: string, ...values: unknown[]) => (await env.DB!.prepare(sql).bind(...values).all<Row>()).results;
const one = async (sql: string) => env.DB!.prepare(sql).first<Row>();

export async function GET(request: Request) {
  const access = await getAppUser(request, false);
  const user = access.user;
  const headers = { "Cache-Control": "private, no-store", ...(access.cookie ? { "Set-Cookie": access.cookie } : {}) };
  if (!isPlatformAdmin(user)) return Response.json({ error: "Acesso restrito à administração da plataforma." }, { status: user ? 403 : 401, headers });
  if (!env.DB) return Response.json({ error: "Banco de dados indisponível." }, { status: 503, headers });

  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
    const offset = Math.min(100000, Math.max(0, Number.parseInt(url.searchParams.get("offset") || "0", 10) || 0));
    const pattern = `%${q}%`;
    const filter = q ? "WHERE c.name LIKE ? OR m.name LIKE ? OR m.email LIKE ?" : "";
    const values = q ? [pattern, pattern, pattern] : [];
    const [totals, companies, clients, events] = await Promise.all([
      one("SELECT (SELECT COUNT(*) FROM companies) AS spaces, (SELECT COUNT(*) FROM companies WHERE kind='organization') AS organizations, (SELECT COUNT(*) FROM members) AS people, (SELECT COUNT(*) FROM invites WHERE used_at IS NULL AND datetime(expires_at) > datetime('now')) AS pendingInvites"),
      all("SELECT c.id,c.name,c.kind,c.created_at AS createdAt,COUNT(m.id) AS people FROM companies c LEFT JOIN members m ON m.company_id=c.id GROUP BY c.id ORDER BY c.created_at DESC LIMIT 12"),
      all(`SELECT m.id,m.name,m.email,m.role,c.id AS companyId,c.name AS companyName,c.kind,c.created_at AS companyCreatedAt
        FROM members m JOIN companies c ON c.id=m.company_id ${filter}
        ORDER BY c.created_at DESC,m.name COLLATE NOCASE LIMIT 30 OFFSET ?`, ...values, offset),
      all(`SELECT eventType,eventAt,person,company FROM (
        SELECT 'Experiência concluída' AS eventType,d.created_at AS eventAt,m.name AS person,c.name AS company FROM decision_runs d JOIN members m ON m.id=d.member_id JOIN companies c ON c.id=d.company_id
        UNION ALL SELECT 'Ciclo do Espelho criado',mc.created_at,m.name,c.name FROM mirror_cycles mc JOIN members m ON m.id=mc.leader_id JOIN companies c ON c.id=mc.company_id
        UNION ALL SELECT 'Reflexão de carreira registrada',cr.created_at,m.name,c.name FROM career_runs cr JOIN members m ON m.id=cr.member_id JOIN companies c ON c.id=cr.company_id
        UNION ALL SELECT 'Registro de energia criado',ee.created_at,m.name,c.name FROM energy_entries ee JOIN members m ON m.id=ee.member_id JOIN companies c ON c.id=ee.company_id
        UNION ALL SELECT 'Termômetro iniciado',tt.created_at,m.name,c.name FROM thermometer_tracks tt JOIN members m ON m.id=tt.leader_id JOIN companies c ON c.id=tt.company_id
      ) ORDER BY eventAt DESC LIMIT 30`),
    ]);
    const total = Number((await one(`SELECT COUNT(*) AS total FROM members m JOIN companies c ON c.id=m.company_id ${filter}`))?.total || 0);
    return Response.json({ totals, companies, clients, events, total, offset, pageSize: 30, generatedAt: new Date().toISOString(), capabilities: { feedback: "O sistema gera devolutivas a partir das escolhas nas experiências; não armazena feedback livre enviado por clientes.", courses: "O progresso da academia é salvo no navegador de cada pessoa e não está disponível no banco central.", logs: "Não há trilha de auditoria ou logs de acesso persistidos nesta versão." } }, { headers });
  } catch (error) {
    console.error("admin dashboard failed", error);
    return Response.json({ error: "Não foi possível carregar os dados administrativos." }, { status: 500, headers });
  }
}
