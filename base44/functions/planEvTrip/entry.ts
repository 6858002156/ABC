import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const CONSUMPTION_KWH_PER_KM = 0.17;
const RESERVE_PCT = 12;
const MAX_STOPS = 5;
const CORRIDOR_KM = 25;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function bangkokHour(date) {
  return Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', hour12: false }).format(date),
  );
}

function rateTypeFor(date) {
  const hour = bangkokHour(date);
  return hour >= 9 && hour < 22 ? 'On-Peak' : 'Off-Peak';
}

function priceFor(station, rate) {
  const on = num(station?.on_peak_price_thb);
  const off = num(station?.off_peak_price_thb);
  const price = rate === 'Off-Peak' ? off || on : on || off;
  return price > 0 ? price : 6.5;
}

async function fetchRoute(origin, destination) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`route ${res.status}`);
  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route?.distance) throw new Error('no route');
  const points = (route.geometry?.coordinates || []).map(([lng, lat]) => ({ lat, lng }));
  if (points.length < 2) throw new Error('no geometry');
  return { distanceKm: route.distance / 1000, durationMin: route.duration / 60, points, source: 'osrm' };
}

function straightRoute(origin, destination) {
  const steps = 24;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    points.push({
      lat: origin.lat + (destination.lat - origin.lat) * t,
      lng: origin.lng + (destination.lng - origin.lng) * t,
    });
  }
  const distanceKm = haversineKm(origin, destination) * 1.3;
  return { distanceKm, durationMin: (distanceKm / 80) * 60, points, source: 'estimate' };
}

function samplePoints(points) {
  const kept = [points[0]];
  let accum = 0;
  for (let i = 1; i < points.length; i += 1) {
    accum += haversineKm(points[i - 1], points[i]);
    if (accum >= 1.5) {
      kept.push(points[i]);
      accum = 0;
    }
  }
  const last = points[points.length - 1];
  const tail = kept[kept.length - 1];
  if (tail.lat !== last.lat || tail.lng !== last.lng) kept.push(last);
  return kept;
}

function stopScore(station, connector) {
  const power = num(station.max_power_kw, 22);
  const price = priceFor(station, 'On-Peak');
  const connectorBonus = connector && station.connector_type === connector ? -60 : 0;
  return (power >= 50 ? 0 : 400) + price * 12 - Math.min(power, 180) * 0.06 + connectorBonus;
}

function durationLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fallbackSummary({ stops, distanceKm, totalMinutes, totalCost, destinationName, energyKwh }) {
  if (!stops.length) {
    return `You can reach ${destinationName} without charging. ${Math.round(distanceKm)} km, about ${durationLabel(totalMinutes)} of driving.`;
  }
  return `${stops.length} charging stop${stops.length > 1 ? 's' : ''} on the way to ${destinationName}. ${Math.round(distanceKm)} km, about ${durationLabel(totalMinutes)} including charging, roughly ฿${Math.round(totalCost)} in total.`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Please sign in to plan a trip.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const origin = body?.origin || {};
    const destination = body?.destination || {};
    const oLat = num(origin.lat, NaN);
    const oLng = num(origin.lng, NaN);
    const dLat = num(destination.lat, NaN);
    const dLng = num(destination.lng, NaN);
    if (![oLat, oLng, dLat, dLng].every((v) => Number.isFinite(v))) {
      return Response.json({ error: 'Choose a start and a destination first.' }, { status: 400 });
    }

    const vehicle = body?.vehicle || {};
    const capacity = clamp(num(vehicle.battery_capacity_kwh, 60), 15, 150);
    const startPct = clamp(Math.round(num(body?.battery_start_pct, 60)), 5, 100);
    let targetPct = clamp(Math.round(num(body?.battery_target_pct, 80)), 40, 100);
    if (targetPct <= startPct) targetPct = clamp(startPct + 10, 40, 100);
    const connector = String(vehicle.preferred_connector || '').trim();
    const vehicleLabel = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim().slice(0, 60) || 'Your EV';

    const originPoint = { lat: oLat, lng: oLng };
    const destinationPoint = { lat: dLat, lng: dLng };
    let route;
    try {
      route = await fetchRoute(originPoint, destinationPoint);
    } catch {
      route = straightRoute(originPoint, destinationPoint);
    }

    const pts = samplePoints(route.points);
    const cum = [0];
    for (let i = 1; i < pts.length; i += 1) {
      cum.push(cum[i - 1] + haversineKm(pts[i - 1], pts[i]));
    }
    const distanceKm = route.distanceKm > 0 ? route.distanceKm : cum[cum.length - 1] || 1;

    const stationRows = [];
    let cursor;
    for (let page = 0; page < 6; page += 1) {
      const batch = await base44.entities.ChargingStations.filter({}, { limit: 500, cursor });
      stationRows.push(...(batch.items || []));
      if (!batch.has_more) break;
      cursor = batch.next_cursor;
    }

    const corridor = [];
    for (const station of stationRows) {
      if (station.status === 'Offline') continue;
      const lat = num(station.latitude, NaN);
      const lng = num(station.longitude, NaN);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      let bestIdx = 0;
      let bestD = Infinity;
      for (let i = 0; i < pts.length; i += 1) {
        const d = haversineKm({ lat, lng }, pts[i]);
        if (d < bestD) {
          bestD = d;
          bestIdx = i;
        }
      }
      if (bestD > CORRIDOR_KM) continue;
      corridor.push({ ...station, lat, lng, alongKm: cum[bestIdx] });
    }
    corridor.sort((a, b) => a.alongKm - b.alongKm);

    const departure = new Date();
    const speed = distanceKm / (Math.max(route.durationMin, 20) / 60);
    let energy = capacity * (startPct / 100);
    let cursorKm = 0;
    let clockMin = 0;
    let chargeMinutesTotal = 0;
    const stops = [];
    let warning = '';

    while (stops.length < MAX_STOPS) {
      const rangeKm = (energy - capacity * (RESERVE_PCT / 100)) / CONSUMPTION_KWH_PER_KM;
      if (cursorKm + rangeKm >= distanceKm - 5) break;

      const reachKm = cursorKm + rangeKm * 0.92;
      const candidates = corridor.filter((s) => s.alongKm > cursorKm + 12 && s.alongKm <= reachKm);
      if (candidates.length === 0) {
        warning = `A charge is needed around ${Math.round(reachKm)} km, but no charger in the app is reachable there yet. Try a different start charge or route.`;
        break;
      }
      const preferred = candidates.filter((s) => s.alongKm >= cursorKm + rangeKm * 0.5);
      let pick;
      if (preferred.length) {
        preferred.sort((a, b) => stopScore(a, connector) - stopScore(b, connector));
        pick = preferred[0];
      } else {
        // Sparse corridor: take the furthest reachable charger so the driver makes real progress.
        candidates.sort((a, b) => b.alongKm - a.alongKm || stopScore(a, connector) - stopScore(b, connector));
        pick = candidates[0];
      }

      const legKm = pick.alongKm - cursorKm;
      const arrivalEnergy = energy - legKm * CONSUMPTION_KWH_PER_KM;
      const arrivalPct = clamp(Math.round((arrivalEnergy / capacity) * 100), 0, 100);
      const targetEnergy = capacity * (targetPct / 100);
      const kwh = Math.round(Math.max(2, targetEnergy - arrivalEnergy) * 10) / 10;
      const power = clamp(num(pick.max_power_kw, 50), 11, 180);
      const effectivePower = Math.min(power, 120);
      const chargeMinutes = Math.max(5, Math.round((kwh / effectivePower) * 60));

      const driveMin = (legKm / speed) * 60;
      const arrivalAt = new Date(departure.getTime() + (clockMin + driveMin) * 60000);
      const rate = rateTypeFor(new Date(arrivalAt.getTime() + chargeMinutes * 30000));
      const price = Math.round(priceFor(pick, rate) * 100) / 100;
      const cost = Math.round(kwh * price * 10) / 10;

      stops.push({
        station_id: pick.id,
        station_name: pick.station_name || 'Charging station',
        network: pick.network_brand || 'Other',
        connector_type: pick.connector_type || '',
        power_kw: Math.round(power),
        price_thb: price,
        kwh,
        charge_minutes: chargeMinutes,
        cost,
        arrival_pct: arrivalPct,
        target_pct: targetPct,
        at_km: Math.round(pick.alongKm),
        latitude: pick.lat,
        longitude: pick.lng,
      });

      clockMin += driveMin + chargeMinutes;
      chargeMinutesTotal += chargeMinutes;
      cursorKm = pick.alongKm;
      energy = targetEnergy;
    }

    const remaining = Math.max(0, distanceKm - cursorKm);
    const endEnergy = energy - remaining * CONSUMPTION_KWH_PER_KM;
    const arrivalPct = clamp(Math.round((endEnergy / capacity) * 100), 0, 100);
    const totalMinutes = Math.round(route.durationMin + chargeMinutesTotal);
    const totalCost = Math.round(stops.reduce((sum, s) => sum + s.cost, 0) * 10) / 10;
    const energyKwh = Math.round(distanceKm * CONSUMPTION_KWH_PER_KM * 10) / 10;

    if (!stops.length && arrivalPct <= 0) {
      warning = 'This trip is longer than your battery can cover and no charger matched the route. Try adjusting your start charge.';
    }

    const originName = String(origin.name || 'Start').slice(0, 80);
    const destinationName = String(destination.name || 'Destination').slice(0, 80);

    let headline = stops.length ? `${stops.length} stop${stops.length > 1 ? 's' : ''} planned` : 'No stop needed';
    let summary = fallbackSummary({
      stops,
      distanceKm,
      totalMinutes,
      totalCost,
      destinationName,
      energyKwh,
    });

    try {
      const llm = await Promise.race([
        base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are the VOLT JAI trip planner for electric vehicles in Thailand. Write a short, practical trip summary for the driver.

Facts:
- Route: ${originName} to ${destinationName}
- Distance: ${Math.round(distanceKm)} km, driving ${durationLabel(route.durationMin)}, total ${durationLabel(totalMinutes)} including charging
- Vehicle: ${vehicleLabel}, ${Math.round(capacity)} kWh battery, leaving with ${startPct}%, charging to ${targetPct}%, arriving with ${arrivalPct}%
- Charging stops: ${
            stops.length
              ? stops
                  .map(
                    (s) =>
                      `${s.station_name} (${s.network}) at ${s.at_km} km, ${s.power_kw}kW, add ${s.kwh} kWh in ${s.charge_minutes} min for ฿${s.cost}`,
                  )
                  .join('; ')
              : 'none needed'
          }
- Total charging cost: ฿${totalCost}. Energy used: ${energyKwh} kWh.
${warning ? `- Note: ${warning}` : ''}

Rules: two sentences maximum, mention the most useful practical detail (charger power, price, or timing). No markdown, no emoji, no bullet points. Write in English.`,
          response_json_schema: {
            type: 'object',
            properties: {
              headline: { type: 'string', description: 'Max 4 words, e.g. "Two fast stops"' },
              summary: { type: 'string', description: 'Two sentences, max 45 words' },
            },
            required: ['headline', 'summary'],
          },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
      ]);
      const parsed = typeof llm === 'string' ? JSON.parse(llm) : llm;
      if (parsed?.summary) summary = String(parsed.summary).slice(0, 320);
      if (parsed?.headline) headline = String(parsed.headline).slice(0, 40);
    } catch {
      // keep the deterministic summary
    }

    return Response.json({
      origin: originName,
      destination: destinationName,
      distance_km: Math.round(distanceKm),
      drive_minutes: Math.round(route.durationMin),
      total_duration_minutes: totalMinutes,
      energy_kwh: energyKwh,
      estimated_cost: totalCost,
      vehicle_model: vehicleLabel,
      battery_capacity_kwh: Math.round(capacity),
      start_pct: startPct,
      target_pct: targetPct,
      arrival_pct: arrivalPct,
      charging_stops: stops,
      headline,
      summary,
      warning,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Could not plan this trip right now.' }, { status: 500 });
  }
}