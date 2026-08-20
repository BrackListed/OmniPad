import type { DriveStep } from "driver.js";
import axios from "axios";

export interface CustomTourStep extends DriveStep {
  page: string;
}

const TOUR_ACTIVE_KEY = "omnipad-tour-active";

export function isTourActive(): boolean {
  return sessionStorage.getItem(TOUR_ACTIVE_KEY) === "1";
}

export function activateTour(): void {
  sessionStorage.setItem(TOUR_ACTIVE_KEY, "1");
}

export function deactivateTour(): void {
  sessionStorage.removeItem(TOUR_ACTIVE_KEY);
}

export function triggerTourReplay(): void {
  furthestStepReached = -1;
  visitedModes.clear();
  activateTour();
}

export async function shouldAutoStartTour(userId: string, token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const result = await axios.get(`http://localhost:5000/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return !result.data.has_seen_tour;
  } catch (error) {
    console.error("Failed to check tour status", error);
    return false;
  }
}

export async function completeTour(userId: string, token: string | null): Promise<void> {
  if (!token) return;
  try {
    await axios.patch(`http://localhost:5000/users/complete-tour/${userId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error("Failed to mark tour complete", error);
  }
}

export function tourPageMatches(stepPage: string, pathname: string): boolean {
  if (stepPage.endsWith("/*")) {
    return pathname.startsWith(stepPage.slice(0, -1));
  }
  return pathname === stepPage;
}

let furthestStepReached = -1;

export function markTourStepReached(index: number | undefined): void {
  if (index !== undefined && index > furthestStepReached) {
    furthestStepReached = index;
  }
}

export function tourStartIndex(pathname: string): number {
  const afterProgress = TOUR_STEPS.findIndex(
    (step, i) => i > furthestStepReached && tourPageMatches(step.page, pathname)
  );
  if (afterProgress !== -1) return afterProgress;
  return TOUR_STEPS.findIndex((step) => tourPageMatches(step.page, pathname));
}

const visitedModes = new Set<string>();

export function markModeVisited(mode: string): void {
  visitedModes.add(mode);
}

export function studyHubResumeIndex(): number {
  const modeOrder = ["Feynman", "Socratic", "Quiz", "Flashcards"];
  const cardElementByMode: Record<string, string> = {
    Feynman: "#feynman-card",
    Socratic: "#socratic-card",
    Quiz: "#quiz-card",
    Flashcards: "#flashcards-card",
  };
  const nextUnvisited = modeOrder.find((mode) => !visitedModes.has(mode));
  if (nextUnvisited === undefined) {
    return TOUR_STEPS.findIndex((step) => step.element === "#flashcards-card");
  }
  if (nextUnvisited === "Feynman") {
    return tourStartIndex("/study-hub");
  }
  return TOUR_STEPS.findIndex(
    (step) => step.page === "/study-hub" && step.element === cardElementByMode[nextUnvisited]
  );
}

