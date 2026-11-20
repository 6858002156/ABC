import { BatteryCharging, Zap } from "lucide-react";
import { formatTHB } from "@/lib/brands";
import { networkColor, networkShort } from "@/lib/networks";
import DirectionsButton from "@/components/DirectionsButton";

export default function TripStopList({ stops }) {
  if (!stops.length) return null;

  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
        <BatteryCharging className="h-4 w-4 text-emerald-500" />
        Charging stops ({stops.length})
      </h3>
      <div className="space-y-2.5">
        {stops.map((stop, i) => (
          <div key={`${stop.station_id}-${i}`} className="rounded-2xl border border-slate-100 bg-white p-3.5">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[9.5px] font-bold text-white"
                style={{ background: networkColor(stop.network) }}
              >
                {networkShort(stop.network)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Stop {i + 1} · km {Math.round(stop.at_km || 0)}
                </div>
                <div className="truncate text-[13px] font-semibold text-slate-900">{stop.station_name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-0.5">
                    <Zap className="h-3 w-3 text-emerald-500" />
                    {stop.power_kw} kW
                  </span>
                  <span className="inline-flex items-center gap-0.5">
                    <BatteryCharging className="h-3 w-3 text-emerald-500" />
                    {stop.kwh} kWh · {stop.charge_minutes} min
                  </span>
                  <span>{stop.connector_type || stop.network}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[13px] font-bold text-slate-900">{formatTHB(stop.cost)}</div>
                <div className="text-[10px] text-slate-400">฿{stop.price_thb}/kWh</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-[11px] text-slate-500">
                Arrive {stop.arrival_pct}% <span className="text-slate-300">→</span> charge to {stop.target_pct}%
              </span>
              <DirectionsButton lat={stop.latitude} lng={stop.longitude} iconOnly />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}