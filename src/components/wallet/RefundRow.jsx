import { RotateCcw, Check, Clock, X } from "lucide-react";
import { formatTHB } from "@/lib/brands";
import { cn } from "@/lib/utils";

const STATUS = {
  pending: { label: "Pending review", cls: "bg-amber-50 text-amber-700", Icon: Clock },
  completed: { label: "Refunded", cls: "bg-emerald-50 text-emerald-700", Icon: Check },
  failed: { label: "Rejected", cls: "bg-rose-50 text-rose-600", Icon: X },
};

export default function RefundRow({ refund }) {
  const s = STATUS[refund.status] || STATUS.pending;

  return (
    <div className="flex items-center gap-3 p-3.5">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", s.cls)}>
        <RotateCcw className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-slate-900 truncate">
          {refund.station_name || "Charging session"}
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          {new Date(refund.created_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          {refund.brand ? ` · ${refund.brand}` : ""}
        </div>
        <span className={cn("inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-0.5 rounded-full mt-1", s.cls)}>
          <s.Icon className="w-3 h-3" /> {s.label}
        </span>
      </div>
      <div className="text-[13px] font-bold text-emerald-600 shrink-0">+{formatTHB(refund.amount)}</div>
    </div>
  );
}