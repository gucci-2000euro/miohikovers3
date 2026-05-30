import type { LeaderboardEntry } from '@/types/index';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const medals = ['🥇', '🥈', '🥉'];

export function LeaderboardWidget({ entries, currentUserId }: Props) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <h3 className="text-white font-bold mb-3 text-sm">Classifica settimanale</h3>
      <div className="flex flex-col gap-1">
        {entries.slice(0, 10).map((entry, idx) => {
          const isMe = entry.user_id === currentUserId;
          const delta = entry.delta_vs_prev_week;

          return (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors ${
                isMe ? 'bg-hiko-primary/15 border border-hiko-primary/30' : 'hover:bg-white/5'
              }`}
            >
              <span className="w-6 text-center text-sm">
                {idx < 3 ? medals[idx] : <span className="text-white/40 text-xs">{idx + 1}</span>}
              </span>
              <span className={`flex-1 text-sm font-medium truncate ${isMe ? 'text-hiko-primary' : 'text-white'}`}>
                {isMe ? 'Tu' : entry.user_id.slice(0, 8)}
              </span>
              <span className="text-white/70 text-xs font-medium">
                {entry.km_totali.toFixed(1)} km
              </span>
              {delta != null && (
                <span className={`flex items-center text-xs ${delta > 0 ? 'text-hiko-primary' : delta < 0 ? 'text-red-400' : 'text-white/30'}`}>
                  {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
                  {Math.abs(delta).toFixed(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
