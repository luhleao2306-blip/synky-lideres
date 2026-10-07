"use client";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { JourneyStorageContext } from "./use-journey-store";
import { emptyStudyProgress, mergeStudyProgress, parseStudyProgress, type StudyProgress } from "./academy-model";

export default function useAcademyProgress(key:string,companyId:string) {
  const override=useContext(JourneyStorageContext);
  const [progress,setProgress]=useState<StudyProgress>(emptyStudyProgress),[loading,setLoading]=useState(true),[error,setError]=useState(""),[blocked,setBlocked]=useState(false),[saved,setSaved]=useState(false);
  const [syncError,setSyncError]=useState(""),[synced,setSynced]=useState(false),[syncing,setSyncing]=useState(false);
  const [resume,setResume]=useState(0);
  const current=useRef(progress),ready=useRef(false),dirty=useRef(false),remoteReady=useRef(false),revision=useRef(0),inflight=useRef(false),pending=useRef<StudyProgress|null>(null),generation=useRef(0);
  const load=useCallback(async()=>{
    const run=++generation.current;ready.current=false;remoteReady.current=false;setLoading(true);setSyncError("");setSynced(false);
    try{
      const raw=(override||window.localStorage).getItem(key);
      const local=dirty.current?current.current:raw?parseStudyProgress(raw):emptyStudyProgress();
      let value=local;
      if(!override){
        try{
          const response=await fetch(`/api/academy/progress?company=${encodeURIComponent(companyId)}`,{cache:"no-store"});
          const data=await response.json() as {progress?:StudyProgress|null;revision?:number;error?:string};
          if(!response.ok||typeof data.revision!=="number")throw new Error(data.error||"Não foi possível recuperar os estudos da conta.");
          if(run!==generation.current)return;
          if(data.progress){const remote=parseStudyProgress(JSON.stringify(data.progress));value=raw||dirty.current?mergeStudyProgress(remote,local):remote;}
          revision.current=data.revision;remoteReady.current=true;
        }catch(cause){if(run===generation.current)setSyncError(cause instanceof Error?cause.message:"Falha de conexão. Tente sincronizar novamente.");}
      }
      if(run!==generation.current)return;
      current.current=value;setProgress(value);setError("");setBlocked(false);ready.current=true;
      try{(override||window.localStorage).setItem(key,JSON.stringify(value));dirty.current=false;setSaved(true);}catch{dirty.current=true;setSaved(false);setError("O navegador não conseguiu guardar uma cópia. Exporte seu progresso antes de sair.");}
    }catch{if(run===generation.current){setBlocked(true);setError("Não foi possível ler seus estudos. Os registros foram preservados. Tente carregar novamente; não limpe os dados do navegador.");}}
    finally{if(run===generation.current)setLoading(false);}
  },[key,companyId,override]);
  useEffect(()=>{
    const timer=window.setTimeout(()=>{void load()},0);
    const changed=(event:StorageEvent)=>{if(!override&&event.key===key){if(dirty.current){ready.current=false;setBlocked(true);setError("Outra aba alterou os estudos. Exporte esta aba antes de carregar novamente.");}else void load();}};
    const warn=(event:BeforeUnloadEvent)=>{if(dirty.current){event.preventDefault();event.returnValue="";}};
    window.addEventListener("storage",changed);window.addEventListener("beforeunload",warn);
    return()=>{window.clearTimeout(timer);generation.current++;ready.current=false;remoteReady.current=false;pending.current=null;window.removeEventListener("storage",changed);window.removeEventListener("beforeunload",warn);};
  },[load,key,override]);
  useEffect(()=>{
    if(loading||blocked||!ready.current||override||!remoteReady.current)return;
    const run=generation.current;
    const timer=window.setTimeout(()=>{
      pending.current=progress;
      if(inflight.current)return;
      const sync=async()=>{
        inflight.current=true;setSyncing(true);
        try{
          while(pending.current&&run===generation.current){
            const snapshot=pending.current;pending.current=null;
            const response=await fetch("/api/academy/progress",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({companyId,progress:snapshot,revision:revision.current})});
            const data=await response.json() as {revision?:number;error?:string};
            if(run!==generation.current)return;
            if(!response.ok||typeof data.revision!=="number")throw new Error(data.error||"Não foi possível sincronizar seus estudos.");
            revision.current=data.revision;setSyncError("");setSynced(snapshot===current.current);
          }
        }catch(cause){if(run===generation.current){remoteReady.current=false;setSynced(false);setSyncError(cause instanceof Error?cause.message:"Falha de conexão. Seus registros locais foram preservados.");}}
        finally{inflight.current=false;if(run===generation.current)setSyncing(false);else if(pending.current&&remoteReady.current)setResume(value=>value+1);}
      };void sync();
    },700);
    return()=>window.clearTimeout(timer);
  },[companyId,loading,blocked,override,progress,resume]);
  const update=useCallback((change:(value:StudyProgress)=>StudyProgress)=>{
    if(!ready.current)return false;
    let base=current.current;
    if(!dirty.current){try{const raw=(override||window.localStorage).getItem(key);if(raw)base=parseStudyProgress(raw);}catch{ready.current=false;setBlocked(true);setError("Os estudos salvos ficaram indisponíveis. Exporte uma cópia antes de carregar novamente.");return false;}}
    const value={...change(base),updatedAt:new Date().toISOString()};current.current=value;setProgress(value);setSynced(false);
    try{(override||window.localStorage).setItem(key,JSON.stringify(value));dirty.current=false;setSaved(true);setError("");}catch{dirty.current=true;setSaved(false);setError("O progresso está nesta aba, mas o navegador não conseguiu guardá-lo. Exporte uma cópia antes de sair.");}
    return true;
  },[key,override]);
  return{progress,loading,error,blocked,saved,load,update,retry:()=>update(value=>value),syncError,synced,syncing};
}
