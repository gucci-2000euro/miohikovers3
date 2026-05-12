import { Plus, Clock, Play, CheckCircle2, Star } from 'lucide-react';

// Local types — field names match useChallengeStore exactly.
// Cazzaniga Samuele (UI/UX)

interface Challenge {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewardPoints: number;
  type: 'community' | 'personal';
}

interface UserChallenge {
  state: 'active' | 'completed' | 'available';
  progress: number;
  target: number;
  unit: string;
}

// ─── State config ─────────────────────────────────────────────────────────────

type StateKey = 'available' | 'active' | 'completed' | 'none';

const STATE_CONFIG: Record<StateKey, {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: React.ReactNode;
}> = {
  none: {
    label: 'Accept',
    bgClass: 'bg-white/5',
    textClass: 'text-white/60',
    borderClass: 'border-white/10',
    icon: <Plus size={14} />,
  },
  available: {
    label: 'Accept',
    bgClass: 'bg-white/5',
    textClass: 'text-white/60',
    borderClass: 'border-white/10',
    icon: <Plus size={14} />,
  },
  active: {
    label: 'In progress',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500/30',
    icon: <Play size={14} />,
  },
  completed: {
    label: 'Completed',
    bgClass: 'bg-hiko-primary/10',
    textClass: 'text-hiko-primary',
    borderClass: 'border-hiko-primary/30',
    icon: <CheckCircle2 size={14} />,
  },
};

const DIFFICULTY_STARS: Record<Challenge['difficulty'], string> = {
  easy:   '★★☆☆☆',
  medium: '★★★☆☆',
  hard:   '★★★★★',
};

// ─── Props ────────────────────────────────────────────────────────────────────

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             challenge
// TIPO:             Challenge
// COSA MOSTRA:      titolo sfida, difficoltà, punti, stato
// COSA MOSTRA VUOTA:badge grigio "Challenge not available"
// PASSA QUI:        Frontend 2 — dalla lista sfide
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             userChallenge
// TIPO:             UserChallenge | undefined
// COSA MOSTRA:      grigio=non accettata, arancione=in corso, verde=completata
// COSA MOSTRA VUOTA:badge grigio "Accept"
// PASSA QUI:        Frontend 2 — le sfide attive/completate dell'utente
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             onAction
// TIPO:             (() => void) | undefined
// COSA MOSTRA:      bottone cliccabile (Accept / abandon)
// COSA MOSTRA VUOTA:nessun bottone — solo badge informativo
// PASSA QUI:        Frontend 2 — gestisce la logica di accettazione
// ================================================================

export interface ChallengeBadgeProps {
  challenge?: Challenge;
  userChallenge?: UserChallenge;
  onAction?: () => void;
  size?: 'sm' | 'md';
  showProgress?: boolean;
  className?: string;
}

export function ChallengeBadge({
  challenge,
  userChallenge,
  onAction,
  size = 'md',
  showProgress = false,
  className = '',
}: ChallengeBadgeProps) {
  if (!challenge) {
    return (
      <div className={`glass-panel rounded-2xl p-3 ${className}`}>
        <p className="text-xs text-white/30">Challenge not available</p>
      </div>
    );
  }

  const stateKey: StateKey = userChallenge?.state ?? 'none';
  const cfg = STATE_CONFIG[stateKey];
  const isSmall = size === 'sm';

  const progressPct =
    userChallenge && userChallenge.target > 0
      ? Math.min(100, Math.round((userChallenge.progress / userChallenge.target) * 100))
      : 0;

  return (
    <div className={[
      `rounded-2xl border ${cfg.bgClass} ${cfg.borderClass}`,
      isSmall ? 'p-3' : 'p-4',
      className,
    ].join(' ')}>
      {/* Top row: icon + label + pts */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className={`flex items-center gap-1.5 ${cfg.textClass}`}>
          {cfg.icon}
          <span className={`font-semibold ${isSmall ? 'text-xs' : 'text-sm'}`}>{cfg.label}</span>
        </div>
        <div className={`flex items-center gap-0.5 font-bold ${isSmall ? 'text-xs' : 'text-sm'} text-hiko-primary`}>
          <Star size={isSmall ? 10 : 12} className="fill-hiko-primary" />
          +{challenge.rewardPoints} pts
        </div>
      </div>

      {/* Title */}
      <p className={`font-bold text-white leading-snug ${isSmall ? 'text-xs' : 'text-sm'} mb-1`}>
        {challenge.title}
      </p>

      {/* Difficulty */}
      <p className="text-[10px] text-yellow-400 tracking-widest mb-2">
        {DIFFICULTY_STARS[challenge.difficulty]}
      </p>

      {/* Progress bar (active only) */}
      {showProgress && userChallenge && userChallenge.state === 'active' && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-white/40 mb-1">
            <span>{userChallenge.progress} {userChallenge.unit}</span>
            <span>{userChallenge.target} {userChallenge.unit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-orange-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      {onAction && userChallenge?.state !== 'completed' && (
        <button
          onClick={onAction}
          className={`mt-1 w-full py-1.5 rounded-xl text-xs font-semibold transition-colors ${cfg.bgClass} ${cfg.textClass} border ${cfg.borderClass} hover:brightness-125`}
        >
          {stateKey === 'active' ? 'Abandon' : 'Accept challenge'}
        </button>
      )}
    </div>
  );
}
