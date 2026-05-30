import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import CallbackPage from "./pages/CallbackPage";
import FeedPage from "./pages/FeedPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/Layout";
import { getMyProfile, getTopTracks } from "./services/spotify";
import { contributeUserTracks, isUserBanned, registerUser } from "./services/firestore";
import "./styles/app.css";

function ProtectedRoute({ children }) {
  const { token, tokenExpiry, profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const valid = !!token && Date.now() < (tokenExpiry || 0);
  const [banned, setBanned] = React.useState(false);

  React.useEffect(() => {
    if (valid && profile?.id) {
      isUserBanned(profile.id).then(b => {
        if (b) { logout(); navigate('/', { replace: true }); }
        setBanned(b);
      }).catch(() => {});
    }
  }, [profile?.id, valid]);

  if (!valid) return <Navigate to="/" replace />;
  if (banned) return null;
  return children;
}

function ProfileRecovery() {
  const { token, tokenExpiry, profile, setProfile } = useAuthStore();
  useEffect(() => {
    const valid = !!token && Date.now() < (tokenExpiry || 0);
    if (valid && !profile?.id) {
      getMyProfile(token).then(setProfile).catch(() => {});
    }
  }, [token, profile?.id]);
  return null;
}

function TrackContributor() {
  const { token, profile } = useAuthStore();
  useEffect(() => {
    if (!token || !profile?.id) return;
    // Register user in DB on every login (creates entry if not exists)
    registerUser(profile).catch(e => console.error('registerUser failed:', e));
    // Contribute this user's top tracks to the shared pool
    Promise.all([
      getTopTracks(token, 'short_term', 30),
      getTopTracks(token, 'medium_term', 30),
    ]).then(([short, medium]) => {
      const shortItems = Array.isArray(short?.items) ? short.items : [];
      const mediumItems = Array.isArray(medium?.items) ? medium.items : [];
      const seen = new Set();
      const tracks = [...shortItems, ...mediumItems]
        .filter(t => { if (!t?.id || seen.has(t.id)) return false; seen.add(t.id); return true; });
      console.log('TrackContributor: contributing', tracks.length, 'tracks for', profile.id);
      return contributeUserTracks(profile.id, tracks);
    }).catch(e => console.error('contributeUserTracks failed:', e));
  }, [token, profile?.id]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileRecovery />
      <TrackContributor />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="feed" element={<FeedPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
