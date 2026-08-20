import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios"
import { useAuth } from "@clerk/react";
import { API_BASE_URL } from "@/lib/api";

interface taskType{
  id: string
  user_id: string
  title: string
  details: string
  due: string
  type: string
  created_at: Date
}

const typeStyles: Record<string, { border: string; text: string }> = {
  Assignments: { border: "border-red-500", text: "text-red-400" },
  Tasks: { border: "border-sky-500", text: "text-sky-400" },
  Events: { border: "border-violet-500", text: "text-violet-400" },
};

function getDeadlineLabel(due: string) {
  if (!due) return "No due date";
  const dueDate = new Date(`${due}T23:59:59`);
  const diffMs = dueDate.getTime() - Date.now();
  if (diffMs <= 0) return "Overdue";
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24) return `DUE ${Math.ceil(diffHours)}h`;
  return `DUE ${Math.ceil(diffHours / 24)}d`;
}

function formatDueDate(due: string) {
  if (!due) return "No due date";
  return new Date(`${due}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PriorityQueueCard() {
  const {getToken, userId} = useAuth()
  const [tasks, setTasks] = useState<taskType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")
  useEffect(() => {
    if(!userId) return 
    const fetchTasksData = async() => {
      const token = await getToken()
      const result = await axios.get(`${API_BASE_URL}/tasks/${userId}`, {headers: {Authorization: `Bearer ${token}`}})
      setTasks(result.data.tasks)
      setIsLoading(result.data.isLoading)
      if(result.data.message) setMessage(result.data.message)
    }
    fetchTasksData()
  }, [])
  return (
    <div id = "priority-queue" className="rounded-2xl border border-white/10 bg-[#12121a] p-5">
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
        {isLoading && (
          <p className="py-6 text-center text-sm text-zinc-500">Loading tasks...</p>
        )}

        {!isLoading && tasks.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-500">
            {message || "No tasks in your queue yet."}
          </p>
        )}

        {!isLoading &&
          tasks.map((task) => {
            const style = typeStyles[task.type] ?? typeStyles.Tasks;
            return (
              <div
                key={task.id}
                className={`flex items-center gap-4 rounded-xl border-l-4 ${style.border} bg-white/[0.03] p-4`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{task.title}</span>
                    <span className={`text-xs font-semibold ${style.text}`}>
                      {getDeadlineLabel(task.due)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{task.type}</p>
                </div>
                <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                  {formatDueDate(task.due)}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} />
              </div>
            );
          })}
      </div>
    </div>
  );
}
