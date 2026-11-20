import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Loader2, Sparkles, X } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { createTreeSphere } from "@/lib/treeSphere";
import { cn } from "@/lib/utils";

const PHRASES = [
  "Ask me about any charger",
  "What does a full charge cost?",
  "Where is the cheapest DC stop?",
];
const CHIPS = ["Cheapest DC charger in Bangkok", "Fastest CCS2 near Chiang Mai", "Estimate charge time and cost", "CCS2 vs Type 2", "AC vs DC fast charging", "On-Peak vs Off-Peak", "Battery care tips", "Plan a long-distance EV trip", "สถานีชาร์จ DC ราคาถูกในกรุงเทพ", "หัว CCS2 กับ Type 2 ต่างกันอย่างไร", "เทคนิคดูแลแบตเตอรี่ EV"];
export default function AskAiPanel({ onClose }) {
  const [state, setState] = useState("idle");
  const [answer, setAnswer] = useState(null);
  const [question, setQuestion] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [picked, setPicked] = useState(-1);
  const canvasRef = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const destroy = createTreeSphere(canvasRef.current, () => stateRef.current);
    return destroy;
  }, []);

  useEffect(() => {
    if (state !== "idle") return;
    setPhraseIndex(0);
    const timer = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [state]);

  const ask = (text) => {
    const q = text.trim();
    if (!q || state === "thinking") return;
    setPicked(CHIPS.indexOf(q));
    setQuestion("");
    setState("thinking");
    mockApi.functions.invoke("askEvAssistant", { question: q })
      .then((result) => setAnswer(result.data))
      .catch(() => setAnswer({ pill: "Assistant", figure: "Unavailable", text: "I could not prepare an answer. Please try again." }))
      .finally(() => setState("answer"));
  };

  const reset = () => {
    setState("idle");
    setAnswer(null);
    setPicked(-1);
  };

  const thinking = state === "thinking";

  return (
    <div className="absolute inset-0 z-[1100] flex flex-col overflow-hidden bg-slate-950 text-white">
      <header className="flex items-center justify-between gap-3 border-b border-slate-800/80 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+14px)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-4 w-4 text-slate-950" strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-[14px] font-bold leading-tight">VOLT JAI Assistant</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
              Codex AI Â· Thailand EV
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden items-center gap-1.5 text-[11px] font-medium text-slate-400 sm:inline-flex">
            <i className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {thinking ? "Checking stations" : "Demo station data"}
          </span>
          <button
            onClick={onClose}
            aria-label="Close assistant"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-2">
        <div className="relative w-full max-w-[340px]">
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={cn(
              "block w-full aspect-[16/10] transition-all duration-700 drop-shadow-[0_0_18px_rgba(16,185,129,0.35)]",
              state === "answer" ? "scale-90 opacity-0" : "scale-100 opacity-100",
              thinking && "drop-shadow-[0_0_28px_rgba(16,185,129,0.55)]",
            )}
          />

          <AnimatePresence>
            {state === "answer" && answer && (
              <motion.div
                key="answer"
                initial={{ opacity: 0, filter: "blur(12px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(12px)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 text-center"
              >
                {answer.pill && (
                  <span className="rounded bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    {answer.pill}
                  </span>
                )}
                <div className="font-display text-2xl font-bold leading-none tracking-tight text-white">
                  {answer.figure}
                </div>
                <p className="max-w-[290px] text-[13px] leading-snug text-slate-300">{answer.text}</p>
                <button
                  onClick={reset}
                  className="mt-1 min-h-[36px] rounded bg-emerald-500 px-4 py-1.5 text-[12px] font-bold text-slate-950 transition-colors hover:bg-emerald-400"
                >
                  Ask another
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="min-h-[1.6em] text-center">
          {state === "idle" && (
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7 }}
              className="font-display text-[15px] font-medium tracking-tight text-white"
            >
              {PHRASES[phraseIndex]}
            </motion.p>
          )}
          {thinking && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
              Looking through your stations
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 px-3 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-1">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
          {CHIPS.map((chip, i) => (
            <button
              key={chip}
              onClick={() => ask(chip)}
              disabled={thinking}
              aria-pressed={picked === i}
              className={cn(
                "shrink-0 whitespace-nowrap rounded border px-3 py-2 text-[12px] font-semibold transition-colors",
                picked === i && state === "answer"
                  ? "border-emerald-400 bg-emerald-400 text-slate-950"
                  : "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-white/5",
                thinking && "opacity-60",
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 py-1.5 pl-3.5 pr-1.5 focus-within:border-emerald-500/60">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.isComposing) {
                e.preventDefault();
                ask(question);
              }
            }}
            maxLength={200}
            placeholder="Ask about stations, prices, routesâ€¦"
            aria-label="Ask the assistant"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={() => ask(question)}
            disabled={thinking || !question.trim()}
            aria-label="Send question"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 transition-opacity disabled:opacity-35"
          >
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" strokeWidth={2.6} />}
          </button>
        </div>
      </div>
    </div>
  );
}
