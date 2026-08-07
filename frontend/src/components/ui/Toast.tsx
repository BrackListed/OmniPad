import { createPortal } from "react-dom";
import { CheckCircle2, X, XCircle } from "lucide-react";

type ToastProps = {
  open: boolean;
  success: boolean;
  message: string;
  onClose: () => void;
};

export function Toast({ open, success, message, onClose }: ToastProps) {
  if (!open) return null;

  return createPortal(
    <div
      className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 rounded-xl border bg-[#12121a] px-4 py-3 shadow-2xl ${
        success ? "border-emerald-500/30" : "border-red-500/30"
      }`}
    >
      {success ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" strokeWidth={2} />
      ) : (
        <XCircle className="h-5 w-5 shrink-0 text-red-400" strokeWidth={2} />
      )}
      <p className={`text-sm font-medium ${success ? "text-emerald-300" : "text-red-300"}`}>
        {message}
      </p>
      <button
        onClick={onClose}
        className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-500 hover:bg-white/5 hover:text-white"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>,
    document.body
  );
}
