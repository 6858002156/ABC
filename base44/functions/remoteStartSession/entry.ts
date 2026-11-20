import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildCommand, dispatchCommand, bangkokRateType } from '../../shared/ocpi.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { station_id } = await req.json().catch(() => ({}));
    if (!station_id) return Response.json({ error: 'station_id is required' }, { status: 400 });

    const station = await base44.asServiceRole.entities.ChargingStations
      .get(station_id)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!station) return Response.json({ error: 'Station not found' }, { status: 404 });
    if (station.status !== 'Available') {
      return Response.json({ error: `Station is currently ${station.status}` }, { status: 409 });
    }

    const balance = Number(user.wallet_balance_thb ?? 0);
    if (!Number.isFinite(balance) || balance < 100) {
      return Response.json({ error: 'A minimum wallet balance of ฿100 is required' }, { status: 400 });
    }

    const active = await base44.entities.ChargingSessions.filter({ session_status: 'Active' }, { limit: 1 });
    if ((active?.items || []).length > 0) {
      return Response.json({ error: 'You already have an active charging session' }, { status: 409 });
    }

    const appUrl = req.headers.get('X-Base44-App-Url') || '';
    const command = buildCommand({
      type: 'START_SESSION',
      evseUid: station.external_ocpi_evse_uid,
      appUrl,
      tokenUid: user.id,
    });
    const dispatch = await dispatchCommand(command);

    const session = await base44.entities.ChargingSessions.create({
      user_id: user.id,
      station_id,
      start_time: new Date().toISOString(),
      kwh_delivered: 0,
      total_cost_thb: 0,
      rate_type: bangkokRateType(),
      session_status: 'Active',
      external_session_id: `OCPI-${crypto.randomUUID()}`,
    });

    await base44.asServiceRole.entities.ChargingStations.update(station_id, {
      status: 'Charging',
      last_updated: new Date().toISOString(),
    });

    return Response.json({ session, ocpi: dispatch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}