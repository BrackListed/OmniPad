import { CheckCircle2, MoreHorizontal } from "lucide-react";

export function QuickJumpCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121a] p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xs font-semibold tracking-wide text-zinc-400">
            RECENTLY REVIEWED — QUICK JUMP
          </h2>
          <p className="mt-1 text-xs text-zinc-500">Your last 4 active modules:</p>
        </div>
        <button className="text-zinc-500 hover:text-zinc-300">
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-white">Module Alpha</span>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">Reading 88%</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-violet-500" style={{ width: "88%" }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-white">Module Beta</span>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">Quiz 74%</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-violet-500" style={{ width: "74%" }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-white">Module Gamma</span>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">Quiz 91%</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-violet-500" style={{ width: "91%" }} />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-start justify-between">
            <span className="text-sm font-semibold text-white">Module Delta</span>
            <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">100% Mastery</p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-violet-500" style={{ width: "100%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
