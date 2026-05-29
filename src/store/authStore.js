import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      tokenExpiry: null,
      profile: null,

      setToken: (token, expiresIn) => {
        const expiry = Date.now() + expiresIn * 1000;
        set({ token, tokenExpiry: expiry });
      },

      setProfile: (profile) => set({ profile }),

      logout: () => set({ token: null, tokenExpiry: null, profile: null }),

      isValid: () => {
        const { token, tokenExpiry } = useAuthStore.getState();
        return !!token && Date.now() < (tokenExpiry || 0);
      },
    }),
    { name: 'topvibe-auth' }
  )
);
