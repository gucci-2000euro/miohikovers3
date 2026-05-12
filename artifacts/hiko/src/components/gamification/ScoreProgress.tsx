import { Progress } from '@/components/ui/progress';
import { LevelBadge } from './LevelBadge';

// ─── Presentation logic — pure math, not business logic ──────────────────────
// Cazzaniga Samuele (UI/UX)
// soglia(N) = 100 * N * (N - 1) / 2

function getLevelThresholds(livello: number, punteggio: number): {
  current: number;
  next: number;
  progress: number;
} {
  const current = Math.round(100 * livello * (livello - 1) / 2);
  const next    = Math.round(100 * (livello + 1) * livello / 2);
  const range   = next - current;
  const progress = range > 0
    ? Math.min(100, Math.max(0, Math.round(((punteggio - current) / range) * 100)))
    : 100;
  return { current, next, progress };
}

// ─── Props ────────────────────────────────────────────────────────────────────

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             punteggio_totale
// TIPO:             number
// COSA MOSTRA:      barra di avanzamento verso il livello successivo
// COSA MOSTRA VUOTA:barra a 0%
// PASSA QUI:        Frontend 2 — dallo store utente / profilo
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             livello
// TIPO:             number
// COSA MOSTRA:      LevelBadge sm + "Level N" + soglia prossimo livello
// COSA MOSTRA VUOTA:livello 1 come default
// PASSA QUI:        Frontend 2 — dallo store utente / profilo
// ================================================================

export interface ScoreProgressProps {
  punteggio_totale?: number;
  livello?: number;
  className?: string;
}

export function ScoreProgress({ punteggio_totale = 0, livello = 1, className = '' }: ScoreProgressProps) {
  const { current, next, progress } = getLevelThresholds(livello, punteggio_totale);
  const pointsLeft = Math.max(0, next - punteggio_totale);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-3">
        <LevelBadge livello={livello} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm font-semibold text-white">Level {livello}</span>
            <span className="text-xs text-white/40">{punteggio_totale} / {next} pts</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10 [&>[data-progress]]:bg-hiko-primary" />
        </div>
        <LevelBadge livello={livello + 1} size="sm" />
      </div>
      <p className="text-xs text-white/40 text-center">
        {pointsLeft > 0
          ? `${pointsLeft} pts to level ${livello + 1}`
          : 'Ready to level up!'}
      </p>
    </div>
  );
}
