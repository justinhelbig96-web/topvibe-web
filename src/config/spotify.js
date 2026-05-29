export const SPOTIFY_CLIENT_ID = '42ca8dd36a37420d8322aacb51225405';

export const SPOTIFY_SCOPES = [
  'user-top-read',
  'user-read-email',
  'user-read-private',
  'user-library-read',
].join(' ');

export const REDIRECT_URI = window.location.origin + '/callback';

// --- PKCE helpers ---

function generateCodeVerifier() {
  const array = new Uint8Array(96);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function initiateLogin() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  sessionStorage.setItem('pkce_verifier', verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString();
}

export async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem('pkce_verifier');
  if (!verifier) throw new Error('No code verifier found');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: verifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description || 'Token exchange failed');
  }

  sessionStorage.removeItem('pkce_verifier');
  return response.json(); // { access_token, expires_in, refresh_token, ... }
}
