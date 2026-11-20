import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X, AlertCircle, Check, Zap, Clock, BatteryCharging, Wallet } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { chargingCost, currentRateType, sessionSnapshot, formatClock, thb } from "@/lib/charging";
import { networkColor, networkShort } from "@/lib/networks";
import { cn } from "@/lib/utils";

function BatteryRing({ pct }) {
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative w-52 h-52">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (pct / 100) * circumference}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[40px] font-bold leading-none text-white font-display">{Math.round(pct)}%</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mt-1">Battery</span>
      </div>
    </div>
  );
}

function Stat({ label, value, unit, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3">
      <div className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </div>
      <div className="mt-1 text-[18px] font-bold text-white leading-none">
        {value} <span className="text-[10.5px] font-medium text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

export default function SessionDashboard({ session, station, capacityKwh, onClose, onStopped }) {
  const [, setTick] = useState(0);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (receipt) return undefined;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [receipt]);

  const snap = sessionSnapshot(session, station, capacityKwh);
  const rateType = session?.rate_type || currentRateType();
  const price = snap.price;

  const stop = async () => {
    setStopping(true);
    setError("");
    try {
      const amount = chargingCost(snap.kwh, station, rateType);
      const updatedWallet = await mockApi.wallet.charge(amount);
      const balance = updatedWallet.balance;
      const completed = await mockApi.entities.ChargingSessions.update(session.id, {
        session_status: "Completed",
        kwh_delivered: Math.round(snap.kwh * 100) / 100,
        cost: amount,
        total_cost_thb: amount,
        rate_type: rateType,
        rate_thb_per_kwh: price,
        end_time: new Date().toISOString(),
      });
      await mockApi.entities.Transaction.create({ type: "charge", amount, cost: amount, status: "completed", station_name: station?.station_name, brand: station?.network_brand, kwh: completed.kwh_delivered, payment_method: "Volt Jai Wallet" });
      setReceipt({ session: completed, cost: amount, balance });
      onStopped?.();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Could not stop the session");
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-950 text-white overflow-y-auto">
      <div className="max-w-md mx-auto px-5 pt-[calc(1rem+env(safe-area-inset-top))] pb-10">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-400">
                {receipt ? "Session complete" : "Charging in progress"}
              </span>
            </div>
            <h1 className="text-[16px] font-bold truncate mt-1 font-display">{station?.station_name}</h1>
          </div>
          <button onClick={onClose} aria-label="Minimise" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-slate-950"
            style={{ background: networkColor(station?.network_brand) }}
          >
            {networkShort(station?.network_brand)}
          </span>
          <span className="text-[11px] text-slate-400">{station?.network_brand} · {station?.connector_type}</span>
        </div>

        <div className="flex justify-center py-6">
          <BatteryRing pct={receipt ? snap.batteryPct : snap.batteryPct} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Stat label="kWh delivered" value={snap.kwh.toFixed(2)} unit="kWh" icon={BatteryCharging} />
          <Stat label="Elapsed" value={formatClock(snap.elapsedMs)} unit="" icon={Clock} />
          <Stat label="Current power" value={Math.round(snap.power)} unit="kW" icon={Zap} />
          <Stat label="Live cost" value={thb(snap.cost)} unit="" icon={Wallet} />
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-2xl bg-slate-800/60 border border-slate-700/60 px-3.5 py-2.5">
          <span className="text-[11px] font-semibold text-slate-400">
            {rateType} rate
          </span>
          <span className="text-[12px] font-bold text-white">{thb(price)}/kWh</span>
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-[12px] text-red-300">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {!receipt ? (
          <button
            onClick={stop}
            disabled={stopping}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 py-3.5 text-[14.5px] font-bold text-white shadow-lg shadow-red-500/20 active:scale-[0.99] transition-transform disabled:opacity-60"
          >
            {stopping && <Loader2 className="w-4 h-4 animate-spin" />} Stop Charging
          </button>
        ) : (
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-2xl bg-emerald-500 py-3.5 text-[14.5px] font-bold text-slate-950"
          >
            Back to map
          </button>
        )}
      </div>

      {receipt && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm rounded-3xl bg-slate-800 border border-slate-700 p-5 text-white">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-center text-[17px] font-bold mt-3 font-display">Digital receipt</h2>
            <p className="text-center text-[11.5px] text-slate-400">{station?.station_name}</p>

            <div className="mt-4 space-y-2 text-[12.5px]">
              <div className="flex justify-between"><span className="text-slate-400">Energy delivered</span><span className="font-semibold">{Number(receipt.session?.kwh_delivered || 0).toFixed(2)} kWh</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Duration</span><span className="font-semibold">{formatClock(snap.elapsedMs)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Rate</span><span className="font-semibold">{rateType} · {thb(price)}/kWh</span></div>
              <div className="flex justify-between border-t border-slate-700 pt-2"><span className="text-slate-400">Total paid</span><span className="font-bold text-emerald-400">{thb(receipt.cost)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Wallet balance</span><span className="font-semibold">{thb(receipt.balance)}</span></div>
            </div>

            <button onClick={onClose} className={cn("mt-5 w-full rounded-2xl bg-emerald-500 py-3 text-[14px] font-bold text-slate-950")}>
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
