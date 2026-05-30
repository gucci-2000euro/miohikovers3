import type { CommunityChallenge, ChallengeProgress } from '@/types/index';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users } from 'lucide-react';
import { differenceInHours, differenceInDays } from 'date-fns';

interface Props {
  challenge: CommunityChallenge;
  progress: ChallengeProgress[];
}

function formatCountdown(scadenza: string): string {
  const hours = differenceInHours(new Date(scadenza), new Date());
  if (hours < 24) return `${hours}h rimaste`;
  const days = differenceInDays(new Date(scadenza), new Date());
  return `${days}g rimasti`;
}

export function CommunityChallengeBanner({ challenge, progress }: Props) {
  const total = progress.length;
  const completed = progress.filter((p) => p.completata).length;
  const aggregated = progress.reduce((sum, p) => sum + p.valore_attuale, 0);
  const pct = Math.min((aggregated / challenge.obiettivo_valore) * 100, 100);

  const leader = challenge.tipo === 'competitiva'
    ? [...progress].sort((a, b) => b.valore_attuale - a.valore_attuale)[0]
    : null;

  const unitLabel = challenge.obiettivo_tipo === 'km' ? 'km' : challenge.obiettivo_tipo === 'corse' ? 'corse' : 'min';

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-hiko-primary shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">{challenge.nome}</p>
            <p className="text-white/50 text-xs capitalize">{challenge.tipo}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40 shrink-0">
          <Clock size={11} />
          {formatCountdown(challenge.scadenza)}
        </div>
      </div>

      {challenge.tipo === 'collettiva' ? (
        <>
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>{aggregated.toFixed(1)} / {challenge.obiettivo_valore} {unitLabel}</span>
            <span className="flex items-center gap-1"><Users size={11} /> {total}</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-hiko-primary rounded-full"
            />
          </div>
          <p className="text-white/40 text-xs mt-1">{completed} completata/i su {total}</p>
        </>
      ) : (
        <div className="text-xs text-white/60">
          {leader ? (
            <p>Leader: <span className="text-hiko-primary font-bold">{leader.user_id.slice(0, 8)}</span> — {leader.valore_attuale.toFixed(1)} {unitLabel}</p>
          ) : (
            <p>Nessun partecipante ancora.</p>
          )}
        </div>
      )}

      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-white/40">{challenge.punti} punti</span>
        <button className="text-xs bg-hiko-primary text-hiko-deep font-bold px-3 py-1 rounded-lg hover:bg-hiko-primary/90 transition-colors">
          Partecipa
        </button>
      </div>
    </div>
  );
}
