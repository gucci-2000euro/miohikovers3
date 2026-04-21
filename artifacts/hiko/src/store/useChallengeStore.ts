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

const mockChallenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Weekend Warrior',
    description: 'Run 15km total over the weekend.',
    difficulty: 'medium',
    rewardPoints: 250,
    state: 'active',
    type: 'community',
    progress: 8.5,
    target: 15,
    unit: 'km'
  },
  {
    id: 'c2',
    title: 'Speed Demon',
    description: 'Maintain a sub 5:00 pace for 3km.',
    difficulty: 'hard',
    rewardPoints: 500,
    state: 'available',
    type: 'personal',
    progress: 0,
    target: 3,
    unit: 'km'
  },
  {
    id: 'c3',
    title: 'Early Bird',
    description: 'Complete 3 runs before 7 AM.',
    difficulty: 'easy',
    rewardPoints: 150,
    state: 'active',
    type: 'personal',
    progress: 2,
    target: 3,
    unit: 'runs'
  },
  {
    id: 'c4',
    title: 'Marathon Month',
    description: 'Run a total of 42.2km this month.',
    difficulty: 'hard',
    rewardPoints: 1000,
    state: 'completed',
    type: 'community',
    progress: 42.2,
    target: 42.2,
    unit: 'km'
  }
];

interface ChallengeState {
  challenges: Challenge[];
  totalPoints: number;
}

export const useChallengeStore = create<ChallengeState>(() => ({
  challenges: mockChallenges,
  totalPoints: 3450
}));
