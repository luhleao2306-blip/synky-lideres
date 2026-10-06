import { allStudyLessons, FINAL_QUIZ_ID, legacyStudyQuestionIds, PASSING_GRADE, studyCourses, studyQuiz, type StudyQuestion } from "./academy-curriculum";
export type StudyAnswers = Record<string, number>;
export type StudyAttempt = { id: string; quizId: string; answers: StudyAnswers; questionIds?: string[]; at: string; grade: number; correct: number; total: number };
export type StudyProgress = { version: 1; studied: string[]; bookmarks: string[]; drafts: Record<string, StudyAnswers>; attempts: StudyAttempt[]; updatedAt: string | null };
export const emptyStudyProgress = (): StudyProgress => ({ version: 1, studied: [], bookmarks: [], drafts: {}, attempts: [], updatedAt: null });
export const studyStorageKey = (companyId: string, memberId: string) => `synky:academy:v1:${encodeURIComponent(companyId)}:${encodeURIComponent(memberId)}`;
function scoreQuestions(questions: StudyQuestion[], answers: StudyAnswers) {
  if (questions.some(question => !Number.isInteger(answers[question.id]) || answers[question.id] < 0 || answers[question.id] >= question.options.length)) throw new Error("Responda todas as questões antes de finalizar.");
  const correct = questions.filter(question => answers[question.id] === question.correct).length;
  return { correct, total: questions.length, grade: Math.round(correct / questions.length * 100) / 10 };
}
const sameIds = (left: string[], right: string[]) => left.length === right.length && new Set(left).size === left.length && left.every(id => right.includes(id));
export function attemptStudyQuestions(attempt: StudyAttempt) {
  const quiz = studyQuiz(attempt.quizId);
  const ids = attempt.questionIds || Object.keys(attempt.answers);
  return quiz?.questions.filter(question => ids.includes(question.id)) || [];
}
export function isCurrentStudyAttempt(attempt: StudyAttempt) {
  const quiz = studyQuiz(attempt.quizId);
  return !!quiz && sameIds(attempt.questionIds || Object.keys(attempt.answers), quiz.questions.map(question => question.id));
}
export function latestCurrentStudyAttempt(progress: StudyProgress, quizId: string) { return [...progress.attempts].reverse().find(attempt => attempt.quizId === quizId && isCurrentStudyAttempt(attempt)); }
export function scoreStudyQuiz(quizId: string, answers: StudyAnswers) {
  const quiz = studyQuiz(quizId);
  if (!quiz) throw new Error("Avaliação não encontrada.");
  return scoreQuestions(quiz.questions, answers);
}
export function latestStudyAttempt(progress: StudyProgress, quizId: string) { return [...progress.attempts].reverse().find(attempt => attempt.quizId === quizId); }
export function courseStudied(progress: StudyProgress, courseId: string) { const course = studyCourses.find(item => item.id === courseId); return !!course && course.lessons.every(lesson => progress.studied.includes(lesson.id)); }
export function quizUnlocked(progress: StudyProgress, quizId: string) {
  if (quizId === FINAL_QUIZ_ID) return studyCourses.every(course => courseStudied(progress, course.id) && (latestCurrentStudyAttempt(progress, course.id)?.grade ?? -1) >= PASSING_GRADE);
  const quiz = studyQuiz(quizId);
  if (quiz?.practice) return quiz.lessons.every(lesson => progress.studied.includes(lesson.id));
  return courseStudied(progress, quizId);
}
export function parseStudyProgress(raw: string): StudyProgress {
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !Array.isArray(value.studied) || !Array.isArray(value.bookmarks) || !Array.isArray(value.attempts) || value.attempts.length > 1000 || !value.drafts || typeof value.drafts !== "object" || Array.isArray(value.drafts)) throw new Error("O progresso salvo não está em um formato válido.");
  const validLessons = new Set(allStudyLessons.map(lesson => lesson.id));
  const ids = (items: unknown[]): string[] => { if (items.some(item => typeof item !== "string" || !validLessons.has(item))) throw new Error("Aula inválida no progresso salvo."); return [...new Set(items as string[])]; };
  const answersFor = (id: string, input: unknown): StudyAnswers => { const quiz = studyQuiz(id); if (!quiz || !input || typeof input !== "object" || Array.isArray(input)) throw new Error("Respostas inválidas no progresso salvo."); const result: StudyAnswers = {}; for (const [questionId, answer] of Object.entries(input)) { const question = quiz.questions.find(item => item.id === questionId); if (!question || typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= question.options.length) throw new Error("Alternativa inválida no progresso salvo."); result[questionId] = answer; } return result; };
  const drafts: Record<string, StudyAnswers> = {};
  for (const [id, input] of Object.entries(value.drafts)) drafts[id] = answersFor(id, input);
  const attempts = value.attempts.map((item: Record<string, unknown>) => {
    if (!item || typeof item.id !== "string" || !item.id || typeof item.quizId !== "string" || typeof item.at !== "string" || !Number.isFinite(Date.parse(item.at))) throw new Error("Tentativa inválida no progresso salvo.");
    const answers = answersFor(item.quizId, item.answers), quiz = studyQuiz(item.quizId)!;
    if (item.questionIds !== undefined && (!Array.isArray(item.questionIds) || item.questionIds.some(id => typeof id !== "string"))) throw new Error("Questões inválidas no histórico salvo.");
    const questionIds = (item.questionIds as string[] | undefined) || Object.keys(answers);
    const legacyIds = legacyStudyQuestionIds[item.quizId];
    if (!sameIds(questionIds, Object.keys(answers)) || (!sameIds(questionIds, quiz.questions.map(question => question.id)) && !(legacyIds && sameIds(questionIds, legacyIds)))) throw new Error("Tentativa incompleta ou versão desconhecida no histórico salvo.");
    const questions = quiz.questions.filter(question => questionIds.includes(question.id));
    return { id: item.id, quizId: item.quizId, at: item.at, answers, ...(item.questionIds ? { questionIds } : {}), ...scoreQuestions(questions, answers) };
  });
  if (new Set(attempts.map((attempt: StudyAttempt) => attempt.id)).size !== attempts.length) throw new Error("Tentativas duplicadas no progresso salvo.");
  return { version: 1, studied: ids(value.studied), bookmarks: ids(value.bookmarks), drafts, attempts, updatedAt: typeof value.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt)) ? value.updatedAt : null };
}
