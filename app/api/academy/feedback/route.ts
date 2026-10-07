import { env } from "cloudflare:workers";
import { getAppUser } from "../../../guest-auth";
import { sameOrigin } from "@/lib/cloudflare-auth";
import { boundedBody } from "@/lib/profile";
import { ensureAcademySchema, readAcademyReport } from "@/lib/academy-storage";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function POST(request:Request) {
  if(!sameOrigin(request))return json({error:"Solicitação inválida."},403);
  try {
    const {user}=await getAppUser(request,false);
    if(!user||user.isGuest||!env.DB)return json({error:"Entre para enviar seu feedback."},401);
    const input=JSON.parse(new TextDecoder().decode(await boundedBody(request,12000))) as {companyId?:unknown;courseId?:unknown;rating?:unknown;message?:unknown};
    if(!input||typeof input.companyId!=="string"||typeof input.courseId!=="string"||!Number.isInteger(input.rating)||Number(input.rating)<1||Number(input.rating)>5||typeof input.message!=="string"||input.message.trim().length<3||input.message.length>2000)return json({error:"Escolha uma nota de 1 a 5 e escreva entre 3 e 2.000 caracteres."},400);
    const subject=await env.DB.prepare("SELECT m.id,m.name,m.email,m.company_id AS companyId,c.name AS companyName FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? AND m.company_id=? LIMIT 1").bind(user.userId,input.companyId).first<{id:string;name:string;email:string;companyId:string;companyName:string}>();
    if(!subject)return json({error:"Este espaço não pertence à sua conta."},403);
    await ensureAcademySchema();
    const report=await readAcademyReport(subject);
    if(!report.courses.some(course=>course.courseId===input.courseId))return json({error:"Comece o curso e sincronize seus estudos antes de avaliar."},400);
    const now=new Date().toISOString();
    await env.DB.prepare("INSERT INTO synky_course_feedback(member_id,company_id,course_id,rating,message,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(member_id,company_id,course_id) DO UPDATE SET rating=excluded.rating,message=excluded.message,updated_at=excluded.updated_at").bind(subject.id,subject.companyId,input.courseId,input.rating,input.message.trim(),now).run();
    return json({ok:true});
  } catch{return json({error:"Não foi possível salvar o feedback. Tente novamente."},503);}
}
