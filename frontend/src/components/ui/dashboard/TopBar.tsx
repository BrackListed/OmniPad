import { Bell, Flame, Plus, Search } from "lucide-react";

export function TopBar() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
            A
          </div>
          <span className="text-lg font-semibold text-white">Welcome back, Alex!</span>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-zinc-300 hover:bg-white/10">
          <Bell className="h-4.5 w-4.5" strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search OmniPads or topics"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-violet-500/50"
          />
        </div>

        <button className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Task / Upload Module
        </button>

        <div className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-white">
          <Flame className="h-4 w-4 text-orange-400" strokeWidth={2} fill="currentColor" />
          12
        </div>

        <button className="whitespace-nowrap rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15">
          Check-in
        </button>
      </div>
    </div>
  );
}
