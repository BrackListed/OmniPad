import { useEffect, useRef, useState, type ReactNode } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// Only show the screen if the server is slow to answer, so warm loads don't flash
const SHOW_DELAY_MS = 700;
const RETRY_MS = 2000;
// Render free tier sleeps after ~15 min without traffic
const RECHECK_AFTER_MS = 10 * 60 * 1000;

export function BackendGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [waking, setWaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const lastOk = useRef(0);
  const checking = useRef(false);

  async function wake() {
    if (checking.current) return;
    checking.current = true;
    const start = Date.now();
    const showTimer = setTimeout(() => setWaking(true), SHOW_DELAY_MS);
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);

    while (true) {
      try {
        await axios.get(`${API_BASE_URL}/health`, { timeout: 15000 });
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
      }
    }

    clearTimeout(showTimer);
    clearInterval(tick);
    lastOk.current = Date.now();
    checking.current = false;
    setWaking(false);
    setElapsed(0);
    setReady(true);
  }

  useEffect(() => {
    wake();
    function onVisible() {
      if (document.visibilityState === "visible" && Date.now() - lastOk.current > RECHECK_AFTER_MS) {
        wake();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <>
      {ready ? children : <div className="min-h-screen bg-[#0b0b12]" />}
      {waking && <WakingScreen elapsed={elapsed} />}
    </>
  );
}

function WakingScreen({ elapsed }: { elapsed: number }) {
  let message = "Connecting to the server…";
  if (elapsed >= 5) message = "Waking up the server. It sleeps when nobody's been around for a while.";
  if (elapsed >= 25) message = "Almost there. Cold starts can take up to a minute.";
  if (elapsed >= 70) message = "This is taking longer than usual. Still trying…";

  return (
    <div className="fixed inset-0 z-200 flex flex-col items-center justify-center gap-5 bg-[#0b0b12] px-6 text-center">
      <span className="text-xl font-semibold text-white">OmniPad</span>
      <Loader2 className="h-8 w-8 animate-spin text-violet-400" strokeWidth={2} />
      <p className="max-w-sm text-sm text-zinc-400">{message}</p>
      {elapsed >= 5 && <p className="text-xs tabular-nums text-zinc-600">{elapsed}s</p>}
    </div>
  );
}
