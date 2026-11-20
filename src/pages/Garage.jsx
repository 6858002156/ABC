import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Plus, Check, Trash2, Battery, Gauge, X } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EV_BRANDS = ["Tesla", "BYD", "MG", "GWM", "Neta", "Volvo", "Hyundai", "Kia", "BMW", "Mercedes", "Ford", "Toyota", "Honda", "Mitsubishi"];
const empty = { name: "", brand: "Tesla", model: "", battery_kwh: 75, range_km: 400, color: "", plate: "" };

export default function Garage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    mockApi.entities.Vehicle.list("-updated_date", 50).then(setVehicles).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!form.name.trim() || !form.model.trim()) return;
    setSaving(true);
    await mockApi.entities.Vehicle.create({
      ...form,
      name: form.name.trim(),
      model: form.model.trim(),
      battery_kwh: Number(form.battery_kwh),
      range_km: Number(form.range_km),
    });
    setSaving(false); setAdding(false); setForm(empty); load();
  };

  const setActive = async (v) => {
    await mockApi.entities.Vehicle.updateMany({ is_active: true }, { $set: { is_active: false } });
    await mockApi.entities.Vehicle.update(v.id, { is_active: true });
    load();
  };

  const remove = async (v) => {
    await mockApi.entities.Vehicle.delete(v.id);
    load();
  };

  const active = vehicles.find((v) => v.is_active);

  return (
    <div className="px-5 pt-5 pb-4 space-y-5">
      <div>
        <p className="text-[13px] text-slate-400 font-medium">My Garage</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">Your rides</h1>
      </div>

      {active && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-xl">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"><Car className="w-6 h-6 text-emerald-400" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Active ride</div>
              <div className="text-[17px] font-bold truncate">{active.brand} {active.model}</div>
              {active.plate && <div className="text-[11px] text-white/60">{active.plate}</div>}
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1 text-[10px] text-white/60 uppercase font-semibold"><Battery className="w-3 h-3" /> Battery</div>
              <div className="text-[16px] font-bold mt-0.5">{active.battery_kwh} kWh</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-1 text-[10px] text-white/60 uppercase font-semibold"><Gauge className="w-3 h-3" /> Range</div>
              <div className="text-[16px] font-bold mt-0.5">{active.range_km} km</div>
            </div>
          </div>
        </motion.div>
      )}

      {!adding && (
        <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 font-semibold text-[14px] transition-colors">
          <Plus className="w-4 h-4" /> Add a vehicle
        </button>
      )}

      {adding && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">New vehicle</h3>
            <button onClick={() => { setAdding(false); setForm(empty); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nickname (e.g. Daily)" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:border-emerald-400 focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <Select value={form.brand} onValueChange={(v) => setForm({ ...form, brand: v })}>
              <SelectTrigger className="h-[42px] rounded-xl border-slate-200 bg-white px-3 text-[14px] font-normal text-slate-700 shadow-none focus:ring-0 focus:ring-offset-0 focus:border-emerald-400">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {EV_BRANDS.map((b) => (
                  <SelectItem key={b} value={b} className="text-[14px]">{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Model" className="px-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:border-emerald-400 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Battery (kWh)</label>
              <input type="number" value={form.battery_kwh} onChange={(e) => setForm({ ...form, battery_kwh: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:border-emerald-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Range (km)</label>
              <input type="number" value={form.range_km} onChange={(e) => setForm({ ...form, range_km: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:border-emerald-400 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Color" className="px-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:border-emerald-400 focus:outline-none" />
            <input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="Plate" className="px-3 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:border-emerald-400 focus:outline-none" />
          </div>
          <button onClick={save} disabled={saving || !form.name.trim() || !form.model.trim()} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-[14px] transition-colors">
            {saving ? "Saving..." : "Save vehicle"}
          </button>
        </motion.div>
      )}

      <div className="space-y-3">
        {loading && [0, 1].map((i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}
        {!loading && vehicles.map((v) => (
          <div key={v.id} className={cn("bg-white rounded-2xl p-4 border shadow-sm transition-all", v.is_active ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-100")}>
            <div className="flex items-center gap-3">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", v.is_active ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-slate-100")}>
                <Car className={cn("w-5 h-5", v.is_active ? "text-white" : "text-slate-500")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-slate-900 truncate">{v.name}</div>
                <div className="text-[12px] text-slate-500 truncate">{v.brand} {v.model} · {v.battery_kwh}kWh · {v.range_km}km</div>
              </div>
              {!v.is_active && <button onClick={() => setActive(v)} className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full">Set active</button>}
              {v.is_active && <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-0.5"><Check className="w-3 h-3" /> Active</span>}
            </div>
            <div className="flex justify-end mt-2">
              <button onClick={() => remove(v)} className="text-[11px] text-slate-400 hover:text-red-500 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
            </div>
          </div>
        ))}
        {!loading && vehicles.length === 0 && !adding && (
          <div className="text-center py-10 text-slate-400">
            <Car className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-[13px]">No vehicles yet. Add your EV to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
