import { useState } from "react";
import { motion } from "framer-motion";
import { X, QrCode, CreditCard, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { thb } from "@/lib/charging";

const AMOUNTS = [100, 300, 500, 1000];

function QrPattern({ seed }) {
  const cells = Array.from({ length: 169 }, (_, i) => (((seed * (i + 7) * 31) % 13) % 2 === 0));
  return (
    <div
      className="grid gap-[2px] p-2 bg-white rounded-xl w-40 h-40"
      style={{ gridTemplateColumns: "repeat(13, 1fr)" }}
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-slate-900" : "bg-white"} />
      ))}
    </div>
  );
}

export default function TopUpModal({ onClose, onTopUp }) {
  const [amount, setAmount] = useState(300);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("PromptPay QR");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const value = custom ? Number(custom) : amount;

  const pay = async () => {
    if (!value || value <= 0) return;
    setState("paying");
    setError("");
    try {
      await onTopUp(value, method);
      setState("done");
    } catch (e) {
      setError(e?.message || "Top-up failed");
      setState("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-[2100] flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl bg-slate-800 border border-slate-700 p-5 text-white"
      >
        {state === "done" ? (
          <div className="text-center py-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-[16px] font-bold mt-3 font-display">Top-up successful</h2>
            <p className="text-[12px] text-slate-400 mt-1">{thb(value)} added with {method}</p>
            <button onClick={onClose} className="mt-5 w-full rounded-2xl bg-emerald-500 py-3 text-[14px] font-bold text-slate-950">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold font-display">Top up wallet</h2>
              <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3">
              {AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setAmount(amt); setCustom(""); }}
                  className={cn(
                    "rounded-xl py-2.5 text-[13px] font-bold border transition-colors",
                    !custom && amount === amt ? "bg-emerald-500 border-emerald-400 text-slate-950" : "bg-slate-900 border-slate-700 text-slate-200",
                  )}
                >
                  ฿{amt}
                </button>
              ))}
            </div>

            <input
              type="number"
              inputMode="numeric"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Other amount (THB)"
              className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-[13px] text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
            />

            <div className="grid grid-cols-2 gap-2 mt-3">
              {[{ key: "PromptPay QR", icon: QrCode }, { key: "Credit Card", icon: CreditCard }].map(({ key, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMethod(key)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold border transition-colors",
                    method === key ? "bg-slate-900 border-emerald-400 text-emerald-300" : "bg-slate-900 border-slate-700 text-slate-300",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" /> {key}
                </button>
              ))}
            </div>

            {method === "PromptPay QR" && (
              <div className="mt-3 flex flex-col items-center rounded-2xl bg-slate-900 border border-slate-700 p-3">
                <QrPattern seed={value || 1} />
                <p className="text-[10.5px] text-slate-400 mt-2">Scan with your banking app to pay {thb(value)}</p>
              </div>
            )}
            {method === "Credit Card" && (
              <div className="mt-3 space-y-2 rounded-2xl bg-slate-900 border border-slate-700 p-3">
                <input placeholder="Card number" className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="MM / YY" className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none" />
                  <input placeholder="CVV" className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-[12.5px] text-white placeholder:text-slate-500 focus:outline-none" />
                </div>
              </div>
            )}

            {error && <p className="mt-2 text-[11.5px] text-red-400">{error}</p>}

            <button
              onClick={pay}
              disabled={state === "paying" || !value}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-[14px] font-bold text-slate-950 disabled:opacity-60"
            >
              {state === "paying" && <Loader2 className="w-4 h-4 animate-spin" />}
              Pay {thb(value)}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}