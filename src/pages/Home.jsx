import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Route, Wallet as WalletIcon, CalendarCheck, ArrowUpRight, TrendingUp, MapPin, Car, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { useWallet } from "@/hooks/useWallet";
import { formatTHB } from "@/lib/brands";
import BrandLogo from "@/components/BrandLogo";
import NearbyMap from "@/components/NearbyMap";
import HomeChargers from "@/components/home/HomeChargers";

const QUICK = [
  { to: "/stations", label: "Find Charger", icon: Zap, color: "from-emerald-500 to-teal-600" },
  { to: "/plan", label: "Trip Planner", icon: Route, color: "from-sky-500 to-indigo-600" },
  { to: "/wallet", label: "Top Up", icon: WalletIcon, color: "from-amber-500 to-orange-600" },
  { to: "/bookings", label: "My Bookings", icon: CalendarCheck, color: "from-violet-500 to-purple-600" },
];

export default function Home() {
  const { wallet, loading } = useWallet();
  const [txns, setTxns] = useState([]);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    mockApi.entities.Transaction.list("-created_date", 3).then(setTxns).catch(() => {});
    mockApi.entities.Vehicle.filter({ is_active: true }, "-updated_date", 1).then((v) => setVehicle(v[0] || null)).catch(() => {});
  }, []);

  return (
    <div className="px-5 pt-5 space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-slate-400 font-medium">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Let's drive electric 🇹🇭</h1>
        </div>
        <Link
          to="/settings"
          aria-label="Settings"
          className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 active:scale-95 transition-transform shrink-0"
        >
          <SettingsIcon className="w-5 h-5" />
        </Link>
      </div>

      {/* Wallet card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="absolute -left-4 -bottom-6 w-24 h-24 rounded-full bg-teal-400/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-white/60">Volt Jai Balance</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">All brands</span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-3xl font-bold tracking-tight">{loading ? "—" : formatTHB(wallet?.balance || 0)}</span>
            <span className="text-[12px] text-white/50 mb-1.5">THB</span>
          </div>
          <Link to="/wallet" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-full">
            <ArrowUpRight className="w-3.5 h-3.5" /> Top up
          </Link>
        </div>
      </motion.div>

      {/* Active ride */}
      <Link to="/garage" className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">My ride</div>
            {vehicle ? (
              <>
                <div className="text-[14px] font-bold text-slate-900 truncate">{vehicle.brand} {vehicle.model}</div>
                <div className="text-[11px] text-slate-500">{vehicle.battery_kwh} kWh · {vehicle.range_km} km range</div>
              </>
            ) : (
              <div className="text-[13px] font-semibold text-slate-500">Add your EV to personalize</div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
        </div>
      </Link>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {QUICK.map(({ to, label, icon: Icon, color }, i) => (
          <motion.div key={to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Link to={to} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md active:scale-95 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Near you map */}
      <div>
        <h2 className="text-[15px] font-bold text-slate-900 mb-3">Near you</h2>
        <NearbyMap />
      </div>

      {/* Chargers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-slate-900">Chargers</h2>
          <Link to="/stations" className="text-[12px] font-semibold text-emerald-600">Map view</Link>
        </div>
        <HomeChargers />
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-slate-900">Recent activity</h2>
          <Link to="/wallet" className="text-[12px] font-semibold text-emerald-600">History</Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
          {txns.length === 0 && <div className="p-4 text-[13px] text-slate-400 text-center">No transactions yet</div>}
          {txns.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3.5">
              {t.type === "topup" ? (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-emerald-500 shrink-0"><TrendingUp className="w-4 h-4" /></div>
              ) : (
                <BrandLogo brand={t.brand} size={36} className="shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-900 truncate">{t.type === "topup" ? "Top up" : t.station_name || "Charging session"}</div>
                <div className="text-[11px] text-slate-400">{t.brand || "Wallet"} · {t.kwh ? `${t.kwh} kWh` : t.payment_method || ""}</div>
              </div>
              <div className={`text-[13px] font-bold ${t.type === "topup" ? "text-emerald-600" : "text-slate-900"}`}>
                {t.type === "topup" ? "+" : "-"}{formatTHB(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
