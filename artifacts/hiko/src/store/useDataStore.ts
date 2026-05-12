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

interface DataState {
  routes: Route[];
  runners: { id: string; lat: number; lng: number }[];
}

// TODO [BE]: popolare routes dall'API — GET /api/routes (lista percorsi dal DB PostGIS)
// TODO [FE1]: popolare runners con le posizioni GPS live via Supabase Realtime
export const useDataStore = create<DataState>(() => ({
  routes: [],
  runners: [],
}));
