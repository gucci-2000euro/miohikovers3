import { useState } from 'react';
import type { Badge, UserBadge } from '@/types/index';
import { differenceInDays } from 'date-fns';

type UserBadgeWithInfo = Badge & UserBadge;

interface Props {
  badges: UserBadgeWithInfo[];
}

export function BadgeGrid({ badges }: Props) {
  const [tooltip, setTooltip] = useState<string | null>(null);

  const permanent = badges.filter((b) => b.tipo === 'permanente');
  const temporary = badges.filter((b) => b.tipo === 'temporaneo');

  const renderBadge = (badge: UserBadgeWithInfo) => {
    const daysLeft = badge.scade_at
      ? differenceInDays(new Date(badge.scade_at), new Date())
      : null;
    const expiringSoon = daysLeft != null && daysLeft <= 7;

    return (
      <div
        key={`${badge.user_id}-${badge.badge_id}`}
        className="relative flex flex-col items-center gap-1 cursor-pointer"
        onMouseEnter={() => setTooltip(badge.badge_id)}
        onMouseLeave={() => setTooltip(null)}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
          expiringSoon ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-white/10'
        }`}>
          <img src={badge.icona_url} alt={badge.nome} className="w-8 h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="text-2xl">🏅</span>
        </div>
        <span className="text-[10px] text-white/60 text-center leading-tight max-w-[56px] truncate">
          {badge.nome}
        </span>
        {daysLeft != null && (
          <span className={`text-[9px] font-bold ${expiringSoon ? 'text-yellow-400' : 'text-white/30'}`}>
            {daysLeft}g
          </span>
        )}

        {tooltip === badge.badge_id && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-hiko-deep border border-white/20 rounded-xl p-3 w-48 z-10 shadow-xl">
            <p className="text-white font-bold text-xs mb-1">{badge.nome}</p>
            <p className="text-white/60 text-[11px]">{badge.descrizione}</p>
            <p className="text-white/40 text-[10px] mt-1">+{badge.xp_reward} XP</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {permanent.length > 0 && (
        <div className="mb-4">
          <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Permanenti</p>
          <div className="grid grid-cols-4 gap-3">{permanent.map(renderBadge)}</div>
        </div>
      )}
      {temporary.length > 0 && (
        <div>
          <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Temporanei</p>
          <div className="grid grid-cols-4 gap-3">{temporary.map(renderBadge)}</div>
        </div>
      )}
      {badges.length === 0 && (
        <div className="text-center py-8 text-white/30 text-sm">Nessun badge ancora. Inizia a correre!</div>
      )}
    </div>
  );
}
