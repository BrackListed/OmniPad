import { useAuth } from "@clerk/react";
import { Navigate, useNavigate } from "react-router-dom";
import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";
import { TopBar } from "../components/ui/dashboard/TopBar";
import { PriorityQueueCard } from "../components/ui/dashboard/PriorityQueueCard";
import { CalendarPreviewCard } from "../components/ui/dashboard/CalendarPreviewCard";
import { RecentlyReviewedCard } from "../components/ui/dashboard/RecentlyReviewedCard";
import { StudyVelocityCard } from "../components/ui/dashboard/StudyVelocityCard";
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import "@/tour/tour.css";
import { TOUR_STEPS, tourPageMatches, tourStartIndex, markTourStepReached, isTourActive, activateTour, deactivateTour, shouldAutoStartTour, completeTour } from "@/tour/tourSteps";
import type { CustomTourStep } from "@/tour/tourSteps";
import { useEffect } from "react";


export function Dashboard() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const navigate = useNavigate()
  useEffect(() => {
    if(!userId) return
    const driverObj = driver({
      showProgress: true,
      animate: true,
      popoverClass: "omnipad-tour",
      overlayColor: "#0b0b12",
      overlayOpacity: 0.75,
      steps: TOUR_STEPS as NonNullable<Parameters<typeof driver>[0]>["steps"],
      waitForElement: 3000,
      onHighlightStarted: (element, step) => {
        const tourStep = step as CustomTourStep
        if(!tourPageMatches(tourStep.page, location.pathname)){
          navigate(tourStep.page)
        }
      },
      onNextClick: (element, step, opts) => {
        markTourStepReached(opts.index)
        const nextStep = opts.index !== undefined ? TOUR_STEPS[opts.index + 1] as CustomTourStep | undefined : undefined
        if(nextStep && !tourPageMatches(nextStep.page, location.pathname)){
          navigate(nextStep.page)
          return
        }
        driverObj.moveNext()
      },
      onCloseClick: () => {
        driverObj.destroy()
        deactivateTour()
        getToken().then((token) => completeTour(userId, token))
      },
      onDoneClick: () => {
        driverObj.destroy()
        deactivateTour()
        getToken().then((token) => completeTour(userId, token))
      }
    })

    async function initTour(){
      if(!isTourActive()){
        const token = await getToken()
        const shouldStart = await shouldAutoStartTour(userId!, token)
        if(!shouldStart) return
        activateTour()
      }
      const startIndex = tourStartIndex(location.pathname)
      driverObj.drive(startIndex === -1 ? 0 : startIndex)
    }
    initTour()

    return () => driverObj.destroy()
  }, [userId])
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
            <RecentlyReviewedCard />
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
