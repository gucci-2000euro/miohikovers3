import { Activity, Mountain, Users, Timer, CheckCircle2 } from 'lucide-react';

// ─── Local type (field names match useDataStore.Route exactly) ────────────────
// Cazzaniga Samuele (UI/UX) — structural typing: any Route from the store fits.

interface Route {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  difficulty: 'easy' | 'medium' | 'hard';
  terrain: 'asphalt' | 'trail' | 'mixed';
  bestTime?: string;
  activeRunners?: number;
}

// ─── Difficulty config (visual only) ─────────────────────────────────────────

const DIFFICULTY: Record<Route['difficulty'], { label: string; className: string }> = {
  easy:   { label: 'Easy',   className: 'bg-hiko-primary/20 text-hiko-primary' },
  medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-500' },
  hard:   { label: 'Hard',   className: 'bg-red-500/20 text-red-500' },
};

const TERRAIN: Record<Route['terrain'], string> = {
  asphalt: 'Asphalt',
  trail:   'Trail',
  mixed:   'Mixed',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RouteCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-panel rounded-2xl p-4 animate-pulse ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="h-5 w-2/3 bg-white/10 rounded-md" />
        <div className="h-5 w-16 bg-white/10 rounded-md" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-7 w-20 bg-white/10 rounded-full" />
        <div className="h-7 w-20 bg-white/10 rounded-full" />
        <div className="h-7 w-20 bg-white/10 rounded-full" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-white/10 rounded-md" />
        <div className="h-4 w-16 bg-white/10 rounded-md" />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             route
// TIPO:             Route
// COSA MOSTRA:      nome, difficoltà, distanza, dislivello, terreno
// COSA MOSTRA VUOTA:skeleton animato (animate-pulse)
// PASSA QUI:        Frontend 2 — dalla lista percorsi
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             onClick
// TIPO:             (() => void) | undefined
// COSA MOSTRA:      cursore pointer, ring di focus, hover luminoso
// COSA MOSTRA VUOTA:card non cliccabile, nessun effetto hover
// PASSA QUI:        Frontend 2 — gestisce la navigazione al dettaglio
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             isCompleted
// TIPO:             boolean | undefined
// COSA MOSTRA:      checkmark verde absolute top-2 right-2 + bordo verde
// COSA MOSTRA VUOTA:nessun indicatore di completamento
// PASSA QUI:        Frontend 2 — confronta l'id con le corse salvate
// ================================================================

export interface RouteCardProps {
  route?: Route;
  onClick?: () => void;
  isCompleted?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RouteCard({ route, onClick, isCompleted = false, className = '' }: RouteCardProps) {
  if (!route) return <RouteCardSkeleton className={className} />;

  const diff = DIFFICULTY[route.difficulty];
  const terrain = TERRAIN[route.terrain] ?? route.terrain;
  const hasAction = !!onClick;

  return (
    <div
      role={hasAction ? 'button' : 'article'}
      tabIndex={hasAction ? 0 : undefined}
      onClick={onClick}
      onKeyDown={hasAction ? (e) => { if (e.key === 'Enter') onClick?.(); } : undefined}
      className={[
        'relative glass-panel rounded-2xl p-4 transition-all duration-200',
        hasAction && 'cursor-pointer hover:bg-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-hiko-primary/50',
        isCompleted ? 'border-hiko-primary/40' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Completed checkmark */}
      {isCompleted && (
        <span className="absolute top-3 right-3 text-hiko-primary" aria-label="Completato">
          <CheckCircle2 size={18} className="fill-hiko-primary/20" />
        </span>
      )}

      {/* Header: name + difficulty badge */}
      <div className="flex justify-between items-start gap-2 mb-4">
        <h3 className="text-base font-bold text-white leading-tight pr-6">
          {route.name || '—'}
        </h3>
        <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider ${diff.className}`}>
          {diff.label}
        </span>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Pill icon={<Activity size={12} />} value={`${route.distance ?? '—'} km`} />
        <Pill icon={<Mountain size={12} />} value={`+${route.elevation ?? '—'} m`} />
        <Pill icon={<Users size={12} />}    value={terrain} />
      </div>

      {/* Footer: best time + active runners */}
      <div className="flex justify-between items-center text-xs text-white/50">
        <span>{terrain}</span>
        <div className="flex items-center gap-3">
          {route.bestTime && (
            <span className="flex items-center gap-1">
              <Timer size={11} /> {route.bestTime}
            </span>
          )}
          {(route.activeRunners ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} /> {route.activeRunners}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pill sub-component ───────────────────────────────────────────────────────

function Pill({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-white/70 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
      {icon}
      {value}
    </span>
  );
}
