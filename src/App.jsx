import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import CallbackPage from "./pages/CallbackPage";
import FeedPage from "./pages/FeedPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/Layout";
import { getTopTracks } from "./services/spotify";
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

function TrackContributor() {
  const { token, profile } = useAuthStore();
  useEffect(() => {
    if (!token || !profile?.id) return;
    // Register user in DB on every login (creates entry if not exists)
    registerUser(profile).catch(() => {});
    // Contribute this user's top tracks to the shared pool
    Promise.all([
      getTopTracks(token, 'short_term', 30),
      getTopTracks(token, 'medium_term', 30),
    ]).then(([short, medium]) => {
      const seen = new Set();
      const tracks = [...(short.items || []), ...(medium.items || [])]
        .filter(t => { if (!t?.id || seen.has(t.id)) return false; seen.add(t.id); return true; });
      return contributeUserTracks(profile.id, tracks);
    }).catch(() => {});
  }, [token, profile?.id]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
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
