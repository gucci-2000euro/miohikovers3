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
  avgPace: number;       // seconds per km
  weeklyCalories: number;
  totalCalories: number;
}

interface AuthState {
  user: User | null;
  authModalOpen: boolean;
  authModalReason: string | null;
  pendingAction: (() => void) | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  openAuthModal: (reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (reason: string, action: () => void) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authModalOpen: false,
      authModalReason: null,
      pendingAction: null,
      login: (email, name) => {
        // TODO [BE]: dopo il login, chiamare GET /api/profile?userId=... per caricare
        // level, title, avatar e tutte le statistiche reali dell'utente
        set({
          user: {
            id: 'u1',
            name: name || '',
            email,
            avatar: '',        // TODO [BE]: URL avatar dal profilo utente
            level: 1,          // TODO [BE]: livello reale calcolato dal punteggio
            title: '',         // TODO [BE]: titolo reale in base al livello
            totalKm: 0,
            totalRuns: 0,
            longestRun: 0,
            currentStreak: 0,
            weeklyAvg: 0,
            avgPace: 0,
            weeklyCalories: 0,
            totalCalories: 0,
          },
          authModalOpen: false,
          authModalReason: null
        });
        const pending = get().pendingAction;
        if (pending) {
          set({ pendingAction: null });
          setTimeout(pending, 50);
        }
      },
      logout: () => set({ user: null }),
      updateProfile: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
      openAuthModal: (reason, onSuccess) => set({
        authModalOpen: true,
        authModalReason: reason ?? null,
        pendingAction: onSuccess ?? null
      }),
      closeAuthModal: () => set({ authModalOpen: false, authModalReason: null, pendingAction: null }),
      requireAuth: (reason, action) => {
        if (get().user) {
          action();
        } else {
          set({ authModalOpen: true, authModalReason: reason, pendingAction: action });
        }
      }
    }),
    {
      name: 'hiko-auth-v2',
      partialize: (state) => ({ user: state.user })
    }
  )
);
