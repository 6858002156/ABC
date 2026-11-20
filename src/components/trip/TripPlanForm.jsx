import { ArrowDownUp, MapPin, Navigation, Sparkles, BatteryCharging } from "lucide-react";
import LocationSearch from "@/components/LocationSearch";
import { cn } from "@/lib/utils";

const STEP = 5;

export default function TripPlanForm({
  origin,
  destination,
  onOrigin,
  onDestination,
  onSwap,
  vehicles,
  vehicleId,
  onVehicle,
  batteryStart,
  onBatteryStart,
  batteryTarget,
  onBatteryTarget,
  onPlan,
  planning,
}) {
  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const capacity = Number(vehicle?.battery_capacity_kwh) || 60;
  const rangeKm = Math.max(0, Math.round((capacity * Math.max(0, batteryStart - 12)) / 100 / 0.17));
  const ready = Boolean(origin && destination && vehicle) && !planning;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
      <div className="space-y-2">
        <LocationSearch value={origin} onChange={onOrigin} placeholder="From — mall, airport, landmark" icon={MapPin} accent="emerald" />
        <div className="flex justify-center -my-1">
          <button
            onClick={onSwap}
            disabled={!origin && !destination}
            aria-label="Swap start and destination"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-40"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>
        <LocationSearch value={destination} onChange={onDestination} placeholder="To — mall, airport, landmark" icon={Navigation} accent="sky" />
      </div>

      <div>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Your car</div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => onVehicle(v.id)}
              aria-pressed={v.id === vehicleId}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-left transition-colors",
                v.id === vehicleId ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white",
              )}
            >
              <div className="text-[12px] font-bold text-slate-900">
                {v.brand} {v.model}
              </div>
              <div className="text-[10.5px] text-slate-500">
                {v.battery_capacity_kwh} kWh · {v.preferred_connector || "CCS2"}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            Leaving with <span className="text-emerald-600">{batteryStart}%</span>
          </span>
          <input
            type="range"
            min={5}
            max={95}
            step={STEP}
            value={batteryStart}
            onChange={(e) => onBatteryStart(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </label>
        <label className="block">
          <span className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            Charge up to <span className="text-emerald-600">{batteryTarget}%</span>
          </span>
          <input
            type="range"
            min={40}
            max={100}
            step={STEP}
            value={batteryTarget}
            onChange={(e) => onBatteryTarget(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </label>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
        <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" />
        About {rangeKm} km before the first charging stop
      </p>

      <button
        onClick={onPlan}
        disabled={!ready}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-[14px] font-bold text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.99] disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" />
        {planning ? "Planning your trip…" : "Plan with AI"}
      </button>
    </div>
  );
}