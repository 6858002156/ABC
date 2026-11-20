import { useCallback, useEffect, useMemo, useState } from "react";
import { List, Map as MapIcon, Search, X, Loader2, Zap, Navigation } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import StationMap from "@/components/map/StationMap";
import StationSheet from "@/components/map/StationSheet";
import FilterChips from "@/components/map/FilterChips";
import SessionDashboard from "@/components/session/SessionDashboard";
import AskAi from "@/components/map/AskAi";
import { distanceKm, currentRateType, priceForRate, thb } from "@/lib/charging";
import { networkShort, networkColor, statusMeta } from "@/lib/networks";
import { cn } from "@/lib/utils";

const BANGKOK = { latitude: 13.7563, longitude: 100.5018 };

export default function MapHome() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("map");
  const [search, setSearch] = useState("");
  const [network, setNetwork] = useState("All");
  const [connector, setConnector] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [fastOnly, setFastOnly] = useState(false);
  const [origin, setOrigin] = useState(BANGKOK);

  const [sheetStation, setSheetStation] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const [liveSession, setLiveSession] = useState(null);
  const [liveStation, setLiveStation] = useState(null);
  const [capacityKwh, setCapacityKwh] = useState(60);

  const load = useCallback(async () => {
    const page = await mockApi.entities.ChargingStations.list({ sort: "-last_updated", limit: 500 });
    setStations(Array.isArray(page) ? page : (page.items || []));
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
    mockApi.entities.ChargingSessions
      .filter({ session_status: "Active" }, { limit: 1 })
      .then((page) => {
        const active = page.items?.[0];
        if (active) setLiveSession(active);
      })
      .catch(() => {});
    mockApi.entities.UserVehicles
      .filter({ is_active: true }, { limit: 1 })
      .then((page) => {
        const vehicle = page.items?.[0];
        if (vehicle?.battery_capacity_kwh) setCapacityKwh(vehicle.battery_capacity_kwh);
      })
      .catch(() => {});
  }, [load]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setOrigin({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {},
      { timeout: 5000, maximumAge: 600000 },
    );
  }, []);

  useEffect(() => {
    if (liveSession) {
      const match = stations.find((s) => s.id === liveSession.station_id);
      if (match) setLiveStation(match);
    }
  }, [liveSession, stations]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stations.filter((station) => {
      if (network !== "All" && station.network_brand !== network) return false;
      if (connector !== "All" && station.connector_type !== connector) return false;
      if (availableOnly && station.status !== "Available") return false;
      if (fastOnly && (Number(station.max_power_kw) || 0) < 50) return false;
      if (query) {
        const haystack = `${station.station_name} ${station.address} ${station.province} ${station.network_brand}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [stations, network, connector, availableOnly, fastOnly, search]);

  const networks = useMemo(
    () => [...new Set(stations.map((station) => station.network_brand).filter(Boolean))].sort(),
    [stations],
  );

  const nearby = useMemo(
    () => [...filtered].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b)),
    [filtered, origin],
  );

  const startCharging = async (station) => {
    setStarting(true);
    setStartError("");
    try {
      const rateType = currentRateType();
      const session = await mockApi.entities.ChargingSessions.create({
        station_id: station.id,
        session_status: "Active",
        start_time: new Date().toISOString(),
        rate_type: rateType,
      });
      setLiveSession(session);
      setLiveStation(station);
      setSheetStation(null);
      await load();
    } catch (e) {
      setStartError(e?.response?.data?.error || e?.message || "Could not start charging");
    } finally {
      setStarting(false);
    }
  };

  const openStation = (station) => {
    setStartError("");
    setSheetStation(station);
  };

  const activeRate = currentRateType();

  return (
    <div className="relative h-[calc(100dvh-7.5rem)] overflow-hidden bg-slate-900" style={{ minHeight: 420 }}>
      {view === "map" ? (
        <div className="absolute inset-0">
          <StationMap stations={filtered} selected={sheetStation} onSelect={openStation} />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto px-4 pt-32 pb-24 space-y-2.5">
          {loading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-emerald-400 animate-spin" /></div>}
          {!loading && nearby.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Zap className="w-9 h-9 mx-auto mb-2 text-slate-600" />
              <p className="text-[13px]">No stations match these filters.</p>
            </div>
          )}
          {nearby.map((station) => {
            const meta = statusMeta(station.status);
            return (
              <button
                key={station.id}
                onClick={() => openStation(station)}
                className="w-full text-left rounded-2xl bg-slate-800/90 border border-slate-700/70 p-3.5 active:scale-[0.995] transition-transform"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-950 shrink-0"
                    style={{ background: networkColor(station.network_brand) }}
                  >
                    {networkShort(station.network_brand)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-white truncate">{station.station_name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{station.province} · {station.connector_type} · {Math.round(station.max_power_kw || 0)}kW</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn("text-[10.5px] font-bold", meta.text)}>{station.status}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 inline-flex items-center gap-0.5">
                      <Navigation className="w-2.5 h-2.5" /> {distanceKm(origin, station).toFixed(1)} km
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px]">
                  <span className="rounded-full bg-slate-700/60 px-2 py-0.5 font-semibold text-slate-200">{activeRate}</span>
                  <span className="font-bold text-emerald-400">{thb(priceForRate(station, activeRate))}/kWh</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Search + quick filters */}
      <div className="absolute inset-x-0 top-0 z-[900] px-3 pt-3 pb-2 bg-gradient-to-b from-slate-950 via-slate-950/85 to-transparent">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900/95 border border-slate-700 px-3 py-2.5 shadow-lg">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search station, mall or province"
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-slate-500 focus:outline-none min-w-0"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear search" className="text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="mt-2">
          <FilterChips
            network={network}
            onNetwork={setNetwork}
            networks={networks}
            connector={connector}
            onConnector={setConnector}
            availableOnly={availableOnly}
            onAvailableOnly={setAvailableOnly}
            fastOnly={fastOnly}
            onFastOnly={setFastOnly}
          />
        </div>
      </div>

      {/* Map / list toggle */}
      <button
        onClick={() => setView(view === "map" ? "list" : "map")}
        className="absolute right-3 bottom-4 z-[900] inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2.5 text-[12px] font-bold text-slate-950 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform"
      >
        {view === "map" ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
        {view === "map" ? "List" : "Map"}
      </button>

      {view === "map" && !loading && (
        <div className="absolute left-3 bottom-4 z-[900] rounded-full bg-slate-900/90 border border-slate-700 px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-300">
          {filtered.length} stations
        </div>
      )}

      {sheetStation && (
        <StationSheet
          station={sheetStation}
          onClose={() => setSheetStation(null)}
          onStart={startCharging}
          starting={starting}
          error={startError}
        />
      )}

      {liveSession && (
        <SessionDashboard
          session={liveSession}
          station={liveStation || stations.find((s) => s.id === liveSession.station_id)}
          capacityKwh={capacityKwh}
          onStopped={() => load().catch(() => {})}
          onClose={() => {
            setLiveSession(null);
            setLiveStation(null);
            load().catch(() => {});
          }}
        />
      )}

      <AskAi />
    </div>
  );
}

