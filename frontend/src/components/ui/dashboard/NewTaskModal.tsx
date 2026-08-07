import { createPortal } from "react-dom";
import { Calendar, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import { useAuth } from "@clerk/react";
import axios from "axios"
import { Toast } from "../Toast";

const calendarThemeVars = {
  "--fc-border-color": "rgba(255, 255, 255, 0.1)",
  "--fc-page-bg-color": "transparent",
  "--fc-neutral-bg-color": "rgba(255, 255, 255, 0.05)",
  "--fc-neutral-text-color": "#a1a1aa",
  "--fc-button-text-color": "#ffffff",
  "--fc-button-bg-color": "rgba(255, 255, 255, 0.05)",
  "--fc-button-border-color": "rgba(255, 255, 255, 0.1)",
  "--fc-button-hover-bg-color": "rgba(255, 255, 255, 0.1)",
  "--fc-button-hover-border-color": "rgba(255, 255, 255, 0.15)",
  "--fc-button-active-bg-color": "#7c3aed",
  "--fc-button-active-border-color": "#7c3aed",
  "--fc-today-bg-color": "rgba(124, 58, 237, 0.15)",
  "--fc-highlight-color": "rgba(124, 58, 237, 0.25)",
} as React.CSSProperties;

type NewTaskModalProps = {
  open: boolean;
  onClose: () => void;
  initialDate?: string;
};

export function NewTaskModal({ open, onClose, initialDate }: NewTaskModalProps) {
  const [type, setType] = useState<"Assignments" | "Tasks" | "Events" | string>("Assignments")
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [date, setDate] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open && initialDate) setDate(initialDate)
  }
  const { userId, getToken } = useAuth()
  const [success, setSuccess] = useState<undefined | boolean>(undefined)
  const [successMessage, setSuccessMessage] = useState("")
  useEffect(() => {
    if(success){
      setTimeout(() => {
        setSuccess(undefined)
      }, 1000);
    }
    if(success === false){
      setTimeout(() => {
        setSuccess(undefined)
      }, 1000);
    }
  }, [success])
  if (!open) return null;

  const displayDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Select date";
  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">New Task</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Add a task, assignment, or event to your queue.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-300">Task Name</label>
            <input
              onChange={(e) => setTitle(e.target.value) }
              type="text"
              placeholder="e.g. Reading Assignment #3"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Details</label>
            <textarea
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Add any notes, links, or instructions..."
              className="mt-1.5 w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300">Date</label>
              <div className="relative mt-1.5">
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-lg border bg-white/5 px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-white/[0.07] ${
                    isCalendarOpen ? "border-violet-500/50" : "border-white/10"
                  } ${date ? "text-white" : "text-zinc-500"}`}
                >
                  {displayDate}
                  <Calendar className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} />
                </button>

                {isCalendarOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-70"
                      onClick={() => setIsCalendarOpen(false)}
                    />
                    <div
                      className="absolute left-0 top-full z-80 mt-2 w-72 overflow-hidden rounded-lg border border-white/10 bg-[#181820] p-2 text-sm text-zinc-200 shadow-2xl"
                      style={calendarThemeVars}
                    >
                      <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        initialDate={date || undefined}
                        headerToolbar={{ left: "prev", center: "title", right: "next" }}
                        height="auto"
                        dateClick={(info: DateClickArg) => {
                          setDate(info.dateStr);
                          setIsCalendarOpen(false);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Type</label>
              <div className="relative mt-1.5">
                <select value={type} onChange={(e) => setType(e.target.value)}
                  defaultValue="Assignments"
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-9 text-sm text-white outline-none transition-colors hover:bg-white/[0.07] focus:border-violet-500/50"
                >
                  <option value={"Assignments"} className="bg-[#12121a]">Assignments</option>
                  <option value={"Tasks"} className="bg-[#12121a]">Tasks</option>
                  <option value={"Events"} className="bg-[#12121a]">Events</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            Cancel
          </button>
          <button onClick={() => saveTask(title, details, date, type, userId)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">
            Create Task
          </button>
        </div>
      </div>
      </div>
      <Toast
        open={success !== undefined}
        success={!!success}
        message={successMessage}
        onClose={() => setSuccess(undefined)}
      />
    </div>,
    document.body
  );

  async function saveTask(title: string, details: string, date: string, type: string, userId: string | null | undefined){
    const token = getToken() 
    const result = await axios.post(`http://localhost:5000/add/tasks/${userId}`, {title: title, details: details, due: date, type: type}, {headers: {Authorization: `Bearer ${token}`}})
    setSuccess(result.data.status)
    setSuccessMessage(result.data.message)
  }
}
