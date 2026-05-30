import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getTopTracks, searchTracksByGenre, fetchItunesPreview } from '../services/spotify';
import { saveVote, getTrackStats } from '../services/firestore';
import SpotifyBadge from '../components/SpotifyBadge';

const GENRES = [
  { id: 'all', label: '🔥 All' },
  { id: 'pop', label: 'Pop' },
  { id: 'hip-hop', label: 'Hip-Hop' },
  { id: 'electronic', label: 'Electronic' },
  { id: 'rock', label: 'Rock' },
  { id: 'r-n-b', label: 'R&B' },
  { id: 'indie', label: 'Indie' },
  { id: 'latin', label: 'Latin' },
  { id: 'k-pop', label: 'K-Pop' },
];

export default function FeedPage() {
  const { token, profile } = useAuthStore();
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('all');
  const [stats, setStats] = useState({ fireCount: 0, skipCount: 0 });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [voted, setVoted] = useState(null); // 'fire' | 'skip' | null
  const [autoplay, setAutoplay] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const autoplayRef = useRef(false);
  const audioRef = useRef(null);
  const dragStartX = useRef(0);
  const cardRef = useRef(null);
  const loadSessionRef = useRef(0); // incremented each time loadPreview is called — cancels stale fetches
  const hasInteractedRef = useRef(false); // track whether user has clicked anything

  useEffect(() => { loadTracks(); }, [genre]);

  useEffect(() => {
    if (tracks[index]) {
      loadStats(tracks[index].id);
      loadPreview(tracks[index]);
    }
  }, [index, tracks]);

  const loadTracks = async () => {
    setLoading(true);
    setIndex(0);
    try {
      let result = [];
      if (genre === 'all') {
        // Use the user's own top tracks (Spotify recommendations API is deprecated for new apps)
        const [short, medium] = await Promise.all([
          getTopTracks(token, 'short_term', 30),
          getTopTracks(token, 'medium_term', 30),
        ]);
        const seen = new Set();
        const merged = [
          ...(short.items || []),
          ...(medium.items || []),
        ].filter(t => {
          if (!t?.id || seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
        result = merged.sort(() => Math.random() - 0.5);
      } else {
        result = await searchTracksByGenre(token, genre, 40);
      }
      setTracks(result.filter(t => t?.id));
    } catch (e) {
      console.error('loadTracks:', e);
      setTracks([]);
    }
    setLoading(false);
  };

  const loadStats = async (id) => {
    const s = await getTrackStats(id).catch(() => ({ fireCount: 0, skipCount: 0 }));
    setStats(s);
  };

  const loadPreview = async (track) => {
    stopAudio();
    setPreviewUrl(null);
    setPreviewLoading(true);
    const session = ++loadSessionRef.current;

    let url = track.preview_url || null;

    // Many Spotify tracks have no preview_url anymore — fall back to iTunes
    if (!url) {
      const artist = track.artists?.[0]?.name || '';
      url = await fetchItunesPreview(artist, track.name);
    }

    // Stale check — a newer track was loaded while we were fetching
    if (session !== loadSessionRef.current) return;

    setPreviewLoading(false);
    setPreviewUrl(url || null);

    if (url && hasInteractedRef.current && autoplayRef.current) {
      playAudio(url);
    }
  };

  const playAudio = (url) => {
    if (!audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.volume = autoplayRef.current ? volume : volume;
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    hasInteractedRef.current = true;
    if (!previewUrl || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio(previewUrl);
    }
  };

  const toggleAutoplay = () => {
    hasInteractedRef.current = true;
    const next = !autoplayRef.current;
    autoplayRef.current = next;
    setAutoplay(next);
    if (next && previewUrl && !isPlaying) {
      playAudio(previewUrl);
    } else if (!next) {
      if (audioRef.current) { audioRef.current.pause(); }
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const vote = useCallback(async (v) => {
    hasInteractedRef.current = true;
    if (!tracks[index] || voted) return;
    setVoted(v);
    const track = tracks[index];
    stopAudio();

    if (profile?.id) {
      await saveVote(profile.id, track, v, profile).catch(() => {});
    }

    setTimeout(() => {
      setVoted(null);
      setIndex(i => i + 1);
    }, 400);
  }, [tracks, index, voted, profile]);

  // Drag handlers
  const onMouseDown = (e) => {
    setDragging(true);
    dragStartX.current = e.clientX;
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setDragX(e.clientX - dragStartX.current);
  };
  const onMouseUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > 80) vote('fire');
    else if (dragX < -80) vote('skip');
    setDragX(0);
  };

  const onTouchStart = (e) => {
    dragStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    setDragX(e.touches[0].clientX - dragStartX.current);
  };
  const onTouchEnd = () => {
    if (dragX > 80) vote('fire');
    else if (dragX < -80) vote('skip');
    setDragX(0);
  };

  const track = tracks[index];
  const rotation = Math.min(Math.max(dragX / 20, -12), 12);
  const isFireSide = dragX > 40;
  const isSkipSide = dragX < -40;

  if (loading) return (
    <div className="feed-loading">
      <div className="spinner" />
    </div>
  );

  if (!track) return (
    <div className="feed-empty">
      <div className="feed-empty__icon">🎵</div>
      <h2 className="feed-empty__title">No more tracks</h2>
      <p className="feed-empty__sub">You've heard them all. Try another genre!</p>
      <div className="feed-empty__genres">
        {GENRES.map(g => (
          <button
            key={g.id}
            className={`genre-tab ${genre === g.id ? 'active' : ''}`}
            onClick={() => setGenre(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>
      <button className="btn-green" onClick={loadTracks}>Reload current genre</button>
    </div>
  );

  const totalVotes = stats.fireCount + stats.skipCount;
  const firePercent = totalVotes > 0 ? Math.round((stats.fireCount / totalVotes) * 100) : 0;

  return (
    <div className="feed-page">
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Genre tabs */}
      <div className="genre-tabs">
        {GENRES.map(g => (
          <button
            key={g.id}
            className={`genre-tab ${genre === g.id ? 'active' : ''}`}
            onClick={() => setGenre(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="feed-main">
        {/* Card */}
        <div className="card-area">
          {tracks[index + 1] && (
            <div className="card card-next">
              <img src={tracks[index + 1].album?.images?.[0]?.url} alt="" />
            </div>
          )}
          <div
            ref={cardRef}
            className={`card card-main ${voted === 'fire' ? 'voted-fire' : ''} ${voted === 'skip' ? 'voted-skip' : ''}`}
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              cursor: dragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={track.album?.images?.[0]?.url}
              alt={track.name}
              className="card-cover"
              draggable={false}
            />
            {isFireSide && <div className="card-overlay fire-overlay">FIRE 🔥</div>}
            {isSkipSide && <div className="card-overlay skip-overlay">SKIP 💀</div>}
            <div className="card-stats">
              <span className="stat-fire">🔥 {stats.fireCount}</span>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: firePercent + '%' }} />
              </div>
              <span className="stat-skip">💀 {stats.skipCount}</span>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="feed-info">
          <div>
            <h2 className="feed-info__title">{track.name}</h2>
            <p className="feed-info__artist">{track.artists?.map(a => a.name).join(', ')}</p>
            <p className="feed-info__album">{track.album?.name}</p>
          </div>

          {previewLoading ? (
            <div className="player-row">
              <button className="play-btn-lg" disabled style={{ opacity: 0.5 }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ animation: 'spin .8s linear infinite' }}><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" opacity=".3"/><path d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8z"/></svg>
                Loading…
              </button>
            </div>
          ) : previewUrl ? (
            <div className="player-row">
              <button className="play-btn-lg" onClick={togglePlay}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
                {isPlaying ? 'Pause' : 'Play 30s'}
              </button>
              <button
                className={`autoplay-btn ${autoplay ? 'autoplay-on' : ''}`}
                onClick={toggleAutoplay}
                title="Toggle autoplay"
              >
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14l-5-5h3V8h4v4h3l-5 5z"/></svg>
                Autoplay
              </button>
              <div className="volume-row">
                <svg className="vol-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>
            </div>
          ) : (
            <div className="spotify-embed-wrap">
              <iframe
                title="Spotify player"
                src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          )}

          <div className="feed-info__stats">
            <div className="feed-stat-row">
              <span>🔥 Fire votes</span>
              <strong>{stats.fireCount}</strong>
            </div>
            <div className="feed-stat-row">
              <span>💀 Skips</span>
              <strong>{stats.skipCount}</strong>
            </div>
            <div className="feed-stat-bar">
              <div className="feed-stat-bar__fill" style={{ width: firePercent + '%' }} />
            </div>
            {totalVotes > 0 && <p className="feed-stat-pct">{firePercent}% fire rate</p>}
          </div>

          <div className="vote-buttons">
            <button className="vote-btn skip-btn" onClick={() => vote('skip')}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              Skip
            </button>
            <button className="vote-btn fire-btn" onClick={() => vote('fire')}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>
              Fire 🔥
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <SpotifyBadge uri={track.uri} />
            <span className="swipe-hint" style={{ margin: 0 }}>← Skip · Fire →</span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
            Track {index + 1} of {tracks.length}
          </p>
        </div>
      </div>
    </div>
  );
}
