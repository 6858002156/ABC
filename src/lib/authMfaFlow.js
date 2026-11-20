export function mfaSession() { return null; }
export async function signInToManageMfa() { return { access_token: "demo" }; }
export function resumeMfa() { return null; }
export async function loadSignInOptions() { return {}; }
export async function signInWithProvider(_provider, returnTo) { window.location.assign(returnTo || "/"); }
export function finishSignIn(_accessToken, returnTo) { window.location.assign(returnTo || "/"); }
