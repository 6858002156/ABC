import { secrets } from 'base44:runtime';

// Base URL of the Charge Point Operator's OCPI 2.2.1 endpoint.
// Empty when the app has no live CPO connected, so commands stay local-only.
export function cpoBaseUrl() {
  try {
    return String(secrets.get('OCPI_CPO_BASE_URL') || '').replace(/\/+$/, '');
  } catch (e) {
    return '';
  }
}

export function buildCommand({ type, evseUid, sessionId, appUrl, tokenUid }) {
  const payload = {
    response_url: `${appUrl}/functions/ocpiLocationWebhook`,
    token: { uid: tokenUid || 'APP-USER', type: 'APP_USER' },
    evse_uid: evseUid || '',
  };
  if (type === 'STOP_SESSION' && sessionId) payload.session_id = sessionId;
  return { type, payload };
}

export async function dispatchCommand(command) {
  const base = cpoBaseUrl();
  if (!base || !command.payload.evse_uid) {
    return { sent: false, reason: 'No live CPO endpoint configured — session handled locally' };
  }
  try {
    const res = await fetch(`${base}/commands/${command.type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(command.payload),
      signal: AbortSignal.timeout(10000),
    });
    return { sent: res.ok, status: res.status };
  } catch (error) {
    return { sent: false, reason: String(error?.message || error) };
  }
}

// Thailand Time-of-Use window: On-Peak 09:00-22:00 Asia/Bangkok.
export function bangkokRateType() {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', hour12: false }).format(new Date()),
  );
  return hour >= 9 && hour < 22 ? 'On-Peak' : 'Off-Peak';
}