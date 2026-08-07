import { ChevronLeft, ChevronRight } from "lucide-react";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

type CalendarToolbarProps = {
  title: string;
  currentView: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeView: (view: CalendarView) => void;
};

export function CalendarToolbar({
  title,
  currentView,
  onPrev,
  onNext,
  onToday,
  onChangeView,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          onClick={onToday}
          className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-zinc-200 hover:bg-white/10"
        >
          Today
        </button>
      </div>

      <h1 className="text-xl font-semibold text-white">{title}</h1>

      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
        <button
          onClick={() => onChangeView("dayGridMonth")}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            currentView === "dayGridMonth"
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Month
        </button>
        <button
          onClick={() => onChangeView("timeGridWeek")}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            currentView === "timeGridWeek"
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onChangeView("timeGridDay")}
          className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
            currentView === "timeGridDay"
              ? "bg-violet-600 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Day
        </button>
      </div>
    </div>
  );
}
