import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Deletes the signed-in user's own records and then the account itself.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { confirm } = await req.json().catch(() => ({}));
    if (confirm !== 'DELETE') {
      return Response.json({ error: 'Confirmation required' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Vehicle.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.Booking.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.UserVehicles.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.ChargingSessions.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.WalletTransactions.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}