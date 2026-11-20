// The seven Thai charging networks and their map/badge colours
export const NETWORKS = {
  "PTT EV Station PluZ": { color: "#3b82f6", short: "PTT" },
  "PEA VOLTA": { color: "#a855f7", short: "PEA" },
  "EA Anywhere": { color: "#10b981", short: "EA" },
  "Elex by EGAT": { color: "#eab308", short: "ELEX" },
  ReverSharger: { color: "#ec4899", short: "REV" },
  "Tesla Supercharger": { color: "#ef4444", short: "TESLA" },
  "MG Super Charge": { color: "#64748b", short: "MG" },
};

export const NETWORK_LIST = Object.keys(NETWORKS);

export const networkColor = (brand) => NETWORKS[brand]?.color || "#64748b";
export const networkShort = (brand) => NETWORKS[brand]?.short || "EV";

export const STATUS_META = {
  Available: { color: "#10b981", ring: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  Charging: { color: "#f59e0b", ring: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" },
  Offline: { color: "#64748b", ring: "bg-slate-500/15", text: "text-slate-400", dot: "bg-slate-400" },
};

export const statusMeta = (status) => STATUS_META[status] || STATUS_META.Offline;