import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Thailand bounding box, split in four so each request stays under OCM's 500-result cap
const QUADRANTS = [
  '(13.05,97.3),(20.5,101.45)',
  '(13.05,101.45),(20.5,105.6)',
  '(5.6,97.3),(13.05,101.45)',
  '(5.6,101.45),(13.05,105.6)',
];

const FALLBACK_PRICE = [7.9, 5.2];

const NETWORKS = [
  [/pea\s*volta/i, 'PEA VOLTA'],
  [/ea\s*anywhere|energy\s*absolute/i, 'EA Anywhere'],
  [/elex|egat/i, 'Elex by EGAT'],
  [/pluz|ptt/i, 'PTT EV Station PluZ'],
  [/rever/i, 'ReverSharger'],
  [/tesla/i, 'Tesla Supercharger'],
  [/\bmg\b|mg\s*(super|charge)/i, 'MG Super Charge'],
];

const DEFAULT_PRICES = {
  'PTT EV Station PluZ': [7.9, 5.2],
  'PEA VOLTA': [8.2, 5.4],
  'EA Anywhere': [7.5, 4.9],
  'Elex by EGAT': [7.8, 5.1],
  ReverSharger: [7.6, 5.0],
  'Tesla Supercharger': [8.5, 5.5],
  'MG Super Charge': [6.9, 4.6],
};

function matchNetwork(text) {
  for (const [pattern, network] of NETWORKS) {
    if (pattern.test(text)) return network;
  }
  return null;
}

function matchConnector(connections) {
  const titles = connections.map((c) => String(c?.ConnectionType?.Title || '').toLowerCase());
  if (titles.some((t) => t.includes('chademo'))) return 'CHAdeMO';
  if (titles.some((t) => t.includes('type 2') || t.includes('type2'))) return 'Type 2';
  return 'CCS2';
}

function toRecord(poi, syncedAt) {
  const info = poi.AddressInfo || {};
  const lat = Number(info.Latitude);
  const lng = Number(info.Longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const operator = poi.OperatorInfo?.Title || '';
  // Unlisted operators are still kept, so the map covers every public charger in Thailand
  const network = matchNetwork(`${operator} ${info.Title || ''}`) || 'Other';

  const connections = Array.isArray(poi.Connections) ? poi.Connections : [];
  const powers = connections.map((c) => Number(c?.PowerKW)).filter((n) => Number.isFinite(n) && n > 0);
  const [onPeak, offPeak] = DEFAULT_PRICES[network] || FALLBACK_PRICE;

  const statusTitle = String(poi.StatusType?.Title || '').toLowerCase();
  const status = /not operational|planned|closed/.test(statusTitle) ? 'Offline' : 'Available';

  return {
    station_name: info.Title || `${network} ${info.Town || ''}`.trim(),
    network_brand: network,
    operator: operator || '',
    province: info.StateOrProvince || info.Town || 'Thailand',
    latitude: lat,
    longitude: lng,
    address: [info.AddressLine1, info.Town, info.Postcode].filter(Boolean).join(', ') || 'Thailand',
    status,
    connector_type: matchConnector(connections),
    max_power_kw: powers.length ? Math.max(...powers) : 22,
    on_peak_price_thb: onPeak,
    off_peak_price_thb: offPeak,
    external_station_id: `OCM-${poi.ID}`,
    last_updated: syncedAt,
  };
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = secrets.get('OCM_API_KEY');
    const syncedAt = new Date().toISOString();

    const responses = await Promise.allSettled(
      QUADRANTS.map((box) =>
        fetch(
          `https://api.openchargemap.io/v3/poi/?output=json&countrycode=TH&boundingbox=${box}&maxresults=500&compact=false&verbose=false`,
          {
            headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
            signal: AbortSignal.timeout(25000),
          },
        ).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Open Charge Map returned ${r.status}`)))),
      ),
    );

    const failures = [];
    const unique = new Map();
    responses.forEach((result, index) => {
      if (result.status === 'rejected') {
        failures.push({ quadrant: index, error: String(result.reason?.message || result.reason) });
        return;
      }
      for (const poi of Array.isArray(result.value) ? result.value : []) {
        if (poi && poi.ID != null && !unique.has(poi.ID)) unique.set(poi.ID, poi);
      }
    });

    if (unique.size === 0 && failures.length > 0) {
      return Response.json({ error: 'Could not reach Open Charge Map', failures }, { status: 502 });
    }

    const existing = new Map();
    let cursor;
    do {
      const page = await base44.asServiceRole.entities.ChargingStations.filter({}, { limit: 500, cursor });
      for (const row of page?.items || []) {
        if (row.external_station_id) existing.set(row.external_station_id, row.id);
      }
      cursor = page?.has_more ? page.next_cursor : undefined;
    } while (cursor);

    const toCreate = [];
    const toUpdate = [];
    for (const poi of unique.values()) {
      const record = toRecord(poi, syncedAt);
      if (!record) continue;
      const id = existing.get(record.external_station_id);
      if (id) toUpdate.push({ id, ...record });
      else toCreate.push(record);
    }

    let created = 0;
    let updated = 0;
    for (const batch of chunk(toCreate, 200)) {
      await base44.asServiceRole.entities.ChargingStations.bulkCreate(batch);
      created += batch.length;
    }
    for (const batch of chunk(toUpdate, 200)) {
      await base44.asServiceRole.entities.ChargingStations.bulkUpdate(batch);
      updated += batch.length;
    }

    return Response.json({
      ok: true,
      fetched: unique.size,
      created,
      updated,
      failures,
      last_synced: syncedAt,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}