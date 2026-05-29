import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { exchangeCodeForToken } from '../config/spotify';
import { getMyProfile } from '../services/spotify';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { setToken, setProfile } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      navigate('/', { replace: true });
      return;
    }

    exchangeCodeForToken(code)
      .then(({ access_token, expires_in }) => {
        setToken(access_token, expires_in ?? 3600);
        return getMyProfile(access_token);
      })
      .then(profile => {
        setProfile(profile);
        navigate('/feed', { replace: true });
      })
      .catch(() => navigate('/', { replace: true }));
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ color: '#1DB954', fontSize: '1.2rem' }}>Connecting to Spotify...</div>
    </div>
  );
}
