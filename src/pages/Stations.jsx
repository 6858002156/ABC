import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import useAllStations from "@/hooks/useAllStations";
import StationsMap from "@/components/stations/StationsMap";
import StationRow from "@/components/stations/StationRow";
import StationFilterBar from "@/components/stations/StationFilterBar";

const FAST_KW = 50;
const LIST_STEP = 40;

export default function Stations() {
  const { stations, loading, reload } = useAllStations();
  const [query, setQuery] = useState("");
  const [operator, setOperator] = useState("All");
  const [connector, setConnector] = useState("All");
  const [fastOnly, setFastOnly] = useState(false);
  const [visible, setVisible] = useState(LIST_STEP);
  const [selected, setSelected] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    mockApi.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => {});
  }, []);

  const operators = useMemo(() => {
    const set = new Set(stations.map((s) => s.operator || s.brand).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [stations]);

  const connectors = useMemo(() => {
    const set = new Set();
    stations.forEach((s) => {
      const list = s.connector_types?.length ? s.connector_types : s.connector_type ? [s.connector_type] : [];
      list.forEach((c) => set.add(c));
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [stations]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stations.filter((s) => {
      if (operator !== "All" && (s.operator || s.brand) !== operator) return false;
      if (connector !== "All") {
        const list = s.connector_types?.length ? s.connector_types : s.connector_type ? [s.connector_type] : [];
        if (!list.includes(connector)) return false;
      }
      if (fastOnly && (s.max_power_kw ?? s.power_kw ?? 0) < FAST_KW) return false;
      if (!q) return true;
      return [s.name, s.address, s.district, s.operator, s.brand]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [stations, operator, connector, fastOnly, query]);

  useEffect(() => {
    setVisible(LIST_STEP);
  }, [query, operator, connector, fastOnly]);

  const runSync = async () => {
    setSyncing(true);
    setSyncMsg("");
    try {
      const res = await mockApi.functions.invoke("syncBangkokStations", {});
      const data = res?.data || {};
      if (data.error) {
        setSyncMsg(data.error);
      } else {
        const osmBusy = (data.failures || []).some((f) => f.source === "openstreetmap");
        setSyncMsg(
          `${data.created} added, ${data.updated} updated` +
          (data.osm_added ? ` · ${data.osm_added} from OpenStreetMap` : "") +
          (osmBusy ? " · OpenStreetMap busy, retry later" : "")
        );
      }
      await reload();
    } catch (e) {
      setSyncMsg("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="px-5 pt-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Stations</h1>
          <p className="text-[13px] text-slate-400 font-medium">
            All public chargers in Bangkok, every brand
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={runSync}
            disabled={syncing}
            className="shrink-0 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-[12px] font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <RefreshCw className={syncing ? "w-3.5 h-3.5 animate-spin" : "w-3.5 h-3.5"} />
            {syncing ? "Syncing…" : "Sync stations"}
          </button>
        )}
      </div>

      {syncMsg && <p className="text-[12px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">{syncMsg}</p>}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search station, area or operator"
          className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-[14px] focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <StationFilterBar
        operators={operators}
        operator={operator}
        onOperator={setOperator}
        connectors={connectors}
        connector={connector}
        onConnector={setConnector}
        fastOnly={fastOnly}
        onFastOnly={setFastOnly}
      />

      <StationsMap stations={filtered} selected={selected} onSelect={setSelected} />

      {selected && (
        <div>
          <StationRow station={selected} highlighted />
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-slate-400 font-medium">
          {filtered.length} station{filtered.length === 1 ? "" : "s"}
        </span>
        {(operator !== "All" || connector !== "All" || fastOnly || query) && (
          <button
            onClick={() => { setOperator("All"); setConnector("All"); setFastOnly(false); setQuery(""); }}
            className="text-[12px] font-semibold text-emerald-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, visible).map((s) => <StationRow key={s.id} station={s} />)}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[13px] text-slate-400 flex flex-col items-center gap-1">
              <SlidersHorizontal className="w-5 h-5 text-slate-300" />
              No stations match these filters
            </div>
          )}
          {filtered.length > visible && (
            <button
              onClick={() => setVisible((v) => v + LIST_STEP)}
              className="w-full py-3 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 hover:border-slate-300"
            >
              Show {Math.min(LIST_STEP, filtered.length - visible)} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
