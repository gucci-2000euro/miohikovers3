import type { CommunityChannel } from '@/types/index';
import { Hash, Megaphone, Map, Trophy } from 'lucide-react';

interface Props {
  channels: CommunityChannel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  unreadCounts: Record<string, number>;
}

const channelIcons = {
  generale: Hash,
  annunci: Megaphone,
  percorsi: Map,
  sfide: Trophy,
};

export function ChannelList({ channels, activeChannelId, onSelectChannel, unreadCounts }: Props) {
  const order: CommunityChannel['tipo'][] = ['generale', 'annunci', 'percorsi', 'sfide'];
  const sorted = [...channels].sort((a, b) => order.indexOf(a.tipo) - order.indexOf(b.tipo));

  return (
    <div className="flex flex-col gap-1">
      {sorted.map((ch) => {
        const Icon = channelIcons[ch.tipo];
        const unread = unreadCounts[ch.id] ?? 0;
        const isActive = ch.id === activeChannelId;

        return (
          <button
            key={ch.id}
            onClick={() => onSelectChannel(ch.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
              isActive ? 'bg-hiko-primary/20 text-hiko-primary' : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1 text-sm font-medium truncate">{ch.nome}</span>
            {ch.solo_admin && (
              <span className="text-[10px] text-white/30 shrink-0">solo admin</span>
            )}
            {unread > 0 && (
              <span className="bg-hiko-primary text-hiko-deep text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
