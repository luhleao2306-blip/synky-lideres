"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { emptyWorkspace, parseWorkspace, saveWorkspace, type JourneyWorkspaceData, type PersonalJourney } from "./journey-model";

export const JourneyStorageContext = createContext<Pick<Storage,"getItem"|"setItem"> | null>(null);
export default function useJourneyStore(key: string) {
  const storageOverride = useContext(JourneyStorageContext);
  const [workspace, setWorkspace] = useState<JourneyWorkspaceData>(emptyWorkspace);
  const current = useRef(workspace);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [saved, setSaved] = useState(false);
  const unreadable = useRef<string | null>(null);
  const ready = useRef(false);
  const conflicting = useRef(false);
  const writable = useRef(false);
  const dirty = useRef(false);

  const load = useCallback(() => {
    try {
      const raw = (storageOverride || window.localStorage).getItem(key);
      unreadable.current = raw;
      const value = raw ? parseWorkspace(raw) : emptyWorkspace();
      current.current = value; setWorkspace(value);
      setError(""); setBlocked(false); setConflict(false); setSaved(!!raw);
      conflicting.current = false; writable.current = true; dirty.current = false;
    } catch {
      setError("Não foi possível ler o progresso deste navegador. Exporte uma cópia antes de recuperar ou reiniciar o armazenamento.");
      setBlocked(true); writable.current = false;
    } finally { ready.current = true; setLoading(false); }
  }, [key, storageOverride]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    const changed = (event: StorageEvent) => {
      if (storageOverride || event.key !== key || event.storageArea !== window.localStorage) return;
      conflicting.current = true; setConflict(true);
      // A second tab must never silently replace this tab's drafts.
    };
    window.addEventListener("storage", changed);
    return () => { window.clearTimeout(timer); window.removeEventListener("storage", changed); ready.current = false; };
  }, [key, load, storageOverride]);

  const persist = useCallback((value: JourneyWorkspaceData) => {
    try {
      saveWorkspace(storageOverride || window.localStorage, key, value);
      setSaved(true); setError(""); dirty.current = false;
    } catch {
      setSaved(false); dirty.current = true;
      setError("O navegador não conseguiu salvar. Seus textos continuam nesta aba: tente novamente ou exporte uma cópia antes de sair.");
    }
  }, [key, storageOverride]);

  const update = useCallback((change: (value: JourneyWorkspaceData) => JourneyWorkspaceData) => {
    if (!ready.current || !writable.current || conflicting.current) return false;
    const value = { ...change(current.current), updatedAt: new Date().toISOString() };
    current.current = value; setWorkspace(value); persist(value); return true;
  }, [persist]);
  const updateJourney = useCallback((id: string, change: (value: PersonalJourney) => PersonalJourney) => update(value => ({ ...value, journeys: value.journeys.map(journey => journey.id === id ? { ...change(journey), updatedAt: new Date().toISOString() } : journey) })), [update]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  return { workspace, loading, error, blocked, conflict, saved, update, updateJourney, load,
    retry: () => { if (conflicting.current) { conflicting.current = false; setConflict(false); } persist(current.current); },
    recover: (value: JourneyWorkspaceData) => { current.current = value; setWorkspace(value); writable.current = true; conflicting.current = false; setBlocked(false); setConflict(false); persist(value); },
    rawBackup: () => unreadable.current,
  };
}
