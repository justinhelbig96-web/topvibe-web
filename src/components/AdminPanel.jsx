import React, { useEffect, useState } from 'react';
import { getAllUsers, banUser, unbanUser, getBannedUsers } from '../services/firestore';

export default function AdminPanel({ onClose }) {
  const [users, setUsers] = useState([]);
  const [banned, setBanned] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [all, bannedSet] = await Promise.all([getAllUsers(), getBannedUsers()]);
      setUsers(all.sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0)));
      setBanned(bannedSet);
    } catch (e) {
      console.error('AdminPanel load error:', e);
      setError('Firestore permission denied. Check your security rules.');
    } finally {
      setLoading(false);
    }
  };

  const toggleBan = async (userId) => {
    setActionId(userId);
    if (banned.has(userId)) {
      await unbanUser(userId);
      setBanned(s => { const n = new Set(s); n.delete(userId); return n; });
    } else {
      await banUser(userId);
      setBanned(s => new Set(s).add(userId));
    }
    setActionId(null);
  };

  const filtered = users.filter(u =>
    !search || (u.displayName || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalVotes = users.reduce((s, u) => s + (u.totalVotes || 0), 0);
  const totalTracks = users.reduce((s, u) => s + (u.trackCount || 0), 0);

  return (
    <div className="admin-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="admin-panel">
        <div className="admin-header">
          <div>
            <h2 className="admin-title">Admin Panel</h2>
            <p className="admin-sub">{users.length} users · {totalVotes} votes · {totalTracks} tracks</p>
          </div>
          <button className="admin-close" onClick={onClose}>✕</button>
        </div>

        <input
          className="admin-search"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="admin-loading"><div className="spinner" /></div>
        ) : error ? (
          <div className="admin-error">
            <p>⚠️ {error}</p>
            <p className="admin-error-hint">
              Go to <strong>Firebase Console → Firestore → Rules</strong> and set:
              <br /><code>allow read, write: if true;</code> (for testing)
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Tracks</th>
                  <th>Votes</th>
                  <th>🔥 Fire</th>
                  <th>💀 Skip</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const isBanned = banned.has(u.id);
                  return (
                    <tr key={u.id} className={isBanned ? 'admin-row--banned' : ''}>
                      <td className="admin-user-cell">
                        {u.avatar
                          ? <img src={u.avatar} alt="" className="admin-avatar" />
                          : <div className="admin-avatar admin-avatar-fallback">?</div>
                        }
                        <span className="admin-name">{u.displayName || 'Unknown'}</span>
                      </td>
                      <td>{u.trackCount || 0}</td>
                      <td>{u.totalVotes || 0}</td>
                      <td>{u.fireCount || 0}</td>
                      <td>{u.skipCount || 0}</td>
                      <td>
                        <span className={`admin-badge ${isBanned ? 'admin-badge--banned' : 'admin-badge--active'}`}>
                          {isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`admin-ban-btn ${isBanned ? 'admin-ban-btn--unban' : 'admin-ban-btn--ban'}`}
                          onClick={() => toggleBan(u.id)}
                          disabled={actionId === u.id}
                        >
                          {actionId === u.id ? '...' : isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="admin-empty">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
