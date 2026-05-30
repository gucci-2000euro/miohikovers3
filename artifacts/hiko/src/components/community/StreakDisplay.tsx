import type { Streak } from '@/types/index';
import { motion } from 'framer-motion';

interface Props {
  streak: Streak;
  compact?: boolean;
}

const MILESTONES = [7, 30, 100, 365];

function nextMilestone(current: number): number {
  return MILESTONES.find((m) => m > current) ?? current;
}

export function StreakDisplay({ streak, compact = false }: Props) {
  const next = nextMilestone(streak.current_length);
  const progress = Math.min((streak.current_length / next) * 100, 100);
  const freezes = Array.from({ length: 3 }, (_, i) => i < streak.freezes_available);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-hiko-primary font-bold text-lg">{streak.current_length}</span>
        <span className="text-white/50 text-xs">🔥</span>
        <div className="flex gap-0.5">
          {freezes.map((has, i) => (
            <span key={i} className={has ? 'opacity-100' : 'opacity-30'}>🧊</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white/50 text-xs mb-1">Streak attuale</p>
          <div className="flex items-baseline gap-2">
            <motion.span
              key={streak.current_length}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-5xl font-black text-hiko-primary"
            >
              {streak.current_length}
            </motion.span>
            <span className="text-white/50 text-sm">giorni 🔥</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/50 text-xs mb-1">Record</p>
          <p className="text-white font-bold text-lg">{streak.longest_length} 🏆</p>
        </div>
      </div>

      {/* Freeze badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/50 text-xs">Freeze:</span>
        {freezes.map((has, i) => (
          <span key={i} className={`text-xl ${has ? '' : 'grayscale opacity-30'}`}>🧊</span>
        ))}
      </div>

      {/* Progress verso prossima milestone */}
      <div>
        <div className="flex justify-between text-xs text-white/40 mb-1">
          <span>{streak.current_length} giorni</span>
          <span>Prossimo obiettivo: {next} 🎯</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-hiko-primary rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
