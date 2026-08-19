import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";
import { TopBar } from "../components/ui/dashboard/TopBar";
import { PriorityQueueCard } from "../components/ui/dashboard/PriorityQueueCard";
import { CalendarPreviewCard } from "../components/ui/dashboard/CalendarPreviewCard";
import { QuickJumpCard } from "../components/ui/dashboard/QuickJumpCard";
import { StudyVelocityCard } from "../components/ui/dashboard/StudyVelocityCard";
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TOUR_STEPS } from "@/tour/tourSteps";
import { useEffect } from "react";


export function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const dashboardSteps = TOUR_STEPS.filter((step) => step.page === "/dashboard")
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: dashboardSteps
    })
    const timer = setTimeout(() => {
      driverObj.drive()
    }, 400);

    return () => clearTimeout(timer)
  }, [])
  if (!isLoaded) {
    return <div className="min-h-screen bg-[#0b0b12]" />;
  }

  if (!isSignedIn) {
    return <Navigate to="/intermission" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0b0b12]">
      <div id="left-sidebar">
        <LeftSidebar />
      </div>

      <main className="flex-1 px-8 py-6">
        <div id = "profile">
          <TopBar />
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <div id = "priority-queue">
              <PriorityQueueCard />
            </div>
            <QuickJumpCard />
          </div>
          <div className="col-span-1 flex flex-col gap-6">
            <CalendarPreviewCard />
            <div id = "study-velocity">
              <StudyVelocityCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
