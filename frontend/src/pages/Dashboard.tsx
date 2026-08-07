import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";
import { TopBar } from "../components/ui/dashboard/TopBar";
import { PriorityQueueCard } from "../components/ui/dashboard/PriorityQueueCard";
import { CalendarPreviewCard } from "../components/ui/dashboard/CalendarPreviewCard";
import { QuickJumpCard } from "../components/ui/dashboard/QuickJumpCard";
import { StudyVelocityCard } from "../components/ui/dashboard/StudyVelocityCard";

export function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#0b0b12]" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/intermission" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0b0b12]">
      <LeftSidebar />

      <main className="flex-1 px-8 py-6">
        <TopBar />

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <PriorityQueueCard />
            <QuickJumpCard />
          </div>
          <div className="col-span-1 flex flex-col gap-6">
            <CalendarPreviewCard />
            <StudyVelocityCard />
          </div>
        </div>
      </main>
    </div>
  );
}