export const TOUR_STEPS: CustomTourStep[] = [
  {
    page: "/",
    element: "#profile",
    popover: {
      title: "1. OmniPad",
      description: "One command center for a student's entire semester — assignments, a live calendar, and four AI-native study modes, all in a single workspace.",
      side: "right",
      align: "start",
    },
  },
  {
    page: "/",
    element: "#left-sidebar",
    popover: {
      title: "2. Everything, One Sidebar",
      description: "Dashboard, Calendar, Study Hub, Analytics — every surface of the product is one click away. No app-switching.",
      side: "right",
      align: "start",
    },
  },
  {
    page: "/",
    element: "#priority-queue",
    popover: {
      title: "3. Priority Queue",
      description: "Every task is automatically ranked by how soon it's due. The app tells you what to work on next — you don't have to figure it out.",
      side: "left",
      align: "start",
    },
  },
  {
    page: "/",
    element: "#study-velocity",
    popover: {
      title: "4. Study Analytics",
      description: "Study consistency is tracked automatically and visualized as a live graph — no manual logging required.",
      side: "top",
      align: "start",
    },
  },
  {
    page: "/calendar",
    element: "#calendar-main",
    popover: {
      title: "5. A Real Calendar",
      description: "Every deadline lands here the moment it's created, synced across the whole app instantly.",
      side: "right",
      align: "start",
    },
  },
  {
    page: "/calendar",
    element: "#add-task",
    advanceOnClick: true,
    popover: {
      title: "6. Live Demo",
      description: "Let's create a task, live. Click Add Task.",
      side: "left",
      align: "end",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/calendar",
    element: "#new-task",
    popover: {
      title: "7. Instant Fill",
      description: "Pre-filled instantly: Calculus Assignment A, due Aug 31. Real usage is this fast — type a title and go.",
      side: "right",
      align: "center",
    },
  },
  {
    page: "/calendar",
    element: "#new-task-added",
    advanceOnClick: true,
    popover: {
      title: "8. Save It",
      description: "Click Create Task — watch it land on the calendar in real time.",
      side: "left",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/calendar",
    element: () => document.querySelector('.fc-daygrid-day[data-date="2026-08-31"]') as Element,
    waitForElement: 5000,
    popover: {
      title: "9. There It Is",
      description: "Created live, synced instantly — no reload, no manual refresh.",
      side: "top",
      align: "start",
    },
  },
  {
    page: "/study-hub",
    element: "#module-intake",
    popover: {
      title: "10. Feed It Anything",
      description: "Drop in a PDF, a screenshot, or raw notes. OmniPad reads it and builds study material automatically.",
      side: "bottom",
      align: "start",
    },
  },
  {
    page: "/study-hub",
    element: "#file-processing",
    popover: {
      title: "11. Pick A File",
      description: "Select a file above — processing takes under two seconds. No manual tagging, no setup.",
      side: "bottom",
      align: "center",
    },
  },
  {
    page: "/study-hub",
    element: "#mode-cards",
    popover: {
      title: "12. Four AI Study Modes",
      description: "Feynman, Socratic, Quiz, and Flashcards — all generated from the same material, instantly.",
      side: "top",
      align: "center",
    },
  },
  {
    page: "/study-hub",
    element: "#feynman-card",
    advanceOnClick: true,
    popover: {
      title: "13. Teach It Back",
      description: "Let's start with Feynman. Click in.",
      side: "right",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Feynman/*",
    element: "#feynman-question",
    popover: {
      title: "14. Generated On The Fly",
      description: "Every question here is generated fresh from your uploaded material. Explain it back like you're teaching a five-year-old — try getting it wrong on purpose.",
      side: "left",
      align: "start",
    },
  },
  {
    page: "/study-hub/Feynman/*",
    element: "#feynman-submit",
    waitForElement: 15000,
    skipMissingElement: true,
    advanceOnClick: true,
    popover: {
      title: "15. Submit It",
      description: "Hit Submit to see what happens.",
      side: "left",
      align: "end",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Feynman/*",
    element: "#critique-modal",
    waitForElement: 6000,
    skipMissingElement: true,
    popover: {
      title: "16. Real Feedback",
      description: "That's Feynman grading in real time — actual reasoning feedback, not keyword matching.",
      side: "right",
      align: "center",
    },
  },
  {
    page: "/study-hub/Feynman/*",
    element: "#nav-study-hub",
    advanceOnClick: true,
    popover: {
      title: "17. Next Up: Socratic",
      description: "Head back to Study Hub to see Socratic mode.",
      side: "right",
      align: "start",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub",
    element: "#socratic-card",
    advanceOnClick: true,
    popover: {
      title: "18. Now Try Socratic",
      description: "Same file, different mode. Click in.",
      side: "right",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Socratic/*",
    element: "#socratic-question",
    popover: {
      title: "19. Guided, Not Graded",
      description: "Same engine, different pedagogy — Socratic mode leads with guiding questions and hints instead of a flat prompt.",
      side: "left",
      align: "start",
    },
  },
  {
    page: "/study-hub/Socratic/*",
    element: "#nav-study-hub",
    advanceOnClick: true,
    popover: {
      title: "20. Next Up: Quiz",
      description: "Back to Study Hub for Quiz mode.",
      side: "right",
      align: "start",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub",
    element: "#quiz-card",
    advanceOnClick: true,
    popover: {
      title: "21. Now Try Quiz",
      description: "Same file, different mode. Click in.",
      side: "right",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Quiz/*",
    element: "#quiz-start",
    advanceOnClick: true,
    popover: {
      title: "22. Instantly Scored",
      description: "Multiple choice, auto-generated, scored the moment you answer. Click Start Quiz.",
      side: "bottom",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Quiz/*",
    element: "#quiz-question",
    waitForElement: 8000,
    skipMissingElement: true,
    popover: {
      title: "23. The Format",
      description: "Four options per question, pulled straight from your material — no manual question-writing.",
      side: "left",
      align: "start",
    },
  },
  {
    page: "/study-hub/Quiz/*",
    element: "#nav-study-hub",
    advanceOnClick: true,
    popover: {
      title: "24. Last One: Flashcards",
      description: "Back to Study Hub for Flashcards.",
      side: "right",
      align: "start",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub",
    element: "#flashcards-card",
    advanceOnClick: true,
    popover: {
      title: "25. Now Try Flashcards",
      description: "Same file, different mode. Click in.",
      side: "right",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Flashcards/*",
    element: "#flashcards-start",
    advanceOnClick: true,
    popover: {
      title: "26. Auto-Generated Cards",
      description: "Front and back, generated automatically from your material. Click Start Flashcards.",
      side: "bottom",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Flashcards/*",
    element: "#flashcard-card",
    waitForElement: 8000,
    skipMissingElement: true,
    advanceOnClick: true,
    popover: {
      title: "27. Answer It",
      description: "Try to recall the answer, then click the card to flip it.",
      side: "right",
      align: "center",
      showButtons: ["previous", "close"],
    },
  },
  {
    page: "/study-hub/Flashcards/*",
    element: "#flashcard-card",
    popover: {
      title: "28. That's The Feedback",
      description: "Instant recall check, right on the card — no separate grading screen needed. That's the whole product: four study modes, one workspace, built for speed.",
      side: "right",
      align: "center",
    },
  },
];
