import { env } from "cloudflare:workers";
import { getAppUser } from "../../guest-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { readAcademyReport } from "@/lib/academy-storage";
import type { AcademyReport } from "@/lib/academy-report";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(request:Request) {
  try {
    const {user}=await getAppUser(request,false);
    if(!user||user.isGuest)return json({error:"Entre para consultar os resultados."},401);
    if(!env.DB)return json({error:"Resultados temporariamente indisponíveis."},503);
    const url=new URL(request.url),master=isPlatformAdmin(user);
    if(url.searchParams.get("scope")==="directory"){
      if(!master)return json({error:"Consulta restrita à administração."},403);
      const search=(url.searchParams.get("q")||"").trim().slice(0,80),offset=Math.max(0,Math.min(100000,parseInt(url.searchParams.get("offset")||"0",10)||0));
      const filter=search?"WHERE m.name LIKE ? OR m.email LIKE ? OR c.name LIKE ?":"",values=search?[`%${search}%`,`%${search}%`,`%${search}%`]:[];
      const [total,people]=await Promise.all([
        env.DB.prepare(`SELECT COUNT(*) AS total FROM members m JOIN companies c ON c.id=m.company_id ${filter}`).bind(...values).first<{total:number}>(),
        env.DB.prepare(`SELECT m.id,m.name,m.email,m.company_id AS companyId,c.name AS companyName FROM members m JOIN companies c ON c.id=m.company_id ${filter} ORDER BY m.name COLLATE NOCASE,m.id LIMIT 30 OFFSET ?`).bind(...values,offset).all<AcademyReport["subject"]>(),
      ]);
      return json({people:people.results,total:total?.total||0,offset,pageSize:30});
    }
    const id=url.searchParams.get("member"),company=url.searchParams.get("company");
    const subject=id
      ?await env.DB.prepare("SELECT m.id,m.name,m.email,m.user_id AS userId,m.company_id AS companyId,c.name AS companyName FROM members m JOIN companies c ON c.id=m.company_id WHERE m.id=?").bind(id).first<AcademyReport["subject"] & {userId:string}>()
      :await env.DB.prepare(`SELECT m.id,m.name,m.email,m.user_id AS userId,m.company_id AS companyId,c.name AS companyName FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? ${company?"AND m.company_id=?":""} ORDER BY m.rowid LIMIT 1`).bind(user.userId,...company?[company]:[]).first<AcademyReport["subject"] & {userId:string}>();
    if(!subject)return json({error:"Cliente não encontrado."},404);
    if(!master&&subject.userId!==user.userId)return json({error:"Você só pode consultar seus próprios resultados."},403);
    const publicSubject={id:subject.id,name:subject.name,email:subject.email,companyId:subject.companyId,companyName:subject.companyName};
    return json(await readAcademyReport(publicSubject));
  }catch{return json({error:"Não foi possível carregar os resultados. Tente novamente."},503);}
}
