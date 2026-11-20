import { ChevronDown, Zap, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { stations as mockStations } from "@/lib/mockApi";
import { networkColor } from "@/lib/networks";
import { cn } from "@/lib/utils";

const chipBase =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap border transition-colors";
const chipIdle = "bg-slate-900/90 border-slate-700 text-slate-200";
const chipActive = "bg-emerald-500 border-emerald-400 text-slate-950";
const NETWORK_LIST = [...new Set(mockStations.map((station) => station.network_brand).filter(Boolean))].sort();

export default function FilterChips({
  network,
  onNetwork,
  networks = NETWORK_LIST,
  connector,
  onConnector,
  availableOnly,
  onAvailableOnly,
  fastOnly,
  onFastOnly,
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chipBase, network === "All" ? chipIdle : chipActive)}>
            {network === "All" ? "Network" : network}
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="z-[2000] w-64 p-1.5 rounded-2xl border-slate-700 bg-slate-800 text-slate-100">
          <div className="max-h-72 overflow-y-auto">
            {["All", ...(networks.length ? networks : NETWORK_LIST)].map((brand) => (
              <button
                key={brand}
                onClick={() => onNetwork(brand)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12.5px] font-medium hover:bg-slate-700/70 text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: brand === "All" ? "#94a3b8" : networkColor(brand) }}
                />
                <span className="flex-1">{brand === "All" ? "All Networks" : brand}</span>
                {network === brand && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(chipBase, chipActive)}>
            {connector}
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48 p-1.5 rounded-2xl border-slate-700 bg-slate-800 text-slate-100">
          {["All", "CCS2", "Type 2", "CHAdeMO"].map((type) => (
            <button
              key={type}
              onClick={() => onConnector(type)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12.5px] font-medium hover:bg-slate-700/70"
            >
              {type === "All" ? "All connectors" : type}
              {connector === type && <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <button
        onClick={() => onAvailableOnly(!availableOnly)}
        className={cn(chipBase, availableOnly ? chipActive : chipIdle)}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available only
      </button>

      <button
        onClick={() => onFastOnly(!fastOnly)}
        className={cn(chipBase, fastOnly ? chipActive : chipIdle)}
      >
        <Zap className="w-3 h-3" /> DC Fast &gt;50kW
      </button>
    </div>
  );
}
