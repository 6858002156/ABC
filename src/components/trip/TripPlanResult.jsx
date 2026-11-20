import { motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import TripSummaryCard from "@/components/trip/TripSummaryCard";
import TripCostCard from "@/components/trip/TripCostCard";
import TripStopList from "@/components/trip/TripStopList";

export default function TripPlanResult({ plan, saved, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5">
      <TripSummaryCard plan={plan} />

      {plan.warning && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px] leading-relaxed text-amber-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {plan.warning}
        </div>
      )}

      <TripCostCard plan={plan} />
      <TripStopList stops={plan.charging_stops || []} />

      <div className="flex items-center justify-between pt-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" /> Saved to your trips
            </>
          ) : (
            "Plan for this car and charge level"
          )}
        </span>
        <button onClick={onReset} className="text-[12px] font-semibold text-emerald-600">
          Plan another trip
        </button>
      </div>
    </motion.div>
  );
}