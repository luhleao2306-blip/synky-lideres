import type { ModuleKey } from "@/lib/modules";

const artwork = {
  mirror: { image: "/images/landing/format-team-alt.webp", label: "ESCUTA DO TIME" },
  decisions: { image: "/images/landing/path-decisions.webp", label: "DECISÕES REAIS" },
  communication: { image: "/images/landing/intro-meeting.webp", label: "CONVERSA EM DUPLA" },
  energy: { image: "/images/landing/format-individual-alt.webp", label: "ROTINA E ENERGIA" },
  career: { image: "/images/landing/path-mirror.webp", label: "ESCOLHAS DE CARREIRA" },
  thermometer: { image: "/images/landing/intro-workshop.webp", label: "EVOLUÇÃO DO TIME" },
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
