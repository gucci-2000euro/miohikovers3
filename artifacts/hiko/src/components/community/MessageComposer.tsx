import { useState, useCallback, useRef } from 'react';
import type { CommunityMessage } from '@/types/index';
import { checkBlacklist, moderateWithAI } from '@/lib/moderation';
import { Send, Paperclip, AlertTriangle, Info } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

interface Props {
  channelId: string;
  onSend: (message: Partial<CommunityMessage>) => Promise<string | null>; // ritorna messageId
  onRemove?: (messageId: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function MessageComposer({ channelId, onSend, onRemove, disabled, readOnly }: Props) {
  const [text, setText] = useState('');
  const [blocked, setBlocked] = useState<string | null>(null);
  const [flagged, setFlagged] = useState<string | null>(null);
  const aiPending = useRef(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    const result = checkBlacklist(val);
    if (!result) {
      setBlocked(null);
      setFlagged(null);
    } else if (result.decision === 'blocked') {
      setBlocked(result.reason);
      setFlagged(null);
    } else {
      // flagged: warning giallo, non impedisce l'invio
      setBlocked(null);
      setFlagged(result.reason);
    }
  }, []);

  const handleSend = async () => {
    if (!text.trim() || disabled || readOnly || blocked) return;

    const currentText = text.trim();
    const hasFlagged = !!flagged;

    // Invia immediatamente
    const messageId = await onSend({ channel_id: channelId, contenuto: currentText, tipo: 'testo' });
    setText('');
    setBlocked(null);
    setFlagged(null);

    // Se c'era un flagged, valutazione AI in background
    if (hasFlagged && messageId && !aiPending.current) {
      aiPending.current = true;
      moderateWithAI(messageId, channelId, currentText, SUPABASE_URL, SUPABASE_ANON)
        .then(result => {
          if (result.decision === 'blocked' && onRemove) {
            onRemove(messageId);
          }
        })
        .finally(() => { aiPending.current = false; });
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (readOnly) {
    return (
      <div className="px-4 py-3 border-t border-white/10 text-center text-sm text-white/40">
        Solo gli admin possono scrivere in questo canale.
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-white/10">
      {/* Blocked: rosso, impedisce invio */}
      {blocked && (
        <div className="flex items-start gap-2 mb-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{blocked}</p>
        </div>
      )}
      {/* Flagged: giallo, avviso ma permette invio — l'AI valuta in background */}
      {flagged && !blocked && (
        <div className="flex items-start gap-2 mb-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-3 py-2">
          <Info size={14} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">{flagged} Il messaggio verrà revisionato automaticamente.</p>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button className="text-white/40 hover:text-white/70 transition-colors p-1 shrink-0">
          <Paperclip size={18} />
        </button>
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKey}
          placeholder="Scrivi un messaggio..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 resize-none outline-none focus:border-hiko-primary/50 transition-colors"
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled || !!blocked}
          className="bg-hiko-primary text-hiko-deep p-2 rounded-xl disabled:opacity-40 hover:bg-hiko-primary/90 transition-colors shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
