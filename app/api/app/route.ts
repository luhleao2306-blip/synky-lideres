import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { communicationTopics, decisionFeedback, mirrorQuestions, scenarios } from "../../../lib/experiences";
import { calculateMirrorAggregate } from "../../../lib/results";

type Row = Record<string, unknown>;
const json = (body: unknown, status=200) => Response.json(body,{status});
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const db = () => { if(!env.DB) throw new Error("Banco de dados indisponível"); return env.DB; };
const one = async (sql:string,...values:unknown[]) => db().prepare(sql).bind(...values).first<Row>();
const all = async (sql:string,...values:unknown[]) => (await db().prepare(sql).bind(...values).all<Row>()).results;
const run = async (sql:string,...values:unknown[]) => db().prepare(sql).bind(...values).run();
const fail = (message:string,status=400) => json({error:message},status);
const parse = (value:unknown) => { try{return JSON.parse(String(value))}catch{return null} };
const validScores = (x:unknown) => Array.isArray(x)&&x.length===mirrorQuestions.length&&x.every(v=>v===null||(Number.isInteger(v)&&v>=1&&v<=5));
const validPreferences = (x:unknown) => Array.isArray(x)&&x.length===communicationTopics.length&&x.every(v=>v===0||v===1);
const safeText = (x:unknown,max=120) => typeof x==="string"?x.trim().slice(0,max):"";
const emailText = (x:unknown) => safeText(x,254).toLowerCase();
async function member(userId:string) {return one("SELECT m.*, c.name AS company_name FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? ORDER BY m.rowid LIMIT 1",userId)}
async function invitation(token:string,email:string) {return one("SELECT * FROM invites WHERE token=? AND email=? AND used_at IS NULL AND expires_at>?",token,email,now())}
function publicCycle(row:Row,count:number,teamScores:number[][]) {
  const self=parse(row.self_scores) as number[];
  const aggregate=calculateMirrorAggregate(String(row.status),teamScores,mirrorQuestions.length);
  return {id:row.id,status:row.status,createdAt:row.created_at,closedAt:row.closed_at,selfScores:self,responseCount:count,teamScores:aggregate,action:row.action};
}
export async function GET(request:Request) {
  try {
    const user=await getChatGPTUser(); if(!user) return fail("Entre para continuar.",401);
    const url=new URL(request.url);
    const token=url.searchParams.get("invite");
    const m=await member(user.userId);
    const invite=token?await invitation(token,user.email.toLowerCase()):null;
    if(!m) return json({needsSetup:!(await one("SELECT id FROM companies LIMIT 1")),invite:invite?{type:invite.type,token,companyId:invite.company_id,referenceId:invite.reference_id}:null,inviteError:!!token&&!invite,user:{name:user.displayName,email:user.email}});
    const companyId=String(m.company_id),memberId=String(m.id);
    const cycles=await all("SELECT * FROM mirror_cycles WHERE company_id=? AND leader_id=? ORDER BY created_at DESC",companyId,memberId);
    const mirrors=await Promise.all(cycles.map(async cycle=>{
      const rows=await all("SELECT scores FROM mirror_responses WHERE cycle_id=?",cycle.id);
      return publicCycle(cycle,rows.length,rows.map(r=>parse(r.scores)).filter(Array.isArray));
    }));
    const mirrorRequests=await all("SELECT i.token,i.reference_id,c.created_at,c.status FROM invites i JOIN mirror_cycles c ON c.id=i.reference_id LEFT JOIN mirror_responses r ON r.cycle_id=c.id AND r.respondent_id=? WHERE i.company_id=? AND i.email=? AND i.type='mirror' AND i.used_at IS NULL AND i.expires_at>? AND c.status='open' AND r.id IS NULL",memberId,companyId,user.email.toLowerCase(),now());
    const runs=await all("SELECT id,scenario_id,choices,created_at FROM decision_runs WHERE company_id=? AND member_id=? ORDER BY created_at DESC LIMIT 20",companyId,memberId);
    const pairRows=await all("SELECT * FROM communication_pairs WHERE company_id=? AND status!='removed' AND (creator_id=? OR partner_id=?) ORDER BY created_at DESC",companyId,memberId,memberId);
    const pairs=await Promise.all(pairRows.map(async pair=>{
      const mine=await one("SELECT preferences,consent FROM communication_responses WHERE pair_id=? AND member_id=?",pair.id,memberId);
      const total=await one("SELECT COUNT(*) AS n FROM communication_responses WHERE pair_id=? AND consent=1",pair.id);
      const ready=Number(total?.n)===2;
      const responses=ready?await all("SELECT preferences FROM communication_responses WHERE pair_id=? AND consent=1 ORDER BY member_id",pair.id):[];
      const preferences=ready?responses.map(r=>parse(r.preferences)):[];
      return {id:pair.id,status:pair.status,createdAt:pair.created_at,partnerEmail:pair.partner_email,answered:!!mine,ready,preferences:ready?preferences:undefined,agreement:ready?pair.agreement:undefined};
    }));
    const pendingCommunication=await all("SELECT i.token,i.reference_id,p.created_at FROM invites i JOIN communication_pairs p ON p.id=i.reference_id WHERE i.company_id=? AND i.email=? AND i.type='communication' AND i.used_at IS NULL AND i.expires_at>? AND p.status='pending'",companyId,user.email.toLowerCase(),now());
    return json({user:{name:user.displayName,email:user.email},membership:{id:memberId,role:m.role,companyId,companyName:m.company_name},mirrors,mirrorRequests,runs:runs.map(r=>({...r,choices:parse(r.choices)})),pairs,pendingCommunication,invite:invite?{type:invite.type,token,referenceId:invite.reference_id}:null,inviteError:!!token&&!invite});
  } catch(e){console.error("app get failed",e);return fail("Não foi possível carregar os dados. Tente novamente.",500)}
}
export async function POST(request:Request) {
  try {
    const user=await getChatGPTUser(); if(!user) return fail("Entre para continuar.",401);
    const p=await request.json() as Record<string,unknown>;
    const action=safeText(p.action);
    let m=await member(user.userId);
    if(action==="setup") {
      if(user.email.toLowerCase()!=="contato@somus.group" && process.env.NODE_ENV!=="development") return fail("A configuração inicial está reservada ao proprietário da plataforma.",403);
      if(m || await one("SELECT id FROM companies LIMIT 1")) return fail("A configuração inicial já foi feita.",403);
      const name=safeText(p.company,90);if(name.length<2)return fail("Informe o nome da empresa.");
      const companyId=id(),memberId=id();
      await db().batch([
        db().prepare("INSERT INTO companies(id,name,created_at) VALUES(?,?,?)").bind(companyId,name,now()),
        db().prepare("INSERT INTO members(id,company_id,user_id,email,name,role) VALUES(?,?,?,?,?,?)").bind(memberId,companyId,user.userId,user.email.toLowerCase(),user.displayName,"admin"),
      ]);
      return json({ok:true});
    }
    if(action==="join") {
      const token=safeText(p.token,100);const invite=await invitation(token,user.email.toLowerCase());if(!invite)return fail("Convite inválido ou expirado.",404);
      if(m && m.company_id!==invite.company_id)return fail("Este convite pertence a outra empresa.",403);
      if(!m) {
        const memberId=id();
        await run("INSERT INTO members(id,company_id,user_id,email,name,role) VALUES(?,?,?,?,?,?)",memberId,invite.company_id,user.userId,user.email.toLowerCase(),user.displayName,invite.role||"participant");
        m=await member(user.userId);
      }
      if(invite.type==="member") await run("UPDATE invites SET used_at=? WHERE token=?",now(),token);
      if(invite.type==="communication") await run("UPDATE communication_pairs SET partner_id=? WHERE id=? AND company_id=? AND status='pending'",m?.id,invite.reference_id,invite.company_id);
      return json({ok:true,type:invite.type,referenceId:invite.reference_id});
    }
    if(!m)return fail("Você ainda não participa de uma empresa.",403);
    const companyId=String(m.company_id),memberId=String(m.id),role=String(m.role);
    if(action==="invite_member") {
      if(!["admin","rh"].includes(role))return fail("Apenas administração e RH podem convidar pessoas.",403);
      const email=emailText(p.email),newRole=safeText(p.role);
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!["rh","leader","participant"].includes(newRole))return fail("Confira o e-mail e o perfil.");
      const token=id();await run("INSERT INTO invites(token,company_id,email,type,role,expires_at,created_at) VALUES(?,?,?,?,?,?,?)",token,companyId,email,"member",newRole,new Date(Date.now()+7*864e5).toISOString(),now());
      return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${token}`});
    }
    if(action==="create_mirror") {
      if(!["admin","rh","leader"].includes(role))return fail("Seu perfil não pode iniciar esta experiência.",403);
      if(!validScores(p.scores)||(p.scores as unknown[]).some((v:unknown)=>v===null))return fail("Responda todos os itens da autoavaliação.");
      const cycleId=id();await run("INSERT INTO mirror_cycles(id,company_id,leader_id,status,self_scores,created_at) VALUES(?,?,?,?,?,?)",cycleId,companyId,memberId,"open",JSON.stringify(p.scores),now());
      return json({ok:true,id:cycleId});
    }
    if(action==="invite_mirror") {
      const cycle=await one("SELECT * FROM mirror_cycles WHERE id=? AND company_id=? AND leader_id=? AND status='open'",p.cycleId,companyId,memberId);
      if(!cycle)return fail("Ciclo não encontrado.",404);
      const email=emailText(p.email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email===user.email.toLowerCase())return fail("Informe o e-mail de alguém do time.");
      const existing=await one("SELECT token FROM invites WHERE company_id=? AND email=? AND type='mirror' AND reference_id=? AND used_at IS NULL AND expires_at>?",companyId,email,cycle.id,now());
      if(existing)return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${existing.token}`});
      const token=id();await run("INSERT INTO invites(token,company_id,email,type,role,reference_id,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?)",token,companyId,email,"mirror","participant",cycle.id,new Date(Date.now()+14*864e5).toISOString(),now());
      return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${token}`});
    }
    if(action==="respond_mirror") {
      const token=safeText(p.token,100),invite=await invitation(token,user.email.toLowerCase());
      if(!invite||invite.type!=="mirror"||invite.company_id!==companyId)return fail("Convite inválido ou expirado.",404);
      const cycle=await one("SELECT * FROM mirror_cycles WHERE id=? AND company_id=? AND status='open'",invite.reference_id,companyId);
      if(!cycle||cycle.leader_id===memberId)return fail("Esta avaliação não está disponível.",403);
      if(await one("SELECT id FROM mirror_responses WHERE cycle_id=? AND respondent_id=?",cycle.id,memberId))return fail("Você já respondeu a este ciclo.",409);
      if(!validScores(p.scores))return fail("Revise as respostas.");
      await db().batch([
        db().prepare("INSERT INTO mirror_responses(id,cycle_id,respondent_id,scores,created_at) VALUES(?,?,?,?,?)").bind(id(),cycle.id,memberId,JSON.stringify(p.scores),now()),
        db().prepare("UPDATE invites SET used_at=? WHERE token=?").bind(now(),token),
      ]);
      return json({ok:true});
    }
    if(action==="close_mirror"||action==="choose_action") {
      const cycle=await one("SELECT id FROM mirror_cycles WHERE id=? AND company_id=? AND leader_id=?",p.cycleId,companyId,memberId);if(!cycle)return fail("Ciclo não encontrado.",404);
      if(action==="close_mirror")await run("UPDATE mirror_cycles SET status='closed',closed_at=? WHERE id=?",now(),cycle.id);
      else {const text=safeText(p.text,240);if(!text)return fail("Escolha uma ação.");await run("UPDATE mirror_cycles SET action=? WHERE id=?",text,cycle.id)}
      return json({ok:true});
    }
    if(action==="complete_decision") {
      const scenarioId=safeText(p.scenarioId),feedback=decisionFeedback(scenarioId,p.choices as number[]);
      if(!feedback)return fail("Escolhas inválidas.");
      await run("INSERT INTO decision_runs(id,company_id,member_id,scenario_id,choices,created_at) VALUES(?,?,?,?,?,?)",id(),companyId,memberId,scenarioId,JSON.stringify(p.choices),now());
      return json({ok:true,feedback,scenario:scenarios.find(s=>s.id===scenarioId)?.title});
    }
    if(action==="create_communication") {
      const email=emailText(p.email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email===user.email.toLowerCase())return fail("Informe o e-mail da outra pessoa.");
      if(!validPreferences(p.preferences)||p.consent!==true)return fail("Responda aos itens e autorize a comparação.");
      const pairId=id(),token=id();
      await db().batch([
        db().prepare("INSERT INTO communication_pairs(id,company_id,creator_id,partner_email,status,created_at) VALUES(?,?,?,?,?,?)").bind(pairId,companyId,memberId,email,"pending",now()),
        db().prepare("INSERT INTO communication_responses(id,pair_id,member_id,preferences,consent,created_at) VALUES(?,?,?,?,?,?)").bind(id(),pairId,memberId,JSON.stringify(p.preferences),1,now()),
        db().prepare("INSERT INTO invites(token,company_id,email,type,role,reference_id,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(token,companyId,email,"communication","participant",pairId,new Date(Date.now()+14*864e5).toISOString(),now()),
      ]);
      return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${token}`});
    }
    if(action==="respond_communication") {
      const token=safeText(p.token,100),invite=await invitation(token,user.email.toLowerCase());
      if(!invite||invite.type!=="communication"||invite.company_id!==companyId)return fail("Convite inválido ou expirado.",404);
      const pair=await one("SELECT * FROM communication_pairs WHERE id=? AND company_id=? AND status='pending' AND partner_email=?",invite.reference_id,companyId,user.email.toLowerCase());
      if(!pair||!validPreferences(p.preferences)||p.consent!==true)return fail("Respostas ou consentimento pendentes.");
      await db().batch([
        db().prepare("INSERT INTO communication_responses(id,pair_id,member_id,preferences,consent,created_at) VALUES(?,?,?,?,?,?)").bind(id(),pair.id,memberId,JSON.stringify(p.preferences),1,now()),
        db().prepare("UPDATE communication_pairs SET partner_id=?,status='ready' WHERE id=?").bind(memberId,pair.id),
        db().prepare("UPDATE invites SET used_at=? WHERE token=?").bind(now(),token),
      ]);
      return json({ok:true});
    }
    if(action==="remove_communication") {
      const pair=await one("SELECT id FROM communication_pairs WHERE id=? AND company_id=? AND (creator_id=? OR partner_id=?)",p.pairId,companyId,memberId,memberId);if(!pair)return fail("Comparação não encontrada.",404);
      await db().batch([
        db().prepare("DELETE FROM communication_responses WHERE pair_id=?").bind(pair.id),
        db().prepare("DELETE FROM invites WHERE company_id=? AND type='communication' AND reference_id=?").bind(companyId,pair.id),
        db().prepare("DELETE FROM communication_pairs WHERE id=? AND company_id=?").bind(pair.id,companyId),
      ]);
      return json({ok:true});
    }
    if(action==="save_agreement") {
      const pair=await one("SELECT id,status FROM communication_pairs WHERE id=? AND company_id=? AND (creator_id=? OR partner_id=?)",p.pairId,companyId,memberId,memberId);
      if(!pair||pair.status!=="ready")return fail("Comparação não disponível.",404);
      const agreement=safeText(p.agreement,600);if(!agreement)return fail("Escreva um acordo prático.");
      await run("UPDATE communication_pairs SET agreement=? WHERE id=? AND company_id=?",agreement,pair.id,companyId);
      return json({ok:true});
    }
    return fail("Ação desconhecida.",404);
  } catch(e){console.error("app post failed",e);return fail("Não foi possível concluir. Revise os dados e tente novamente.",500)}
}
