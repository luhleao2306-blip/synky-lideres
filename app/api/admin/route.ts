import { env } from "cloudflare:workers";
import { getAppUser } from "../../guest-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { ensureAuthSchema, expireIso, hashToken, newOpaqueToken, normalizeEmail, sameOrigin, validEmail } from "@/lib/cloudflare-auth";

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
    await ensureAuthSchema();
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
    const [registrationInvites, authEvents, learningProgress] = await Promise.all([
      all("SELECT email,company_name AS companyName,created_at AS createdAt,expires_at AS expiresAt,used_at AS usedAt FROM synky_registration_invites ORDER BY created_at DESC LIMIT 50"),
      all("SELECT event_type AS eventType,email,created_at AS eventAt FROM synky_auth_events ORDER BY created_at DESC LIMIT 100"),
      all("SELECT m.name,m.email,c.name AS companyName,p.studied_lessons AS studiedLessons,p.total_lessons AS totalLessons,p.final_grade AS finalGrade,p.course_progress AS courseProgress,p.updated_at AS updatedAt FROM synky_academy_progress p JOIN members m ON m.id=p.member_id JOIN companies c ON c.id=p.company_id ORDER BY p.updated_at DESC LIMIT 200"),
    ]);
    return Response.json({ totals, companies, clients, events, registrationInvites, authEvents, learningProgress, total, offset, pageSize: 30, generatedAt: new Date().toISOString(), capabilities: { feedback: "O sistema gera devolutivas a partir das escolhas nas experiências; não armazena feedback livre enviado por clientes.", courses: "O painel sincroniza marcos de conclusão e notas reportados pelo progresso de estudos de cada conta. Respostas individuais de atividades não são expostas aqui.", logs: "A trilha inclui eventos de entrada, falhas, convites e cadastros." } }, { headers });
  } catch (error) {
    console.error("admin dashboard failed", error);
    return Response.json({ error: "Não foi possível carregar os dados administrativos." }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  const access = await getAppUser(request, false);
  const user = access.user;
  const headers = { "Cache-Control": "private, no-store", ...(access.cookie ? { "Set-Cookie": access.cookie } : {}) };
  if (!isPlatformAdmin(user)) return Response.json({ error: "Acesso restrito à administração da plataforma." }, { status: user ? 403 : 401, headers });
  if (!env.DB) return Response.json({ error: "Banco de dados indisponível." }, { status: 503, headers });
  if (!sameOrigin(request)) return Response.json({ error: "Solicitação inválida." }, { status: 403, headers });
  try {
    await ensureAuthSchema();
    const input = await request.json() as { email?: unknown; companyName?: unknown };
    const email = normalizeEmail(input.email);
    const companyName = typeof input.companyName === "string" ? input.companyName.trim().slice(0, 120) : "";
    if (!validEmail(email) || companyName.length < 2) return Response.json({ error: "Informe um e-mail válido e o nome da empresa." }, { status: 400, headers });
    const existing = await env.DB.prepare("SELECT id FROM synky_auth_users WHERE email=? LIMIT 1").bind(email).first<{ id: string }>();
    if (existing) return Response.json({ error: "Este e-mail já possui uma conta." }, { status: 409, headers });
    const token = newOpaqueToken();
    const now = new Date().toISOString();
    const expiresAt = expireIso(7 * 24 * 60);
    await env.DB.prepare("INSERT INTO synky_registration_invites(token_hash,email,company_name,created_by,created_at,expires_at) VALUES(?,?,?,?,?,?)")
      .bind(await hashToken(token), email, companyName, user?.email ?? "", now, expiresAt).run();
    await env.DB.prepare("INSERT INTO synky_auth_events(id,event_type,email,created_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), "Convite de cadastro criado", email, now).run();
    return Response.json({ ok: true, invite: { email, companyName, expiresAt, url: `${new URL(request.url).origin}/cadastro?token=${encodeURIComponent(token)}` } }, { status: 201, headers });
  } catch (error) {
    console.error("admin invitation creation failed", error);
    return Response.json({ error: "Não foi possível gerar o convite." }, { status: 500, headers });
  }
}
