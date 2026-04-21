import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: number;
  title: string;
  totalKm: number;
  totalRuns: number;
  longestRun: number;
  currentStreak: number;
  weeklyAvg: number;
}

interface AuthState {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, name) => set({
        user: {
          id: 'u1',
          name: name || 'Mara',
          email,
          avatar: 'https://i.pravatar.cc/150?u=u1',
          level: 12,
          title: 'Pathfinder',
          totalKm: 428.5,
          totalRuns: 64,
          longestRun: 21.1,
          currentStreak: 5,
          weeklyAvg: 24.5
        }
      }),
      logout: () => set({ user: null }),
      updateProfile: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null }))
    }),
    { name: 'hiko-auth' }
  )
);
