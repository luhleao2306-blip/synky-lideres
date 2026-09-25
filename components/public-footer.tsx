import { ArrowUpRight } from "lucide-react";
import BrandLogo from "./brand-logo";

export default function PublicFooter(){
  return <footer className="footer"><a href="/" className="brand" aria-label="Synky Líderes, início"><BrandLogo/></a><span>Desenvolvimento humano com espaço para cada pessoa.</span><a href="/app">Acessar plataforma <ArrowUpRight size={16}/></a></footer>;
}
