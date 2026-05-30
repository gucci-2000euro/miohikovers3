import type { ModerationQueueItem as MQItem, CommunityMessage } from '@/types/index';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Props {
  item: MQItem;
  message: CommunityMessage;
  onApprove: () => void;
  onBlock: () => void;
  onSilence: (duration: '1h' | '24h' | '7d') => void;
}

export function ModerationQueueItemCard({ item, message, onApprove, onBlock, onSilence }: Props) {
  const confidencePct = Math.round(item.ai_confidence * 100);
  const confidenceColor = confidencePct >= 75 ? 'text-red-400' : confidencePct >= 50 ? 'text-yellow-400' : 'text-white/50';

  return (
    <div className="glass-panel rounded-2xl p-4 border border-yellow-400/20">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
          <span className="text-xs text-white/50">
            {format(new Date(item.created_at), 'dd MMM HH:mm', { locale: it })}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 ${confidenceColor}`}>
            {item.ai_raccomandazione} {confidencePct}%
          </span>
        </div>
        <span className="text-xs text-white/30">{item.segnalazioni_count} segnalazioni</span>
      </div>

      <div className="bg-black/30 rounded-xl p-3 mb-3">
        <p className="text-white/80 text-sm whitespace-pre-wrap break-words">{message.contenuto}</p>
      </div>

      {item.ai_summary && (
        <p className="text-white/40 text-xs mb-3 italic">{item.ai_summary}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={onApprove} className="flex items-center gap-1 text-xs bg-hiko-primary/20 text-hiko-primary font-medium px-3 py-1.5 rounded-lg hover:bg-hiko-primary/30 transition-colors">
          <CheckCircle size={12} /> Approva
        </button>
        <button onClick={onBlock} className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors">
          <XCircle size={12} /> Blocca
        </button>
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-white/40" />
          {(['1h', '24h', '7d'] as const).map((d) => (
            <button
              key={d}
              onClick={() => onSilence(d)}
              className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
