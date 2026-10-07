import { env } from "cloudflare:workers";
import { getAppUser } from "../../../guest-auth";
import { ensureAuthSchema } from "@/lib/cloudflare-auth";
import { allStudyLessons, studyCourses } from "@/app/app/academy-curriculum";

export const dynamic = "force-dynamic";
type CourseProgress = { courseId: string; complete: boolean; grade: number | null; attempts: number };

export async function POST(request: Request) {
  const { user } = await getAppUser(request, false);
  if (!user) return Response.json({ error: "Entre para sincronizar seu progresso." }, { status: 401 });
  if (!env.DB) return Response.json({ error: "Sincronização temporariamente indisponível." }, { status: 503 });
  try {
    await ensureAuthSchema();
    const input = await request.json() as { companyId?: unknown; studiedLessons?: unknown; totalLessons?: unknown; courseProgress?: unknown; finalGrade?: unknown };
    const companyId = typeof input.companyId === "string" ? input.companyId.slice(0, 80) : "";
    const member = await env.DB.prepare("SELECT id FROM members WHERE user_id=? AND company_id=? LIMIT 1").bind(user.userId, companyId).first<{ id: string }>();
    if (!member) return Response.json({ error: "Este espaço não pertence a esta conta." }, { status: 403 });
    const totalLessons = allStudyLessons.length;
    const studiedLessons = Number(input.studiedLessons);
    if (!Number.isInteger(studiedLessons) || studiedLessons < 0 || studiedLessons > totalLessons || input.totalLessons !== totalLessons || !Array.isArray(input.courseProgress) || input.courseProgress.length !== studyCourses.length) return Response.json({ error: "O progresso recebido não é válido." }, { status: 400 });
    const allowed = new Set(studyCourses.map(course => course.id));
    const courseProgress: CourseProgress[] = input.courseProgress.map(item => {
      if (!item || typeof item !== "object") throw new Error("Atividade inválida.");
      const value = item as Record<string, unknown>;
      if (typeof value.courseId !== "string" || !allowed.has(value.courseId) || typeof value.complete !== "boolean" || typeof value.attempts !== "number" || !Number.isInteger(value.attempts) || Number(value.attempts) < 0 || Number(value.attempts) > 1000 || (value.grade !== null && (typeof value.grade !== "number" || value.grade < 0 || value.grade > 10))) throw new Error("Atividade inválida.");
      return { courseId: value.courseId, complete: value.complete, grade: value.grade as number | null, attempts: Number(value.attempts) };
    });
    const finalGrade = input.finalGrade === null ? null : Number(input.finalGrade);
    if (finalGrade !== null && (!Number.isFinite(finalGrade) || finalGrade < 0 || finalGrade > 10)) return Response.json({ error: "A nota informada não é válida." }, { status: 400 });
    await env.DB.prepare(`INSERT INTO synky_academy_progress(member_id,company_id,course_progress,final_grade,studied_lessons,total_lessons,updated_at)
      VALUES(?,?,?,?,?,?,?) ON CONFLICT(member_id,company_id) DO UPDATE SET course_progress=excluded.course_progress,final_grade=excluded.final_grade,studied_lessons=excluded.studied_lessons,total_lessons=excluded.total_lessons,updated_at=excluded.updated_at`)
      .bind(member.id, companyId, JSON.stringify(courseProgress), finalGrade, studiedLessons, totalLessons, new Date().toISOString()).run();
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("academy progress sync failed", error);
    return Response.json({ error: "Não foi possível sincronizar seu progresso." }, { status: 400 });
  }
}
