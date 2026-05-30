import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

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
  avgPace: number;
  weeklyCalories: number;
  totalCalories: number;
}

interface AuthState {
  user: User | null;
  authModalOpen: boolean;
  authModalReason: string | null;
  pendingAction: (() => void) | null;
  login: (email: string, password: string, name?: string) => Promise<string | null>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  openAuthModal: (reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (reason: string, action: () => void) => void;
}

function buildUser(id: string, email: string, name: string): User {
  return {
    id,
    name,
    email,
    avatar: '',
    level: 1,
    title: '',
    totalKm: 0,
    totalRuns: 0,
    longestRun: 0,
    currentStreak: 0,
    weeklyAvg: 0,
    avgPace: 0,
    weeklyCalories: 0,
    totalCalories: 0,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      authModalOpen: false,
      authModalReason: null,
      pendingAction: null,

      init: async () => {
        // Pulisce sessioni legacy con id fittizi (es. 'u1')
        const current = get().user;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (current && !uuidRegex.test(current.id)) {
          set({ user: null });
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const name = u.user_metadata?.name ?? u.email?.split('@')[0] ?? '';
          set({ user: buildUser(u.id, u.email ?? '', name) });
        }
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            const u = session.user;
            const name = u.user_metadata?.name ?? u.email?.split('@')[0] ?? '';
            set({ user: buildUser(u.id, u.email ?? '', name) });
          } else {
            set({ user: null });
          }
        });
      },

      login: async (email, password, name) => {
        if (name) {
          // Signup
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
          });
          if (error) return error.message;
          if (data.user) {
            set({
              user: buildUser(data.user.id, email, name),
              authModalOpen: false,
              authModalReason: null,
            });
            const pending = get().pendingAction;
            if (pending) { set({ pendingAction: null }); setTimeout(pending, 50); }
          }
          return null;
        }
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return error.message;
        if (data.user) {
          const displayName = data.user.user_metadata?.name ?? email.split('@')[0];
          set({
            user: buildUser(data.user.id, email, displayName),
            authModalOpen: false,
            authModalReason: null,
          });
          const pending = get().pendingAction;
          if (pending) { set({ pendingAction: null }); setTimeout(pending, 50); }
        }
        return null;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },

      updateProfile: (data) =>
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),

      openAuthModal: (reason, onSuccess) =>
        set({ authModalOpen: true, authModalReason: reason ?? null, pendingAction: onSuccess ?? null }),

      closeAuthModal: () =>
        set({ authModalOpen: false, authModalReason: null, pendingAction: null }),

      requireAuth: (reason, action) => {
        if (get().user) {
          action();
        } else {
          set({ authModalOpen: true, authModalReason: reason, pendingAction: action });
        }
      },
    }),
    {
      name: 'hiko-auth-v2',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
