"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Check, ArrowUpRight, Sprout } from "lucide-react";
import type { JourneyView, PersonalJourney } from "./journey-model";

// Assets are reused read-only. This component and its styles belong exclusively to /app.
export const leaderPhotos = {
  overview: "/images/landing/format-team-alt.webp",
  starting: "/images/landing/path-decisions.webp",
  diagnosis: "/images/landing/privacy-mirror.webp",
  plan: "/images/landing/format-individual-alt.webp",
  exercises: "/images/landing/intro-workshop.webp",
  journal: "/images/landing/privacy-energy.webp",
  review: "/images/landing/path-mirror.webp",
};
export type LeaderVisual = keyof typeof leaderPhotos;

export function LeaderCover({ visual, eyebrow, title, children, actions, image }: { visual: LeaderVisual; eyebrow: string; title: string; children?: ReactNode; actions?: ReactNode; image?: string }) {
  return <header className={`l-cover l-cover-${visual}`}>
    <div className="l-cover-copy"><span className="l-cover-eyebrow"><span aria-hidden="true"/>{eyebrow}</span><h1>{title}</h1>{children && <p>{children}</p>}{actions && <div className="l-cover-actions">{actions}</div>}<span className="l-cover-signature"><Sprout size={15}/> Desenvolvimento que cabe na sua realidade.</span></div>
    <div className="l-cover-image"><img src={image || leaderPhotos[visual]} alt="" decoding="async"/><span className="l-photo-caption">SYNKY LÍDERES <span>Refletir. Praticar. Evoluir.</span></span></div>
  </header>;
}

const steps: { view: JourneyView; title: string; description: string }[] = [
  { view: "starting", title: "Partir", description: "Um desafio real" },
  { view: "diagnosis", title: "Reconhecer", description: "Seus padrões" },
  { view: "plan", title: "Planejar", description: "Uma ação possível" },
  { view: "exercises", title: "Ensaiar", description: "Outras escolhas" },
  { view: "journal", title: "Praticar", description: "No seu trabalho" },
  { view: "review", title: "Revisar", description: "O que mudou" },
];

export function JourneyRail({ journey, current, navigate }: { journey: PersonalJourney | null; current?: JourneyView; navigate: (view: JourneyView) => void }) {
  const railRef = useRef<HTMLElement>(null);
  useEffect(()=>{railRef.current?.querySelector<HTMLElement>("[aria-current=step]")?.scrollIntoView({block:"nearest",inline:"center",behavior:"auto"})},[current]);
  const plan = journey?.plan;
  const done = [!!journey, !!journey?.diagnostics.length && !journey.diagnosticDraft.open, !!plan && plan.status !== "draft", !!journey?.exercises.some(item => item.planId === plan?.id), !!journey?.entries.some(item => item.planId === plan?.id), !!journey?.reviews.some(item => item.planId === plan?.id)];
  return <nav ref={railRef} className="l-journey-rail" aria-label="Meu caminho de desenvolvimento"><ol>{steps.map((step, index) => <li key={step.view}><button onClick={() => navigate(step.view)} className={`${done[index] ? "done" : ""} ${current === step.view ? "current" : ""}`} aria-current={current === step.view ? "step" : undefined}><span className="l-rail-number">{done[index] ? <Check size={15}/> : String(index + 1).padStart(2, "0")}</span><span><b>{step.title}</b><small>{step.description}</small></span><ArrowUpRight size={15}/></button></li>)}</ol></nav>;
}

const connectedCovers: Record<string, { visual: LeaderVisual; eyebrow: string; title: string; description: string; image?: string }> = {
  experiences: { visual: "overview", eyebrow: "AMPLIAR SEU OLHAR", title: "Novas perspectivas para quem já lidera.", description: "Explore as ferramentas disponíveis. Cada experiência tem sua própria dinâmica e suas regras de compartilhamento." },
  mirror: { visual: "overview", eyebrow: "ESPELHO DO LÍDER", title: "Escutar também é desenvolver sua liderança.", description: "Compare sua autoavaliação com as percepções agregadas da equipe, respeitando o mínimo de respostas de cada item." },
  decisions: { visual: "starting", eyebrow: "DECISÕES SOB PRESSÃO", title: "Uma situação. Diferentes caminhos.", description: "Explore cenários de trabalho e observe o que suas escolhas priorizam em cada momento." },
  communication: { visual: "exercises", image:"/images/landing/format-duo-alt.webp", eyebrow: "RAIO X DA COMUNICAÇÃO", title: "Boas conversas começam com compreensão.", description: "Compare preferências em dupla e construa acordos. A comparação depende das respostas e do consentimento de cada pessoa." },
  energy: { visual: "journal", eyebrow: "MAPA DE ENERGIA", title: "Observe o que sustenta seu ritmo.", description: "Registre como as atividades afetam sua energia e reconheça padrões na sua rotina de trabalho." },
  career: { visual: "review", eyebrow: "BÚSSOLA DE CARREIRA", title: "O que importa no seu próximo passo?", description: "Reflita sobre prioridades profissionais a partir de escolhas concretas deste momento." },
  thermometer: { visual: "overview", eyebrow: "TERMÔMETRO DE LIDERANÇA", title: "Um comportamento por vez, ao longo do tempo.", description: "Acompanhe comportamentos depois de um Espelho concluído. As médias só aparecem com respostas suficientes." },
  evolution: { visual: "diagnosis", eyebrow: "HISTÓRICO DAS EXPERIÊNCIAS", title: "Aprendizados para retomar.", description: "Consulte as experiências realizadas e as ações que você registrou nas ferramentas conectadas." },
  results: { visual: "plan", eyebrow: "RESULTADOS EXISTENTES", title: "Evidências para uma nova reflexão.", description: "Acesse os resultados disponíveis para seu perfil. Os registros pessoais desta jornada continuam separados." },
  team: { visual: "overview", eyebrow: "PESSOAS E CONVITES", title: "Desenvolvimento também acontece em relação.", description: "Conheça as pessoas do seu espaço e use as ações de convite disponíveis para sua permissão." },
  settings: { visual: "journal", eyebrow: "MEU ESPAÇO", title: "Seu contexto. Suas preferências.", description: "Gerencie as informações do seu perfil e confira as opções disponíveis no seu espaço." },
  platform: { visual: "plan", eyebrow: "ADMINISTRAÇÃO DA PLATAFORMA", title: "Organize os espaços da plataforma.", description: "Use os recursos de administração disponíveis para seu perfil." },
};

export function ConnectedCover({ view }: { view: string }) {
  const cover = connectedCovers[view];
  return cover ? <LeaderCover image={cover.image} visual={cover.visual} eyebrow={cover.eyebrow} title={cover.title}>{cover.description}</LeaderCover> : null;
}
