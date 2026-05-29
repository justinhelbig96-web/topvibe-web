import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/firestore';
import SpotifyBadge from '../components/SpotifyBadge';

export default function LeaderboardPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(20)
      .then(setTracks)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="feed-loading"><div className="spinner" /></div>;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>Leaderboard</h1>
        <p>The hottest tracks voted by the community</p>
      </div>

      <div className="lb-list">
        {tracks.map((track, i) => {
          const total = (track.fireCount || 0) + (track.skipCount || 0);
          const pct = total > 0 ? Math.round(((track.fireCount || 0) / total) * 100) : 0;
          return (
            <div key={track.id} className="lb-item">
              <div className={`lb-rank ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <img src={track.albumArt} alt={track.name} className="lb-cover" />
              <div className="lb-info">
                <p className="lb-title">{track.name}</p>
                <p className="lb-artist">{track.artistName}</p>
                <div className="lb-bar-wrap">
                  <div className="lb-bar">
                    <div className="lb-bar-fill" style={{ width: pct + '%' }} />
                  </div>
                  <span className="lb-pct">{pct}% fire</span>
                </div>
              </div>
              <div className="lb-counts">
                <span className="lb-fire">🔥 {track.fireCount || 0}</span>
                <span className="lb-skip">💀 {track.skipCount || 0}</span>
              </div>
              {track.uri && (
                <a
                  href={`https://open.spotify.com/track/${track.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="lb-spotify-link"
                  title="Open in Spotify"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                </a>
              )}
            </div>
          );
        })}
        {tracks.length === 0 && (
          <div className="lb-empty">No votes yet. Be the first to vote!</div>
        )}
      </div>
    </div>
  );
}
