import { create } from 'zustand';

export interface Route {
  id: string;
  name: string;
  distance: number; // km
  elevation: number; // m
  difficulty: 'easy' | 'medium' | 'hard';
  terrain: 'asphalt' | 'trail' | 'mixed';
  bestTime: string;
  activeRunners: number;
  center: [number, number];
  waypoints: [number, number][];
}

const BARCELONA_CENTER: [number, number] = [41.3851, 2.1734];

const generateRandomWaypoints = (center: [number, number], radius: number, points: number = 20): [number, number][] => {
  const result: [number, number][] = [];
  let current = [...center];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    // slightly randomize the circle to make it look like a route
    const r = radius * (0.8 + Math.random() * 0.4);
    result.push([
      center[0] + Math.cos(angle) * r * 0.01,
      center[1] + Math.sin(angle) * r * 0.01
    ]);
  }
  // close the loop
  result.push(result[0]);
  return result;
};

export const mockRoutes: Route[] = [
  {
    id: 'r1',
    name: 'Gothic Quarter Loop',
    distance: 5.2,
    elevation: 45,
    difficulty: 'easy',
    terrain: 'asphalt',
    bestTime: '24:15',
    activeRunners: 12,
    center: [41.3833, 2.1764],
    waypoints: generateRandomWaypoints([41.3833, 2.1764], 1)
  },
  {
    id: 'r2',
    name: 'Montjuïc Climb',
    distance: 8.5,
    elevation: 180,
    difficulty: 'hard',
    terrain: 'mixed',
    bestTime: '42:30',
    activeRunners: 4,
    center: [41.3653, 2.1584],
    waypoints: generateRandomWaypoints([41.3653, 2.1584], 1.5)
  },
  {
    id: 'r3',
    name: 'Barceloneta Sprint',
    distance: 10.0,
    elevation: 10,
    difficulty: 'medium',
    terrain: 'asphalt',
    bestTime: '45:00',
    activeRunners: 28,
    center: [41.3809, 2.1893],
    waypoints: generateRandomWaypoints([41.3809, 2.1893], 2)
  },
  {
    id: 'r4',
    name: 'Gràcia Grid',
    distance: 6.8,
    elevation: 65,
    difficulty: 'medium',
    terrain: 'asphalt',
    bestTime: '32:10',
    activeRunners: 8,
    center: [41.4026, 2.1565],
    waypoints: generateRandomWaypoints([41.4026, 2.1565], 1.2)
  }
];

interface DataState {
  routes: Route[];
  runners: { id: string; lat: number; lng: number }[];
}

export const useDataStore = create<DataState>(() => ({
  routes: mockRoutes,
  runners: Array.from({ length: 15 }).map((_, i) => ({
    id: `runner-${i}`,
    lat: BARCELONA_CENTER[0] + (Math.random() - 0.5) * 0.05,
    lng: BARCELONA_CENTER[1] + (Math.random() - 0.5) * 0.05,
  }))
}));
