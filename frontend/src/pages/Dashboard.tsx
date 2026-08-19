import { useAuth } from "@clerk/react";
import { Navigate, useNavigate } from "react-router-dom";
import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";
import { TopBar } from "../components/ui/dashboard/TopBar";
import { PriorityQueueCard } from "../components/ui/dashboard/PriorityQueueCard";
import { CalendarPreviewCard } from "../components/ui/dashboard/CalendarPreviewCard";
import { QuickJumpCard } from "../components/ui/dashboard/QuickJumpCard";
import { StudyVelocityCard } from "../components/ui/dashboard/StudyVelocityCard";
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TOUR_STEPS } from "@/tour/tourSteps";
import type { CustomTourStep } from "@/tour/tourSteps";
import { useEffect } from "react";


export function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate()
  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: TOUR_STEPS as NonNullable<Parameters<typeof driver>[0]>["steps"],
      waitForElement: 3000,
      onHighlightStarted: (element, step) => {
        const tourStep = step as CustomTourStep
        if(tourStep.page !== location.pathname){
          navigate(tourStep.page)
        }
      },
      onNextClick: (element, step) => {
        const tourStep = step as CustomTourStep
        const currentIndex = (TOUR_STEPS as CustomTourStep[]).indexOf(tourStep)
        const nextStep = TOUR_STEPS[currentIndex + 1] as CustomTourStep | undefined
        // Navigate immediately instead of letting driver.js spend
        // waitForElement (3s) searching this page for an element that
        // only exists on the next page.
        if(nextStep && nextStep.page !== location.pathname){
          navigate(nextStep.page)
          return
        }
        driverObj.moveNext()
      }
    })
    const timer = setTimeout(() => {
      // Resume at the first step that belongs to this page, instead of
      // always restarting from step 0 (which broke navigating between pages).
      const startIndex = TOUR_STEPS.findIndex(step => step.page === location.pathname)
      driverObj.drive(startIndex === -1 ? 0 : startIndex)
    }, 400);

    return () => {clearTimeout(timer); driverObj.destroy()}
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
