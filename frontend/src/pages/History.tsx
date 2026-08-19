import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";

type SessionStatus = "Completed" | "In Progress";

interface MockSession {
  id: string;
  mode: string;
  score: number;
  total: number;
  status: SessionStatus;
}

interface MockFile {
  id: string;
  filename: string;
  uploadDate: string;
  sessions: MockSession[];
}

const mockFiles: MockFile[] = [
  {
    id: "file-1",
    filename: "Week 5 Handout.pdf",
    uploadDate: "Aug 9, 2026",
    sessions: [
      { id: "s-1", mode: "Feynman", score: 4, total: 5, status: "Completed" },
      { id: "s-2", mode: "Socratic", score: 2, total: 5, status: "In Progress" },
      { id: "s-3", mode: "Quiz", score: 12, total: 12, status: "Completed" },
    ],
  },
  {
    id: "file-2",
    filename: "Thermodynamics Notes.pdf",
    uploadDate: "Aug 12, 2026",
    sessions: [
      { id: "s-4", mode: "Flashcards", score: 18, total: 20, status: "Completed" },
      { id: "s-5", mode: "Feynman", score: 1, total: 6, status: "In Progress" },
    ],
  },
  {
    id: "file-3",
    filename: "Organic Chemistry Ch. 4.pdf",
    uploadDate: "Aug 15, 2026",
    sessions: [
      { id: "s-6", mode: "Quiz", score: 0, total: 10, status: "In Progress" },
      { id: "s-7", mode: "Socratic", score: 5, total: 5, status: "Completed" },
    ],
  },
];

export function History() {
  const [filter, setFilter] = useState<SessionStatus>("Completed");
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  const visibleFiles = mockFiles.filter((file) =>
    file.sessions.some((session) => session.status === filter)
  );

  return (
    <div className="flex min-h-screen bg-[#0b0b12]">
      <LeftSidebar />

      <main className="flex flex-1 flex-col p-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">History</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Browse your past study sessions by file.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("Completed")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "Completed"
                ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setFilter("In Progress")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "In Progress"
                ? "border-violet-400/40 bg-violet-500/20 text-violet-200"
                : "border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            In Progress
          </button>
        </div>

        <div className="mt-6 flex w-full max-w-2xl flex-col gap-3">
          {visibleFiles.length === 0 ? (
            <p className="text-sm text-zinc-500">No files with {filter.toLowerCase()} sessions yet.</p>
          ) : (
            visibleFiles.map((file) => {
              const isExpanded = expandedFileId === file.id;
              const sessions = file.sessions.filter((session) => session.status === filter);

              return (
                <div
                  key={file.id}
                  className="rounded-2xl border border-white/10 bg-[#12121a] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/5"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{file.filename}</p>
                      <p className="text-xs text-zinc-500">{file.uploadDate}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-2 border-t border-white/10 p-4">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">"{session.mode}"</p>
                            <p className="mt-0.5 text-xs text-zinc-400">
                              Score: {session.score}/{session.total}
                              {" · "}
                              Status:{" "}
                              <span
                                className={
                                  session.status === "Completed"
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                                }
                              >
                                {session.status}
                              </span>
                            </p>
                          </div>
                          <button
                            type="button"
                            className="shrink-0 rounded-lg border border-violet-400/35 bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-100 transition-colors hover:bg-violet-500/30"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
