import React, { useEffect, useState } from 'react';
import { getUserLeaderboard } from '../services/firestore';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLeaderboard(20)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="feed-loading"><div className="spinner" /></div>;

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1>Top Listeners</h1>
        <p>Most active community members by fire votes</p>
      </div>

      <div className="lb-list">
        {users.map((user, i) => {
          const total = (user.fireCount || 0) + (user.skipCount || 0);
          const pct = total > 0 ? Math.round(((user.fireCount || 0) / total) * 100) : 0;
          return (
            <div key={user.userId} className="lb-item">
              <div className={`lb-rank ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              {user.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="lb-cover lb-avatar" />
              ) : (
                <div className="lb-cover lb-avatar lb-avatar-fallback">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                </div>
              )}
              <div className="lb-info">
                <p className="lb-title">{user.displayName}</p>
                <p className="lb-artist">{total} votes cast</p>
                <div className="lb-bar-wrap">
                  <div className="lb-bar">
                    <div className="lb-bar-fill" style={{ width: pct + '%' }} />
                  </div>
                  <span className="lb-pct">{pct}% fire</span>
                </div>
              </div>
              <div className="lb-counts">
                <span className="lb-fire">🔥 {user.fireCount || 0}</span>
                <span className="lb-skip">💀 {user.skipCount || 0}</span>
              </div>
            </div>
          );
        })}
        {users.length === 0 && (
          <div className="lb-empty">No votes yet. Be the first to vote!</div>
        )}
      </div>
    </div>
  );
}
