import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { cn } from "@/lib/utils";

const CATEGORY_STYLE = {
  mall: { icon: "🛍️", color: "bg-pink-100 text-pink-600" },
  airport: { icon: "✈️", color: "bg-sky-100 text-sky-600" },
  landmark: { icon: "🏛️", color: "bg-amber-100 text-amber-600" },
  beach: { icon: "🏖️", color: "bg-cyan-100 text-cyan-600" },
  city: { icon: "🏙️", color: "bg-violet-100 text-violet-600" },
  hotel: { icon: "🏨", color: "bg-indigo-100 text-indigo-600" },
  transit: { icon: "🚉", color: "bg-teal-100 text-teal-600" },
};

const ACCENT_ICON = { emerald: "text-emerald-500", sky: "text-sky-500" };

export default function LocationSearch({ value, onChange, placeholder, icon, accent = "emerald" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState([]);
  const boxRef = useRef(null);

  useEffect(() => {
    mockApi.entities.Location.list("name", 200).then(setAll).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResults(all.slice(0, 8)); return; }
    setLoading(true);
    const t = setTimeout(() => {
      const q = query.toLowerCase();
      setResults(all.filter((l) => l.name.toLowerCase().includes(q) || l.province?.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)).slice(0, 8));
      setLoading(false);
    }, 150);
    return () => clearTimeout(t);
  }, [query, all]);

  const pick = (loc) => {
    onChange(loc);
    setQuery("");
    setOpen(false);
  };

  const Icon = icon || MapPin;

  return (
    <div className="relative" ref={boxRef}>
      <Icon className={cn("absolute left-3 top-3.5 w-4 h-4", ACCENT_ICON[accent] || "text-emerald-500")} />
      <input
        value={open ? query : value?.name || ""}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-3 text-[14px] focus:outline-none focus:border-emerald-400"
      />
      {value && !open && (
        <button onClick={() => { setOpen(true); setQuery(""); }} className="absolute right-2.5 top-2.5 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center">
          <X className="w-3.5 h-3.5 text-slate-500" />
        </button>
      )}
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white rounded-2xl border border-slate-200 shadow-xl max-h-72 overflow-y-auto">
          {query.trim() && (
            <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Search className="w-3 h-3" /> {loading ? "Searching…" : `${results.length} matches`}
            </div>
          )}
          {results.length === 0 && !loading && (
            <div className="px-4 py-6 text-center text-[12px] text-slate-400">No locations found</div>
          )}
          {results.map((loc) => {
            const cat = CATEGORY_STYLE[loc.category] || CATEGORY_STYLE.landmark;
            return (
              <button key={loc.id} onClick={() => pick(loc)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors">
                <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0", cat.color)}>{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900 truncate">{loc.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{loc.address || loc.province || loc.category}</div>
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide shrink-0">{loc.category}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
