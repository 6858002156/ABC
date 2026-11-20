export async function loginWithMfa() { return { access_token: "demo" }; }
export async function continueMfa(_result, returnTo) { window.location.assign(returnTo || "/"); }
export async function loginWithSocial(_provider, returnTo) { window.location.assign(returnTo || "/"); }
export function loginWithGoogle(returnTo) { return loginWithSocial("google", returnTo); }
