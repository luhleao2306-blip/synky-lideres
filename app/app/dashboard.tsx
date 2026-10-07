"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import LeaderAcademy from "./academy-workspace";
import ProfileSettings from "./profile-settings";
import type { PanelView } from "./journey-model";
type Data={user:{name:string;email:string;avatarUrl?:string|null};membership?:{id:string;role:string;companyId:string;companyName:string};memberships:{companyId:string;companyName:string;role:string}[];platformAdmin:boolean};
const views=new Set<PanelView>(["overview","courses","classroom","activities","assessments","grades","library","settings"]);
const viewFromUrl=():PanelView=>{if(typeof window==="undefined")return "overview";const value=new URLSearchParams(window.location.search).get("view");if(value==="results")return "grades";if(value==="team"||value==="platform")return "settings";return views.has(value as PanelView)?value as PanelView:"overview";};
export default function Dashboard(){
  const [data,setData]=useState<Data|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true),[refreshing,setRefreshing]=useState(false),[view,setView]=useState<PanelView>(viewFromUrl);
  const [companyId,setCompanyId]=useState(()=>typeof window==="undefined"?"":new URLSearchParams(window.location.search).get("company")||"");
  const request=useRef<AbortController|null>(null);
  const refresh=useCallback(async()=>{
    request.current?.abort();const controller=new AbortController();request.current=controller;setRefreshing(true);
    try{const response=await fetch(`/api/app${companyId?`?company=${encodeURIComponent(companyId)}`:""}`,{cache:"no-store",signal:controller.signal});const body=await response.json() as Data&{error?:string};if(!response.ok)throw new Error(body.error||"Não foi possível carregar sua conta.");if(!controller.signal.aborted){setData(body);setError("");}}
    catch(cause){if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:"Falha de conexão.");}
    finally{if(!controller.signal.aborted){setLoading(false);setRefreshing(false);}}
  },[companyId]);
  useEffect(()=>{const timer=window.setTimeout(()=>{void refresh()},0);return()=>{window.clearTimeout(timer);request.current?.abort();}},[refresh]);
  useEffect(()=>{const change=()=>{setView(viewFromUrl());setCompanyId(new URLSearchParams(window.location.search).get("company")||"");};window.addEventListener("popstate",change);return()=>window.removeEventListener("popstate",change);},[]);
  function navigate(next:PanelView){if(!views.has(next))next="overview";const url=new URL(window.location.href);url.searchParams.set("view",next);url.searchParams.delete("invite");window.history.pushState(null,"",url.pathname+url.search);setView(next);}
  function selectCompany(id:string){const url=new URL(window.location.href);url.searchParams.set("company",id);url.searchParams.set("view","overview");["lesson","quiz","course","invite"].forEach(key=>url.searchParams.delete(key));window.history.pushState(null,"",url.pathname+url.search);setCompanyId(id);setData(null);setLoading(true);setView("overview");}
  if(loading||!data)return <main className="academy-shell"><div className="ac-empty" role={error?"alert":"status"}><h1>{error?"Não foi possível abrir seus estudos.":"Preparando seu espaço…"}</h1>{error&&<><p>{error}</p><button className="ac-button" onClick={()=>{void refresh()}}>Tentar novamente</button><a className="ac-text-button" href="/login?next=%2Fapp">Entrar novamente</a></>}</div></main>;
  if(!data.membership)return <main className="academy-shell"><section className="ac-empty"><h1>Seu espaço ainda não está disponível.</h1><p>Entre em contato com a administração para conferir o acesso à sua conta.</p>{data.platformAdmin&&<a className="ac-button" href="/admin">Abrir administração</a>}<a className="ac-text-button" href="/">Voltar ao site</a></section></main>;
  const m=data.membership;
  return <LeaderAcademy key={m.id+":"+m.companyId} name={data.user.name} avatarUrl={data.user.avatarUrl} memberId={m.id} companyId={m.companyId} companyName={m.companyName} role={m.role} isGuest={false} memberships={data.memberships} platformAdmin={data.platformAdmin} view={view} navigate={navigate} selectCompany={selectCompany} refreshing={refreshing} busy={false} refresh={()=>{void refresh()}} systemError={error} systemNotice="">{view==="settings"&&<ProfileSettings onProfileChanged={refresh}/>}</LeaderAcademy>;
}
