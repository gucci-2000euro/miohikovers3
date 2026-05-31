import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MapStyle {
  id: string;
  name: string;
  emoji: string;
  url: string;
  attribution: string;
  bg: string;    // colore di sfondo mentre i tile caricano
  isDark: boolean; // true = overlay bianchi, false = overlay scuri
}

export const MAP_STYLES: MapStyle[] = [
  {
    id: 'dark',
    name: 'Scuro',
    emoji: '🌑',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    bg: '#0a0a0a',
    isDark: true,
  },
  {
    id: 'standard',
    name: 'Standard',
    emoji: '🗺️',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    bg: '#e5e3df',
    isDark: false,
  },
  {
    id: 'light',
    name: 'Chiaro',
    emoji: '☀️',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap © CARTO',
    bg: '#f0efe9',
    isDark: false,
  },
  {
    id: 'satellite',
    name: 'Satellite',
    emoji: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    bg: '#1a2233',
    isDark: true,
  },
  {
    id: 'trail',
    name: 'Trail',
    emoji: '🌲',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors',
    bg: '#d6e8c0',
    isDark: false,
  },
];

interface MapState {
  styleId: string;
  setStyleId: (id: string) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      styleId: 'dark',
      setStyleId: (id) => set({ styleId: id }),
    }),
    { name: 'hiko-map-style' }
  )
);

export function getMapStyle(styleId: string): MapStyle {
  return MAP_STYLES.find(s => s.id === styleId) ?? MAP_STYLES[0];
}

/** Restituisce true se lo stile attivo ha sfondo scuro (overlay bianchi) */
export function useMapIsDark(): boolean {
  const styleId = useMapStore(s => s.styleId);
  return getMapStyle(styleId).isDark;
}

/**
 * Classi CSS per i pannelli overlay sulla mappa.
 * Su mappe scure → vetro bianco (glass-panel originale).
 * Su mappe chiare → vetro nero per garantire leggibilità del testo bianco.
 */
export function mapPanel(isDark: boolean): string {
  return isDark
    ? 'bg-white/5 backdrop-blur-md border border-white/10 shadow-lg'
    : 'bg-black/55 backdrop-blur-md border border-black/5 shadow-lg';
}
