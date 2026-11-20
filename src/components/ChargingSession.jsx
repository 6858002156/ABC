import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, BatteryCharging, Clock, Wallet, Square, Check, TrendingUp } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { useWallet } from "@/hooks/useWallet";
import { formatTHB } from "@/lib/brands";
import BrandLogo from "@/components/BrandLogo";
import { chargingCost, currentRateType, priceForRate } from "@/lib/charging";

// Circular progress ring
function Ring({ pct, size = 220, stroke = 14 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#ringGrad)" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: offset }}
          transition={{ ease: "linear", duration: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={Math.round(pct)}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="font-display text-5xl font-bold text-white leading-none"
        >
          {Math.round(pct)}<span className="text-2xl text-white/60">%</span>
        </motion.span>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-emerald-300/80 uppercase mt-1.5">Charging</span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white/5 backdrop-blur rounded-2xl p-3.5 border border-white/10">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-white/50 uppercase">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={`text-lg font-bold mt-1 ${accent || "text-white"}`}>{value}</div>
    </div>
  );
}

export default function ChargingSession({ station, vehicle, onClose }) {
  const { wallet, refresh: refreshWallet } = useWallet();
  const [phase, setPhase] = useState("ready"); // ready | charging | done
  const [pct, setPct] = useState(18);
  const startPct = useRef(18);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [power, setPower] = useState(station.power_kw);
  const [finishing, setFinishing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [rateType, setRateType] = useState(() => currentRateType());
  const timerRef = useRef(null);
  const startTsRef = useRef(0);

  const batteryKwh = vehicle?.battery_kwh || 60;
  const price = priceForRate(station, rateType);

  // live derived values
  const kwhDelivered = useMemo(() => ((pct - startPct.current) / 100) * batteryKwh, [pct, batteryKwh]);
  const cost = useMemo(() => kwhDelivered * price, [kwhDelivered, price]);
  const kwhTotal = useMemo(() => (pct / 100) * batteryKwh, [pct, batteryKwh]);
  const minsLeft = useMemo(() => {
    if (pct >= 100) return 0;
    // current rate: emulate taper above 80%
    const ratePerSec = pct < 80 ? 0.8 : 0.4; // matches tick below
    return Math.ceil((100 - pct) / ratePerSec / 60);
  }, [pct]);

  useEffect(() => {
    if (phase !== "charging") return;
    startTsRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setPct((prev) => {
        if (prev >= 100) return 100;
        const inc = prev < 80 ? 0.8 : 0.4;
        return Math.min(100, prev + inc);
      });
      setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000));
      // small power fluctuation for realism
      setPower((p) => {
        const base = station.power_kw;
        const f = p >= 80 ? 0.6 : 1; // taper after 80%
        return Math.max(base * 0.5, Math.round((base * f + (Math.random() * 6 - 3)) * 10) / 10);
      });
    }, 500);
    return () => clearInterval(timerRef.current);
  }, [phase, station.power_kw]);

  // auto-complete at 100%
  useEffect(() => {
    if (phase === "charging" && pct >= 100) {
      stopCharging();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  const startCharging = () => {
    const s = Math.floor(Math.random() * 11) + 15; // 15-25%
    setRateType(currentRateType());
    startPct.current = s;
    setPct(s);
    setElapsed(0);
    setPhase("charging");
  };

  const stopCharging = async () => {
    if (finishing || phase === "done") return;
    clearInterval(timerRef.current);
    setFinishing(true);
    const finalPct = pct;
    const kwh = ((finalPct - startPct.current) / 100) * batteryKwh;
    const amount = chargingCost(kwh, station, rateType);
    try {
      // Ensure a wallet exists even if the balance card has not finished loading.
      const updatedWallet = await mockApi.wallet.charge(amount);
      // record transaction
      const tx = await mockApi.entities.Transaction.create({
        type: "charge",
        amount,
        status: "completed",
        station_name: station.name,
        brand: station.brand,
        cost: amount,
        kwh: Math.round(kwh * 10) / 10,
        payment_method: "Volt Jai Wallet",
      });
      setSummary({ kwh: Math.round(kwh * 10) / 10, amount, balance: updatedWallet.balance, tx, finalPct, elapsed });
      setPhase("done");
      refreshWallet();
    } catch (e) {
      console.error("finish charge error", e);
      setSummary({ kwh: Math.round(kwh * 10) / 10, amount, finalPct, elapsed });
      setPhase("done");
    } finally {
      setFinishing(false);
    }
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60), r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 overflow-y-auto">
      {/* glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 20%, #10b981 0, transparent 45%)" }} />

      <div className="relative max-w-md mx-auto px-5 pt-8 pb-10 min-h-full flex flex-col">
        {/* header */}
        <div className="flex items-center gap-3 mb-8">
          <BrandLogo brand={station.brand} size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-emerald-300/80">{station.brand}</div>
            <div className="text-sm font-bold text-white truncate">{station.name}</div>
          </div>
          {phase !== "done" && (
            <button onClick={phase === "ready" ? onClose : stopCharging} disabled={finishing} className="text-[12px] font-semibold text-white/60 hover:text-white">
              {phase === "ready" ? "Cancel" : finishing ? "Stopping…" : "Stop"}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="ready" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-5">
                <Zap className="w-9 h-9 text-emerald-400" fill="currentColor" />
              </div>
              <h2 className="text-xl font-bold text-white font-display">Ready to charge</h2>
              <p className="text-[13px] text-white/60 mt-2 max-w-[260px]">
                Plug in your {station.connector_type} connector, then tap below to begin your session at {station.power_kw}kW.
              </p>
              {vehicle && (
                <div className="mt-4 text-[12px] text-white/50">
                  {vehicle.brand} {vehicle.model} · {batteryKwh}kWh battery
                </div>
              )}
              <button onClick={startCharging} className="mt-7 w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-900 font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all">
                <BatteryCharging className="w-5 h-5" /> Start charging
              </button>
              {wallet && (
                <p className="text-[11px] text-white/40 mt-3">Balance {formatTHB(wallet.balance)} · {formatTHB(price)}/kWh</p>
              )}
            </motion.div>
          )}

          {phase === "charging" && (
            <motion.div key="charging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center">
              <div className="relative my-2">
                <Ring pct={pct} />
                {/* pulsing core */}
                <motion.div
                  className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-emerald-400"
                  style={{ top: "62%", left: "50%", x: "-50%" }}
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 w-full mt-6">
                <Stat icon={Zap} label="Power" value={`${power} kW`} accent="text-emerald-300" />
                <Stat icon={TrendingUp} label="Delivered" value={`${kwhDelivered.toFixed(1)} kWh`} />
                <Stat icon={Wallet} label="Cost" value={formatTHB(cost)} accent="text-emerald-300" />
                <Stat icon={Clock} label="Time left" value={`~${minsLeft}m`} />
              </div>

              <div className="flex items-center justify-between w-full mt-4 text-[12px] text-white/50">
                <span>Battery: {kwhTotal.toFixed(1)} / {batteryKwh} kWh</span>
                <span>Elapsed {fmtTime(elapsed)}</span>
              </div>

              <button
                onClick={stopCharging}
                disabled={finishing}
                className="mt-6 w-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold py-3.5 rounded-2xl text-[14px] flex items-center justify-center gap-2 transition-colors"
              >
                <Square className="w-4 h-4 fill-current" /> Stop charging
              </button>
            </motion.div>
          )}

          {phase === "done" && summary && (
            <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center text-center pt-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/40">
                <Check className="w-8 h-8 text-slate-900" strokeWidth={3} />
              </motion.div>
              <h2 className="text-xl font-bold text-white font-display">Session complete</h2>
              <p className="text-[13px] text-white/60 mt-1">Charged to {Math.round(summary.finalPct)}% in {fmtTime(summary.elapsed)}</p>

              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mt-6 space-y-3 text-left">
                <div className="flex justify-between text-[13px]"><span className="text-white/50">Energy delivered</span><span className="font-bold text-white">{summary.kwh} kWh</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-white/50">Rate</span><span className="font-semibold text-white">{formatTHB(price)}/kWh</span></div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center"><span className="text-[13px] text-white/50">Total paid</span><span className="text-xl font-bold text-emerald-300">{formatTHB(summary.amount)}</span></div>
                <div className="flex justify-between text-[12px] text-white/40"><span>Paid from</span><span>Volt Jai Wallet</span></div>
              </div>

              <button onClick={onClose} className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 rounded-2xl text-[14px] transition-colors">
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
