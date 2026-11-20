import { useState } from "react";
import { Sparkles } from "lucide-react";
import AskAiPanel from "@/components/map/AskAiPanel";

export default function AskAi() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask the AI assistant"
        className="absolute left-3 bottom-16 z-[900] inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 text-[11.5px] font-bold text-white shadow-lg backdrop-blur active:scale-95 transition-transform"
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        Ask AI
      </button>

      {open && <AskAiPanel onClose={() => setOpen(false)} />}
    </>
  );
}