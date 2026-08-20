import { LayoutGrid, Calendar, BookOpen, LineChart, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { UserButton } from "@clerk/react";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-violet-600/15 text-violet-400"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
  }`;

export function LeftSidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between border-r border-white/10 bg-[#0b0b12] px-3 py-5">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <UserButton />
          <span className="text-[15px] font-semibold text-white">OmniPad</span>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass}>
            <LayoutGrid className="h-4.5 w-4.5" strokeWidth={2} />
            Dashboard
          </NavLink>
          <NavLink to="/calendar" className={linkClass}>
            <Calendar className="h-4.5 w-4.5" strokeWidth={2} />
            Calendar
          </NavLink>
          <NavLink id="nav-study-hub" to="/study-hub" className={linkClass}>
            <BookOpen className="h-4.5 w-4.5" strokeWidth={2} />
            Study Hub
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            <LineChart className="h-4.5 w-4.5" strokeWidth={2} />
            History/Analytics
          </NavLink>
        </nav>
      </div>

      <NavLink to="/settings" className={linkClass}>
        <Settings className="h-4.5 w-4.5" strokeWidth={2} />
        Settings
      </NavLink>
    </aside>
  );
}
