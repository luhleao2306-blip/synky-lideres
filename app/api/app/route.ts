import { env } from "cloudflare:workers";
import { getAppUser } from "../../guest-auth";
import { communicationTopics, decisionFeedback, mirrorQuestions, scenarios } from "../../../lib/experiences";
import { calculateMirrorAggregate } from "../../../lib/results";
import { careerPriorities, energyTypes, summarizeEnergy } from "../../../lib/additional-experiences";
import { moduleKeys, resolveModules, type ModuleKey } from "../../../lib/modules";
import { brazilDay } from "../../../lib/calendar";
import { isPlatformAdmin } from "../../../lib/platform-admin";

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
const validEnergy = (x:unknown) => Number.isInteger(x)&&Number(x)>=-2&&Number(x)<=2;
const safeText = (x:unknown,max=120) => typeof x==="string"?x.trim().slice(0,max):"";
const emailText = (x:unknown) => safeText(x,254).toLowerCase();
async function member(userId:string,companyId?:string) {return companyId?one("SELECT m.*, c.name AS company_name,c.kind AS company_kind,c.modules AS modules_json FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? AND m.company_id=? LIMIT 1",userId,companyId):one("SELECT m.*, c.name AS company_name,c.kind AS company_kind,c.modules AS modules_json FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? ORDER BY m.rowid LIMIT 1",userId)}
async function invitation(token:string,email:string,isGuest=false) {return isGuest?one("SELECT i.*, c.name AS company_name FROM invites i JOIN companies c ON c.id=i.company_id WHERE i.token=? AND (i.email NOT LIKE '%@visitor.synky.local' OR i.email=?) AND i.used_at IS NULL AND i.expires_at>?",token,email,now()):one("SELECT i.*, c.name AS company_name FROM invites i JOIN companies c ON c.id=i.company_id WHERE i.token=? AND i.email=? AND i.used_at IS NULL AND i.expires_at>?",token,email,now())}
function publicCycle(row:Row,count:number,teamScores:number[][],checkins:Row[],checkinCount:number) {
  const self=parse(row.self_scores) as number[];
  const aggregate=calculateMirrorAggregate(String(row.status),teamScores,mirrorQuestions.length);
  return {id:row.id,status:row.status,createdAt:row.created_at,closedAt:row.closed_at,selfScores:self,responseCount:count,teamScores:aggregate,action:row.action,checkins,checkinCount};
}
export async function GET(request:Request) {
  try {
    const access=await getAppUser(request,false),user=access.user;
    if(!user)return fail("Não foi possível iniciar sua visita.",401);
    const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:access.cookie?{"Set-Cookie":access.cookie}:{}});
    const url=new URL(request.url);
    const token=url.searchParams.get("invite");
    const invite=token?await invitation(token,user.email.toLowerCase(),user.isGuest):null;
    const companySelection=invite?String(invite.company_id):url.searchParams.get("company")||undefined;
    let m=await member(user.userId,companySelection);
    if(!m&&!token&&!companySelection){
      const companyId=id();
      await db().batch([
        db().prepare("INSERT INTO companies(id,name,kind,created_at) VALUES(?,?,?,?)").bind(companyId,"Meu espaço","personal",now()),
        db().prepare("INSERT INTO members(id,company_id,user_id,email,name,role) VALUES(?,?,?,?,?,?)").bind(id(),companyId,user.userId,user.email.toLowerCase(),user.displayName,"admin"),
      ]);
      m=await member(user.userId,companyId);
    }
    const memberships=await all("SELECT m.company_id AS companyId,m.role,c.name AS companyName FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? ORDER BY c.name",user.userId);
    const platformAdmin=isPlatformAdmin(user);
    if(!m){if(companySelection&&!invite&&memberships.length)return respond({error:"Você não tem acesso a esta empresa."},403);return respond({needsSetup:platformAdmin&&!(await one("SELECT id FROM companies LIMIT 1")),invite:invite?{type:invite.type,token,companyId:invite.company_id,companyName:invite.company_name,role:invite.role,referenceId:invite.reference_id}:null,inviteError:!!token&&!invite,user:{name:user.displayName,email:user.email},isGuest:user.isGuest,memberships,platformAdmin})}
    const companyId=String(m.company_id),memberId=String(m.id);
    const cycles=await all("SELECT * FROM mirror_cycles WHERE company_id=? AND leader_id=? ORDER BY created_at DESC",companyId,memberId);
    const mirrors=await Promise.all(cycles.map(async cycle=>{
      const rows=await all("SELECT scores FROM mirror_responses WHERE cycle_id=?",cycle.id);
      const checkins=await all("SELECT id,action,note,entry_date AS entryDate,created_at AS createdAt FROM mirror_action_checkins WHERE cycle_id=? ORDER BY entry_date DESC LIMIT 20",cycle.id);
      const checkinCount=Number((await one("SELECT COUNT(*) AS n FROM mirror_action_checkins WHERE cycle_id=?",cycle.id))?.n||0);
      return publicCycle(cycle,rows.length,rows.map(r=>parse(r.scores)).filter(Array.isArray),checkins,checkinCount);
    }));
    const mirrorRequests=await all("SELECT i.token,i.reference_id,c.created_at,c.status FROM invites i JOIN mirror_cycles c ON c.id=i.reference_id LEFT JOIN mirror_responses r ON r.cycle_id=c.id AND r.respondent_id=? WHERE i.company_id=? AND i.email IN (?,?) AND i.type='mirror' AND i.used_at IS NULL AND i.expires_at>? AND c.status='open' AND r.id IS NULL",memberId,companyId,user.email.toLowerCase(),String(m.email).toLowerCase(),now());
    const runs=await all("SELECT id,scenario_id,choices,created_at FROM decision_runs WHERE company_id=? AND member_id=? ORDER BY created_at DESC LIMIT 20",companyId,memberId);
    const decisionCount=Number((await one("SELECT COUNT(*) AS n FROM decision_runs WHERE company_id=? AND member_id=?",companyId,memberId))?.n||0);
    const pairRows=await all("SELECT p.*, creator.name AS creator_name, partner.name AS partner_name FROM communication_pairs p JOIN members creator ON creator.id=p.creator_id LEFT JOIN members partner ON partner.id=p.partner_id WHERE p.company_id=? AND p.status!='removed' AND (p.creator_id=? OR p.partner_id=?) ORDER BY p.created_at DESC",companyId,memberId,memberId);
    const pairs=await Promise.all(pairRows.map(async pair=>{
      const responses=await all("SELECT member_id,preferences FROM communication_responses WHERE pair_id=? AND consent=1 ORDER BY CASE WHEN member_id=? THEN 0 ELSE 1 END",pair.id,pair.creator_id);
      const creatorAnswered=responses.some(r=>r.member_id===pair.creator_id),partnerAnswered=responses.some(r=>r.member_id===pair.partner_id);
      const ready=creatorAnswered&&partnerAnswered;
      const invite=pair.creator_id===memberId&&!ready?await one("SELECT token,expires_at FROM invites WHERE company_id=? AND type='communication' AND reference_id=? AND used_at IS NULL AND expires_at>? ORDER BY created_at DESC LIMIT 1",companyId,pair.id,now()):null;
      return {id:pair.id,status:pair.status,createdAt:pair.created_at,partnerEmail:pair.partner_email,creatorName:pair.creator_name,partnerName:pair.partner_name,isCreator:pair.creator_id===memberId,answered:creatorAnswered&&pair.creator_id===memberId||partnerAnswered&&pair.partner_id===memberId,creatorAnswered,partnerAnswered,ready,preferences:ready?responses.map(r=>parse(r.preferences)):undefined,agreement:ready?pair.agreement:undefined,inviteToken:invite?.token,inviteExpiresAt:invite?.expires_at};
    }));
    const pendingCommunication=await all("SELECT i.token,i.reference_id,p.created_at FROM invites i JOIN communication_pairs p ON p.id=i.reference_id WHERE i.company_id=? AND i.email IN (?,?) AND i.type='communication' AND i.used_at IS NULL AND i.expires_at>? AND p.status='pending'",companyId,user.email.toLowerCase(),String(m.email).toLowerCase(),now());
    const communicationCandidates=await all("SELECT id,name,email FROM members WHERE company_id=? AND id!=? ORDER BY name COLLATE NOCASE",companyId,memberId);
    const energyRows=await all("SELECT id,entry_date AS entryDate,activity_type AS activityType,activity,energy,created_at AS createdAt FROM energy_entries WHERE company_id=? AND member_id=? AND entry_date>=? ORDER BY entry_date DESC,created_at DESC LIMIT 100",companyId,memberId,new Date(Date.now()-30*864e5).toISOString().slice(0,10));
    const energySummary=summarizeEnergy(energyRows.filter(row=>String(row.entryDate)>=new Date(Date.now()-14*864e5).toISOString().slice(0,10)).map(row=>({entryDate:String(row.entryDate),activityType:String(row.activityType),energy:Number(row.energy)})));
    const energyShares=await all("SELECT s.id,l.name,l.email FROM energy_shares s JOIN members l ON l.id=s.leader_id AND l.company_id=s.company_id WHERE s.company_id=? AND s.member_id=? ORDER BY s.created_at DESC",companyId,memberId);
    const sharedEnergyRows=await all("SELECT s.id,s.member_id,m.name,m.email FROM energy_shares s JOIN members m ON m.id=s.member_id AND m.company_id=s.company_id WHERE s.company_id=? AND s.leader_id=? ORDER BY s.created_at DESC",companyId,memberId);
    const sharedEnergy=await Promise.all(sharedEnergyRows.map(async share=>{
      const rows=await all("SELECT entry_date AS entryDate,activity_type AS activityType,energy FROM energy_entries WHERE company_id=? AND member_id=? AND entry_date>=?",companyId,share.member_id,new Date(Date.now()-14*864e5).toISOString().slice(0,10));
      const summary=summarizeEnergy(rows.map(row=>({entryDate:String(row.entryDate),activityType:String(row.activityType),energy:Number(row.energy)})));
      return {id:share.id,name:share.name,email:share.email,total:summary.total,categories:summary.categories};
    }));
    const careerRuns=(await all("SELECT id,choices,created_at AS createdAt FROM career_runs WHERE company_id=? AND member_id=? ORDER BY created_at DESC LIMIT 20",companyId,memberId)).map(row=>({id:row.id,choices:parse(row.choices),createdAt:row.createdAt}));
    const trackRows=await all("SELECT * FROM thermometer_tracks WHERE company_id=? AND leader_id=? ORDER BY created_at DESC",companyId,memberId);
    const thermometerTracks=await Promise.all(trackRows.map(async track=>{
      const dimensions=parse(track.dimensions) as number[];
      const rounds=await all("SELECT * FROM thermometer_rounds WHERE track_id=? ORDER BY created_at ASC",track.id);
      const publicRounds=await Promise.all(rounds.map(async round=>{
        const answers=await all("SELECT scores FROM thermometer_responses WHERE round_id=?",round.id);
        const scores=answers.map(answer=>parse(answer.scores) as (number|null)[]).filter(Array.isArray);
        return {id:round.id,status:round.status,createdAt:round.created_at,closedAt:round.closed_at,responseCount:scores.length,scores:calculateMirrorAggregate(String(round.status),scores,dimensions.length)};
      }));
      return {id:track.id,cycleId:track.cycle_id,dimensions,createdAt:track.created_at,rounds:publicRounds};
    }));
    const thermometerRequests=await all("SELECT r.id AS roundId,t.dimensions,t.created_at AS createdAt FROM thermometer_tracks t JOIN thermometer_rounds r ON r.track_id=t.id AND r.status='open' JOIN mirror_responses original ON original.cycle_id=t.cycle_id AND original.respondent_id=? LEFT JOIN thermometer_responses answered ON answered.round_id=r.id AND answered.respondent_id=? WHERE t.company_id=? AND answered.id IS NULL ORDER BY r.created_at DESC",memberId,memberId,companyId);
    const canManage=["admin","rh"].includes(String(m.role));
    const people=canManage?await all("SELECT id,name,email,role FROM members WHERE company_id=? ORDER BY name",companyId):[];
    const pendingInvites=canManage?await all("SELECT token,email,type,role,expires_at AS expiresAt,created_at AS createdAt FROM invites WHERE company_id=? AND type='member' AND used_at IS NULL AND expires_at>? ORDER BY created_at DESC LIMIT 30",companyId,now()):[];
    const companyStats=canManage?{
      people:people.length,
      mirrorCycles:Number((await one("SELECT COUNT(*) AS n FROM mirror_cycles WHERE company_id=?",companyId))?.n||0),
      decisionRuns:Number((await one("SELECT COUNT(*) AS n FROM decision_runs WHERE company_id=?",companyId))?.n||0),
      careerRuns:Number((await one("SELECT COUNT(*) AS n FROM career_runs WHERE company_id=?",companyId))?.n||0),
      thermometerTracks:Number((await one("SELECT COUNT(*) AS n FROM thermometer_tracks WHERE company_id=?",companyId))?.n||0),
    }:null;
    const platformCompanies=platformAdmin?await all("SELECT c.id,c.name,c.created_at AS createdAt,COUNT(m.id) AS people FROM companies c JOIN members owner ON owner.company_id=c.id AND owner.user_id=? AND owner.role='admin' LEFT JOIN members m ON m.company_id=c.id WHERE c.kind='organization' GROUP BY c.id ORDER BY c.created_at DESC",user.userId):[];
    return respond({user:{name:user.isGuest?String(m.name):user.displayName,email:user.isGuest?String(m.email):user.email},isGuest:user.isGuest,membership:{id:memberId,role:m.role,companyId,companyName:m.company_name,kind:m.company_kind},memberships,platformAdmin,platformCompanies,moduleSettings:resolveModules(m.modules_json),mirrors,mirrorRequests,runs:runs.map(r=>({...r,choices:parse(r.choices)})),decisionCount,pairs,pendingCommunication,communicationCandidates,energyEntries:energyRows,energySummary,energyShares,sharedEnergy,careerRuns,thermometerTracks,thermometerRequests:thermometerRequests.map(row=>({...row,dimensions:parse(row.dimensions)})),people,pendingInvites,companyStats,invite:invite?{type:invite.type,token,companyId:invite.company_id,companyName:invite.company_name,role:invite.role,referenceId:invite.reference_id}:null,inviteError:!!token&&!invite});
  } catch(e){console.error("app get failed",e);return fail("Não foi possível carregar os dados. Tente novamente.",500)}
}
export async function POST(request:Request) {
  try {
    const user=(await getAppUser(request)).user; if(!user) return fail("Abra a plataforma para iniciar sua visita.",401);
    const p=await request.json() as Record<string,unknown>;
    const action=safeText(p.action);
    const m=await member(user.userId,safeText(p.companyId,100)||undefined);
    if(action==="setup") {
      if(!isPlatformAdmin(user)) return fail("A configuração inicial está reservada à administração da plataforma.",403);
      if(m || await one("SELECT id FROM companies LIMIT 1")) return fail("A configuração inicial já foi feita.",403);
      const name=safeText(p.company,90);if(name.length<2)return fail("Informe o nome da empresa.");
      const companyId=id(),memberId=id();
      await db().batch([
        db().prepare("INSERT INTO companies(id,name,created_at) VALUES(?,?,?)").bind(companyId,name,now()),
        db().prepare("INSERT INTO members(id,company_id,user_id,email,name,role) VALUES(?,?,?,?,?,?)").bind(memberId,companyId,user.userId,user.email.toLowerCase(),user.displayName,"admin"),
      ]);
      return json({ok:true});
    }
    if(action==="create_company") {
      if(!isPlatformAdmin(user))return fail("Apenas a administração da plataforma pode criar empresas.",403);
      const name=safeText(p.name,90);if(name.length<2)return fail("Informe o nome da empresa.");
      const companyId=id();
      await db().batch([
        db().prepare("INSERT INTO companies(id,name,created_at) VALUES(?,?,?)").bind(companyId,name,now()),
        db().prepare("INSERT INTO members(id,company_id,user_id,email,name,role) VALUES(?,?,?,?,?,?)").bind(id(),companyId,user.userId,user.email.toLowerCase(),user.displayName,"admin"),
      ]);
      return json({ok:true,companyId});
    }
    if(action==="join") {
      const token=safeText(p.token,100);const invite=await invitation(token,user.email.toLowerCase(),user.isGuest);if(!invite)return fail("Convite inválido ou expirado.",404);
      let invitedMember=await member(user.userId,String(invite.company_id));
      if(invite.type==="communication") {
        const pair=await one("SELECT creator_id,partner_id,status FROM communication_pairs WHERE id=? AND company_id=?",invite.reference_id,invite.company_id);
        if(!pair||pair.status!=="pending"||pair.creator_id===invitedMember?.id||pair.partner_id&&pair.partner_id!==invitedMember?.id)return fail("Este convite de dupla já foi usado ou não está disponível.",403);
      }
      if(!invitedMember) {
        const memberId=id();
        await run("INSERT INTO members(id,company_id,user_id,email,name,role) VALUES(?,?,?,?,?,?)",memberId,invite.company_id,user.userId,user.isGuest?String(invite.email):user.email.toLowerCase(),user.displayName,invite.role||"participant");
        invitedMember=await member(user.userId,String(invite.company_id));
      }
      if(user.isGuest)await run("UPDATE invites SET email=? WHERE token=?",user.email.toLowerCase(),token);
      if(invite.type==="member") await run("UPDATE invites SET used_at=? WHERE token=?",now(),token);
      if(invite.type==="communication") await run("UPDATE communication_pairs SET partner_id=? WHERE id=? AND company_id=? AND status='pending' AND partner_id IS NULL AND creator_id!=?",invitedMember?.id,invite.reference_id,invite.company_id,invitedMember?.id);
      return json({ok:true,type:invite.type,companyId:invite.company_id,referenceId:invite.reference_id});
    }
    if(!m)return fail("Você ainda não participa de uma empresa.",403);
    const companyId=String(m.company_id),memberId=String(m.id),role=String(m.role);
    if(action==="rename_profile") {
      const name=safeText(p.name,70);
      if(name.length<2)return fail("Informe um nome com pelo menos dois caracteres.");
      await run("UPDATE members SET name=? WHERE id=? AND company_id=?",name,memberId,companyId);
      return json({ok:true});
    }
    if(action==="set_contact_email") {
      if(!user.isGuest)return fail("O e-mail desta conta é gerenciado pelo acesso ChatGPT.",403);
      const email=emailText(p.email);
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.endsWith("@visitor.synky.local"))return fail("Informe um e-mail de contato válido.");
      if(await one("SELECT id FROM members WHERE company_id=? AND email=? AND id!=?",companyId,email,memberId))return fail("Este e-mail já está em uso neste ambiente.",409);
      await run("UPDATE members SET email=? WHERE id=? AND company_id=?",email,memberId,companyId);
      return json({ok:true});
    }
    if(action==="rename_company") {
      if(role!=="admin")return fail("Apenas o administrador pode alterar a empresa.",403);
      const name=safeText(p.name,90);if(name.length<2)return fail("Informe o nome da empresa.");
      await run("UPDATE companies SET name=? WHERE id=?",name,companyId);
      return json({ok:true});
    }
    if(action==="set_module") {
      if(role!=="admin")return fail("Apenas o administrador pode configurar experiências.",403);
      const key=safeText(p.module);
      if(!moduleKeys.includes(key as ModuleKey)||typeof p.enabled!=="boolean")return fail("Experiência ou opção inválida.");
      const modules=resolveModules(m.modules_json);modules[key as ModuleKey]=p.enabled;
      await run("UPDATE companies SET modules=? WHERE id=?",JSON.stringify(modules),companyId);
      return json({ok:true});
    }
    const actionModule:Record<string,ModuleKey>={create_mirror:"mirror",invite_mirror:"mirror",respond_mirror:"mirror",close_mirror:"mirror",choose_action:"mirror",add_action_checkin:"mirror",complete_decision:"decisions",create_communication:"communication",renew_communication_invite:"communication",respond_communication:"communication",remove_communication:"communication",save_agreement:"communication",add_energy:"energy",delete_energy:"energy",share_energy:"energy",revoke_energy_share:"energy",save_career:"career",create_thermometer:"thermometer",respond_thermometer:"thermometer",close_thermometer_round:"thermometer",new_thermometer_round:"thermometer"};
    if(actionModule[action]&&!resolveModules(m.modules_json)[actionModule[action]])return fail("Esta experiência está indisponível neste ambiente.",403);
    if(action==="invite_member") {
      if(!["admin","rh"].includes(role))return fail("Apenas administração e RH podem convidar pessoas.",403);
      const email=emailText(p.email),newRole=safeText(p.role);
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!["rh","leader","participant"].includes(newRole))return fail("Confira o e-mail e o perfil.");
      const token=id();await run("INSERT INTO invites(token,company_id,email,type,role,expires_at,created_at) VALUES(?,?,?,?,?,?,?)",token,companyId,email,"member",newRole,new Date(Date.now()+7*864e5).toISOString(),now());
      return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${token}`});
    }
    if(action==="revoke_invite") {
      if(!["admin","rh"].includes(role))return fail("Apenas administração e RH podem cancelar convites.",403);
      const result=await run("DELETE FROM invites WHERE token=? AND company_id=? AND type='member' AND used_at IS NULL",safeText(p.token,100),companyId);
      if(!result.meta.changes)return fail("Convite não encontrado.",404);
      return json({ok:true});
    }
    if(action==="change_member_role") {
      if(role!=="admin")return fail("Apenas o administrador pode alterar perfis.",403);
      const target=await one("SELECT id,role FROM members WHERE id=? AND company_id=?",p.memberId,companyId);
      const newRole=safeText(p.role);
      if(!target||target.id===memberId||target.role==="admin"||!["rh","leader","participant"].includes(newRole))return fail("Não é possível alterar este perfil.",403);
      await run("UPDATE members SET role=? WHERE id=? AND company_id=?",newRole,target.id,companyId);
      return json({ok:true});
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
      const email=emailText(p.email);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||(email===user.email.toLowerCase()||email===String(m.email).toLowerCase()))return fail("Informe o e-mail de alguém do time.");
      const existing=await one("SELECT token FROM invites WHERE company_id=? AND email=? AND type='mirror' AND reference_id=? AND used_at IS NULL AND expires_at>?",companyId,email,cycle.id,now());
      if(existing)return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${existing.token}`});
      const token=id();await run("INSERT INTO invites(token,company_id,email,type,role,reference_id,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?)",token,companyId,email,"mirror","participant",cycle.id,new Date(Date.now()+14*864e5).toISOString(),now());
      return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${token}`});
    }
    if(action==="respond_mirror") {
      const token=safeText(p.token,100),invite=await invitation(token,user.email.toLowerCase(),user.isGuest);
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
    if(action==="add_action_checkin") {
      const cycle=await one("SELECT id,status,action FROM mirror_cycles WHERE id=? AND company_id=? AND leader_id=?",p.cycleId,companyId,memberId);
      if(!cycle||cycle.status!=="closed"||!cycle.action)return fail("Escolha uma ação em um ciclo concluído antes de registrar a prática.",403);
      const note=safeText(p.note,280);
      if(note.length<8)return fail("Conte em uma frase o que aconteceu (mínimo de 8 caracteres).");
      const entryDate=brazilDay();
      if(await one("SELECT id FROM mirror_action_checkins WHERE cycle_id=? AND entry_date=?",cycle.id,entryDate))return fail("Você já registrou uma prática hoje neste ciclo.",409);
      await run("INSERT INTO mirror_action_checkins(id,cycle_id,action,note,entry_date,created_at) VALUES(?,?,?,?,?,?)",id(),cycle.id,cycle.action,note,entryDate,now());
      return json({ok:true});
    }
    if(action==="complete_decision") {
      const scenarioId=safeText(p.scenarioId),feedback=decisionFeedback(scenarioId,p.choices as number[]);
      if(!feedback)return fail("Escolhas inválidas.");
      await run("INSERT INTO decision_runs(id,company_id,member_id,scenario_id,choices,created_at) VALUES(?,?,?,?,?,?)",id(),companyId,memberId,scenarioId,JSON.stringify(p.choices),now());
      return json({ok:true,feedback,scenario:scenarios.find(s=>s.id===scenarioId)?.title});
    }
    if(action==="create_communication") {
      const partnerId=safeText(p.partnerId,100),requestedEmail=emailText(p.email);
      const partner=partnerId?await one("SELECT id,name,email FROM members WHERE id=? AND company_id=?",partnerId,companyId):requestedEmail?await one("SELECT id,name,email FROM members WHERE email=? AND company_id=?",requestedEmail,companyId):null;
      if(partnerId&&!partner)return fail("Escolha alguém do seu espaço.",404);
      const email=partner?String(partner.email).toLowerCase():requestedEmail;
      if(!partner&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return fail("Escolha alguém do time ou informe um e-mail válido.");
      if(partner?.id===memberId||email===user.email.toLowerCase()||email===String(m.email).toLowerCase())return fail("Escolha outra pessoa para formar a dupla.");
      const existing=partner?await one("SELECT id FROM communication_pairs WHERE company_id=? AND status='pending' AND ((creator_id=? AND partner_id=?) OR (creator_id=? AND partner_id=?)) ORDER BY created_at DESC LIMIT 1",companyId,memberId,partner.id,partner.id,memberId):await one("SELECT id FROM communication_pairs WHERE company_id=? AND creator_id=? AND partner_email=? AND status='pending' ORDER BY created_at DESC LIMIT 1",companyId,memberId,email);
      if(existing)return json({ok:true,id:existing.id,existing:true});
      const pairId=id();
      if(partner){await run("INSERT INTO communication_pairs(id,company_id,creator_id,partner_email,partner_id,status,created_at) VALUES(?,?,?,?,?,?,?)",pairId,companyId,memberId,email,partner.id,"pending",now());return json({ok:true,id:pairId})}
      const token=id();
      await db().batch([
        db().prepare("INSERT INTO communication_pairs(id,company_id,creator_id,partner_email,status,created_at) VALUES(?,?,?,?,?,?)").bind(pairId,companyId,memberId,email,"pending",now()),
        db().prepare("INSERT INTO invites(token,company_id,email,type,role,reference_id,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?)").bind(token,companyId,email,"communication","participant",pairId,new Date(Date.now()+14*864e5).toISOString(),now()),
      ]);
      return json({ok:true,id:pairId,link:`${new URL(request.url).origin}/app?invite=${token}`});
    }
    if(action==="renew_communication_invite") {
      const pair=await one("SELECT id,partner_email,partner_id,status FROM communication_pairs WHERE id=? AND company_id=? AND creator_id=?",p.pairId,companyId,memberId);
      if(!pair||pair.status!=="pending"||pair.partner_id)return fail("Esta dupla não precisa de um novo link.",403);
      const existing=await one("SELECT token FROM invites WHERE company_id=? AND type='communication' AND reference_id=? AND used_at IS NULL AND expires_at>? ORDER BY created_at DESC LIMIT 1",companyId,pair.id,now());
      const token=existing?.token||id();
      if(!existing)await run("INSERT INTO invites(token,company_id,email,type,role,reference_id,expires_at,created_at) VALUES(?,?,?,?,?,?,?,?)",token,companyId,pair.partner_email,"communication","participant",pair.id,new Date(Date.now()+14*864e5).toISOString(),now());
      return json({ok:true,link:`${new URL(request.url).origin}/app?invite=${token}`});
    }
    if(action==="respond_communication") {
      if(!validPreferences(p.preferences)||p.consent!==true)return fail("Responda aos itens e autorize a comparação.");
      const token=safeText(p.token,100),invite=token?await invitation(token,user.email.toLowerCase(),user.isGuest):null;
      if(token&&(!invite||invite.type!=="communication"||invite.company_id!==companyId))return fail("Convite inválido ou expirado.",404);
      const pair=invite?await one("SELECT * FROM communication_pairs WHERE id=? AND company_id=? AND status='pending'",invite.reference_id,companyId):await one("SELECT * FROM communication_pairs WHERE id=? AND company_id=? AND status='pending' AND (creator_id=? OR partner_id=?)",p.pairId,companyId,memberId,memberId);
      if(!pair||invite&&(pair.creator_id===memberId||pair.partner_id&&pair.partner_id!==memberId))return fail("Esta dupla não está disponível para você.",403);
      if(await one("SELECT id FROM communication_responses WHERE pair_id=? AND member_id=?",pair.id,memberId))return fail("Você já respondeu nesta dupla.",409);
      const statements=[db().prepare("INSERT INTO communication_responses(id,pair_id,member_id,preferences,consent,created_at) VALUES(?,?,?,?,?,?)").bind(id(),pair.id,memberId,JSON.stringify(p.preferences),1,now())];
      if(invite&& !pair.partner_id)statements.push(db().prepare("UPDATE communication_pairs SET partner_id=? WHERE id=? AND partner_id IS NULL").bind(memberId,pair.id));
      statements.push(db().prepare("UPDATE communication_pairs SET status='ready' WHERE id=? AND (SELECT COUNT(*) FROM communication_responses WHERE pair_id=? AND consent=1)=2").bind(pair.id,pair.id));
      if(pair.creator_id!==memberId)statements.push(db().prepare("UPDATE invites SET used_at=? WHERE company_id=? AND type='communication' AND reference_id=? AND used_at IS NULL").bind(now(),companyId,pair.id));
      await db().batch(statements);
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
    if(action==="add_energy") {
      const activity=safeText(p.activity,120),activityType=safeText(p.activityType,40),entryDate=safeText(p.entryDate,10);
      const earliest=new Date(Date.now()-14*864e5).toISOString().slice(0,10),latest=new Date(Date.now()+864e5).toISOString().slice(0,10);
      if(!activity||!energyTypes.includes(activityType as typeof energyTypes[number])||!validEnergy(p.energy)||!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)||entryDate<earliest||entryDate>latest)return fail("Revise a atividade, a data e a energia percebida.");
      await run("INSERT INTO energy_entries(id,company_id,member_id,entry_date,activity_type,activity,energy,created_at) VALUES(?,?,?,?,?,?,?,?)",id(),companyId,memberId,entryDate,activityType,activity,Number(p.energy),now());
      return json({ok:true});
    }
    if(action==="delete_energy") {
      const result=await run("DELETE FROM energy_entries WHERE id=? AND company_id=? AND member_id=?",p.entryId,companyId,memberId);
      if(!result.meta.changes)return fail("Registro não encontrado.",404);
      return json({ok:true});
    }
    if(action==="share_energy") {
      const email=emailText(p.email),leader=await one("SELECT id FROM members WHERE company_id=? AND email=? AND role IN ('admin','rh','leader')",companyId,email);
      if(!leader||leader.id===memberId)return fail("Escolha um líder ou RH da sua empresa.");
      const existing=await one("SELECT id FROM energy_shares WHERE company_id=? AND member_id=? AND leader_id=?",companyId,memberId,leader.id);
      if(existing)return json({ok:true});
      await run("INSERT INTO energy_shares(id,company_id,member_id,leader_id,created_at) VALUES(?,?,?,?,?)",id(),companyId,memberId,leader.id,now());
      return json({ok:true});
    }
    if(action==="revoke_energy_share") {
      const result=await run("DELETE FROM energy_shares WHERE id=? AND company_id=? AND member_id=?",p.shareId,companyId,memberId);
      if(!result.meta.changes)return fail("Compartilhamento não encontrado.",404);
      return json({ok:true});
    }
    if(action==="save_career") {
      const choices=p.choices as number[];
      if(!careerPriorities(choices))return fail("Responda todos os dilemas.");
      await run("INSERT INTO career_runs(id,company_id,member_id,choices,created_at) VALUES(?,?,?,?,?)",id(),companyId,memberId,JSON.stringify(choices),now());
      return json({ok:true});
    }
    if(action==="create_thermometer") {
      if(!["admin","rh","leader"].includes(role))return fail("Seu perfil não pode iniciar este acompanhamento.",403);
      const cycle=await one("SELECT id,status FROM mirror_cycles WHERE id=? AND company_id=? AND leader_id=?",p.cycleId,companyId,memberId);
      if(!cycle||cycle.status!=="closed")return fail("Conclua um ciclo do Espelho primeiro.");
      const participants=await one("SELECT COUNT(*) AS n FROM mirror_responses WHERE cycle_id=?",cycle.id);
      if(Number(participants?.n)<5)return fail("O ciclo precisa de cinco respostas para acompanhar a percepção do time.");
      const dimensions=p.dimensions as number[];
      if(!Array.isArray(dimensions)||dimensions.length<1||dimensions.length>3||new Set(dimensions).size!==dimensions.length||dimensions.some(v=>!Number.isInteger(v)||v<0||v>=mirrorQuestions.length))return fail("Escolha de um a três comportamentos.");
      if(await one("SELECT id FROM thermometer_tracks WHERE cycle_id=?",cycle.id))return fail("Este ciclo já tem acompanhamento.");
      const trackId=id(),roundId=id();
      await db().batch([
        db().prepare("INSERT INTO thermometer_tracks(id,company_id,leader_id,cycle_id,dimensions,created_at) VALUES(?,?,?,?,?,?)").bind(trackId,companyId,memberId,cycle.id,JSON.stringify(dimensions),now()),
        db().prepare("INSERT INTO thermometer_rounds(id,track_id,status,created_at) VALUES(?,?,?,?)").bind(roundId,trackId,"open",now()),
      ]);
      return json({ok:true});
    }
    if(action==="respond_thermometer") {
      const round=await one("SELECT r.id,t.company_id,t.cycle_id,t.dimensions,t.leader_id FROM thermometer_rounds r JOIN thermometer_tracks t ON t.id=r.track_id WHERE r.id=? AND r.status='open' AND t.company_id=?",p.roundId,companyId);
      if(!round||round.leader_id===memberId||!await one("SELECT id FROM mirror_responses WHERE cycle_id=? AND respondent_id=?",round.cycle_id,memberId))return fail("Este acompanhamento não está disponível para você.",403);
      const dimensions=parse(round.dimensions) as number[],scores=p.scores as unknown;
      if(!Array.isArray(scores)||scores.length!==dimensions.length||scores.some(v=>v!==null&&(!Number.isInteger(v)||v<1||v>5)))return fail("Revise as respostas do acompanhamento.");
      if(await one("SELECT id FROM thermometer_responses WHERE round_id=? AND respondent_id=?",round.id,memberId))return fail("Você já respondeu esta rodada.",409);
      await run("INSERT INTO thermometer_responses(id,round_id,respondent_id,scores,created_at) VALUES(?,?,?,?,?)",id(),round.id,memberId,JSON.stringify(scores),now());
      return json({ok:true});
    }
    if(action==="close_thermometer_round") {
      const round=await one("SELECT r.id FROM thermometer_rounds r JOIN thermometer_tracks t ON t.id=r.track_id WHERE r.id=? AND r.status='open' AND t.company_id=? AND t.leader_id=?",p.roundId,companyId,memberId);
      if(!round)return fail("Rodada não encontrada.",404);
      await run("UPDATE thermometer_rounds SET status='closed',closed_at=? WHERE id=?",now(),round.id);
      return json({ok:true});
    }
    if(action==="new_thermometer_round") {
      const track=await one("SELECT id FROM thermometer_tracks WHERE id=? AND company_id=? AND leader_id=?",p.trackId,companyId,memberId);
      if(!track)return fail("Acompanhamento não encontrado.",404);
      if(await one("SELECT id FROM thermometer_rounds WHERE track_id=? AND status='open'",track.id))return fail("Encerre a rodada atual antes de começar outra.");
      await run("INSERT INTO thermometer_rounds(id,track_id,status,created_at) VALUES(?,?,?,?)",id(),track.id,"open",now());
      return json({ok:true});
    }
    return fail("Ação desconhecida.",404);
  } catch(e){console.error("app post failed",e);return fail("Não foi possível concluir. Revise os dados e tente novamente.",500)}
}
