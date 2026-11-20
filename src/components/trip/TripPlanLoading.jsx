import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

const STEPS = ["Routing your drive", "Matching chargers along the way", "Estimating charging time and cost"];

export default function TripPlanLoading({ origin, destination }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-5 text-white shadow-xl">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
        <span className="truncate">{origin}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{destination}</span>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
        <span className="text-[13px] font-semibold">Planning with AI…</span>
      </div>

      <div className="mt-3 space-y-1.5">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex items-center gap-2 text-[11px] ${i <= step ? "text-white/85" : "text-white/35"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${i <= step ? "bg-emerald-400" : "bg-white/25"}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}