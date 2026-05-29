import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getTopTracks, getRecommendations, fetchItunesPreview } from '../services/spotify';
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

const ALL_SEEDS = ['pop', 'hip-hop', 'electronic', 'rock', 'indie'];

export default function FeedPage() {
  const { token, profile } = useAuthStore();
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('all');
  const [stats, setStats] = useState({ fireCount: 0, skipCount: 0 });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [voted, setVoted] = useState(null); // 'fire' | 'skip' | null
  const audioRef = useRef(null);
  const dragStartX = useRef(0);
  const cardRef = useRef(null);

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
      const seeds = genre === 'all' ? ALL_SEEDS : [genre];
      const recs = await getRecommendations(token, seeds, 30);
      setTracks(recs.filter(t => t.id));
    } catch {
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
    let url = track.preview_url;
    if (!url) {
      const artist = track.artists?.[0]?.name || '';
      url = await fetchItunesPreview(artist, track.name);
    }
    setPreviewUrl(url);
    if (url) setTimeout(() => playAudio(url), 300);
  };

  const playAudio = (url) => {
    if (!audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.volume = 0.7;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!previewUrl || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const vote = useCallback(async (v) => {
    if (!tracks[index] || voted) return;
    setVoted(v);
    const track = tracks[index];
    stopAudio();

    if (profile?.id) {
      await saveVote(profile.id, track, v).catch(() => {});
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

      {/* Card area */}
      <div className="card-area">
        {/* Next card shadow */}
        {tracks[index + 1] && (
          <div className="card card-next">
            <img src={tracks[index + 1].album?.images?.[0]?.url} alt="" />
          </div>
        )}

        {/* Main card */}
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

          {/* Fire/Skip overlays */}
          {isFireSide && <div className="card-overlay fire-overlay">FIRE</div>}
          {isSkipSide && <div className="card-overlay skip-overlay">SKIP</div>}

          <div className="card-info">
            <div className="card-track-info">
              <h2 className="card-title">{track.name}</h2>
              <p className="card-artist">{track.artists?.map(a => a.name).join(', ')}</p>
            </div>

            {/* Play button */}
            <button className="play-btn" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>

          {/* Community stats */}
          <div className="card-stats">
            <span className="stat-fire">🔥 {stats.fireCount}</span>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: firePercent + '%' }} />
            </div>
            <span className="stat-skip">💀 {stats.skipCount}</span>
          </div>

          <SpotifyBadge uri={track.uri} />
        </div>
      </div>

      {/* Vote buttons */}
      <div className="vote-buttons">
        <button className="vote-btn skip-btn" onClick={() => vote('skip')}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          Skip
        </button>
        <button className="vote-btn fire-btn" onClick={() => vote('fire')}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>
          Fire
        </button>
      </div>

      <p className="swipe-hint">Swipe right for Fire, left to Skip</p>
    </div>
  );
}
