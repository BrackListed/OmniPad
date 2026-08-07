import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

function DayCell({
  day,
  dim = false,
  highlighted = false,
  dots = [],
}: {
  day: number;
  dim?: boolean;
  highlighted?: boolean;
  dots?: ("blue" | "green" | "violet")[];
}) {
  const dotColor = {
    blue: "bg-sky-400",
    green: "bg-emerald-400",
    violet: "bg-violet-400",
  };

  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg py-2 ${
        highlighted ? "bg-white/5" : ""
      }`}
    >
      <span className={`text-sm ${dim ? "text-zinc-600" : "text-zinc-200"}`}>{day}</span>
      <div className="flex h-1.5 items-center gap-0.5">
        {dots.map((color, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full ${dotColor[color]}`} />
        ))}
      </div>
    </div>
  );
}

export function CalendarPreviewCard() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#12121a] p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-400">
          MY MONTH — CALENDAR PREVIEW
        </h2>
        <button className="text-zinc-500 hover:text-zinc-300">
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">August 2026</span>
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/5">
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/5">
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center text-xs font-medium text-zinc-500">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        <DayCell day={26} dim />
        <DayCell day={27} dim />
        <DayCell day={28} dim />
        <DayCell day={29} dim />
        <DayCell day={30} dim />
        <DayCell day={31} dim />
        <DayCell day={1} dots={["blue"]} />

        <DayCell day={2} />
        <DayCell day={3} highlighted dots={["blue", "green"]} />
        <DayCell day={4} />
        <DayCell day={5} />
        <DayCell day={6} />
        <DayCell day={7} />
        <DayCell day={8} dots={["violet"]} />

        <DayCell day={9} dots={["green"]} />
        <DayCell day={10} />
        <DayCell day={11} />
        <DayCell day={12} dots={["blue", "blue"]} />
        <DayCell day={13} dots={["blue"]} />
        <DayCell day={14} />
        <DayCell day={15} />

        <DayCell day={16} />
        <DayCell day={17} />
        <DayCell day={18} />
        <DayCell day={19} dots={["green"]} />
        <DayCell day={20} />
        <DayCell day={21} />
        <DayCell day={22} dots={["violet"]} />

        <DayCell day={23} />
        <DayCell day={24} />
        <DayCell day={25} />
        <DayCell day={26} />
        <DayCell day={27} />
        <DayCell day={28} />
        <DayCell day={29} />

        <DayCell day={30} />
        <DayCell day={31} />
        <DayCell day={1} dim />
        <DayCell day={2} dim />
        <DayCell day={3} dim />
        <DayCell day={4} dim />
        <DayCell day={5} dim />
      </div>

      <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-400" />
          Assignments
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Tasks
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-400" />
          Events
        </div>
      </div>
    </div>
  );
}
