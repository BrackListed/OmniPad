import { useState } from "react";
import { LayoutGrid, Calendar, BookOpen, LineChart, RotateCcw, Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { UserButton } from "@clerk/react";
import { triggerTourReplay } from "@/tour/tourSteps";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-violet-600/15 text-violet-400"
      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
  }`;

function SidebarContent({ isDesktop, onNavigate }: { isDesktop: boolean; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <UserButton />
          <span className="text-[15px] font-semibold text-white">OmniPad</span>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass} onClick={onNavigate}>
            <LayoutGrid className="h-4.5 w-4.5" strokeWidth={2} />
            Dashboard
          </NavLink>
          <NavLink to="/calendar" className={linkClass} onClick={onNavigate}>
            <Calendar className="h-4.5 w-4.5" strokeWidth={2} />
            Calendar
          </NavLink>
          <NavLink id={isDesktop ? "nav-study-hub" : undefined} to="/study-hub" className={linkClass} onClick={onNavigate}>
            <BookOpen className="h-4.5 w-4.5" strokeWidth={2} />
            Study Hub
          </NavLink>
          <NavLink to="/history" className={linkClass} onClick={onNavigate}>
            <LineChart className="h-4.5 w-4.5" strokeWidth={2} />
            History/Analytics
          </NavLink>
        </nav>
      </div>

      <button
        type="button"
        onClick={() => {
          triggerTourReplay()
          window.location.href = "/"
        }}
        className={linkClass({ isActive: false })}
      >
        <RotateCcw className="h-4.5 w-4.5" strokeWidth={2} />
        Replay Tour
      </button>
    </>
  );
}

export function LeftSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-white/10 bg-[#0b0b12] px-3 py-5 md:flex">
        <SidebarContent isDesktop />
      </aside>

      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0b0b12] px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
        <span className="text-[15px] font-semibold text-white">OmniPad</span>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 max-w-[80%] flex-col justify-between border-r border-white/10 bg-[#0b0b12] px-3 py-5">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              aria-label="Close menu"
            >
              <X className="h-4.5 w-4.5" strokeWidth={2} />
            </button>
            <SidebarContent isDesktop={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
