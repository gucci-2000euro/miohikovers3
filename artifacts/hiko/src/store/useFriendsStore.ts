import { create } from 'zustand';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  weeklyKm: number;
  mutualFriends?: number;
  status: 'friend' | 'request' | 'suggested' | 'pending';
}

interface FriendsState {
  friends: Friend[];
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  sendRequest: (id: string) => void;
}

// TODO [BE]: popolare friends dall'API — GET /api/friends?userId=... (amici, richieste, suggeriti)
// TODO [BE]: implementare endpoint accept/reject/send — POST /api/friends/:action
export const useFriendsStore = create<FriendsState>((set) => ({
  friends: [],
  acceptRequest: (id) => set((state) => ({
    friends: state.friends.map(f => f.id === id ? { ...f, status: 'friend' } : f),
  })),
  rejectRequest: (id) => set((state) => ({
    friends: state.friends.filter(f => f.id !== id),
  })),
  sendRequest: (id) => set((state) => ({
    friends: state.friends.map(f => f.id === id ? { ...f, status: 'pending' } : f),
  })),
}));
