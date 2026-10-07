import { env } from "cloudflare:workers";
import { ensureAuthSchema } from "./cloudflare-auth";
import { courseResults, type AcademyReport, type CertificateRecord, type CourseFeedback, type CourseResult } from "./academy-report";
import { parseStudyProgress } from "@/app/app/academy-model";
import { studyCourses, studyPractices } from "@/app/app/academy-curriculum";

let setup: Promise<void> | null = null;
export async function ensureAcademySchema() {
  if (!env.DB) throw new Error("Banco indisponível.");
  if (!setup) setup = (async () => {
    await ensureAuthSchema();
    await env.DB!.batch([
      env.DB!.prepare(`CREATE TABLE IF NOT EXISTS synky_academy_records(member_id TEXT NOT NULL,company_id TEXT NOT NULL,progress TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,write_id TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(member_id,company_id))`),
      env.DB!.prepare(`CREATE TABLE IF NOT EXISTS synky_academy_legacy_snapshots(member_id TEXT NOT NULL,company_id TEXT NOT NULL,course_progress TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(member_id,company_id))`),
      env.DB!.prepare(`CREATE TABLE IF NOT EXISTS synky_course_certificates(id TEXT PRIMARY KEY,member_id TEXT NOT NULL,company_id TEXT NOT NULL,course_id TEXT NOT NULL,course_title TEXT NOT NULL,recipient TEXT NOT NULL,grade REAL NOT NULL,issued_at TEXT NOT NULL,UNIQUE(member_id,company_id,course_id))`),
      env.DB!.prepare(`CREATE TABLE IF NOT EXISTS synky_course_feedback(member_id TEXT NOT NULL,company_id TEXT NOT NULL,course_id TEXT NOT NULL,rating INTEGER NOT NULL,message TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(member_id,company_id,course_id))`),
    ]);
  })().catch(error => { setup = null; throw error; });
  await setup;
}
export async function readAcademyProgress(memberId: string, companyId: string) {
  await ensureAcademySchema();
  const row = await env.DB!.prepare("SELECT progress,revision,updated_at AS updatedAt FROM synky_academy_records WHERE member_id=? AND company_id=?").bind(memberId, companyId).first<{ progress: string; revision: number; updatedAt: string }>();
  return row ? { progress: parseStudyProgress(row.progress), revision: row.revision, updatedAt: row.updatedAt } : null;
}
export async function readAcademyReport(subject: AcademyReport["subject"]): Promise<AcademyReport> {
  await ensureAcademySchema();
  const stored = await readAcademyProgress(subject.id, subject.companyId);
  const [certificates, feedback] = await Promise.all([
    env.DB!.prepare("SELECT id,course_id AS courseId,course_title AS courseTitle,recipient,grade,issued_at AS issuedAt FROM synky_course_certificates WHERE member_id=? AND company_id=? ORDER BY issued_at DESC").bind(subject.id,subject.companyId).all<CertificateRecord>(),
    env.DB!.prepare("SELECT course_id AS courseId,rating,message,updated_at AS updatedAt FROM synky_course_feedback WHERE member_id=? AND company_id=? ORDER BY updated_at DESC").bind(subject.id,subject.companyId).all<CourseFeedback>(),
  ]);
  const old = await env.DB!.prepare(`SELECT course_progress,updated_at FROM synky_academy_legacy_snapshots WHERE member_id=? AND company_id=?
    UNION ALL SELECT course_progress,updated_at FROM synky_academy_progress WHERE member_id=? AND company_id=? LIMIT 1`).bind(subject.id,subject.companyId,subject.id,subject.companyId).first<{ course_progress: string; updated_at: string }>();
  let courses: CourseResult[] = [];
  if (old) {
    const rows: { courseId: string; complete: boolean; grade: number | null; attempts: number }[] = JSON.parse(old.course_progress);
    courses = rows.filter(item => item.complete || item.grade !== null || item.attempts > 0).flatMap(item => { const course = studyCourses.find(course => course.id === item.courseId); return course ? [{ courseId: course.id, title: course.title, complete: item.complete, studied: null, totalLessons: course.lessons.length, activitiesDone: null, totalActivities: studyPractices.filter(practice => practice.courseId === course.id).length, activityGrade: null, examGrade: item.grade, overallGrade: null, attempts: item.attempts, activities: [], history: [] }] : []; });
  }
  const current = stored ? courseResults(stored.progress) : [];
  for (const course of current) {
    const previous = courses.find(item => item.courseId === course.courseId);
    if (course.examGrade === null && previous?.examGrade !== null && previous?.examGrade !== undefined) course.previousExamGrade = previous.examGrade;
  }
  const legacy = courses.filter(course => !current.some(item => item.courseId === course.courseId));
  return { subject, courses: [...current, ...legacy], certificates: certificates.results, feedback: feedback.results, updatedAt: stored?.updatedAt || old?.updated_at || null, legacy: legacy.length > 0 || current.some(item => item.previousExamGrade !== undefined) };
}
