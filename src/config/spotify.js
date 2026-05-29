export const SPOTIFY_CLIENT_ID = '42ca8dd36a37420d8322aacb51225405';

export const SPOTIFY_SCOPES = [
  'user-top-read',
  'user-read-email',
  'user-read-private',
  'user-library-read',
].join(' ');

// Set this to your Vercel URL in production, localhost for dev
export const REDIRECT_URI = window.location.origin + '/callback';

export const SPOTIFY_AUTH_URL =
  'https://accounts.spotify.com/authorize' +
  '?response_type=token' +
  '&client_id=' + SPOTIFY_CLIENT_ID +
  '&scope=' + encodeURIComponent(SPOTIFY_SCOPES) +
  '&redirect_uri=' + encodeURIComponent(REDIRECT_URI);
