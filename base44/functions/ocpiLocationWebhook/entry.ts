import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// OCPI 2.2.1 status mapping -> app status
const STATUS_MAP = {
  AVAILABLE: 'Available',
  OCCUPIED: 'Charging',
  CHARGING: 'Charging',
  RESERVED: 'Charging',
  OUTOFORDER: 'Offline',
  INOPERATIVE: 'Offline',
  BLOCKED: 'Offline',
  UNKNOWN: 'Offline',
};

export default async function (req) {
  try {
    if (req.method !== 'POST' && req.method !== 'PATCH') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Shared token configured on the Dashboard → Secrets page
    let expected = '';
    try {
      expected = String(secrets.get('OCPI_WEBHOOK_TOKEN') || '');
    } catch (e) {
      expected = '';
    }
    if (!expected) {
      return Response.json({ error: 'Webhook token is not configured' }, { status: 503 });
    }

    const header = req.headers.get('Authorization') || '';
    const provided = header.replace(/^Token\s+/i, '').trim()
      || new URL(req.url).searchParams.get('token')
      || '';
    if (provided !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const evseUid = body.evse_uid || body?.evse?.uid || body?.data?.evse_uid;
    if (!evseUid) return Response.json({ error: 'evse_uid is required' }, { status: 400 });

    const rawStatus = String(body.status || body?.evse?.status || '').toUpperCase();
    const status = STATUS_MAP[rawStatus];
    if (!status) return Response.json({ error: `Unsupported status: ${rawStatus}` }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const found = await base44.asServiceRole.entities.ChargingStations.filter(
      { external_ocpi_evse_uid: evseUid },
      { limit: 1 },
    );
    const station = (found?.items || [])[0];
    if (!station) return Response.json({ error: 'Unknown evse_uid' }, { status: 404 });

    await base44.asServiceRole.entities.ChargingStations.update(station.id, {
      status,
      last_updated: body.last_updated || new Date().toISOString(),
    });

    return Response.json({ ok: true, station_id: station.id, status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}