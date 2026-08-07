import { useAuth, SignInButton, SignUpButton } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Layers, Calendar, BookOpen, LineChart, CheckCircle2, ArrowRight } from "lucide-react";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Intermission() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#0b0b12]" />;
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0b12] px-6">
      <motion.div
        className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/25 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-indigo-600/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-fuchsia-600/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full max-w-xl flex-col items-center text-center"
      >
        <motion.div variants={item} className="mb-8 flex items-center gap-2">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-600/30"
            whileHover={{ rotate: 8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Layers className="h-5 w-5 text-white" strokeWidth={2.25} />
          </motion.div>
          <span className="text-xl font-semibold text-white">OmniPad</span>
        </motion.div>

        <motion.div
          variants={item}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-zinc-300"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Your academic command center
        </motion.div>

        <motion.h1
          variants={item}
          className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl"
        >
          Everything you're juggling,
          <br />
          finally in <span className="text-violet-400">one pad</span>.
        </motion.h1>

        <motion.p variants={item} className="mt-5 max-w-md text-balance text-base leading-relaxed text-zinc-400">
          Assignments, tasks, and events — tracked, prioritized, and visualized in a single
          calm dashboard. Sign in to pick up right where you left off.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <SignUpButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-colors hover:bg-violet-500"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
            </motion.button>
          </SignUpButton>

          <SignInButton mode="modal">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign In
            </motion.button>
          </SignInButton>
        </motion.div>

        <motion.div variants={item} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <motion.div
            whileHover={{ y: -3 }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300"
          >
            <Calendar className="h-3.5 w-3.5 text-sky-400" strokeWidth={2} />
            Universal Calendar
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300"
          >
            <BookOpen className="h-3.5 w-3.5 text-violet-400" strokeWidth={2} />
            Study Hub
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300"
          >
            <LineChart className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2} />
            Progress Analytics
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-zinc-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-orange-400" strokeWidth={2} />
            Priority Queue
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
