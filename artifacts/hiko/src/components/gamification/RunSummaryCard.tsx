import { motion } from 'framer-motion';
import { ChallengeBadge } from './ChallengeBadge';

// Local types — field names match project stores exactly.
// Cazzaniga Samuele (UI/UX)

interface Run {
  id?: string;
  elapsedTime: number;    // seconds
  distance: number;       // km
  currentPace: number;    // seconds per km
}

interface Route {
  id: string;
  name: string;
}

interface Challenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardPoints: number;
  type: 'community' | 'personal';
}

// ─── Presentation helpers ─────────────────────────────────────────────────────

function fmtTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function fmtPace(sPerKm: number): string {
  if (!sPerKm || !isFinite(sPerKm)) return '—';
  return `${Math.floor(sPerKm / 60)}:${String(Math.floor(sPerKm % 60)).padStart(2, '0')} /km`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             run
// TIPO:             Run
// COSA MOSTRA:      durata, distanza, passo, velocità in griglia 2x2
// PASSA QUI:        Frontend 1 — dalla schermata corsa a fine run
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             route
// TIPO:             Route
// COSA MOSTRA:      nome percorso come titolo del riepilogo
// PASSA QUI:        Frontend 1 — il percorso appena completato
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             completedChallenges
// TIPO:             Array<{ challenge: Challenge; punteggio: number }>
// COSA MOSTRA:      lista badge sfide + totale punti
// COSA MOSTRA VUOTA:sezione nascosta (array vuoto = nessuna sezione)
// PASSA QUI:        Frontend 2 — le sfide completate in questa sessione
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             previousBestTime
// TIPO:             number | undefined
// COSA MOSTRA:      confronto record — verde se PB, grigio se no
// COSA MOSTRA VUOTA:sezione record non mostrata
// PASSA QUI:        Frontend 2 — il tempo migliore precedente su questo percorso
// ================================================================

export interface RunSummaryCardProps {
  run: Run;
  route: Route;
  completedChallenges: Array<{ challenge: Challenge; punteggio: number }>;
  previousBestTime?: number;
  onClose: () => void;
  onViewDetails?: () => void;
}

export function RunSummaryCard({
  run,
  route,
  completedChallenges,
  previousBestTime,
  onClose,
  onViewDetails,
}: RunSummaryCardProps) {
  const isNewRecord = previousBestTime != null && run.elapsedTime < previousBestTime;
  const totalPts = completedChallenges.reduce((s, c) => s + c.punteggio, 0);
  const velocity = run.elapsedTime > 0 ? (run.distance / run.elapsedTime) * 3600 : 0;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-hiko-deep border-t border-white/10 rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
      role="dialog"
      aria-label="Run summary"
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1 shrink-0">
        <div className="w-10 h-1 rounded-full bg-white/20" />
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto flex-1 px-6 pb-10">
        {/* Header */}
        <div className="text-center py-4">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Run Completed</p>
          <h2 className="text-xl font-bold text-white">{route.name}</h2>
        </div>

        {/* Stats grid 2×2 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatBox label="Time"     value={fmtTime(run.elapsedTime)} />
          <StatBox label="Distance" value={`${run.distance.toFixed(2)} km`} />
          <StatBox label="Avg Pace" value={fmtPace(run.currentPace)} />
          <StatBox label="Speed"    value={`${velocity.toFixed(1)} km/h`} />
        </div>

        {/* Record comparison */}
        {previousBestTime != null && (
          <div className={`rounded-2xl p-3 mb-5 text-center text-sm font-medium ${isNewRecord ? 'bg-hiko-primary/10 text-hiko-primary border border-hiko-primary/30' : 'glass-panel text-white/60'}`}>
            {isNewRecord
              ? `🏆 New Record! Saved ${fmtTime(previousBestTime - run.elapsedTime)}`
              : `Best time: ${fmtTime(previousBestTime)} — ${fmtTime(run.elapsedTime - previousBestTime)} off PB`}
          </div>
        )}

        {/* Completed challenges */}
        {completedChallenges.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-white/70 mb-2">
              Challenges complete · <span className="text-hiko-primary">+{totalPts} pts</span>
            </h3>
            <div className="flex flex-col gap-2">
              {completedChallenges.map(({ challenge }) => (
                <ChallengeBadge
                  key={challenge.id}
                  challenge={challenge}
                  userChallenge={{ state: 'completed', progress: 100, target: 100, unit: '' }}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="w-full py-3.5 rounded-2xl bg-hiko-primary text-hiko-deep font-bold hover:bg-hiko-primary/90 active:scale-95 transition-all duration-200"
            >
              View Details
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl glass-panel text-white/80 font-semibold hover:bg-white/10 active:scale-95 transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── StatBox sub-component ────────────────────────────────────────────────────

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-3 text-center">
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold text-white leading-tight">{value}</p>
    </div>
  );
}
