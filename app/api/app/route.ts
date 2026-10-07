import { env } from "cloudflare:workers";
import { getAppUser } from "../../guest-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { profilePhotoUrl } from "@/lib/profile";
export const dynamic="force-dynamic";
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(request:Request){
  try{
    const {user}=await getAppUser(request,false);if(!user||user.isGuest)return json({error:"Entre para acessar a plataforma."},401);
    if(!env.DB)return json({error:"Sua conta está temporariamente indisponível."},503);
    const memberships=(await env.DB.prepare("SELECT m.id,m.role,m.company_id AS companyId,c.name AS companyName FROM members m JOIN companies c ON c.id=m.company_id WHERE m.user_id=? ORDER BY c.name,m.id").bind(user.userId).all<{id:string;role:string;companyId:string;companyName:string}>()).results;
    const company=new URL(request.url).searchParams.get("company");
    const membership=company?memberships.find(item=>item.companyId===company):memberships[0];
    if(company&&!membership)return json({error:"Você não tem acesso a este espaço."},403);
    return json({user:{name:user.displayName,email:user.email,avatarUrl:await profilePhotoUrl(user.userId)},membership,memberships,platformAdmin:isPlatformAdmin(user)});
  }catch{return json({error:"Não foi possível carregar sua conta. Tente novamente."},503);}
}
// As seis experiências e suas ações foram retiradas. Nenhum acesso legado
// pode criar respostas, convites ou resultados dessas ferramentas.
export async function POST(){return json({error:"Este recurso foi retirado. Acesse os cursos no painel."},410);}
