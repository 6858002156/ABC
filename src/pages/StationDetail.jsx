import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Zap, Star, Clock, ArrowLeft, Check, Wifi, Coffee, Store, ShieldCheck, CalendarPlus, ExternalLink } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { useWallet } from "@/hooks/useWallet";
import { formatTHB } from "@/lib/brands";
import BrandLogo from "@/components/BrandLogo";
import DirectionsButton from "@/components/DirectionsButton";
import ChargingSession from "@/components/ChargingSession";
import { cn } from "@/lib/utils";

const AMENITY_ICON = { WiFi: Wifi, Cafe: Coffee, Mall: Store, "24/7 Security": ShieldCheck };

export default function StationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wallet, refresh: refreshWallet } = useWallet();
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [charging, setCharging] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [form, setForm] = useState({ date: "", time: "10:00", duration: 30, connector: "" });

  useEffect(() => {
    mockApi.entities.ChargingStation.get(id).then((s) => {
      setStation(s);
      setForm((f) => ({ ...f, connector: s?.connector_type || "" }));
    }).finally(() => setLoading(false));
  }, [id]);

  // load the user's active vehicle for the charging session
  useEffect(() => {
    mockApi.entities.Vehicle.filter({ is_active: true }, "-updated_date", 1)
      .then((vs) => setActiveVehicle(vs?.[0] || null))
      .catch(() => setActiveVehicle(null));
  }, []);

  const estimatedCost = station ? (station.power_kw * form.duration / 60 * station.price_per_kwh) : 0;

  const submitBooking = async () => {
    if (!form.date || !form.time) return;
    setBooking(true);
    try {
      const startISO = new Date(`${form.date}T${form.time}:00`).toISOString();
      const rec = await mockApi.entities.Booking.create({
        station_id: station.id,
        station_name: station.name,
        brand: station.brand,
        start_time: startISO,
        duration_minutes: Number(form.duration),
        connector_type: form.connector,
        estimated_cost: Math.round(estimatedCost),
        status: "upcoming",
      });
      setConfirmed(rec);
    } catch (e) {
      console.error(e);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="px-5 pt-5"><div className="h-64 bg-white rounded-2xl animate-pulse" /></div>;
  if (!station) return <div className="px-5 pt-10 text-center text-slate-400">Charger not found</div>;

  const avail = station.available_connectors;

  return (
    <div className="pb-10">
      {/* Hero */}
      <div className="relative h-44 bg-gradient-to-br from-slate-800 to-emerald-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #10b981 0, transparent 40%), radial-gradient(circle at 80% 70%, #14b8a6 0, transparent 40%)" }} />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
          <ArrowLeft className="w-[18px] h-[18px] text-white" />
        </button>
        <div className="absolute bottom-4 left-5 right-5 flex items-end gap-3">
          <BrandLogo brand={station.brand} size={56} className="shadow-lg" />
          <div className="text-white">
            <div className="text-[11px] font-medium text-white/70">{station.brand}</div>
            <h1 className="text-lg font-bold leading-tight">{station.name}</h1>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-5">
        {/* Info row */}
        <div className="flex items-center gap-4 text-[12px]">
          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{station.rating?.toFixed(1)}</span>
          <span className="inline-flex items-center gap-1 text-slate-600 font-medium"><Zap className="w-3.5 h-3.5 text-emerald-500" />{station.power_kw}kW</span>
          <span className="text-slate-600 font-medium">{station.connector_type}</span>
          <span className={cn("ml-auto inline-flex items-center gap-1 font-semibold", avail > 0 ? "text-emerald-600" : "text-slate-400")}>
            <span className={cn("w-1.5 h-1.5 rounded-full", avail > 0 ? "bg-emerald-500" : "bg-slate-300")} />{avail > 0 ? "Available" : "Busy"}
          </span>
        </div>

        <div className="flex items-start gap-2 text-[13px] text-slate-500">
          <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
          <span>{station.address}, {station.province}</span>
        </div>

        <a href={station.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station.name}, ${station.address}, ${station.province}, Thailand`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 hover:text-emerald-800">
          <ExternalLink className="w-3.5 h-3.5" /> View location on Google Maps
        </a>

        <DirectionsButton lat={station.lat} lng={station.lng} label="Get directions" className="w-full" />

        {/* Price card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Price per kWh</div>
            <div className="text-xl font-bold text-slate-900">{formatTHB(station.price_per_kwh)}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium">Connectors</div>
            <div className="text-xl font-bold text-slate-900">{station.available_connectors}/{station.total_connectors}</div>
          </div>
        </div>

        {/* Start charging — live session */}
        <button
          onClick={() => setCharging(true)}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <Zap className="w-5 h-5" fill="currentColor" /> Start charging
        </button>
        {activeVehicle && (
          <p className="text-[11px] text-slate-400 text-center -mt-1">
            Charging {activeVehicle.brand} {activeVehicle.model} · {activeVehicle.battery_kwh}kWh
          </p>
        )}

        {/* Amenities */}
        {station.amenities?.length > 0 && (
          <div>
            <h3 className="text-[13px] font-bold text-slate-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {station.amenities.map((a) => {
                const Icon = AMENITY_ICON[a] || Check;
                return <span key={a} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 bg-white border border-slate-100 px-3 py-1.5 rounded-full"><Icon className="w-3.5 h-3.5 text-emerald-500" />{a}</span>;
              })}
            </div>
          </div>
        )}

        {/* Booking */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-emerald-600" />
            <h3 className="text-[14px] font-bold text-slate-900">Book a charger slot</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-emerald-400" />
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] focus:outline-none focus:border-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium mb-1.5">Duration</div>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((d) => (
                <button key={d} onClick={() => setForm({ ...form, duration: d })} className={cn("flex-1 py-2 rounded-xl text-[12px] font-semibold border transition-all", form.duration === d ? "bg-emerald-600 text-white border-transparent" : "bg-slate-50 text-slate-500 border-slate-200")}>
                  {d}m
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[12px] text-slate-400">Est. cost ({(station.power_kw * form.duration / 60).toFixed(1)} kWh)</span>
            <span className="text-lg font-bold text-slate-900">{formatTHB(estimatedCost)}</span>
          </div>
          <button
            onClick={submitBooking}
            disabled={booking || !form.date}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-[14px] transition-colors flex items-center justify-center gap-2"
          >
            {booking ? "Booking…" : "Confirm booking"}
          </button>
          {wallet && (
            <p className="text-[11px] text-slate-400 text-center">Pays from Volt Jai balance · {formatTHB(wallet.balance)} available</p>
          )}
        </div>
      </div>

      {/* Live charging session overlay */}
      {charging && (
        <ChargingSession
          station={station}
          vehicle={activeVehicle}
          onClose={() => { setCharging(false); refreshWallet(); }}
        />
      )}

      {/* Confirmation modal */}      {confirmed && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setConfirmed(null)}>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold mt-3 text-slate-900">Booking confirmed!</h3>
            <p className="text-[13px] text-slate-500 mt-1">{confirmed.station_name} · {confirmed.duration_minutes} min</p>
            <div className="mt-4 bg-slate-50 rounded-2xl p-3 text-left text-[12px] text-slate-600 space-y-1">
              <div className="flex justify-between"><span>Start</span><span className="font-semibold">{new Date(confirmed.start_time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span></div>
              <div className="flex justify-between"><span>Connector</span><span className="font-semibold">{confirmed.connector_type}</span></div>
              <div className="flex justify-between"><span>Est. cost</span><span className="font-semibold">{formatTHB(confirmed.estimated_cost)}</span></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link to="/bookings" className="flex-1 bg-emerald-600 text-white font-semibold py-3 rounded-xl text-[14px]">View bookings</Link>
              <button onClick={() => setConfirmed(null)} className="flex-1 bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl text-[14px]">Done</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
