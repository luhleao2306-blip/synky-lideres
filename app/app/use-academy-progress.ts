"use client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { JourneyStorageContext } from "./use-journey-store";
import { emptyStudyProgress, parseStudyProgress, type StudyProgress } from "./academy-model";
import { allStudyLessons, FINAL_QUIZ_ID, studyCourses } from "./academy-curriculum";
import { courseCompleted, latestCurrentStudyAttempt } from "./academy-model";

export default function useAcademyProgress(key: string, companyId: string) {
  const override = useContext(JourneyStorageContext);
  const [progress, setProgress] = useState<StudyProgress>(emptyStudyProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [saved, setSaved] = useState(false);
  const current = useRef(progress);
  const ready = useRef(false);
  const dirty = useRef(false);
  const failedWrite = useRef(false);
  const load = useCallback(() => {
    try { const raw = (override || window.localStorage).getItem(key); const value = raw ? parseStudyProgress(raw) : emptyStudyProgress(); current.current = value; setProgress(value); setError(""); setBlocked(false); setSaved(!!raw); failedWrite.current = false; dirty.current = false; ready.current = true; }
    catch { ready.current = false; setBlocked(true); setError("Não foi possível ler o progresso de estudos. Os registros salvos foram preservados. Tente carregar novamente; não limpe os dados do navegador."); }
    finally { setLoading(false); }
  }, [key, override]);
  useEffect(() => { const timer = window.setTimeout(load, 0); const changed = (event: StorageEvent) => { if (!override && event.key === key && event.storageArea === window.localStorage) { if (dirty.current) { ready.current = false; setBlocked(true); setError("Outra aba alterou o progresso enquanto havia registros não salvos aqui. Exporte esta aba antes de carregar a versão salva."); } else load(); } }; const warn = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("storage", changed); window.addEventListener("beforeunload", warn); return () => { window.clearTimeout(timer); ready.current = false; window.removeEventListener("storage", changed); window.removeEventListener("beforeunload", warn); }; }, [load, key, override]);
  useEffect(() => {
    if (loading || blocked || !ready.current || override) return;
    const timer = window.setTimeout(() => {
      const courseProgress = studyCourses.map(course => ({ courseId: course.id, complete: courseCompleted(progress, course.id), grade: latestCurrentStudyAttempt(progress, course.id)?.grade ?? null, attempts: progress.attempts.filter(attempt => attempt.quizId === course.id).length }));
      const finalGrade = latestCurrentStudyAttempt(progress, FINAL_QUIZ_ID)?.grade ?? null;
      void fetch("/api/academy/progress", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ companyId, studiedLessons: progress.studied.length, totalLessons: allStudyLessons.length, courseProgress, finalGrade }) }).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [companyId, loading, blocked, override, progress]);
  const update = useCallback((change: (value: StudyProgress) => StudyProgress) => {
    if (!ready.current) return false;
    let base = current.current;
    if (!failedWrite.current) { try { const raw = (override || window.localStorage).getItem(key); if (raw) base = parseStudyProgress(raw); } catch { ready.current = false; setBlocked(true); setError("O progresso salvo mudou ou ficou indisponível. Nenhum registro foi substituído. Tente carregar novamente."); return false; } }
    const value = { ...change(base), updatedAt: new Date().toISOString() };
    current.current = value; setProgress(value);
    try { (override || window.localStorage).setItem(key, JSON.stringify(value)); setSaved(true); setError(""); failedWrite.current = false; dirty.current = false; }
    catch { failedWrite.current = true; dirty.current = true; setSaved(false); setError("Seu progresso está nesta aba, mas o navegador não conseguiu salvá-lo. Exporte uma cópia antes de sair ou tente salvar novamente."); }
    return true;
  }, [key, override]);
  return { progress, loading, error, blocked, saved, load, update, retry: () => update(value => value) };
}
