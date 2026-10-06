import { env } from "cloudflare:workers";
import { getAppUser } from "../../guest-auth";
import { communicationTopics, decisionFeedback, mirrorQuestions } from "../../../lib/experiences";
import { calculateMirrorAggregate } from "../../../lib/results";
import { careerPriorities, summarizeEnergy } from "../../../lib/additional-experiences";
import { isPlatformAdmin } from "../../../lib/platform-admin";

type Row = Record<string, unknown>;
const db = () => { if (!env.DB) throw new Error("Banco de dados indisponível"); return env.DB; };
const one = async (sql: string, ...values: unknown[]) => db().prepare(sql).bind(...values).first<Row>();
const all = async (sql: string, ...values: unknown[]) => (await db().prepare(sql).bind(...values).all<Row>()).results;
const parse = (value: unknown) => { try { return JSON.parse(String(value)); } catch { return null; } };
const date = () => new Date().toISOString();

export async function GET(request: Request) {
  try {
    const access = await getAppUser(request, true);
    const user = access.user;
    if (!user) return Response.json({ error: "Acesso não disponível." }, { status: 401 });
    const respond = (body: unknown, status = 200) => Response.json(body, {
      status,
      headers: { "Cache-Control": "private, no-store", ...(access.cookie ? { "Set-Cookie": access.cookie } : {}) },
    });
    const url = new URL(request.url);
    const isMaster = isPlatformAdmin(user);

    if (url.searchParams.get("scope") === "directory") {
      if (!isMaster) return respond({ error: "Apenas o administrador master pode consultar todos os resultados." }, 403);
      const search = (url.searchParams.get("q") || "").trim().slice(0, 80);
      const offset = Math.max(0, Math.min(100000, Number.parseInt(url.searchParams.get("offset") || "0", 10) || 0));
      const pattern = `%${search}%`;
      const where = search ? "WHERE m.name LIKE ? OR m.email LIKE ? OR c.name LIKE ?" : "";
      const values = search ? [pattern, pattern, pattern] : [];
      const total = Number((await one(`SELECT COUNT(*) AS total FROM members m JOIN companies c ON c.id=m.company_id ${where}`, ...values))?.total || 0);
      const people = await all(`SELECT m.id,m.name,m.email,m.role,m.company_id AS companyId,c.name AS companyName,c.kind
        FROM members m JOIN companies c ON c.id=m.company_id ${where}
        ORDER BY c.name COLLATE NOCASE,m.name COLLATE NOCASE,m.id LIMIT 30 OFFSET ?`, ...values, offset);
      return respond({ isMaster: true, total, offset, pageSize: 30, people });
    }

    const requestedId = url.searchParams.get("member");
    const companyId = url.searchParams.get("company");
    const subject = requestedId
      ? await one("SELECT m.id,m.name,m.email,m.role,m.user_id AS userId,m.company_id AS companyId,c.name AS companyName,c.kind FROM members m JOIN companies c ON c.id=m.company_id WHERE m.id=?", requestedId)
      : companyId
        ? await one("SELECT m.id,m.name,m.email,m.role,m.user_id AS userId,m.company_id AS companyId,c.name AS companyName,c.kind FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? AND m.company_id=?", user.userId, companyId)
        : await one("SELECT m.id,m.name,m.email,m.role,m.user_id AS userId,m.company_id AS companyId,c.name AS companyName,c.kind FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? ORDER BY m.rowid LIMIT 1", user.userId);
    if (!subject) return respond({ error: "Pessoa não encontrada." }, 404);
    if (!isMaster && subject.userId !== user.userId) return respond({ error: "Você só pode consultar seus próprios resultados." }, 403);
    const memberId = String(subject.id), organizationId = String(subject.companyId);

    const cycleRows = await all("SELECT id,status,self_scores,action,created_at,closed_at FROM mirror_cycles WHERE company_id=? AND leader_id=? ORDER BY created_at DESC", organizationId, memberId);
    const mirrors = await Promise.all(cycleRows.map(async cycle => {
      const responses = await all("SELECT scores FROM mirror_responses WHERE cycle_id=?", cycle.id);
      const scores = responses.map(response => parse(response.scores)).filter(Array.isArray) as (number | null)[][];
      const checkins = await all("SELECT id,action,note,entry_date AS entryDate,created_at AS createdAt FROM mirror_action_checkins WHERE cycle_id=? ORDER BY entry_date DESC", cycle.id);
      return { id: cycle.id, status: cycle.status, createdAt: cycle.created_at, closedAt: cycle.closed_at, selfScores: parse(cycle.self_scores), responseCount: scores.length, teamScores: calculateMirrorAggregate(String(cycle.status), scores, mirrorQuestions.length), action: cycle.action, checkins };
    }));
    const decisionRows = await all("SELECT id,scenario_id AS scenarioId,choices,created_at AS createdAt FROM decision_runs WHERE company_id=? AND member_id=? ORDER BY created_at DESC", organizationId, memberId);
    const decisions = decisionRows.map(run => {
      const choices = parse(run.choices);
      return { id: run.id, scenarioId: run.scenarioId, choices, createdAt: run.createdAt, feedback: decisionFeedback(String(run.scenarioId), choices) };
    });
    const pairRows = await all("SELECT p.id,p.status,p.agreement,p.created_at AS createdAt,p.creator_id AS creatorId,p.partner_id AS partnerId,creator.name AS creatorName,partner.name AS partnerName,p.partner_email AS partnerEmail FROM communication_pairs p JOIN members creator ON creator.id=p.creator_id LEFT JOIN members partner ON partner.id=p.partner_id WHERE p.company_id=? AND p.status!='removed' AND (p.creator_id=? OR p.partner_id=?) ORDER BY p.created_at DESC", organizationId, memberId, memberId);
    const communication = await Promise.all(pairRows.map(async pair => {
      const responses = await all("SELECT member_id AS memberId,preferences,consent FROM communication_responses WHERE pair_id=?", pair.id);
      const ready = pair.status === "ready" && responses.filter(response => Number(response.consent) === 1).length === 2;
      return { id: pair.id, status: pair.status, createdAt: pair.createdAt, creatorName: pair.creatorName, partnerName: pair.partnerName, partnerEmail: pair.partnerEmail, answered: responses.some(response => response.memberId === memberId), ready, agreement: ready ? pair.agreement : null, preferences: ready ? responses.map(response => ({ person: response.memberId === pair.creatorId ? pair.creatorName : pair.partnerName || pair.partnerEmail, values: parse(response.preferences) })) : null };
    }));
    const energy = await all("SELECT id,entry_date AS entryDate,activity_type AS activityType,activity,energy,created_at AS createdAt FROM energy_entries WHERE company_id=? AND member_id=? ORDER BY entry_date DESC,created_at DESC", organizationId, memberId);
    const energySummary = summarizeEnergy(energy.map(entry => ({ entryDate: String(entry.entryDate), activityType: String(entry.activityType), energy: Number(entry.energy) })));
    const careerRows = await all("SELECT id,choices,created_at AS createdAt FROM career_runs WHERE company_id=? AND member_id=? ORDER BY created_at DESC", organizationId, memberId);
    const career = careerRows.map(run => ({ id: run.id, choices: parse(run.choices), createdAt: run.createdAt, priorities: careerPriorities(parse(run.choices)) }));
    const trackRows = await all("SELECT id,cycle_id AS cycleId,dimensions,created_at AS createdAt FROM thermometer_tracks WHERE company_id=? AND leader_id=? ORDER BY created_at DESC", organizationId, memberId);
    const thermometer = await Promise.all(trackRows.map(async track => {
      const dimensions = parse(track.dimensions) as number[];
      const rounds = await all("SELECT id,status,created_at AS createdAt,closed_at AS closedAt FROM thermometer_rounds WHERE track_id=? ORDER BY created_at", track.id);
      const publicRounds = await Promise.all(rounds.map(async round => {
        const responses = await all("SELECT scores FROM thermometer_responses WHERE round_id=?", round.id);
        const scores = responses.map(response => parse(response.scores)).filter(Array.isArray) as (number | null)[][];
        return { ...round, responseCount: scores.length, scores: calculateMirrorAggregate(String(round.status), scores, dimensions.length) };
      }));
      return { id: track.id, cycleId: track.cycleId, dimensions, createdAt: track.createdAt, rounds: publicRounds };
    }));
    const participation = {
      mirrorAnswers: Number((await one("SELECT COUNT(*) AS n FROM mirror_responses r JOIN mirror_cycles c ON c.id=r.cycle_id WHERE c.company_id=? AND r.respondent_id=?", organizationId, memberId))?.n || 0),
      thermometerAnswers: Number((await one("SELECT COUNT(*) AS n FROM thermometer_responses r JOIN thermometer_rounds rd ON rd.id=r.round_id JOIN thermometer_tracks t ON t.id=rd.track_id WHERE t.company_id=? AND r.respondent_id=?", organizationId, memberId))?.n || 0),
    };
    return respond({ isMaster, generatedAt: date(), subject: { id: memberId, name: subject.name, email: subject.email, role: subject.role, companyId: organizationId, companyName: subject.companyName, kind: subject.kind, isOwn: subject.userId === user.userId }, mirrors, decisions, communication, energy, energySummary, career, thermometer, participation, communicationTopics });
  } catch (error) {
    console.error("results get failed", error);
    return Response.json({ error: "Não foi possível carregar os resultados." }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
