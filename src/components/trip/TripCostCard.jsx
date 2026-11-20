import { Receipt } from "lucide-react";
import { formatTHB } from "@/lib/brands";

export default function TripCostCard({ plan }) {
  const stops = plan.charging_stops || [];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
        <Receipt className="h-4 w-4 text-emerald-500" />
        Cost estimate
      </h3>

      {stops.length === 0 ? (
        <p className="text-[12px] leading-relaxed text-slate-500">
          No charging needed on this trip. You arrive with {plan.arrival_pct}% battery.
        </p>
      ) : (
        <div className="space-y-1.5">
          {stops.map((s, i) => (
            <div key={`${s.station_id}-${i}`} className="flex items-center justify-between gap-3 text-[12px]">
              <span className="truncate text-slate-500">
                Stop {i + 1} · {s.station_name}
              </span>
              <span className="shrink-0 font-semibold text-slate-700">{formatTHB(s.cost)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-[12px] font-semibold text-slate-900">Total charging</span>
        <span className="text-[15px] font-bold text-emerald-600">{formatTHB(plan.estimated_cost)}</span>
      </div>
      <p className="mt-1 text-[10.5px] leading-snug text-slate-400">
        {plan.energy_kwh} kWh used on the road, priced at the network's current on-peak / off-peak rate.
      </p>
    </div>
  );
}