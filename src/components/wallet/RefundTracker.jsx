import { useEffect, useState } from "react";
import { RotateCcw, ShieldCheck, ChevronRight, X } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { formatTHB } from "@/lib/brands";
import RefundRow from "@/components/wallet/RefundRow";

export default function RefundTracker({ charges = [], onCreated }) {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { items } = await mockApi.entities.Transaction.filter(
        { type: "refund" },
        { sort: "-created_date", limit: 20 },
      );
      setRefunds(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const request = async (charge) => {
    setSaving(true);
    try {
      await mockApi.entities.Transaction.create({
        type: "refund",
        amount: charge.amount,
        status: "pending",
        station_name: charge.station_name,
        brand: charge.brand,
        payment_method: "Refund request",
      });
      setPicking(false);
      await load();
      onCreated?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="flex items-center justify-between gap-2 p-4 pb-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-emerald-600" />
          <h3 className="text-[14px] font-bold text-slate-900">Track refund</h3>
        </div>
        {!picking ? (
          <button
            onClick={() => setPicking(true)}
            disabled={charges.length === 0}
            className="text-[12px] font-semibold text-emerald-600 disabled:text-slate-300"
          >
            Request refund
          </button>
        ) : (
          <button onClick={() => setPicking(false)} className="text-[12px] font-semibold text-slate-400 inline-flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      {picking && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-[11.5px] text-slate-400">Pick a charging session to refund</p>
          {charges.map((c) => (
            <button
              key={c.id}
              onClick={() => request(c)}
              disabled={saving}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 disabled:opacity-50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold text-slate-800 truncate">{c.station_name || "Charging session"}</div>
                <div className="text-[11px] text-slate-400">
                  {new Date(c.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {formatTHB(c.amount)}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          ))}
        </div>
      )}

      <div className="divide-y divide-slate-50 border-t border-slate-50">
        {loading ? (
          <div className="p-4 space-y-2">
            <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
          </div>
        ) : refunds.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <ShieldCheck className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
            <p className="text-[12.5px] text-slate-400">
              {charges.length === 0 ? "Refunds appear here once you have a charging session." : "No refund requests yet."}
            </p>
          </div>
        ) : (
          refunds.map((r) => <RefundRow key={r.id} refund={r} />)
        )}
      </div>
    </div>
  );
}
