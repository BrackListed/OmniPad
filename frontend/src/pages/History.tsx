import { useEffect, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";
import { useAuth } from "@clerk/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type FileStatus = "Completed" | "In Progress";

interface fileType {
  id: string
  filename: string
  upload_date: string
  user_id: string
  path: string
  completed: boolean
}

interface sessionType{
    id: string
    user_id: string
    file_id: string
    mode: string
    topic: string
    score: number
    passed: boolean
    feedback: string
    wrong_index: number[]
    payload: JSON
    already_attempted: boolean
    created_at: Date
}


export function History() {
  const [filter, setFilter] = useState<FileStatus>("In Progress");
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [files, setFiles] = useState<fileType[]>([])
  const [sessions, setSessions] = useState<sessionType[]>([])
  const {userId, getToken} = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if(!userId) return
    const fetchFilesData = async() => {
        const token = await getToken()
        const result = await axios.get(`http://localhost:5000/file/${userId}`, {headers: {Authorization: `Bearer ${token}`}})
        setFiles(result.data.files)
    }
    const fetchSessions = async() => {
        const token = await getToken()
        const result = await axios.get(`http://localhost:5000/global/sessions/${userId}`, {headers: {Authorization: `Bearer ${token}`}})
        setSessions(result.data)
    }
    fetchFilesData()
    fetchSessions()
  }, [userId])

  const visibleFiles = files.filter((file) =>
    filter === "Completed" ? file.completed : !file.completed
  )

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
            <p className="text-sm text-zinc-500">No {filter.toLowerCase()} files yet.</p>
          ) : (
            visibleFiles.map((file) => {
              const isExpanded = expandedFileId === file.id;
              const fileSessions = sessions.filter((session) => session.file_id === file.id)
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
                      <p className="text-xs text-zinc-500">{file.upload_date}</p>
                    </div>
                    <div
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                        file.completed
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-400"
                          : "border-orange-400/30 bg-orange-500/10 text-orange-400"
                      }`}
                    >
                      {file.completed ? "Completed" : "In Progress"}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      strokeWidth={2}
                    />
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-2 border-t border-white/10 p-4">
                      {fileSessions.length === 0 ? (
                        <p className="text-sm text-zinc-500">No study sessions for this file yet.</p>
                      ) : (
                        fileSessions.map((session) => {
                          const wrongs = session.wrong_index?.length || 0
                          const total = session.score + wrongs
                          return(
                          <div
                            key={session.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white">{session.mode}</p>
                              {session.mode !== "Flashcards" && (
                                <p className="mt-0.5 text-xs text-zinc-400">
                                  Score: {session.score}/{total}
                                  {" · "}
                                  Status:{" "}
                                  <span
                                    className={session.passed ? "text-emerald-400" : "text-red-400"}
                                  >
                                    {session.passed ? "Passed" : "Fail"}
                                  </span>
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              className="shrink-0 rounded-lg border border-violet-400/35 bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-100 transition-colors hover:bg-violet-500/30"
                              onClick={() => navigate(`/study-hub/${session.mode}/${file.id}`)}
                            >
                              View
                            </button>
                          </div>
                          )
                        })
                      )}
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
