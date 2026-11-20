import { Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const triggerClass = "h-9 w-auto gap-1.5 rounded-xl border-slate-200 bg-white pl-3 pr-2 text-[12px] font-semibold text-slate-600 shadow-none focus:ring-0 focus:ring-offset-0 focus:border-emerald-400 data-[state=open]:border-emerald-400";

export default function StationFilterBar({
  operators,
  operator,
  onOperator,
  connectors,
  connector,
  onConnector,
  fastOnly,
  onFastOnly,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={operator} onValueChange={onOperator}>
        <SelectTrigger className={triggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {operators.map((o) => (
            <SelectItem key={o} value={o} className="text-[13px]">
              {o === "All" ? "All operators" : o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={connector} onValueChange={onConnector}>
        <SelectTrigger className={triggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {connectors.map((c) => (
            <SelectItem key={c} value={c} className="text-[13px]">
              {c === "All" ? "All connectors" : c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        onClick={() => onFastOnly(!fastOnly)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-[12px] font-semibold border transition-colors active:scale-95",
          fastOnly
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "bg-white border-slate-200 text-slate-600"
        )}
      >
        <Zap className="w-3.5 h-3.5" /> Fast charging
      </button>
    </div>
  );
}