import { ChevronRight, Sparkles } from "lucide-react";
import { formatTHB } from "@/lib/brands";

const clock = (minutes) => {
  const total = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const Metric = ({ label, value, accent }) => (
  <div>
    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">{label}</div>
    <div className={`text-[15px] font-bold ${accent ? "text-emerald-300" : "text-white"}`}>{value}</div>
  </div>
);

export default function TripSummaryCard({ plan }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900 p-5 text-white shadow-xl">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
        <span className="truncate">{plan.origin}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{plan.destination}</span>
      </div>

      {plan.headline && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold text-emerald-200">
          <Sparkles className="h-3 w-3" />
          {plan.headline}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
        <Metric label="Distance" value={`${plan.distance_km} km`} />
        <Metric label="Total time" value={clock(plan.total_duration_minutes)} />
        <Metric label="Energy used" value={`${plan.energy_kwh} kWh`} />
        <Metric label="Charging cost" value={formatTHB(plan.estimated_cost)} accent />
      </div>

      {plan.summary && <p className="mt-4 text-[12.5px] leading-relaxed text-white/75">{plan.summary}</p>}

      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-white/50">Arrive with</span>
        <span className="text-[12px] font-bold">{plan.arrival_pct}% · {plan.vehicle_model}</span>
      </div>
    </div>
  );
}