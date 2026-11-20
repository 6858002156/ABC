import { motion } from "framer-motion";
import { X, MapPin, Zap, Plug, Loader2, AlertCircle, Clock } from "lucide-react";
import { networkColor, statusMeta, networkShort } from "@/lib/networks";
import { currentRateType, priceForRate, thb } from "@/lib/charging";
import { cn } from "@/lib/utils";

export default function StationSheet({ station, onClose, onStart, starting, error }) {
  if (!station) return null;

  const meta = statusMeta(station.status);
  const activeRate = currentRateType();
  const canStart = station.status === "Available" && !starting;
  const price = priceForRate(station, activeRate);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 z-[1050] bg-slate-950/75 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="absolute inset-x-0 bottom-0 z-[1100] max-h-[88%] overflow-y-auto rounded-t-3xl border-t border-slate-700 bg-slate-800 pb-5 shadow-2xl"
      >
        <div className="sticky top-0 bg-slate-800 pt-2.5 pb-1 rounded-t-3xl">
          <div className="w-10 h-1 rounded-full bg-slate-600 mx-auto" />
        </div>

        <div className="px-5">
          <div className="flex items-start justify-between gap-3 mt-2">
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold leading-snug text-white font-display">{station.station_name}</h2>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold text-slate-950"
                  style={{ background: networkColor(station.network_brand) }}
                >
                  {networkShort(station.network_brand)}
                </span>
                <span className="text-[11.5px] font-semibold text-slate-300">{station.network_brand}</span>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-slate-700/70 flex items-center justify-center text-slate-300 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-start gap-1.5 mt-3 text-[12px] text-slate-400">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              {station.address}
              <span className="text-slate-500"> · {station.province}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", meta.ring, meta.text)}>
              <span className={cn("w-1.5 h-1.5 rounded-full", meta.dot)} /> {station.status}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/60 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
              <Plug className="w-3 h-3" /> {station.connector_type}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
              <Zap className="w-3 h-3" /> {Math.round(station.max_power_kw || 0)} kW max
            </span>
          </div>

          {/* Thailand TOU pricing */}
          <div className="mt-4 rounded-2xl bg-slate-900 p-3.5 border border-slate-700/70">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <Clock className="w-3.5 h-3.5" /> Time-of-Use rate · Thailand
            </div>
            <div className="mt-2.5 space-y-1.5">
              {[
                { key: "On-Peak", window: "09:00 – 22:00", value: station.on_peak_price_thb },
                { key: "Off-Peak", window: "22:00 – 09:00", value: station.off_peak_price_thb },
              ].map((rate) => {
                const active = activeRate === rate.key;
                return (
                  <div
                    key={rate.key}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 transition-colors",
                      active ? "bg-emerald-500/15 border border-emerald-500/40" : "bg-slate-800/60 border border-transparent",
                    )}
                  >
                    <div>
                      <div className={cn("text-[12.5px] font-bold", active ? "text-emerald-300" : "text-slate-300")}>
                        {rate.key}
                        {active && <span className="ml-1.5 text-[10px] font-bold uppercase text-slate-950 bg-emerald-400 px-1.5 py-0.5 rounded-full">Now</span>}
                      </div>
                      <div className="text-[10.5px] text-slate-500">{rate.window}</div>
                    </div>
                    <div className={cn("text-[14px] font-bold", active ? "text-white" : "text-slate-300")}>
                      ฿{Number(rate.value || 0).toFixed(2)}
                      <span className="text-[10px] font-medium text-slate-500">/kWh</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[12px] text-red-300">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={() => onStart(station)}
            disabled={!canStart}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-[14.5px] font-bold text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-transform disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
          >
            {starting && <Loader2 className="w-4 h-4 animate-spin" />}
            {station.status === "Available" ? (starting ? "Connecting…" : `Start Charging · ${thb(price)}/kWh`) : `Station ${station.status}`}
          </button>
          {station.status === "Available" && (
            <p className="mt-2 text-center text-[10.5px] text-slate-500">Requires a wallet balance of ฿100 or more</p>
          )}
        </div>
      </motion.div>
    </>
  );
}