import { create } from 'zustand';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardPoints: number;
  state: 'active' | 'completed' | 'available';
  type: 'community' | 'personal';
  progress: number;
  target: number;
  unit: string;
}

interface ChallengeState {
  challenges: Challenge[];
  totalPoints: number;
}

// TODO [BE]: popolare challenges dall'API — GET /api/challenges?userId=...
// TODO [BE]: calcolare totalPoints sommando rewardPoints delle sfide completed dell'utente
export const useChallengeStore = create<ChallengeState>(() => ({
  challenges: [],
  totalPoints: 0,
}));
