import { createPortal } from "react-dom";
import { Calendar, ChevronDown, X } from "lucide-react";

type NewTaskModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewTaskModal({ open, onClose }: NewTaskModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#12121a] p-6 shadow-2xl">
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
              type="text"
              placeholder="e.g. Reading Assignment #3"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-300">Details</label>
            <textarea
              rows={4}
              placeholder="Add any notes, links, or instructions..."
              className="mt-1.5 w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300">Date</label>
              <div className="relative mt-1.5">
                <input
                  type="date"
                  style={{ colorScheme: "dark" }}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-9 text-sm text-white outline-none focus:border-violet-500/50 [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <Calendar
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  strokeWidth={2}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300">Type</label>
              <div className="relative mt-1.5">
                <select
                  defaultValue="Assignments"
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 pr-9 text-sm text-white outline-none focus:border-violet-500/50"
                >
                  <option className="bg-[#12121a]">Assignments</option>
                  <option className="bg-[#12121a]">Tasks</option>
                  <option className="bg-[#12121a]">Events</option>
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
          <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500">
            Create Task
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
