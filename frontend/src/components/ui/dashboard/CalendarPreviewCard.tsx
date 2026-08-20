import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/react";
import { taskTypeColors } from "../calendar/task-colors";
import { API_BASE_URL } from "@/lib/api";

interface taskType {
  id: string;
  title: string;
  due: string;
  type: string;
}

function DayCell({
  day,
  dim = false,
  highlighted = false,
  dotTypes = [],
}: {
  day: number;
  dim?: boolean;
  highlighted?: boolean;
  dotTypes?: string[];
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg py-2 ${
        highlighted ? "bg-white/5" : ""
      }`}
    >
      <span className={`text-sm ${dim ? "text-zinc-600" : "text-zinc-200"}`}>{day}</span>
      <div className="flex h-1.5 items-center gap-0.5">
        {dotTypes.map((type, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${taskTypeColors[type]?.dot ?? "bg-zinc-500"}`}
          />
        ))}
      </div>
    </div>
  );
}

function toDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function CalendarPreviewCard() {
  const { userId, getToken } = useAuth();
  const [tasks, setTasks] = useState<taskType[]>([]);
  const [viewDate, setViewDate] = useState(() => new Date());

  useEffect(() => {
    if (!userId) return;
    const loadTasks = async () => {
      const token = await getToken();
      const result = await axios.get(`${API_BASE_URL}/tasks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(result.data.tasks ?? []);
    };
    loadTasks();
  }, [userId, getToken]);

  const dotsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const task of tasks) {
      if (!task.due) continue;
      const key = task.due.slice(0, 10);
      const existing = map.get(key) ?? [];
      existing.push(task.type);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  const todayStr = toDateStr(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const cells = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(year, month, 1 - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      const dateStr = toDateStr(date);
      return {
        date,
        dateStr,
        dim: date.getMonth() !== month,
        highlighted: dateStr === todayStr,
        dotTypes: dotsByDate.get(dateStr) ?? [],
      };
    });
  }, [year, month, dotsByDate, todayStr]);

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
        <span className="text-sm font-semibold text-white">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/5"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-white/5"
          >
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
        {cells.map((cell) => (
          <DayCell
            key={cell.dateStr}
            day={cell.date.getDate()}
            dim={cell.dim}
            highlighted={cell.highlighted}
            dotTypes={cell.dotTypes}
          />
        ))}
      </div>

      <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-zinc-400">
        {Object.entries(taskTypeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}
