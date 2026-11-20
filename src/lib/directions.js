// Opens Google Maps turn-by-turn directions from the user's current location to a charger.
export function openDirections(lat, lng) {
  if (lat == null || lng == null) return;
  const dest = `${lat},${lng}`;
  const open = (origin) => {
    const base = "https://www.google.com/maps/dir/?api=1";
    const q = origin
      ? `?origin=${origin}&destination=${dest}&travelmode=driving`
      : `?destination=${dest}&travelmode=driving`;
    window.open(base + q, "_blank", "noopener,noreferrer");
  };

  if (!navigator.geolocation) { open(); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => open(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => open(),
    { enableHighAccuracy: true, timeout: 8000 }
  );
}