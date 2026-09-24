import { getChatGPTUser, chatGPTSignInPath } from "../chatgpt-auth";
import Dashboard from "./dashboard";
import BrandLogo from "@/components/brand-logo";
export const dynamic="force-dynamic";
export default async function AppPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const user=await getChatGPTUser();
  if(!user){const raw=await searchParams;const params=new URLSearchParams();for(const key of ["invite","view","company"]){const value=raw[key];if(typeof value==="string"&&value.length<150)params.set(key,value)}const returnTo="/app"+(params.size?"?"+params:"");return <main className="sign-in"><div className="sign-in-card"><span className="brand"><BrandLogo/></span><h1>Seu espaço de evolução começa aqui.</h1><p>Entre para acessar suas experiências e resultados.</p><a className="button primary" href={chatGPTSignInPath(returnTo)} target="_top">Entrar com ChatGPT</a></div></main>}
  return <Dashboard/>;
}
