import { Activity, Compass, GitBranch, MessageCircleMore, TrendingUp, UsersRound } from "lucide-react";
import type { ModuleKey } from "@/lib/modules";

const artwork = {
  mirror: { number: "01", label: "ESCUTA", words: ["Perceber", "Comparar", "Agir"], Icon: UsersRound },
  decisions: { number: "02", label: "ESCOLHAS", words: ["Cenário", "Decisão", "Impacto"], Icon: GitBranch },
  communication: { number: "03", label: "DIÁLOGO", words: ["Escutar", "Alinhar", "Conversar"], Icon: MessageCircleMore },
  energy: { number: "04", label: "RITMO", words: ["Registrar", "Observar", "Ajustar"], Icon: Activity },
  career: { number: "05", label: "DIREÇÃO", words: ["Priorizar", "Escolher", "Avançar"], Icon: Compass },
  thermometer: { number: "06", label: "PRÁTICA", words: ["Definir", "Praticar", "Revisar"], Icon: TrendingUp },
} satisfies Record<ModuleKey, { number: string; label: string; words: string[]; Icon: typeof UsersRound }>;

export default function ExperienceArtwork({ kind, className = "" }: { kind: ModuleKey; className?: string }) {
  const { number, label, words, Icon } = artwork[kind];
  return <div className={`experience-artwork experience-artwork-${kind} ${className}`} aria-hidden="true">
    <span className="experience-artwork-number">{number}</span>
    <span className="experience-artwork-label">{label}</span>
    <span className="experience-artwork-icon"><Icon size={30} strokeWidth={1.7}/></span>
    <span className="experience-artwork-steps">{words.map((word, index) => <span key={word}>{index > 0 && <i/>}{word}</span>)}</span>
  </div>;
}
