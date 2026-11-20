import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, X, CalendarCheck, Zap } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { formatTHB } from "@/lib/brands";
import BrandLogo from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  upcoming: "bg-emerald-50 text-emerald-700",
  active: "bg-sky-50 text-sky-700",
  completed: "bg-slate-100 text-slate-500",
  cancelled: "bg-rose-50 text-rose-600",
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    mockApi.entities.Booking.list("-start_time", 50).then(setBookings).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    await mockApi.entities.Booking.update(id, { status: "cancelled" });
    load();
  };

  return (
    <div className="px-5 pt-5 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Bookings</h1>
        <p className="text-[13px] text-slate-400 font-medium">Reserved charger slots</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 mt-4">No bookings yet</h3>
          <p className="text-[13px] text-slate-400 mt-1">Reserve a charger to see it here</p>
          <Link to="/stations" className="inline-block mt-4 bg-emerald-600 text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl">Find a charger</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const dt = new Date(b.start_time);
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start gap-3">
                  <BrandLogo brand={b.brand} size={44} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Link to={`/stations/${b.station_id}`} className="text-[14px] font-semibold text-slate-900 truncate hover:text-emerald-600">{b.station_name}</Link>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0", STATUS_STYLE[b.status])}>{b.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[12px] text-slate-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      {dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{b.duration_minutes} min</span>
                      <span className="inline-flex items-center gap-1"><Zap className="w-3 h-3" />{b.connector_type}</span>
                      <span className="ml-auto text-[14px] font-bold text-slate-900">{formatTHB(b.estimated_cost)}</span>
                    </div>
                  </div>
                </div>
                {b.status === "upcoming" && (
                  <button onClick={() => cancel(b.id)} className="w-full mt-3 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-rose-500 bg-rose-50 hover:bg-rose-100 py-2 rounded-xl transition-colors">
                    <X className="w-3.5 h-3.5" /> Cancel booking
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
