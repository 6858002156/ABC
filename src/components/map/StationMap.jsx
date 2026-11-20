import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { networkShort, statusMeta } from "@/lib/networks";

const BANGKOK = [13.7563, 100.5018];

const pinLabel = (station) =>
  station.network_brand === "Other" && station.operator
    ? station.operator.slice(0, 4).toUpperCase()
    : networkShort(station.network_brand);

function stationPin(station, active) {
  const color = statusMeta(station.status).color;
  const width = active ? 104 : 92;
  const height = active ? 44 : 40;
  return L.divIcon({
    className: "",
    html: `<div style="width:${width}px;height:${height}px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
      <div style="background:${color};color:#04120c;font:800 ${active ? 11 : 10}px/1 'Space Grotesk',system-ui,sans-serif;padding:4px 7px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.55);white-space:nowrap;${active ? "outline:2px solid #fff;" : ""}">${pinLabel(station)} · ${Math.round(station.max_power_kw || 0)}kW</div>
      <div style="width:2px;height:5px;background:${color}"></div>
      <div style="width:7px;height:7px;border-radius:50%;background:${color};border:1px solid rgba(255,255,255,.8)"></div>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  });
}

// Leaflet measures its container once on mount; in an embedded preview the
// container can still be resizing, so re-measure until the layout settles.
function MapSize() {
  const map = useMap();
  useEffect(() => {
    // Only re-measure while the map is still mounted and visible.
    const fix = () => {
      if (map.getContainer()?.isConnected) map.invalidateSize();
    };
    fix();
    const t1 = setTimeout(fix, 200);
    const t2 = setTimeout(fix, 800);
    window.addEventListener("resize", fix);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", fix);
    };
  }, [map]);
  return null;
}

function MapFocus({ station }) {
  const map = useMap();
  useEffect(() => {
    if (!station?.latitude) return;
    map.flyTo([station.latitude, station.longitude], 14, { duration: 0.7 });
    // Stop any running pan/zoom animation before Leaflet tears the map down,
    // otherwise a pending frame touches removed panes (_leaflet_pos is undefined).
    return () => {
      map.stop();
    };
  }, [station?.id, map]);
  return null;
}

export default function StationMap({ stations, selected, onSelect }) {
  return (
    <MapContainer
      center={BANGKOK}
      zoom={11}
      zoomControl={false}
      zoomAnimation={false}
      fadeAnimation={false}
      markerZoomAnimation={false}
      style={{ height: "100%", width: "100%", background: "#0f172a" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
        maxZoom={19}
      />
      <MapSize />
      <MapFocus station={selected} />
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={stationPin(station, selected?.id === station.id)}
          eventHandlers={{ click: () => onSelect?.(station) }}
        />
      ))}
    </MapContainer>
  );
}