import { Activity, Calendar, TrendingUp, Zap, Timer, Flame, Shield } from 'lucide-react';
import { StatCard } from './StatCard';

// Local type — field names match useAuthStore User exactly.
// Cazzaniga Samuele (UI/UX)
interface Profile {
  totalKm: number;
  totalRuns: number;
  longestRun: number;
  weeklyAvg: number;
  avgPace: number;     // seconds per km
  weeklyCalories: number;
  totalCalories: number;
  level: number;
}

function formatPace(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatCalories(n: number): string {
  if (!n) return '0';
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-panel rounded-2xl p-4 animate-pulse">
          <div className="h-3 w-12 bg-white/10 rounded mb-3" />
          <div className="h-8 w-16 bg-white/10 rounded mb-2" />
          <div className="h-2 w-20 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             profile
// TIPO:             Profile (field names da useAuthStore)
// COSA MOSTRA:      4 card: km totali, corse, punteggio, livello
// COSA MOSTRA VUOTA:4 skeleton card animate
// PASSA QUI:        Frontend 2 — dalla schermata profilo
// ================================================================

export interface StatsGridProps {
  profile?: Profile;
  className?: string;
}

export function StatsGrid({ profile, className = '' }: StatsGridProps) {
  if (!profile) return <GridSkeleton />;

  const cards = [
    {
      label: 'Total Distance',
      value: profile.totalKm.toFixed(1),
      unit: 'km',
      icon: <Activity size={14} />,
    },
    {
      label: 'Total Runs',
      value: profile.totalRuns,
      unit: 'runs',
      icon: <Calendar size={14} />,
    },
    {
      label: 'Longest Run',
      value: profile.longestRun.toFixed(1),
      unit: 'km',
      icon: <TrendingUp size={14} />,
    },
    {
      label: 'Weekly Avg',
      value: profile.weeklyAvg.toFixed(1),
      unit: 'km',
      icon: <Zap size={14} />,
    },
    {
      label: 'Avg Pace',
      value: formatPace(profile.avgPace),
      unit: 'min/km',
      icon: <Timer size={14} />,
    },
    {
      label: 'Calories / Week',
      value: formatCalories(profile.weeklyCalories),
      unit: 'kcal',
      icon: <Flame size={14} />,
      accent: true,
    },
    {
      label: 'Level',
      value: profile.level,
      icon: <Shield size={14} />,
    },
  ];

  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className}`}>
      {cards.map((c) => (
        <StatCard
          key={c.label}
          label={c.label}
          value={c.value}
          unit={c.unit}
          icon={c.icon}
          accent={c.accent}
        />
      ))}
    </div>
  );
}
