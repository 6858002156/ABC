import { Link } from "react-router-dom";
import { Navigation, Zap } from "lucide-react";
import { brandColor } from "@/lib/brands";
import { openDirections } from "@/lib/directions";
import { cn } from "@/lib/utils";

export default function StationRow({ station, highlighted = false }) {
  const connectors = station.connector_types?.length
    ? station.connector_types
    : station.connector_type
      ? [station.connector_type]
      : [];
  const power = station.max_power_kw ?? station.power_kw;
  const operator = station.operator || station.brand;
  const color = brandColor(station.brand);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border p-3.5 transition-colors",
        highlighted ? "border-emerald-300 shadow-sm" : "border-slate-100"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0"
          style={{ background: color }}
        >
          {(station.brand || "?").slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <Link to={`/stations/${station.id}`} className="block text-[13.5px] font-semibold text-slate-900 truncate hover:text-emerald-700">
            {station.name}
          </Link>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">{operator}</div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {station.address}{station.district && !station.address?.includes(station.district) ? `, ${station.district}` : ""}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {power > 0 && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" /> {power} kW
              </span>
            )}
            {connectors.slice(0, 3).map((c) => (
              <span key={c} className="text-[10.5px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
            {station.num_points > 0 && (
              <span className="text-[10.5px] font-medium text-slate-500">
                {station.num_points} point{station.num_points > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => openDirections(station.lat, station.lng)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-xl text-[12.5px] transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" /> Navigate
        </button>
        <Link
          to={`/stations/${station.id}`}
          className="px-3.5 py-2 rounded-xl border border-slate-200 text-[12.5px] font-semibold text-slate-600 hover:border-slate-300 transition-colors"
        >
          Details
        </Link>
      </div>
    </div>
  );
}