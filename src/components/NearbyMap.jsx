import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Locate, MapPin, Zap } from "lucide-react";
import { mockApi } from "@/lib/mockApi";
import { BRANDS, brandColor, brandShort, formatTHB } from "@/lib/brands";
import BrandLogo from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const BANGKOK = [13.7563, 100.5018];

function distKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function stationIcon(brand) {
  const color = brandColor(brand);
  const logo = BRANDS[brand]?.logo;
  const inner = logo
    ? `<img src="${logo}" style="width:100%;height:100%;object-fit:contain;padding:2px;"/>`
    : `<span style="color:${color};font-weight:700;font-size:11px;">${brandShort(brand)}</span>`;
  return L.divIcon({
    className: "voltjai-pin",
    html: `<div style="position:relative;width:34px;height:34px;">
      <div style="width:34px;height:34px;border-radius:50%;background:#fff;border:2px solid ${color};box-shadow:0 2px 8px rgba(0,0,0,.25);overflow:hidden;display:flex;align-items:center;justify-content:center;">${inner}</div>
      <div style="position:absolute;left:50%;bottom:-3px;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:7px solid ${color};"></div>
    </div>`,
    iconSize: [34, 38],
    iconAnchor: [17, 38],
  });
}

function userIcon() {
  return L.divIcon({
    className: "voltjai-user",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.25),0 1px 4px rgba(0,0,0,.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13, { animate: true });
    return () => map.stop();
  }, [position, map]);
  return null;
}

export default function NearbyMap() {
  const [stations, setStations] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [selected, setSelected] = useState(null);
  const [locating, setLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    mockApi.entities.ChargingStation.list("-rating", 100).then(setStations).catch(() => {});
  }, []);

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
        setDenied(false);
      },
      () => { setLocating(false); setDenied(true); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => { locate(); }, []);

  const center = userPos || BANGKOK;
  const withDist = stations
    .filter((s) => s.lat != null && s.lng != null)
    .map((s) => ({
      ...s,
      distance: userPos ? distKm({ lat: userPos[0], lng: userPos[1] }, { lat: s.lat, lng: s.lng }) : null,
    }))
    .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
  const nearby = withDist.slice(0, 15);

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden border border-slate-100" style={{ height: 280 }}>
        <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} zoomAnimation={false} fadeAnimation={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Recenter position={userPos} />
          {userPos && <Marker position={userPos} icon={userIcon()} />}
          {nearby.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={stationIcon(s.brand)}
              eventHandlers={{ click: () => setSelected(s) }}
            />
          ))}
        </MapContainer>
        <button
          onClick={locate}
          className="absolute right-3 top-3 z-[1000] w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-slate-100 active:scale-95"
          aria-label="Find my location"
        >
          <Locate className={cn("w-4 h-4", locating ? "text-emerald-500 animate-pulse" : "text-slate-600")} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {userPos ? `${nearby.length} chargers near you` : denied ? "Showing all chargers — location off" : "Locating you…"}
        </span>
      </div>

      {selected ? (
        <Link to={`/stations/${selected.id}`} className="mt-2 block bg-white rounded-2xl border border-emerald-200 p-3 shadow-sm active:scale-[0.99] transition-transform">
          <div className="flex items-center gap-3">
            <BrandLogo brand={selected.brand} size={40} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{selected.name}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                {selected.distance != null && (
                  <span className="inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" />{selected.distance.toFixed(1)} km</span>
                )}
                <span className="inline-flex items-center gap-0.5"><Zap className="w-3 h-3 text-emerald-500" />{selected.power_kw}kW</span>
                <span>{selected.available_connectors}/{selected.total_connectors} free</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[13px] font-bold text-slate-900">{formatTHB(selected.price_per_kwh)}/kWh</div>
              <div className="text-[10px] text-emerald-600 font-semibold">View →</div>
            </div>
          </div>
        </Link>
      ) : (
        <p className="mt-2 text-[12px] text-slate-400 text-center">Tap a pin to view charger details</p>
      )}
    </div>
  );
}
