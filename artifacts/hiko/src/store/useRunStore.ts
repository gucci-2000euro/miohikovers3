import { create } from 'zustand';

interface RouteWaypoints {
  lat: number;
  lng: number;
}

interface RunState {
  activeRouteId: string | null;
  isTracking: boolean;
  startTime: number | null;
  elapsedTime: number; // in seconds
  distance: number; // in km
  currentPace: number; // seconds per km
  waypoints: RouteWaypoints[];
  
  startRun: (routeId: string) => void;
  endRun: () => void;
  tick: () => void;
  updateMetrics: (distanceDelta: number) => void;
}

export const useRunStore = create<RunState>((set, get) => ({
  activeRouteId: null,
  isTracking: false,
  startTime: null,
  elapsedTime: 0,
  distance: 0,
  currentPace: 0,
  waypoints: [],

  startRun: (routeId) => set({
    activeRouteId: routeId,
    isTracking: true,
    startTime: Date.now(),
    elapsedTime: 0,
    distance: 0,
    currentPace: 0,
    waypoints: []
  }),

  endRun: () => set({
    activeRouteId: null,
    isTracking: false,
    startTime: null
  }),

  tick: () => {
    const { isTracking, distance, elapsedTime } = get();
    if (!isTracking) return;
    
    set({ elapsedTime: elapsedTime + 1 });
    
    // update pace randomly to simulate
    if (elapsedTime > 0 && distance > 0) {
      const pace = elapsedTime / distance; // seconds per km
      set({ currentPace: pace });
    }
  },

  updateMetrics: (distanceDelta) => {
    const { distance } = get();
    set({ distance: distance + distanceDelta });
  }
}));
