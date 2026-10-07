import { studyCourses, studyPractices, studyQuizTitle } from "@/app/app/academy-curriculum";
import { courseCompleted, courseStarted, latestCurrentStudyAttempt, type StudyProgress } from "@/app/app/academy-model";

export type CourseResult = {
  courseId: string; title: string; complete: boolean; studied: number | null; totalLessons: number;
  activitiesDone: number | null; totalActivities: number; activityGrade: number | null;
  examGrade: number | null; overallGrade: number | null; attempts: number;
  previousExamGrade?: number;
  activities: { id: string; title: string; grade: number | null; attempts: number; at: string | null }[];
  history: { id: string; title: string; kind: "activity" | "exam"; grade: number; at: string }[];
};
export type CertificateRecord = { id: string; courseId: string; courseTitle: string; recipient: string; grade: number; issuedAt: string };
export type CourseFeedback = { courseId: string; rating: number; message: string; updatedAt: string };
export type AcademyReport = {
  subject: { id: string; name: string; email: string; companyId: string; companyName: string };
  courses: CourseResult[]; certificates: CertificateRecord[]; feedback: CourseFeedback[];
  updatedAt: string | null; legacy: boolean;
};
export const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100 : null;
// Nota geral: média simples das práticas realizadas e da última prova atual.
// Uma nota geral só existe quando a prova e alguma prática foram realizadas.
export function courseResults(progress: StudyProgress): CourseResult[] {
  return studyCourses.filter(course => courseStarted(progress, course.id)).map(course => {
    const practices = studyPractices.filter(item => item.courseId === course.id);
    const activities = practices.map(practice => { const attempt = latestCurrentStudyAttempt(progress, practice.id); return { id: practice.id, title: studyQuizTitle(practice.id), grade: attempt?.grade ?? null, at: attempt?.at ?? null, attempts: progress.attempts.filter(item => item.quizId === practice.id).length }; });
    const activityGrade = average(activities.flatMap(item => item.grade === null ? [] : [item.grade]));
    const examGrade = latestCurrentStudyAttempt(progress, course.id)?.grade ?? null;
    const ids = new Set([course.id, ...practices.map(item => item.id)]);
    return { courseId: course.id, title: course.title, complete: courseCompleted(progress, course.id), studied: course.lessons.filter(item => progress.studied.includes(item.id)).length, totalLessons: course.lessons.length, activitiesDone: activities.filter(item => item.grade !== null).length, totalActivities: practices.length, activityGrade, examGrade, overallGrade: activityGrade !== null && examGrade !== null ? average([activityGrade, examGrade]) : null, attempts: progress.attempts.filter(item => item.quizId === course.id).length, activities, history: progress.attempts.filter(item => ids.has(item.quizId)).map(item => ({ id: item.id, title: studyQuizTitle(item.quizId), kind: item.quizId === course.id ? "exam" as const : "activity" as const, grade: item.grade, at: item.at })) };
  });
}
