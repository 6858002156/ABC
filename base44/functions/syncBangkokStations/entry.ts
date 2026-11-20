import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Open Charge Map public API - all public EV charging points inside Bangkok.
const API_URL = 'https://api.openchargemap.io/v3/poi/';

// Bangkok bounding box given for this feature
const NORTH = 13.96;
const SOUTH = 13.49;
const WEST = 100.32;
const EAST = 100.94;

// One request returns at most 500 results, so the box is split into 4 quadrants
const SPLIT_LAT = 13.725;
const SPLIT_LNG = 100.63;

const QUADRANTS = [
  `(${SPLIT_LAT},${WEST}),(${NORTH},${SPLIT_LNG})`, // north-west
  `(${SPLIT_LAT},${SPLIT_LNG}),(${NORTH},${EAST})`, // north-east
  `(${SOUTH},${WEST}),(${SPLIT_LAT},${SPLIT_LNG})`, // south-west
  `(${SOUTH},${SPLIT_LNG}),(${SPLIT_LAT},${EAST})`, // south-east
];

// OpenStreetMap (Overpass) - second free source, community-mapped chargers
// Mirrors are tried in order; the main instance is often overloaded
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Same four areas as Open Charge Map, so one slow mirror cannot block the run
const OSM_AREAS = [
  `${SPLIT_LAT},${WEST},${NORTH},${SPLIT_LNG}`,
  `${SPLIT_LAT},${SPLIT_LNG},${NORTH},${EAST}`,
  `${SOUTH},${WEST},${SPLIT_LAT},${SPLIT_LNG}`,
  `${SOUTH},${SPLIT_LNG},${SPLIT_LAT},${EAST}`,
];

// Two records closer than this are treated as the same physical charger
const DEDUPE_METRES = 60;

const CONNECTOR_ENUM = ['CCS2', 'CHAdeMO', 'Type 2', 'GBT'];

const BRAND_RULES = [
  [/pea\s*volta/i, 'PEA Volta'],
  [/ea\s*anywhere|energy\s*absolute/i, 'EA Anywhere'],
  [/sharge/i, 'Sharge'],
  [/pluz/i, 'EV Station PluZ'],
  [/elex|egat/i, 'Elex'],
  [/charg\s*ev/i, 'chargEV'],
  [/spark/i, 'Spark EV'],
  [/altervim/i, 'Altervim'],
  [/byd/i, 'BYD Charge'],
  [/tesla/i, 'Tesla'],
  [/^mg\b/i, 'MG EV'],
  [/^volt/i, 'PEA Volta'],
];

function matchBrand(operator) {
  const name = String(operator || '');
  for (const rule of BRAND_RULES) {
    if (rule[0].test(name)) return rule[1];
  }
  return null;
}

function normalizeConnector(title) {
  const t = String(title || '').toLowerCase();
  if (!t) return null;
  if (t.includes('ccs')) return 'CCS2';
  if (t.includes('chademo')) return 'CHAdeMO';
  if (t.includes('type 2') || t.includes('type2') || t.includes('mennekes')) return 'Type 2';
  if (t.includes('gb') || t.includes('gbt')) return 'GBT';
  return null;
}

function parsePrice(text) {
  const m = String(text || '').replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}

