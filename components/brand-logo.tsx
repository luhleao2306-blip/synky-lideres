import Image from "next/image";

/** Animated Synky Leaders mark with a transparent background. */
export default function BrandLogo({ tone = "dark", compact = false }: { tone?: "dark" | "light"; compact?: boolean }) {
  const variant = compact ? "mark" : tone;
  return (
    <Image
      className={`brand-logo brand-logo-${tone}`}
      src={`/images/brand/synky-leaders-${variant}.webp?v=20261002-full-symbol`}
      alt={compact ? "" : "Synky Leaders"}
      aria-hidden={compact ? true : undefined}
      width={compact ? 141 : 546}
      height={compact ? 144 : 149}
      unoptimized
    />
  );
}
