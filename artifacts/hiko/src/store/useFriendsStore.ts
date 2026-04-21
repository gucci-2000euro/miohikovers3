import { create } from 'zustand';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  weeklyKm: number;
  mutualFriends?: number;
  status: 'friend' | 'request' | 'suggested' | 'pending';
}

const mockFriends: Friend[] = [
  {
    id: 'u2',
    name: 'Alex Rivers',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    weeklyKm: 34.5,
    status: 'friend'
  },
  {
    id: 'u3',
    name: 'Elena Trail',
    avatar: 'https://i.pravatar.cc/150?u=u3',
    weeklyKm: 42.1,
    status: 'friend'
  },
  {
    id: 'u4',
    name: 'David Urban',
    avatar: 'https://i.pravatar.cc/150?u=u4',
    weeklyKm: 28.0,
    status: 'request',
    mutualFriends: 3
  },
  {
    id: 'u5',
    name: 'Sarah Sprint',
    avatar: 'https://i.pravatar.cc/150?u=u5',
    weeklyKm: 15.2,
    status: 'suggested',
    mutualFriends: 12
  }
];

interface FriendsState {
  friends: Friend[];
  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  sendRequest: (id: string) => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: mockFriends,
  acceptRequest: (id) => set((state) => ({
    friends: state.friends.map(f => f.id === id ? { ...f, status: 'friend' } : f)
  })),
  rejectRequest: (id) => set((state) => ({
    friends: state.friends.filter(f => f.id !== id)
  })),
  sendRequest: (id) => set((state) => ({
    friends: state.friends.map(f => f.id === id ? { ...f, status: 'pending' } : f)
  }))
}));
