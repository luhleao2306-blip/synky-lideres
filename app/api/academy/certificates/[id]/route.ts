import { env } from "cloudflare:workers";
import { getAppUser } from "../../../../guest-auth";
import { isPlatformAdmin } from "@/lib/platform-admin";
import { ensureAcademySchema } from "@/lib/academy-storage";
export const dynamic="force-dynamic";
const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}) {
  const denied=()=>new Response("Certificado não disponível para esta conta.",{status:404,headers:{"Cache-Control":"private, no-store"}});
  try{
    const {user}=await getAppUser(request,false);if(!user||user.isGuest||!env.DB)return denied();
    await ensureAcademySchema();const {id}=await params;
    const cert=await env.DB.prepare("SELECT cert.*,m.user_id FROM synky_course_certificates cert JOIN members m ON m.id=cert.member_id AND m.company_id=cert.company_id WHERE cert.id=?").bind(id).first<{id:string;user_id:string;recipient:string;course_title:string;grade:number;issued_at:string}>();
    if(!cert||cert.user_id!==user.userId&&!isPlatformAdmin(user))return denied();
    const nonce=crypto.randomUUID();
    const html=`<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Certificado · Synky Leaders</title><style nonce="${nonce}">*{box-sizing:border-box}body{margin:0;background:#f2f8f4;color:#083f30;font-family:Arial,sans-serif;padding:35px}main{max-width:1100px;margin:auto;padding:70px;border:2px solid #078461;background:white;text-align:center;border-radius:20px}header{font-size:22px;letter-spacing:.12em;font-weight:700}small{display:block;letter-spacing:.08em}h1{font-family:Georgia,serif;font-weight:400;font-size:48px;margin:48px 0 25px}h2{font-size:34px}p{font-size:18px;line-height:1.9}.course{font-size:26px;font-weight:700}footer{margin-top:40px;font-size:12px;overflow-wrap:anywhere;color:#55736a}button{display:block;margin:25px auto;padding:14px 24px;border:0;border-radius:10px;background:#078461;color:white;font-size:16px;cursor:pointer}@media(max-width:650px){body{padding:15px}main{padding:35px 20px}h1{font-size:35px}h2{font-size:27px}}@media print{body{padding:0;background:white}main{border-radius:0;max-width:none;padding:45px;break-inside:avoid}button{display:none}@page{size:A4 landscape;margin:15mm}}</style></head><body><main><header>SYNKY <small>LEADERS</small></header><h1>Certificado de conclusão</h1><p>Certificamos que</p><h2>${escape(cert.recipient)}</h2><p>concluiu as aulas e atividades práticas do curso</p><p class="course">${escape(cert.course_title)}</p><p>com nota <strong>${cert.grade.toLocaleString("pt-BR")} de 10</strong> na prova final.</p><p>Emitido em ${escape(new Date(cert.issued_at).toLocaleDateString("pt-BR"))}</p><footer>Registro: ${escape(cert.id)}<br>Certificado de conclusão de curso livre · Synky Leaders</footer></main><button id="print">Imprimir ou salvar em PDF</button><script nonce="${nonce}">document.getElementById('print').addEventListener('click',()=>window.print())</script></body></html>`;
    return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":`default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'`}});
  }catch{return new Response("Não foi possível abrir o certificado. Tente novamente.",{status:503,headers:{"Cache-Control":"private, no-store"}});}
}
