import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMyProfile } from '../services/spotify';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { setToken, setProfile } = useAuthStore();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const expiresIn = parseInt(params.get('expires_in') || '3600', 10);

    if (token) {
      setToken(token, expiresIn);
      getMyProfile(token)
        .then(profile => {
          setProfile(profile);
          navigate('/feed', { replace: true });
        })
        .catch(() => navigate('/feed', { replace: true }));
    } else {
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ color: '#1DB954', fontSize: '1.2rem' }}>Connecting to Spotify...</div>
    </div>
  );
}
