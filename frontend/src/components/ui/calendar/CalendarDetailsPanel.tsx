import { taskTypeColors } from "./task-colors";

type CalendarTask = {
  id: string;
  title: string;
  due: string;
  type: string;
};

type CalendarDetailsPanelProps = {
  selectedDate: string;
  tasks: CalendarTask[];
};

export function CalendarDetailsPanel({ selectedDate, tasks }: CalendarDetailsPanelProps) {
  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const tasksForDate = tasks.filter((task) => task.due === selectedDate);

  return (
    <div className="w-80 shrink-0 border-l border-white/10 bg-[#0b0b12] p-6">
      <h2 className="text-lg font-semibold text-white">{formattedDate}</h2>

      <div className="mt-4 flex flex-col gap-3">
        {tasksForDate.length === 0 && (
          <p className="text-sm text-zinc-500">No tasks on this day.</p>
        )}

        {tasksForDate.map((task) => (
          <div key={task.id} className="flex items-start gap-2.5">
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                taskTypeColors[task.type]?.dot ?? taskTypeColors.Tasks.dot
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-white">{task.title}</p>
              <p className="text-xs text-zinc-500">All day</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
