import type { LucideIcon } from "lucide-react";
import { Loader2, Lock, Rocket } from "lucide-react";

const accentStyles = {
  orange: {
    border: "border-orange-500/30",
    iconBg: "bg-orange-500/15",
    iconText: "text-orange-400",
    title: "text-orange-400",
    button: "border-orange-500/40 text-orange-300 hover:bg-orange-500/10",
  },
  sky: {
    border: "border-sky-500/30",
    iconBg: "bg-sky-500/15",
    iconText: "text-sky-400",
    title: "text-sky-400",
    button: "border-sky-500/40 text-sky-300 hover:bg-sky-500/10",
  },
  violet: {
    border: "border-violet-500/30",
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-400",
    title: "text-violet-400",
    button: "border-violet-500/40 text-violet-300 hover:bg-violet-500/10",
  },
  emerald: {
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-400",
    title: "text-emerald-400",
    button: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10",
  },
} as const;

type FeatureCardProps = {
  id?: string;
  icon: LucideIcon;
  accent: keyof typeof accentStyles;
  title: string;
  bullets: string[];
  ctaLabel: string;
  locked?: boolean;
  loading?: boolean;
  onClick?: () => void;
};

export function FeatureCard({
  id,
  icon: Icon,
  accent,
  title,
  bullets,
  ctaLabel,
  locked = false,
  loading = false,
  onClick,
}: FeatureCardProps) {
  const style = accentStyles[accent];

  return (
    <div
      id={id}
      className={`flex flex-col rounded-2xl border bg-[#12121a] p-5 transition-opacity ${style.border} ${
        locked && !loading ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconBg} ${style.iconText}`}>
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        <h3 className={`text-sm font-semibold tracking-wide ${style.title}`}>{title}</h3>
      </div>

      <ul className="mt-4 flex flex-1 flex-col gap-1.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="text-sm text-zinc-400">
            • {bullet}
          </li>
        ))}
      </ul>

      <button
        onClick={onClick}
        disabled={locked || loading}
        className={`mt-5 flex items-center justify-center gap-2 rounded-lg border bg-white/[0.02] px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:hover:bg-white/2 ${style.button}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : locked ? (
          <Lock className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Rocket className="h-4 w-4" strokeWidth={2} />
        )}
        {loading ? "Generating..." : locked ? "Locked" : ctaLabel}
      </button>
    </div>
  );
}
