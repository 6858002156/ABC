import { Link } from "react-router-dom";
import { MapPin, Zap, Star, Clock } from "lucide-react";
import { formatTHB } from "@/lib/brands";
import BrandLogo from "@/components/BrandLogo";
import DirectionsButton from "@/components/DirectionsButton";
import { cn } from "@/lib/utils";

export default function StationCard({ station }) {
  const avail = station.available_connectors;
  const total = station.total_connectors;
  const status = avail > 0 ? "available" : "busy";
  return (
    <Link to={`/stations/${station.id}`} className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all active:scale-[0.98]">
      <div className="flex items-start gap-3">
        <BrandLogo brand={station.brand} size={44} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-[14px] text-slate-900 truncate">{station.name}</h3>
            <div className="flex items-center gap-0.5 text-[11px] text-amber-500 font-medium shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {station.rating?.toFixed(1) || "4.5"}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{station.address}, {station.province}</span>
          </div>
          <div className="flex items-center gap-3 mt-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3 text-emerald-500" /> {station.power_kw}kW
            </span>
            <span className="text-[11px] font-medium text-slate-600">{station.connector_type}</span>
            <span className="text-[11px] font-semibold text-slate-900 ml-auto">{formatTHB(station.price_per_kwh)}/kWh</span>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", status === "available" ? "bg-emerald-500" : "bg-slate-300")} />
              <span className={cn("text-[11px] font-medium", status === "available" ? "text-emerald-600" : "text-slate-400")}>
                {avail > 0 ? `${avail} of ${total} available` : "All busy"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DirectionsButton lat={station.lat} lng={station.lng} iconOnly />
              <span className="text-[11px] text-slate-400 inline-flex items-center gap-0.5"><Clock className="w-3 h-3" /> Book</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}