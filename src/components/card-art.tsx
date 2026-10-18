import {
  Atom,
  BookOpen,
  Cog,
  Landmark,
  Mountain,
  Palette,
  PawPrint,
  type LucideIcon,
} from "lucide-react";
import type { Card, Category } from "@/lib/types";
import { RARITY_MAP } from "@/lib/types";
import { cn, hash } from "@/lib/utils";

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  Animaux: PawPrint,
  Sciences: Atom,
  Histoire: Landmark,
  Arts: Palette,
  Lieux: Mountain,
  Techniques: Cog,
  Recits: BookOpen,
};

/**
 * Illustration de carte générée de façon déterministe (aucune image externe) :
 * dégradé + formes géométriques + pictogramme de catégorie.
 */
export function CardArt({
  card,
  className,
  glyphClassName,
  showGlyph = true,
}: {
  card: Card;
  className?: string;
  glyphClassName?: string;
  showGlyph?: boolean;
}) {
  const seed = hash(card.slug);
  const hue = seed % 360;
  const hue2 = (hue + 40 + (seed % 60)) % 360;
  const rad = 18 + (seed % 30);
  const Icon = CATEGORY_ICONS[card.category];
  const accent = RARITY_MAP[card.rarity].accent;

  return (
    <div
      className={cn("relative overflow-hidden bg-[oklch(0.22_0.03_258)]", className)}
      style={{
        backgroundImage: `radial-gradient(115% 95% at 18% 0%, hsl(${hue} 52% 33%) 0%, hsl(${hue2} 46% 19%) 48%, oklch(0.16 0.03 258) 100%)`,
        filter: "saturate(0.92)",
      }}
      aria-hidden="true"
    >
      <svg className="absolute inset-0 size-full opacity-40" viewBox="0 0 200 260" fill="none">
        <circle
          cx={140 - (seed % 40)}
          cy={70 + (seed % 30)}
          r={40 + rad}
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <circle
          cx={140 - (seed % 40)}
          cy={70 + (seed % 30)}
          r={70 + rad}
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
        <path
          d={`M-20 ${190 + (seed % 30)} Q 100 ${110 + (seed % 40)} 220 ${200 + (seed % 20)}`}
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="1"
        />
        <path
          d={`M-20 ${215 + (seed % 20)} Q 100 ${140 + (seed % 30)} 220 ${225 + (seed % 10)}`}
          stroke="white"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
        {Array.from({ length: 3 }).map((_, i) => (
          <line
            key={i}
            x1={20 + i * 60}
            y1={0}
            x2={-10 + i * 60}
            y2={260}
            stroke="white"
            strokeOpacity="0.06"
            strokeWidth="1"
          />
        ))}
      </svg>

      {showGlyph && (
        <div className="absolute inset-0 grid place-items-center">
          <Icon
            className={cn("size-16 text-white/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]", glyphClassName)}
            strokeWidth={1.25}
          />
        </div>
      )}

      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25" />
    </div>
  );
}
