import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { brandColor, brandShort } from "@/lib/brands";

const BANGKOK = [13.7563, 100.5018];
const MAX_PINS = 600;

function stationIcon(station, active) {
  const color = active ? "#059669" : brandColor(station.brand);
  const label = brandShort(station.brand);
  return L.divIcon({
    className: "voltjai-pin",
    html: `<div style="position:relative;width:${active ? 34 : 26}px;height:${active ? 34 : 26}px;">
      <div style="width:100%;height:100%;border-radius:50%;background:#fff;border:2px solid ${color};box-shadow:0 2px 6px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;color:${color};font-weight:700;font-size:${active ? 11 : 9}px;">${label}</div>
    </div>`,
    iconSize: active ? [34, 34] : [26, 26],
    iconAnchor: active ? [17, 17] : [13, 13],
  });
}

function FitBounds({ stations }) {
  const map = useMap();
  useEffect(() => {
    if (!stations.length) {
      map.setView(BANGKOK, 11);
      return;
    }
    if (stations.length === 1) {
      map.setView([stations[0].lat, stations[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(stations.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    return () => map.stop();
  }, [stations, map]);
  return null;
}

export default function StationsMap({ stations, selected, onSelect }) {
  const pins = stations.filter((s) => s.lat != null && s.lng != null).slice(0, MAX_PINS);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-100" style={{ height: 320 }}>
      <MapContainer center={BANGKOK} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} zoomAnimation={false} fadeAnimation={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        <FitBounds stations={pins} />
        {pins.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={stationIcon(s, selected?.id === s.id)}
            eventHandlers={{ click: () => onSelect?.(s) }}
          />
        ))}
      </MapContainer>
      <div className="absolute left-3 bottom-3 z-[1000] bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 shadow-sm border border-slate-100">
        {pins.length} stations on map
      </div>
    </div>
  );
}