function toRecord(poi, syncedAt) {
  const info = poi.AddressInfo || {};
  const lat = Number(info.Latitude);
  const lng = Number(info.Longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const connections = Array.isArray(poi.Connections) ? poi.Connections : [];
  const connectorTypes = [];
  for (const c of connections) {
    const title = c?.ConnectionType?.Title;
    if (title && !/^\s*unknown\s*$/i.test(title) && !connectorTypes.includes(title)) connectorTypes.push(title);
  }

  const powers = connections
    .map((c) => Number(c?.PowerKW))
    .filter((n) => Number.isFinite(n) && n > 0);
  const maxPower = powers.length ? Math.max(...powers) : 0;

  const numPoints = Number(poi.NumberOfPoints) || connections.length || 1;
  const rawOperator = poi.OperatorInfo?.Title || '';
  const operator = /^\(?\s*unknown operator\s*\)?$/i.test(rawOperator) ? '' : rawOperator;
  const district = info.Town || info.StateOrProvince || '';
  const address = [info.AddressLine1, info.Town, info.Postcode].filter(Boolean).join(', ')
    || district
    || 'Bangkok';
  const usageCost = poi.UsageCost || '';
  const legacyConnector = connectorTypes.map(normalizeConnector).find(Boolean);

  const record = {
    ocm_id: Number(poi.ID),
    name: info.Title || operator || `Charging station ${poi.ID}`,
    operator,
    address,
    district,
    province: 'Bangkok',
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    num_points: numPoints,
    connector_types: connectorTypes,
    max_power_kw: maxPower,
    status: poi.StatusType?.Title || 'Unknown',
    usage_cost: usageCost,
    last_synced: syncedAt,
    // fields the rest of the app already displays
    brand: matchBrand(`${operator} ${info.Title || ''}`) || operator || 'Other',
    power_kw: maxPower,
    price_per_kwh: parsePrice(usageCost),
    total_connectors: numPoints,
    available_connectors: numPoints,
  };
  if (legacyConnector && CONNECTOR_ENUM.includes(legacyConnector)) {
    record.connector_type = legacyConnector;
  }
  return record;
}

function metresBetween(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function addToIndex(index, point) {
  const lat = Number(point.lat);
  const lng = Number(point.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  const key = `${Math.round(lat / 0.001)}:${Math.round(lng / 0.001)}`;
  if (!index.has(key)) index.set(key, []);
  index.get(key).push({ lat, lng, osm_id: point.osm_id });
}

function isNear(index, point, ignoreOsmId) {
  const lat = Number(point.lat);
  const lng = Number(point.lng);
  const baseLat = Math.round(lat / 0.001);
  const baseLng = Math.round(lng / 0.001);
  for (let dLat = -1; dLat <= 1; dLat += 1) {
    for (let dLng = -1; dLng <= 1; dLng += 1) {
      const bucket = index.get(`${baseLat + dLat}:${baseLng + dLng}`);
      if (!bucket) continue;
      for (const other of bucket) {
        if (ignoreOsmId != null && other.osm_id != null && Number(other.osm_id) === Number(ignoreOsmId)) continue;
        if (metresBetween({ lat, lng }, other) <= DEDUPE_METRES) return true;
      }
    }
  }
  return false;
}

async function fetchOsmArea(area) {
  const query = `[out:json][timeout:25];nwr["amenity"="charging_station"](${area});out center;`;
  let lastError = 'no OpenStreetMap mirror reachable';
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'EVThaiConnect/1.0 (charging station directory)',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`OpenStreetMap returned ${res.status}`);
      const body = await res.json();
      return Array.isArray(body?.elements) ? body.elements : [];
    } catch (error) {
      lastError = String(error?.message || error);
    }
  }
  throw new Error(lastError);
}

// Overpass is frequently overloaded, so the areas are independent:
// whatever answers this run gets imported, the rest follow on the next run.
async function fetchOverpass() {
  const results = await Promise.allSettled(OSM_AREAS.map(fetchOsmArea));
  const elements = [];
  let failed = 0;
  for (const result of results) {
    if (result.status === 'rejected') {
      failed += 1;
      continue;
    }
    elements.push(...result.value);
  }
  if (elements.length === 0 && failed > 0) {
    const first = results.find((r) => r.status === 'rejected');
    throw new Error(String(first?.reason || 'OpenStreetMap unavailable'));
  }
  return { elements, failed };
}

const OSM_SOCKETS = [
  [/^socket:type2_combo$/, 'CCS2'],
  [/^socket:ccs$/, 'CCS2'],
  [/^socket:type2$/, 'Type 2'],
  [/^socket:chademo$/, 'CHAdeMO'],
  [/^socket:gb_t$/, 'GBT'],
];

