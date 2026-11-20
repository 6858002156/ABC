import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, Plus, Wallet as WalletIcon, BatteryCharging, Plug, Zap, Check, Loader2, Clock } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { useWallet } from "@/hooks/useWallet";
import AddVehicleModal from "@/components/myev/AddVehicleModal";
import TopUpModal from "@/components/myev/TopUpModal";
import { thb } from "@/lib/charging";
import { networkColor, networkShort } from "@/lib/networks";
import { cn } from "@/lib/utils";

export default function MyEV() {
  const { wallet, loading: walletLoading, updateBalance } = useWallet();
  const [me, setMe] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stationsById, setStationsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [switching, setSwitching] = useState("");

  const loadVehicles = useCallback(async () => {
    const page = await mockApi.entities.UserVehicles.list({ sort: "-created_date", limit: 20 });
    setVehicles(page.items || []);
  }, []);

  useEffect(() => {
    Promise.all([
      mockApi.auth.me().catch(() => null),
      mockApi.entities.UserVehicles.list({ sort: "-created_date", limit: 20 }),
      mockApi.entities.ChargingSessions.filter({ session_status: "Completed" }, { sort: "-start_time", limit: 20 }),
      mockApi.entities.ChargingStations.list({ limit: 500 }),
    ])
      .then(([user, vehiclePage, sessionPage, stationPage]) => {
        setMe(user);
        setVehicles(vehiclePage.items || []);
        setSessions(sessionPage.items || []);
        setStationsById(Object.fromEntries((stationPage.items || []).map((s) => [s.id, s])));
      })
      .finally(() => setLoading(false));
  }, []);

  const activeVehicle = vehicles.find((v) => v.is_active);

  const setActive = async (vehicle) => {
    setSwitching(vehicle.id);
    try {
      await mockApi.entities.UserVehicles.updateMany({ is_active: true }, { $set: { is_active: false } });
      await mockApi.entities.UserVehicles.update(vehicle.id, { is_active: true });
      await loadVehicles();
    } finally {
      setSwitching("");
    }
  };

  const addVehicle = async (preset) => {
    await mockApi.entities.UserVehicles.updateMany({ is_active: true }, { $set: { is_active: false } });
    await mockApi.entities.UserVehicles.create({ ...preset, user_id: me?.id, is_active: true });
    await loadVehicles();
    setAddOpen(false);
  };

  const topUp = async (amount, method) => {
    await updateBalance(Number(wallet?.balance ?? 0) + amount);
    await mockApi.entities.WalletTransactions.create({
      user_id: me?.id,
      type: "Top-Up",
      amount_thb: amount,
      payment_method: method,
      status: "Completed",
      reference_id: `TOPUP-${Date.now()}`,
      created_at: new Date().toISOString(),
    });
  };

  const balance = Number(wallet?.balance ?? 0);

  return (
    <div className="px-5 pt-5 pb-6 space-y-5 text-white">
      <div>
        <p className="text-[12.5px] text-slate-400 font-medium">My EV</p>
        <h1 className="text-[22px] font-bold tracking-tight font-display">Garage, wallet & history</h1>
      </div>

      {/* Wallet */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-5 shadow-xl"
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80">
            <WalletIcon className="w-3.5 h-3.5" /> Wallet balance
          </div>
          <div className="text-[34px] font-bold leading-none mt-2 font-display">{loading ? "—" : thb(balance)}</div>
          <button
            onClick={() => setTopUpOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-[12px] font-bold text-white backdrop-blur active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" /> Top up wallet
          </button>
        </div>
      </motion.div>

      {/* Vehicles */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold font-display">My vehicles</h2>
          <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-400">
            <Plus className="w-3.5 h-3.5" /> Add EV
          </button>
        </div>

        {loading && <div className="h-20 rounded-2xl bg-slate-800 animate-pulse" />}

        {!loading && vehicles.length === 0 && (
          <button
            onClick={() => setAddOpen(true)}
            className="w-full rounded-2xl border border-dashed border-slate-700 p-6 text-center text-slate-400"
          >
            <Car className="w-7 h-7 mx-auto mb-2 text-slate-600" />
            <p className="text-[12.5px]">Add your EV to size charging sessions</p>
          </button>
        )}

        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={cn(
              "rounded-2xl border p-3.5 transition-colors",
              vehicle.is_active ? "border-emerald-500/60 bg-emerald-500/10" : "border-slate-700/70 bg-slate-800/80",
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", vehicle.is_active ? "bg-emerald-500" : "bg-slate-700")}>
                <Car className={cn("w-5 h-5", vehicle.is_active ? "text-slate-950" : "text-slate-300")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold truncate">{vehicle.brand} {vehicle.model}</div>
                <div className="text-[11px] text-slate-400 inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-0.5"><BatteryCharging className="w-3 h-3" /> {vehicle.battery_capacity_kwh} kWh</span>
                  <span className="inline-flex items-center gap-0.5"><Plug className="w-3 h-3" /> {vehicle.preferred_connector}</span>
                </div>
              </div>
              {vehicle.is_active ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10.5px] font-bold text-emerald-300 shrink-0">
                  <Check className="w-3 h-3" /> Active
                </span>
              ) : (
                <button
                  onClick={() => setActive(vehicle)}
                  disabled={Boolean(switching)}
                  className="rounded-full bg-slate-700 px-3 py-1.5 text-[10.5px] font-bold text-slate-200 shrink-0 disabled:opacity-60"
                >
                  {switching === vehicle.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Use"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charging history */}
      <div className="space-y-2.5">
        <h2 className="text-[15px] font-bold font-display">Charging history</h2>

        {!loading && sessions.length === 0 && (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-800/60 p-6 text-center text-slate-400">
            <Zap className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <p className="text-[12.5px]">No completed sessions yet.</p>
          </div>
        )}

        {sessions.map((session) => {
          const station = stationsById[session.station_id];
          return (
            <div key={session.id} className="rounded-2xl border border-slate-700/70 bg-slate-800/80 p-3.5">
              <div className="flex items-start gap-2.5">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold text-slate-950 shrink-0"
                  style={{ background: networkColor(station?.network_brand) }}
                >
                  {networkShort(station?.network_brand)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">{station?.station_name || "Charging session"}</div>
                  <div className="text-[10.5px] text-slate-400 truncate">
                    {station?.network_brand || "Network"} ·{" "}
                    {new Date(session.start_time).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-bold text-white">{thb(session.total_cost_thb)}</div>
                  <div className="text-[10px] text-slate-400">{Number(session.kwh_delivered || 0).toFixed(1)} kWh</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", session.rate_type === "On-Peak" ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300")}>
                  {session.rate_type}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500">
                  <Clock className="w-2.5 h-2.5" /> {station?.connector_type || "CCS2"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {addOpen && <AddVehicleModal onClose={() => setAddOpen(false)} onAdd={addVehicle} />}
      {topUpOpen && <TopUpModal onClose={() => setTopUpOpen(false)} onTopUp={topUp} />}
    </div>
  );
}
