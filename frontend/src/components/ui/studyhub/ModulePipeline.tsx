import { useEffect, useRef, useState } from "react";
import {
  Brain,
  ChevronDown,
  FileCheck2,
  FileText,
  Landmark,
  Loader2,
  Search,
  SquareStack,
  Target,
  UploadCloud,
  X,
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import axios from "axios";
import { useAuth } from "@clerk/react";

type PipelineStatus = "idle" | "processing" | "complete";

interface fileType {
  id: string
  filename: string
  upload_date: Date
  user_id: string
  path: string
}

export function ModulePipeline() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<PipelineStatus>("idle");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePath, setFilePath] = useState("")
  const [fileId, setFileId] = useState("")
  const {getToken, userId} = useAuth()
  const [fileList, setFileList] = useState<fileType[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFiles = fileList.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    if(!userId) return 
    const fetchFiles = async() => {
      const token = await getToken()
      const result = await axios.get(`http://localhost:5000/file/${userId}`, {headers: {Authorization: `Bearer ${token}`}})
      setFileList(result.data.files)
    }
    fetchFiles()
  }, [userId])

  useEffect(() => {
    if (status !== "processing") return;
    const timer = setTimeout(() => setStatus("complete"), 1800);
    return () => clearTimeout(timer);
  }, [status]);

  function startProcessing(name: string) {
    setFileName(name);
    setStatus("processing");
  }

  function reset() {
    setFileName(null);
    setStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }


  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col items-stretch gap-4 sm:flex-row sm:justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            uploadFile(file)
            if (file) startProcessing(file.name);
          }}
        />

        <button
          type="button"
          onClick={() => status === "idle" && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (status === "idle") setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={(e) => {

            e.preventDefault();
            setIsDraggingOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file && status === "idle") startProcessing(file.name);
          }}
          disabled={status !== "idle"}
          className={`flex w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors sm:max-w-md ${
            isDraggingOver ? "border-violet-500 bg-violet-500/10" : "border-white/15 bg-[#12121a]"
          } ${status === "idle" ? "cursor-pointer hover:border-violet-500/50" : "cursor-default"}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
            <UploadCloud className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {fileName ?? "Upload PDF / Screenshot / Notes"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              {fileName ? "Ready to process" : "Drag & drop or click to browse"}
            </p>
          </div>
        </button>

        {fileList.length > 0 && (
          <div className="flex max-h-72 w-full flex-col rounded-2xl border border-white/10 bg-[#12121a] p-4 sm:w-72 sm:shrink-0">
            <h3 className="mb-2 text-sm font-semibold text-white">Your Files</h3>
            <div className="relative mb-3">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                strokeWidth={2}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your files"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-violet-500/50"
              />
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              {filteredFiles.length === 0 ? (
                <p className="py-4 text-center text-sm text-zinc-500">No files found</p>
              ) : (
                filteredFiles.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => selectFile(file)}
                    disabled={status === "processing"}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed ${
                      fileId === file.id
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-white/10 bg-white/2 hover:border-white/20"
                    }`}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{file.filename}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(file.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center py-1">
        <div className="h-6 w-px bg-white/15" />
        <ChevronDown className="h-4 w-4 text-white/25" strokeWidth={2} />
      </div>

      <div
        className={`flex w-full max-w-md items-center gap-3 rounded-2xl border p-4 transition-colors ${
          status === "complete"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : status === "processing"
              ? "border-violet-500/30 bg-violet-500/5"
              : "border-white/10 bg-[#12121a]"
        }`}
      >
        {status === "processing" ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-violet-400" strokeWidth={2} />
        ) : status === "complete" ? (
          <FileCheck2 className="h-5 w-5 shrink-0 text-emerald-400" strokeWidth={2} />
        ) : (
          <FileCheck2 className="h-5 w-5 shrink-0 text-zinc-600" strokeWidth={2} />
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Module Processing Pipeline</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {status === "idle" && "Waiting for a module to upload"}
            {status === "processing" && `Analyzing ${fileName}...`}
            {status === "complete" && "Ready — pick a review mode below"}
          </p>
        </div>
        {status === "complete" && (
          <button
            onClick={reset}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center py-1">
        <div className="h-6 w-px bg-white/15" />
        <ChevronDown className="h-4 w-4 text-white/25" strokeWidth={2} />
      </div>

      <div className="relative w-full">
        <div className="absolute left-[12.5%] right-[12.5%] top-0 hidden h-px bg-white/15 sm:block" />
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-4">
          <div className="flex flex-col items-center gap-2">
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <FeatureCard
              icon={Brain}
              accent="orange"
              title="FEYNMAN REVIEWER"
              bullets={[
                "TEACH & LEARN | Explain like a 5-year-old and get scored.",
                "Target: 80% or re-explain.",
              ]}
              ctaLabel="Start Teaching"
              locked={status !== "complete"}
              onClick={() => createStudySession(fileId, filePath, "Feynman", userId)}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <FeatureCard
              icon={Landmark}
              accent="sky"
              title="SOCRATIC DIALOGUE"
              bullets={[
                "Interrogative AI questioning",
                "Segmented module breakdown",
                "Guided logic chain validation",
              ]}
              ctaLabel="Enter Socratic Arena"
              locked={status !== "complete"}
              onClick={() => createStudySession(fileId, filePath, "Socratic", userId)}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <FeatureCard
              icon={Target}
              accent="violet"
              title="ADAPTIVE QUIZ GEN"
              bullets={[
                "Multi-format (MCQ, Fill-in, T/F)",
                "Targeted weak-spot extraction",
                "Customizable length & difficulty",
              ]}
              ctaLabel="Generate Quiz Batch"
              locked={status !== "complete"}
              onClick={() => createStudySession(fileId, filePath, "Quiz", userId)}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <FeatureCard
              icon={SquareStack}
              accent="emerald"
              title="FLASHCARDS"
              bullets={[
                "Auto-generated front/back cards",
                "Spaced repetition scheduling",
                "Swipe to mark known / unsure",
              ]}
              ctaLabel="Start Flashcards"
              locked={status !== "complete"}
              onClick={() => createStudySession(fileId, filePath, "Flashcards", userId)}
            />
          </div>
        </div>
      </div>
    </div>
  );



  function selectFile(file: fileType){
    setFileId(file.id)
    setFilePath(file.path)
    startProcessing(file.filename)
  }

  async function uploadFile(file: File | undefined){
    const formData = new FormData()
    formData.append("file", file!)
    const token = getToken()
    const result = await axios.post(`http://localhost:5000/upload/file/${userId}`, formData, {headers: {Authorization: `Bearer ${token}`}})
    setFileId(result.data.id)
    setFilePath(result.data.path)
    setFileList((prev) =>
      prev.some((f) => f.id === result.data.id)
        ? prev
        : [
            { id: result.data.id, filename: file!.name, upload_date: new Date(), user_id: userId ?? "", path: result.data.path },
            ...prev,
          ]
    )
  }
  async function createStudySession(id: string, path: string, type: string, userId: string | null | undefined){
    if(!userId) return 
      const token = getToken()
      const result = await axios.post(`http://localhost:5000/generate/session/${userId}`, {type: type, fileId: id, path: path,}, {headers: {Authorization: `Bearer ${token}`}})
      console.log(result.status)
  }
}
