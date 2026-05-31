import { useState } from 'react';
import type { CommunityMessageWithProfile } from '@/types/index';
import { MoreHorizontal, Flag, Reply, Trash2, MapPin, Trophy, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const COMMON_EMOJIS = ['👍', '🔥', '💪', '🏃', '❤️', '🎉'];

interface Props {
  message: CommunityMessageWithProfile;
  currentUserId: string;
  isFirstInGroup: boolean;
  onReact: (emoji: string) => void;
  onReport: () => void;
  onReply: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

function Avatar({ nome, avatarUrl }: { nome: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={nome}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-hiko-primary shrink-0 flex items-center justify-center text-xs font-bold text-hiko-deep">
      {nome[0]?.toUpperCase() ?? 'U'}
    </div>
  );
}

export function MessageBubble({
  message, currentUserId, isFirstInGroup,
  onReact, onReport, onReply, onDelete, isAdmin,
}: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const isOwn = message.user_id === currentUserId;

  if (message.eliminato) return null;

  const displayName = message.profiles?.nome ?? 'Utente';
  const avatarUrl = message.profiles?.avatar_url ?? null;

  return (
    <div
      className={`group flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
      onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
    >
      {/* Avatar o spacer */}
      {isFirstInGroup ? (
        <Avatar nome={displayName} avatarUrl={avatarUrl} />
      ) : (
        <div className="w-8 shrink-0" />
      )}

      <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Nome mittente (solo per altri, primo del gruppo) */}
        {!isOwn && isFirstInGroup && (
          <p className="text-xs font-semibold text-white/60 px-1">{displayName}</p>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-3 py-2 ${
            isOwn
              ? 'bg-hiko-primary text-hiko-deep rounded-tr-sm'
              : 'bg-white/10 text-white rounded-tl-sm'
          }`}
        >
          {message.tipo === 'testo' && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.contenuto}</p>
          )}
          {message.tipo === 'percorso' && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} />
              <span className="font-medium">{message.contenuto}</span>
            </div>
          )}
          {message.tipo === 'sfida' && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy size={16} />
              <span className="font-medium">{message.contenuto}</span>
              <button className="ml-2 bg-hiko-deep text-hiko-primary text-xs font-bold px-2 py-0.5 rounded-lg">
                Accetta
              </button>
            </div>
          )}
          {message.tipo === 'run' && (
            <div className="flex items-center gap-2 text-sm">
              <Activity size={16} />
              <span className="font-medium">{message.contenuto}</span>
            </div>
          )}
        </div>

        {/* Timestamp (solo sul primo del gruppo o sull'ultimo) */}
        {isFirstInGroup && (
          <span className="text-[10px] text-white/30 px-1">
            {format(new Date(message.created_at), 'HH:mm', { locale: it })}
          </span>
        )}

        {/* Reaction picker (on hover) */}
        <div
          className={`opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${isOwn ? 'flex-row-reverse' : ''}`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {showReactions && COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="text-base hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
          {!showReactions && (
            <button className="text-xs text-white/30 px-1">+</button>
          )}
        </div>
      </div>

      {/* Context menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)}>
          <div
            className="absolute bg-hiko-deep border border-white/10 rounded-xl p-1 shadow-xl z-50"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { onReply(); setShowMenu(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg w-full">
              <Reply size={14} /> Rispondi
            </button>
            {!isOwn && (
              <button onClick={() => { onReport(); setShowMenu(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:bg-white/10 rounded-lg w-full">
                <Flag size={14} /> Segnala
              </button>
            )}
            {(isOwn || isAdmin) && onDelete && (
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg w-full">
                <Trash2 size={14} /> Elimina
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
