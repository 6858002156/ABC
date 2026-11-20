import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildCommand, dispatchCommand } from '../../shared/ocpi.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_id, kwh_delivered } = await req.json().catch(() => ({}));
    if (!session_id) return Response.json({ error: 'session_id is required' }, { status: 400 });

    const session = await base44.entities.ChargingSessions
      .get(session_id)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });
    if (session.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (session.session_status !== 'Active') {
      return Response.json({ error: 'Session is not active' }, { status: 400 });
    }

    const station = await base44.asServiceRole.entities.ChargingStations
      .get(session.station_id)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));

    const kwh = Math.max(0, Number(kwh_delivered) || 0);
    const pricePerKwh = Number(
      session.rate_type === 'On-Peak' ? station?.on_peak_price_thb : station?.off_peak_price_thb,
    ) || 0;
    const cost = Math.round(kwh * pricePerKwh * 100) / 100;

    const appUrl = req.headers.get('X-Base44-App-Url') || '';
    const command = buildCommand({
      type: 'STOP_SESSION',
      evseUid: station?.external_ocpi_evse_uid,
      sessionId: session.external_session_id,
      appUrl,
      tokenUid: user.id,
    });
    const dispatch = await dispatchCommand(command);

    const updated = await base44.entities.ChargingSessions.update(session_id, {
      end_time: new Date().toISOString(),
      kwh_delivered: kwh,
      total_cost_thb: cost,
      session_status: 'Completed',
    });

    const balance = Number(user.wallet_balance_thb ?? 0);
    const newBalance = Math.max(0, Math.round((balance - cost) * 100) / 100);
    await base44.asServiceRole.entities.User.update(user.id, { wallet_balance_thb: newBalance });

    await base44.entities.WalletTransactions.create({
      user_id: user.id,
      type: 'Charging-Deduction',
      amount_thb: cost,
      payment_method: 'PromptPay QR',
      status: 'Completed',
      reference_id: session_id,
      created_at: new Date().toISOString(),
    });

    if (station) {
      await base44.asServiceRole.entities.ChargingStations.update(station.id, {
        status: 'Available',
        last_updated: new Date().toISOString(),
      });
    }

    return Response.json({ session: updated, cost, balance: newBalance, ocpi: dispatch });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}