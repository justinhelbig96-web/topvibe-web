import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getMyProfile, getTopTracks, getTopArtists } from '../services/spotify';
import { getUserVotes } from '../services/firestore';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { token, profile, setProfile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [topArtist, setTopArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      let p = profile;
      if (!p) { p = await getMyProfile(token); setProfile(p); }
      const [artists, tracks] = await Promise.all([
        getTopArtists(token, 'long_term', 1),
        getTopTracks(token, 'long_term', 10),
      ]);
      setTopArtist(artists.items?.[0] || null);
      setTopTracks(tracks.items || []);
      if (p?.id) {
        const votes = await getUserVotes(p.id).catch(() => []);
        setLikedTracks(votes.filter(v => v.vote === 'fire').map(v => v.trackData));
      }
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (loading) return <div className="feed-loading"><div className="spinner" /></div>;

  const avatar = profile?.images?.[0]?.url;

  return (
    <div className="profile-page">
      <div className="profile-header">
        {avatar ? (
          <img src={avatar} alt={profile?.display_name} className="profile-avatar" />
        ) : (
          <div className="profile-avatar profile-avatar-fallback">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
        )}
        <h1 className="profile-name">{profile?.display_name || 'Spotify User'}</h1>
        {profile?.email && <p className="profile-email">{profile.email}</p>}
        <p className="profile-followers">{profile?.followers?.total || 0} Followers</p>
        {topArtist && (
          <div className="profile-top-artist">
            <img src={topArtist.images?.[0]?.url} alt={topArtist.name} />
            <div>
              <p className="label">Top Artist</p>
              <p className="value">{topArtist.name}</p>
            </div>
          </div>
        )}
      </div>

      {topTracks.length > 0 && (
        <div className="profile-section">
          <h2>Your Top Tracks</h2>
          <div className="track-list">
            {topTracks.map((t, i) => (
              <a
                key={t.id}
                href={`https://open.spotify.com/track/${t.id}`}
                target="_blank"
                rel="noreferrer"
                className="track-item"
              >
                <span className="track-num">{i + 1}</span>
                <img src={t.album?.images?.[2]?.url || t.album?.images?.[0]?.url} alt={t.name} />
                <div className="track-info">
                  <p className="track-name">{t.name}</p>
                  <p className="track-artist">{t.artists?.map(a => a.name).join(', ')}</p>
                </div>
                <svg className="spotify-mini" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {likedTracks.length > 0 && (
        <div className="profile-section">
          <h2>Your Fire Votes</h2>
          <div className="track-list">
            {likedTracks.map((t) => (
              <a
                key={t.id}
                href={`https://open.spotify.com/track/${t.id}`}
                target="_blank"
                rel="noreferrer"
                className="track-item"
              >
                <span className="track-fire">🔥</span>
                <img src={t.albumArt} alt={t.name} />
                <div className="track-info">
                  <p className="track-name">{t.name}</p>
                  <p className="track-artist">{t.artistName}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="profile-footer">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
