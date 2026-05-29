const BASE = 'https://api.spotify.com/v1';

const get = (url, token) =>
  fetch(BASE + url, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json());

export const getMyProfile = (token) => get('/me', token);

export const getTopTracks = (token, range = 'medium_term', n = 20) =>
  get(`/me/top/tracks?time_range=${range}&limit=${n}`, token);

export const getTopArtists = (token, range = 'medium_term', n = 10) =>
  get(`/me/top/artists?time_range=${range}&limit=${n}`, token);

export const searchTracks = async (token, query, limit = 20) => {
  const data = await get(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, token);
  return data.tracks?.items || [];
};

export const getRecommendations = async (token, seedGenres = ['pop'], limit = 20) => {
  const data = await get(
    `/recommendations?seed_genres=${seedGenres.join(',')}&limit=${limit}&market=DE`,
    token
  );
  return data.tracks || [];
};

export const fetchItunesPreview = async (artistName, trackName) => {
  try {
    const q = `${artistName} ${trackName}`;
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=10&country=de`
    );
    const data = await res.json();
    const results = data.results || [];
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normTrack = normalize(trackName);
    const normArtist = normalize(artistName);
    const exact = results.find(r =>
      normalize(r.trackName) === normTrack &&
      normalize(r.artistName).includes(normArtist.slice(0, 6)) &&
      r.previewUrl
    );
    if (exact) return exact.previewUrl;
    const titleMatch = results.find(r => normalize(r.trackName) === normTrack && r.previewUrl);
    return titleMatch?.previewUrl || null;
  } catch {
    return null;
  }
};
