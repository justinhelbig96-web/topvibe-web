import React, { useEffect, useState } from 'react';
import { getUserLeaderboard } from '../services/firestore';

const MEDAL = ['🥇', '🥈', '🥉'];
const MEDAL_COLOR = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLeaderboard(20).then(setUsers).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="feed-loading"><div className="spinner" /></div>;

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);
  const totalAll = users.reduce((s, u) => s + (u.fireCount || 0) + (u.skipCount || 0), 0);

  return (
    <div className="lb-page">
      <div className="lb-hero">
        <h1 className="lb-hero__title">Top Listeners</h1>
        <p className="lb-hero__sub">{users.length} members · {totalAll} total votes cast</p>
      </div>

      {/* Podium top 3 */}
      {top3.length > 0 && (
        <div className="lb-podium">
          {top3.map((user, i) => {
            const total = (user.fireCount || 0) + (user.skipCount || 0);
            const pct = total > 0 ? Math.round(((user.fireCount || 0) / total) * 100) : 0;
            return (
              <div key={user.userId} className={`lb-podium-card lb-podium-card--${i + 1}`}>
                <div className="lb-podium-medal" style={{ color: MEDAL_COLOR[i] }}>{MEDAL[i]}</div>
                {user.avatar
                  ? <img src={user.avatar} alt={user.displayName} className="lb-podium-avatar" />
                  : <div className="lb-podium-avatar lb-podium-avatar--fallback">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    </div>
                }
                <p className="lb-podium-name">{user.displayName}</p>
                <div className="lb-podium-score">
                  <span className="lb-podium-fire">🔥 {user.fireCount || 0}</span>
                  <span className="lb-podium-sep">·</span>
                  <span className="lb-podium-pct" style={{ color: 'var(--green)' }}>{pct}%</span>
                </div>
                <div className="lb-podium-bar">
                  <div className="lb-podium-bar-fill" style={{ width: pct + '%', background: MEDAL_COLOR[i] }} />
                </div>
                <p className="lb-podium-total">{total} votes</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Rest of list */}
      {rest.length > 0 && (
        <div className="lb-rest">
          {rest.map((user, i) => {
            const rank = i + 4;
            const total = (user.fireCount || 0) + (user.skipCount || 0);
            const pct = total > 0 ? Math.round(((user.fireCount || 0) / total) * 100) : 0;
            return (
              <div key={user.userId} className="lb-row">
                <span className="lb-row__rank">#{rank}</span>
                {user.avatar
                  ? <img src={user.avatar} alt={user.displayName} className="lb-row__avatar" />
                  : <div className="lb-row__avatar lb-row__avatar--fallback">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                    </div>
                }
                <div className="lb-row__info">
                  <p className="lb-row__name">{user.displayName}</p>
                  <div className="lb-row__bar">
                    <div className="lb-row__bar-fill" style={{ width: pct + '%' }} />
                  </div>
                </div>
                <div className="lb-row__counts">
                  <span className="lb-row__fire">🔥 {user.fireCount || 0}</span>
                  <span className="lb-row__skip">💀 {user.skipCount || 0}</span>
                </div>
                <span className="lb-row__pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      )}

      {users.length === 0 && (
        <div className="lb-empty">
          <p>🎵 No votes yet — be the first!</p>
        </div>
      )}
    </div>
  );
}


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
