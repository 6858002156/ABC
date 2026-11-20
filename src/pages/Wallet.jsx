import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Zap, Check, CreditCard, QrCode, Landmark, RotateCcw } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { useWallet } from "@/hooks/useWallet";
import { formatTHB } from "@/lib/brands";
import BrandLogo from "@/components/BrandLogo";
import RefundTracker from "@/components/wallet/RefundTracker";
import { cn } from "@/lib/utils";

const TOPUP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
const METHODS = [
  { id: "promptpay", label: "PromptPay QR", icon: QrCode },
  { id: "card", label: "Credit / Debit", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Landmark },
];

export default function Wallet() {
  const { wallet, loading, updateBalance } = useWallet();
  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("promptpay");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txns, setTxns] = useState([]);

  const loadTxns = () => mockApi.entities.Transaction.list("-created_date", 20).then(setTxns).catch(() => {});
  useEffect(() => { loadTxns(); }, []);

  const finalAmount = custom ? Number(custom) : amount;
  const recentCharges = txns.filter((t) => t.type === "charge" && t.status !== "failed").slice(0, 5);

  const topUp = async () => {
    if (!finalAmount || finalAmount <= 0) return;
    setProcessing(true);
    try {
      await mockApi.entities.Transaction.create({
        type: "topup",
        amount: finalAmount,
        status: "completed",
        payment_method: METHODS.find((m) => m.id === method)?.label,
      });
      await updateBalance((wallet?.balance || 0) + finalAmount);
      setSuccess(true);
      loadTxns();
      setTimeout(() => setSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="px-5 pt-5 space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wallet</h1>
        <p className="text-[13px] text-slate-400 font-medium">One balance for every charger brand</p>
      </div>

      {/* Balance card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-5 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/20 blur-2xl" />
        <div className="relative">
          <div className="text-[12px] font-medium text-white/60">Available balance</div>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-4xl font-bold tracking-tight">{loading ? "—" : formatTHB(wallet?.balance || 0)}</span>
            <span className="text-[12px] text-white/50 mb-1.5">THB</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-white/50">
            <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 text-emerald-300" />Usable on all 8 brands</span>
          </div>
        </div>
      </div>

      {/* Top up */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <h3 className="text-[14px] font-bold text-slate-900">Top up</h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {TOPUP_AMOUNTS.map((a) => (
            <button key={a} onClick={() => { setAmount(a); setCustom(""); }} className={cn("py-3 rounded-xl text-[14px] font-bold border transition-all", (!custom && amount === a) ? "bg-emerald-600 text-white border-transparent shadow-sm" : "bg-slate-50 text-slate-700 border-slate-200")}>
              ฿{a.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[14px]">฿</span>
          <input type="number" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Custom amount" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-3 text-[14px] focus:outline-none focus:border-emerald-400" />
        </div>

        {/* Payment methods */}
        <div>
          <div className="text-[11px] text-slate-400 font-medium mb-1.5">Payment method</div>
          <div className="space-y-2">
            {METHODS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setMethod(id)} className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all", method === id ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white")}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", method === id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500")}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="text-[13px] font-semibold text-slate-700 flex-1 text-left">{label}</span>
                <div className={cn("w-4 h-4 rounded-full border-2", method === id ? "border-emerald-600 bg-emerald-600" : "border-slate-300")}>
                  {method === id && <Check className="w-3 h-3 text-white m-auto mt-px" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={topUp} disabled={processing || !finalAmount} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-[14px] transition-colors flex items-center justify-center gap-2">
          {processing ? "Processing…" : success ? <><Check className="w-4 h-4" /> Topped up!</> : `Top up ${formatTHB(finalAmount || 0)}`}
        </button>
      </div>

      <RefundTracker charges={recentCharges} onCreated={loadTxns} />

      {/* History */}
      <div>
        <h3 className="text-[13px] font-bold text-slate-900 mb-2">Transaction history</h3>
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
          {txns.length === 0 && <div className="p-6 text-[13px] text-slate-400 text-center">No transactions yet</div>}
          {txns.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3.5">
              {t.type === "topup" ? (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-emerald-500 shrink-0"><TrendingUp className="w-4 h-4" /></div>
              ) : t.type === "refund" ? (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-700 bg-emerald-50 shrink-0"><RotateCcw className="w-4 h-4" /></div>
              ) : (
                <BrandLogo brand={t.brand} size={36} className="shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-900 truncate">{t.type === "topup" ? "Top up" : t.type === "refund" ? `Refund · ${t.station_name || "charging"}` : t.station_name || "Charging session"}</div>
                <div className="text-[11px] text-slate-400">{new Date(t.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {t.payment_method || t.brand}</div>
              </div>
              <div className={cn("text-[13px] font-bold", t.type === "charge" ? "text-slate-900" : "text-emerald-600")}>
                {t.type === "charge" ? "-" : "+"}{formatTHB(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {success && (
        <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-lg z-50">
          {formatTHB(finalAmount)} added to your balance
        </motion.div>
      )}
    </div>
  );
}
