import BrandLogo from "./brand-logo";

const items=[{href:"/",label:"Início",key:"home"},{href:"/experiencias",label:"Experiências",key:"experiences"},{href:"/empresas",label:"Para empresas",key:"companies"}] as const;

export default function PublicNavigation({active}:{active:"home"|"experiences"|"companies"}){
  return <div className="public-header"><header className="topbar"><a className="brand" href="/" aria-label="Synky Líderes, início"><BrandLogo/></a><nav aria-label="Navegação principal">{items.map(item=><a key={item.key} href={item.href} className={active===item.key?"current":undefined} aria-current={active===item.key?"page":undefined}>{item.label}</a>)}<a href="/app" className="nav-enter">Entrar</a></nav></header><nav className="public-mobile-nav" aria-label="Navegação móvel">{items.map(item=><a key={item.key} href={item.href} className={active===item.key?"current":undefined} aria-current={active===item.key?"page":undefined}>{item.label}</a>)}</nav></div>;
}
