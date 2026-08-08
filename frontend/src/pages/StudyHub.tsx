import { LeftSidebar } from "../components/ui/dashboard/LeftSidebar";
import { ModulePipeline } from "../components/ui/studyhub/ModulePipeline";

export function StudyHub() {
  return (
    <div className="flex min-h-screen bg-[#0b0b12]">
      <LeftSidebar />

      <main className="flex flex-1 flex-col p-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Study Hub</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Upload a module, let it process, then choose how you want to review it.
          </p>
        </div>

        <div className="mt-6 flex flex-1 flex-col items-center justify-center">
          <ModulePipeline />
        </div>
      </main>
    </div>
  );
}
