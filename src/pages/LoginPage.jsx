import React from 'react';
import { initiateLogin } from '../config/spotify';
import logo from '../assets/logo.png';

// Album art placeholders — real trending covers from Spotify CDN
const TILES = [
  'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96', // Blinding Lights
  'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14', // As It Was
  'https://i.scdn.co/image/ab67616d0000b2736acc7b9b0c8b5e3f99c62093', // Flowers
  'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647', // Cruel Summer
  'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946', // Levitating
  'https://i.scdn.co/image/ab67616d0000b273d9194aa18fa4c9362b47fe0c', // Stay
  'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a', // bad guy
  'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452', // Shape of You
  'https://i.scdn.co/image/ab67616d0000b273c6af5ffa661b4e4a4c56a8e3', // Heat Waves
];

const HOW = [
  {
    step: '01',
    title: 'Connect Spotify',
    desc: 'Sign in with your Spotify account. We read your taste, not your passwords.',
  },
  {
    step: '02',
    title: 'Swipe through tracks',
    desc: 'Fire or skip — 30-second previews let you judge fast.',
  },
  {
    step: '03',
    title: 'See what\'s hot',
    desc: 'The community leaderboard shows which tracks are dominating globally.',
  },
];

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20, flexShrink: 0 }}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

export default function LoginPage() {
  return (
    <div className="sp-page">

      {/* Navbar */}
      <nav className="sp-nav">
        <div className="sp-nav__inner">
          <div className="sp-nav__brand">
            <img src={logo} alt="TopVibe" className="sp-nav__logo" />
            <span className="sp-nav__name">TopVibe</span>
          </div>
          <div className="sp-nav__actions">
            <button className="sp-btn sp-btn--ghost" onClick={initiateLogin}>Log in</button>
            <button className="sp-btn sp-btn--primary" onClick={initiateLogin}>Sign up free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="sp-hero">
        <div className="sp-hero__content">
          <h1 className="sp-hero__title">
            Music discovers you<br />
            <span className="sp-hero__accent">faster here.</span>
          </h1>
          <p className="sp-hero__sub">
            Swipe through tracks, vote on bangers, and see what the world is listening to.
            Powered by your Spotify library.
          </p>
          <button className="sp-btn sp-btn--primary sp-btn--lg" onClick={initiateLogin}>
            <SpotifyIcon />
            Get started free
          </button>
          <p className="sp-hero__legal">Free forever · No credit card needed</p>
        </div>

        {/* Album art mosaic */}
        <div className="sp-mosaic" aria-hidden="true">
          {TILES.map((src, i) => (
            <div key={i} className="sp-mosaic__tile">
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="sp-how">
        <div className="sp-how__inner">
          <p className="sp-how__label">How it works</p>
          <h2 className="sp-how__title">Three steps to your vibe</h2>
          <div className="sp-how__steps">
            {HOW.map((h) => (
              <div key={h.step} className="sp-step">
                <span className="sp-step__num">{h.step}</span>
                <h3 className="sp-step__title">{h.title}</h3>
                <p className="sp-step__desc">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlight */}
      <section className="sp-feature">
        <div className="sp-feature__inner">
          <div className="sp-feature__text">
            <p className="sp-how__label">Community leaderboard</p>
            <h2 className="sp-feature__title">See what everyone is vibing to</h2>
            <p className="sp-feature__desc">
              Every vote counts. Tracks with the most fire votes climb the global leaderboard — updated in real time. No curators, no algorithms. Just the crowd.
            </p>
            <button className="sp-btn sp-btn--outline" onClick={initiateLogin}>
              Check it out
            </button>
          </div>
          <div className="sp-feature__visual">
            <div className="sp-leaderboard-mock">
              {['Espresso · Sabrina Carpenter', 'Die With A Smile · Lady Gaga', 'APT. · Rose & Bruno Mars', 'Birds Of A Feather · Billie Eilish'].map((t, i) => (
                <div key={t} className="sp-lb-row">
                  <span className="sp-lb-rank">#{i + 1}</span>
                  <span className="sp-lb-fire">🔥</span>
                  <span className="sp-lb-name">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="sp-bottom-cta">
        <h2 className="sp-bottom-cta__title">Start listening to the world.</h2>
        <button className="sp-btn sp-btn--primary sp-btn--lg" onClick={initiateLogin}>
          <SpotifyIcon />
          Continue with Spotify
        </button>
        <p className="sp-hero__legal">
          By continuing you agree to Spotify's{' '}
          <a href="https://www.spotify.com/legal/end-user-agreement/" target="_blank" rel="noreferrer">Terms</a>
          {' '}and{' '}
          <a href="https://www.spotify.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
        </p>
      </section>

      {/* Footer */}
      <footer className="sp-footer">
        <div className="sp-footer__inner">
          <span className="sp-footer__brand">TopVibe</span>
          <div className="sp-footer__links">
            <a href="https://justinhelbig96-web.github.io/topvibe-support/" target="_blank" rel="noreferrer">Support</a>
            <a href="https://justinhelbig96-web.github.io/topvibe-support/privacy.html" target="_blank" rel="noreferrer">Privacy</a>
          </div>
          <span className="sp-footer__copy">© 2025 TopVibe</span>
        </div>
      </footer>
    </div>
  );
}


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