function toOsmRecord(element, syncedAt) {
  const tags = element.tags || {};
  const lat = Number(element.lat ?? element.center?.lat);
  const lng = Number(element.lon ?? element.center?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const connectorTypes = [];
  let socketCount = 0;
  const powers = [];
  for (const [key, raw] of Object.entries(tags)) {
    for (const [pattern, name] of OSM_SOCKETS) {
      if (!pattern.test(key)) continue;
      if (!connectorTypes.includes(name)) connectorTypes.push(name);
      const count = Number(raw);
      socketCount += Number.isFinite(count) && count > 0 ? count : 1;
    }
    if (key.endsWith(':output') || key === 'charging_station:output') {
      const kw = Number(String(raw).replace(/[^\d.]/g, ''));
      if (Number.isFinite(kw) && kw > 0) powers.push(kw);
    }
  }

  const maxPower = powers.length ? Math.max(...powers) : 0;
  const operator = tags.operator || tags.network || tags.brand || '';
  const name = tags.name || tags['name:en'] || operator || `Charging station ${element.id}`;
  const numPoints = Number(tags.capacity) || socketCount || 1;
  const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:subdistrict'] || tags['addr:district']]
    .filter(Boolean)
    .join(' ') || tags['addr:city'] || 'Bangkok';
  const usageCost = tags.charge || tags['charging_station:charge'] || '';
  const legacyConnector = connectorTypes.map(normalizeConnector).find(Boolean);

  const record = {
    osm_id: Number(element.id),
    name,
    operator,
    address,
    district: tags['addr:district'] || tags['addr:subdistrict'] || tags['addr:city'] || '',
    province: 'Bangkok',
    lat,
    lng,
    latitude: lat,
    longitude: lng,
    num_points: numPoints,
    connector_types: connectorTypes,
    max_power_kw: maxPower,
    status: tags['operational_status'] || tags['charging_station:status'] || 'Unknown',
    usage_cost: usageCost,
    last_synced: syncedAt,
    brand: matchBrand(`${operator} ${name}`) || operator || 'Other',
    power_kw: maxPower,
    price_per_kwh: parsePrice(usageCost),
    total_connectors: numPoints,
    available_connectors: numPoints,
  };
  if (legacyConnector && CONNECTOR_ENUM.includes(legacyConnector)) {
    record.connector_type = legacyConnector;
  }
  return record;
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
    // App users must be admins; scheduled runs arrive without a user.
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = secrets.get('OCM_API_KEY');
    const syncedAt = new Date().toISOString();

    const responses = await Promise.allSettled(
      QUADRANTS.map((box) =>
        fetch(
          `${API_URL}?output=json&countrycode=TH&boundingbox=${box}&maxresults=500&compact=false&verbose=false`,
          {
            headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
            signal: AbortSignal.timeout(25000),
          },
        ).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`Open Charge Map returned ${r.status}`))))
      )
    );

    const failures = [];
    const unique = new Map();
    responses.forEach((result, index) => {
      if (result.status === 'rejected') {
        failures.push({ quadrant: index, error: String(result.reason?.message || result.reason) });
        return;
      }
      const list = Array.isArray(result.value) ? result.value : [];
      for (const poi of list) {
        if (poi && poi.ID != null && !unique.has(poi.ID)) unique.set(poi.ID, poi);
      }
    });

    if (unique.size === 0 && failures.length > 0) {
      return Response.json(
        { error: 'Could not load stations from Open Charge Map', failures },
        { status: 502 },
      );
    }

    // Load every existing station once: synced rows are updated instead of duplicated,
    // and OpenStreetMap points we already cover are skipped.
    const existingByOcmId = new Map();
    const existingByOsmId = new Map();
    const nearbyIndex = new Map();
    let cursor;
    do {
      const page = await base44.asServiceRole.entities.ChargingStation.filter({}, { limit: 500, cursor });
      for (const row of page?.items || []) {
        if (row.ocm_id != null) existingByOcmId.set(Number(row.ocm_id), row.id);
        if (row.osm_id != null) existingByOsmId.set(Number(row.osm_id), row.id);
        addToIndex(nearbyIndex, row);
      }
      cursor = page?.has_more ? page.next_cursor : undefined;
    } while (cursor);

    const incoming = [];
    for (const poi of unique.values()) {
      const record = toRecord(poi, syncedAt);
      if (record) incoming.push(record);
    }

    // Second free source: community-mapped chargers from OpenStreetMap
    let osmList = [];
    try {
      const osm = await fetchOverpass();
      osmList = osm.elements;
      if (osm.failed > 0) {
        failures.push({ source: 'openstreetmap', error: `${osm.failed} of ${OSM_AREAS.length} areas unavailable` });
      }
    } catch (error) {
      failures.push({ source: 'openstreetmap', error: String(error?.message || error) });
    }

    let osmAdded = 0;
    let osmSkipped = 0;
    const seenOsm = new Set();
    for (const element of osmList) {
      const record = toOsmRecord(element, syncedAt);
      if (!record || seenOsm.has(record.osm_id)) continue;
      seenOsm.add(record.osm_id);
      const knownId = existingByOsmId.get(record.osm_id);
      if (!knownId && isNear(nearbyIndex, record, record.osm_id)) {
        osmSkipped += 1;
        continue;
      }
      addToIndex(nearbyIndex, record);
      incoming.push(record);
      osmAdded += 1;
    }

    const toCreate = [];
    const toUpdate = [];
    for (const record of incoming) {
      const existingId = record.ocm_id != null
        ? existingByOcmId.get(record.ocm_id)
        : existingByOsmId.get(record.osm_id);
      if (existingId) toUpdate.push({ id: existingId, ...record });
      else toCreate.push(record);
    }

    let created = 0;
    let updated = 0;
    for (const batch of chunk(toCreate, 200)) {
      const result = await base44.asServiceRole.entities.ChargingStation.bulkCreate(batch);
      created += Array.isArray(result) ? result.length : batch.length;
    }
    for (const batch of chunk(toUpdate, 200)) {
      await base44.asServiceRole.entities.ChargingStation.bulkUpdate(batch);
      updated += batch.length;
    }

    return Response.json({
      ok: true,
      fetched: responses.reduce((n, r) => n + (r.status === 'fulfilled' && Array.isArray(r.value) ? r.value.length : 0), 0),
      unique: unique.size,
      osm_fetched: osmList.length,
      osm_added: osmAdded,
      osm_skipped: osmSkipped,
      created,
      updated,
      last_synced: syncedAt,
      failures,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}