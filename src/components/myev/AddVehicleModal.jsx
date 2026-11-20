import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";

const PRESETS = [
  { brand: "BYD", model: "Atto 3", battery_capacity_kwh: 60.5, preferred_connector: "CCS2" },
  { brand: "BYD", model: "Seal AWD", battery_capacity_kwh: 82.5, preferred_connector: "CCS2" },
  { brand: "MG", model: "MG4 Electric", battery_capacity_kwh: 64, preferred_connector: "CCS2" },
  { brand: "Tesla", model: "Model Y Long Range", battery_capacity_kwh: 75, preferred_connector: "CCS2" },
  { brand: "Neta", model: "Neta V", battery_capacity_kwh: 38.5, preferred_connector: "CCS2" },
  { brand: "Ora", model: "Good Cat", battery_capacity_kwh: 47.8, preferred_connector: "CCS2" },
  { brand: "Aion", model: "Aion Y Plus", battery_capacity_kwh: 63.2, preferred_connector: "CCS2" },
  { brand: "Volvo", model: "EX30", battery_capacity_kwh: 69, preferred_connector: "CCS2" },
];

export default function AddVehicleModal({ onClose, onAdd }) {
  const [saving, setSaving] = useState("");

  const pick = async (preset) => {
    setSaving(`${preset.brand}-${preset.model}`);
    await onAdd(preset);
    setSaving("");
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl bg-slate-800 border border-slate-700 p-5 text-white max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold font-display">Add your EV</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11.5px] text-slate-400 mt-1">Popular EVs in Thailand — battery size and connector fill in automatically.</p>

        <div className="mt-3 space-y-2">
          {PRESETS.map((preset) => {
            const key = `${preset.brand}-${preset.model}`;
            return (
              <button
                key={key}
                onClick={() => pick(preset)}
                disabled={Boolean(saving)}
                className="w-full flex items-center gap-3 rounded-2xl bg-slate-900/70 border border-slate-700 px-3 py-2.5 text-left active:scale-[0.99] transition-transform disabled:opacity-60"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{preset.brand} {preset.model}</div>
                  <div className="text-[11px] text-slate-400">{preset.battery_capacity_kwh} kWh · {preset.preferred_connector}</div>
                </div>
                {saving === key ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Check className="w-4 h-4 text-slate-600" />}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}