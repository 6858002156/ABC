// Thailand Time-of-Use pricing + session simulation helpers (Asia/Bangkok)

export const DEFAULT_CAPACITY_KWH = 60;
// Demo acceleration so a charging session visibly progresses
export const SIM_SPEED = 12;

export function bangkokHour(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Bangkok", hour: "2-digit", hour12: false }).format(date),
  );
}

export function currentRateType(date = new Date()) {
  const hour = bangkokHour(date);
  return hour >= 9 && hour < 22 ? "On-Peak" : "Off-Peak";
}

export const priceForRate = (station, rateType) => {
  const activeRate = Number(rateType === "On-Peak" ? station?.on_peak_price_thb : station?.off_peak_price_thb);
  // Older station records only have price_per_kwh. Use that valid rate rather
  // than showing a zero price when a TOU field is missing.
  return Number.isFinite(activeRate) && activeRate > 0
    ? activeRate
    : Number(station?.price_per_kwh) > 0 ? Number(station.price_per_kwh) : 0;
};

export const chargingCost = (kwh, station, rateType) =>
  Math.round(Math.max(0, Number(kwh) || 0) * priceForRate(station, rateType) * 100) / 100;

export const thb = (value, decimals = 2) =>
  "฿" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function distanceKm(a, b) {
  if (!a?.latitude || !b?.latitude) return Infinity;
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Everything a session dashboard shows, derived from the start time so it survives a reload
export function sessionSnapshot(session, station, capacityKwh = DEFAULT_CAPACITY_KWH) {
  const start = new Date(session?.start_time || Date.now()).getTime();
  const elapsedMs = Math.max(0, (Date.now() - start) * SIM_SPEED);
  const power = Number(station?.max_power_kw) || 22;
  const kwh = Math.min(capacityKwh, (elapsedMs / 3600000) * power);
  const price = priceForRate(station, session?.rate_type || currentRateType());
  return {
    elapsedMs,
    power,
    kwh,
    cost: chargingCost(kwh, station, session?.rate_type || currentRateType()),
    price,
    batteryPct: Math.min(100, 20 + (kwh / capacityKwh) * 100),
  };
}
