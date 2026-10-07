import { env } from "cloudflare:workers";
import { getAppUser } from "../../../guest-auth";
import { sameOrigin } from "@/lib/cloudflare-auth";
import { boundedBody } from "@/lib/profile";
import { allStudyLessons, studyCourses } from "@/app/app/academy-curriculum";
import { mergeStudyProgress, emptyStudyProgress, isCurrentStudyAttempt, parseStudyProgress, quizUnlocked } from "@/app/app/academy-model";
import { courseResults, average } from "@/lib/academy-report";
import { ensureAcademySchema, readAcademyProgress } from "@/lib/academy-storage";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
async function member(request: Request, companyId: string) {
  const { user } = await getAppUser(request, false);
  if (!user || user.isGuest || !env.DB) return null;
  return env.DB.prepare("SELECT id,name,company_id AS companyId FROM members WHERE user_id=? AND company_id=? LIMIT 1").bind(user.userId,companyId).first<{id:string;name:string;companyId:string}>();
}
export async function GET(request: Request) {
  try {
    const own = await member(request, new URL(request.url).searchParams.get("company") || "");
    if (!own) return json({error:"Entre na sua conta para recuperar os estudos."},403);
    const stored = await readAcademyProgress(own.id,own.companyId);
    return json({progress:stored?.progress || null,revision:stored?.revision || 0});
  } catch { return json({error:"Não foi possível recuperar o progresso. Tente novamente."},503); }
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({error:"Solicitação inválida."},403);
  try {
    const input = JSON.parse(new TextDecoder().decode(await boundedBody(request,2_000_000))) as {companyId?:unknown;progress?:unknown;revision?:unknown};
    if (!input || typeof input !== "object" || typeof input.companyId !== "string" || !Number.isInteger(input.revision) || Number(input.revision)<0 || !input.progress) return json({error:"Atualize o painel para sincronizar os estudos."},400);
    const own = await member(request,input.companyId);
    if (!own) return json({error:"Este espaço não pertence à sua conta."},403);
    await ensureAcademySchema();
    const incoming = parseStudyProgress(JSON.stringify(input.progress));
    const stored = await readAcademyProgress(own.id,own.companyId);
    if ((stored?.revision || 0) !== input.revision) return json({error:"O progresso foi atualizado em outra sessão. Recarregue para reunir os registros."},409);
    // Não substitui notas antigas por um navegador sem histórico local.
    if (!stored && !incoming.studied.length && !incoming.attempts.length && !incoming.started?.length) return json({ok:true,revision:0});
    const progress = stored ? mergeStudyProgress(stored.progress,incoming) : incoming;
    // Recalcula todas as notas com o gabarito e impede provas sem práticas anteriores.
    const earlier = {...emptyStudyProgress(),studied:progress.studied};
    for (const attempt of progress.attempts) {
      if (isCurrentStudyAttempt(attempt) && !quizUnlocked(earlier,attempt.quizId)) return json({error:"Conclua os estudos e atividades antes da prova do curso."},400);
      earlier.attempts.push(attempt);
    }
    const courses = courseResults(progress), now = new Date().toISOString(), revision = Number(input.revision)+1, writeId=crypto.randomUUID();
    const summary = studyCourses.map(course => { const result = courses.find(item => item.courseId===course.id); return {courseId:course.id,complete:result?.complete || false,grade:result?.examGrade ?? null,attempts:result?.attempts || 0}; });
    const guard = "EXISTS(SELECT 1 FROM synky_academy_records WHERE member_id=? AND company_id=? AND revision=? AND write_id=?)";
    const change = stored
      ? env.DB!.prepare("UPDATE synky_academy_records SET progress=?,revision=?,updated_at=?,write_id=? WHERE member_id=? AND company_id=? AND revision=?").bind(JSON.stringify(progress),revision,now,writeId,own.id,own.companyId,input.revision)
      : env.DB!.prepare("INSERT OR IGNORE INTO synky_academy_records(member_id,company_id,progress,revision,updated_at,write_id) VALUES(?,?,?,?,?,?)").bind(own.id,own.companyId,JSON.stringify(progress),revision,now,writeId);
    const result = await env.DB!.batch([
      change,
      ...(!stored ? [env.DB!.prepare(`INSERT OR IGNORE INTO synky_academy_legacy_snapshots(member_id,company_id,course_progress,updated_at) SELECT member_id,company_id,course_progress,updated_at FROM synky_academy_progress WHERE member_id=? AND company_id=? AND ${guard}`).bind(own.id,own.companyId,own.id,own.companyId,revision,writeId)] : []),
      env.DB!.prepare(`INSERT INTO synky_academy_progress(member_id,company_id,course_progress,final_grade,studied_lessons,total_lessons,updated_at) SELECT ?,?,?,?,?,?,? WHERE ${guard} ON CONFLICT(member_id,company_id) DO UPDATE SET course_progress=excluded.course_progress,final_grade=excluded.final_grade,studied_lessons=excluded.studied_lessons,total_lessons=excluded.total_lessons,updated_at=excluded.updated_at`).bind(own.id,own.companyId,JSON.stringify(summary),average(courses.flatMap(item=>item.examGrade===null?[]:[item.examGrade])),progress.studied.length,allStudyLessons.length,now,own.id,own.companyId,revision,writeId),
      ...courses.filter(course=>course.complete).map(course=>env.DB!.prepare(`INSERT OR IGNORE INTO synky_course_certificates(id,member_id,company_id,course_id,course_title,recipient,grade,issued_at) SELECT ?,?,?,?,?,?,?,? WHERE ${guard}`).bind(crypto.randomUUID(),own.id,own.companyId,course.courseId,course.title,own.name,course.examGrade,now,own.id,own.companyId,revision,writeId)),
    ]);
    if (!result[0].meta.changes) return json({error:"Outra sessão atualizou seus estudos. Recarregue para reunir os registros."},409);
    return json({ok:true,revision});
  } catch(error) { return json({error:error instanceof Error && error.message==="BODY_TOO_LARGE"?"Seu histórico excedeu o limite de sincronização. Exporte uma cópia e entre em contato com a administração.":"Não foi possível sincronizar. Os estudos salvos neste navegador foram preservados."},503); }
}
