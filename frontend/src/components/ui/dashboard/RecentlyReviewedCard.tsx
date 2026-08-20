import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/react";
import { API_BASE_URL } from "@/lib/api";

interface fileType {
  id: string;
  filename: string;
  upload_date: string;
  completed: boolean;
}

export function RecentlyReviewedCard() {
  const { userId, getToken } = useAuth();
  const [files, setFiles] = useState<fileType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const loadFiles = async () => {
      const token = await getToken();
      const result = await axios.get(`${API_BASE_URL}/file/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const completed = (result.data.files as fileType[]).filter((file) => file.completed);
      setFiles(completed.slice(0, 4));
      setLoading(false);
    };
    loadFiles();
  }, [userId, getToken]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#12121a] p-5">
      <h2 className="text-xs font-semibold tracking-wide text-zinc-400">RECENTLY REVIEWED</h2>
      <p className="mt-1 text-xs text-zinc-500">Files you've marked as complete.</p>

      {!loading && files.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No completed files yet.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {files.map((file) => (
            <div key={file.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="truncate text-sm font-semibold text-white">{file.filename}</span>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {new Date(file.upload_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
