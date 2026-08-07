import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { taskTypeColors } from "./task-colors";

const calendarThemeVars = {
  "--fc-border-color": "rgba(255, 255, 255, 0.08)",
  "--fc-page-bg-color": "transparent",
  "--fc-neutral-bg-color": "rgba(255, 255, 255, 0.03)",
  "--fc-neutral-text-color": "#71717a",
  "--fc-today-bg-color": "rgba(124, 58, 237, 0.12)",
  "--fc-event-text-color": "#ffffff",
} as React.CSSProperties;

type CalendarTask = {
  id: string;
  title: string;
  due: string;
  type: string;
};

type CalendarGridProps = {
  ref?: React.Ref<FullCalendar>;
  tasks: CalendarTask[];
  selectedDate: string;
  onDateSelect: (dateStr: string) => void;
  onDatesSet: (title: string) => void;
};

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function CalendarGrid({
  ref,
  tasks,
  selectedDate,
  onDateSelect,
  onDatesSet,
}: CalendarGridProps) {
  const events = tasks
    .filter((task) => task.due)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: task.due,
      allDay: true,
      backgroundColor: taskTypeColors[task.type]?.hex ?? taskTypeColors.Tasks.hex,
      borderColor: "transparent",
    }));

  return (
    <div
      className="h-full p-4 text-sm text-zinc-200 [&_.fc-day-selected]:bg-violet-600/25 [&_.fc-day-selected]:ring-1 [&_.fc-day-selected]:ring-inset [&_.fc-day-selected]:ring-violet-500/50"
      style={calendarThemeVars}
    >
      <FullCalendar
        ref={ref}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        height="100%"
        dayMaxEvents={2}
        events={events}
        eventClassNames="cursor-pointer rounded-md px-1.5 py-0.5 text-xs font-semibold"
        dayCellClassNames={(arg) => (toDateStr(arg.date) === selectedDate ? ["fc-day-selected"] : [])}
        dateClick={(info: DateClickArg) => onDateSelect(info.dateStr)}
        eventClick={(info: EventClickArg) => onDateSelect(info.event.startStr.slice(0, 10))}
        datesSet={(arg: DatesSetArg) => onDatesSet(arg.view.title)}
      />
    </div>
  );
}
