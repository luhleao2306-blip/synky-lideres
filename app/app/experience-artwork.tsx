import type { ModuleKey } from "@/lib/modules";

const artwork = {
  mirror: { image: "/images/experiences/mirror.webp", label: "ESCUTA DO TIME" },
  decisions: { image: "/images/experiences/decisions.webp", label: "DECISÕES REAIS" },
  communication: { image: "/images/experiences/communication.webp", label: "CONVERSA EM DUPLA" },
  energy: { image: "/images/experiences/energy.webp", label: "ROTINA E ENERGIA" },
  career: { image: "/images/experiences/career.webp", label: "ESCOLHAS DE CARREIRA" },
  thermometer: { image: "/images/experiences/thermometer.webp", label: "EVOLUÇÃO DO TIME" },
} satisfies Record<ModuleKey, { image: string; label: string }>;

export default function ExperienceArtwork({ kind, className = "" }: { kind: ModuleKey; className?: string }) {
  const { image, label } = artwork[kind];
  return <div
    className={`experience-artwork experience-artwork-${kind} ${className}`}
    style={{ backgroundImage: `linear-gradient(0deg, rgba(8, 35, 23, .58), transparent 48%), url("${image}")` }}
    aria-hidden="true"
  >
    <span className="experience-artwork-label">{label}</span>
  </div>;
}
