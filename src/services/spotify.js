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

export const searchTracksByGenre = async (token, genre, limit = 40) => {
  const data = await get(
    `/search?q=${encodeURIComponent('genre:' + genre)}&type=track&limit=${limit}&market=DE`,
    token
  );
  return data.tracks?.items?.filter(t => t?.id) || [];
};

export const fetchItunesPreview = async (artistName, trackName) => {
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normTrack = normalize(trackName);

  const search = async (term, country = 'de') => {
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15&country=${country}`
      );
      const data = await res.json();
      return data.results || [];
    } catch { return []; }
  };

  const pickBest = (results) => {
    // exact title + artist
    const normArtist = normalize(artistName).slice(0, 5);
    let hit = results.find(r =>
      normalize(r.trackName) === normTrack &&
      normalize(r.artistName).includes(normArtist) &&
      r.previewUrl
    );
    if (hit) return hit.previewUrl;
    // exact title only
    hit = results.find(r => normalize(r.trackName) === normTrack && r.previewUrl);
    if (hit) return hit.previewUrl;
    // title starts-with (handles subtitle variants)
    hit = results.find(r => normalize(r.trackName).startsWith(normTrack.slice(0, Math.max(4, normTrack.length - 2))) && r.previewUrl);
    return hit?.previewUrl || null;
  };

  // 1. Try artist + title in DE
  let results = await search(`${artistName} ${trackName}`);
  let url = pickBest(results);
  if (url) return url;

  // 2. Try title only in DE
  results = await search(trackName);
  url = pickBest(results);
  if (url) return url;

  // 3. Try in US store as fallback
  results = await search(`${artistName} ${trackName}`, 'us');
  url = pickBest(results);
  return url || null;
};
