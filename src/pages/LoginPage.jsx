import React from 'react';
import { initiateLogin } from '../config/spotify';
import logo from '../assets/logo.png';

const FEATURES = [
  {
    icon: '🔥',
    title: 'Vote for Bangers',
    desc: 'Fire or skip tracks. Your taste shapes the global leaderboard.',
  },
  {
    icon: '🎧',
    title: 'Discover New Music',
    desc: 'Preview fresh tracks every session. No algorithm, pure community.',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'See which songs the world is vibing to right now.',
  },
  {
    icon: '📊',
    title: 'Your Top Tracks',
    desc: 'Your Spotify listening history, beautifully visualized.',
  },
];

const STATS = [
  { value: '100%', label: 'Community driven' },
  { value: '∞', label: 'New tracks daily' },
  { value: '#1', label: 'Vibe check app' },
];

export default function LoginPage() {
  return (
    <div className="landing-page">
      {/* Glow orbs */}
      <div className="landing-orb landing-orb--tl" />
      <div className="landing-orb landing-orb--br" />

      {/* Dot grid */}
      <div className="dot-grid" />

      {/* Top gradient line */}
      <div className="landing-topline" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <div className="landing-nav__logo">
            <img src={logo} alt="TopVibe" className="landing-nav__logo-img" />
            <span>TopVibe</span>
          </div>
          <button className="landing-nav__cta" onClick={initiateLogin}>
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        {/* Badge */}
        <div className="landing-badge">
          <span className="landing-badge__dot" />
          DISCOVER · VOTE · DOMINATE
        </div>

        {/* Headline */}
        <h1 className="landing-headline">
          THE WORLD'S<br />
          <span className="landing-headline--accent glow-text">VIBE METER</span>
        </h1>

        <p className="landing-sub">
          Vote on tracks, discover fresh music, and see what the world is vibing to.
          Powered by your Spotify taste.
        </p>

        {/* CTA */}
        <button className="landing-cta" onClick={initiateLogin}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="landing-cta__icon">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Continue with Spotify
        </button>

        {/* Stats strip */}
        <div className="landing-stats">
          {STATS.map((s) => (
            <div key={s.label} className="landing-stat">
              <span className="landing-stat__value">{s.value}</span>
              <span className="landing-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2 className="landing-features__title">Everything you need to vibe</h2>
        <div className="landing-features__grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature-card">
              <div className="landing-feature-card__icon">{f.icon}</div>
              <h3 className="landing-feature-card__title">{f.title}</h3>
              <p className="landing-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-bottom-cta">
        <div className="landing-bottom-cta__glow" />
        <h2 className="landing-bottom-cta__title">Ready to find your vibe?</h2>
        <button className="landing-cta" onClick={initiateLogin}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="landing-cta__icon">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Get Started Free
        </button>
        <p className="landing-legal">
          By continuing you agree to Spotify's{' '}
          <a href="https://www.spotify.com/legal/end-user-agreement/" target="_blank" rel="noreferrer">Terms</a>
          {' '}and{' '}
          <a href="https://www.spotify.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
        </p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2025 TopVibe</span>
        <span>·</span>
        <a href="https://justinhelbig96-web.github.io/topvibe-support/" target="_blank" rel="noreferrer">Support</a>
        <span>·</span>
        <a href="https://justinhelbig96-web.github.io/topvibe-support/privacy.html" target="_blank" rel="noreferrer">Privacy</a>
      </footer>
    </div>
  );
}

