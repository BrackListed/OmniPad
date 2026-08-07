import { ChevronDown, ChevronRight } from "lucide-react";

export function PriorityQueueCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121a] p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xs font-semibold tracking-wide text-zinc-400">
            UP NEXT — YOUR UNIVERSAL PRIORITY QUEUE
          </h2>
          <p className="mt-1 text-xs text-zinc-500">Filtered by last</p>
        </div>
        <button className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10">
          Sort by due date ASC
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-4 rounded-xl border-l-4 border-red-500 bg-white/[0.03] p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Reading Assignment #3</span>
              <span className="text-xs font-semibold text-red-400">DUE 6h</span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">Academic Assignments</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-red-500" style={{ width: "85%" }} />
            </div>
          </div>
          <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            1d Deadline
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} />
        </div>

        <div className="flex items-center gap-4 rounded-xl border-l-4 border-sky-500 bg-white/[0.03] p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Portfolio Website Build</span>
              <span className="text-xs font-semibold text-sky-400">DUE 2d</span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">Personal Task</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-sky-500" style={{ width: "45%" }} />
            </div>
          </div>
          <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            In progress
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} />
        </div>

        <div className="flex items-center gap-4 rounded-xl border-l-4 border-violet-500 bg-white/[0.03] p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Design Sprint '26</span>
              <span className="text-xs font-semibold text-violet-400">DUE 4d</span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">Event</p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
              <div className="h-1.5 rounded-full bg-violet-500" style={{ width: "8%" }} />
            </div>
          </div>
          <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            Upcoming
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
