import type { Community } from '@/types/index';
import { Users, MapPin, Lock, UserCheck, Globe } from 'lucide-react';

interface Props {
  community: Community;
  friendsCount?: number;
  onJoin: () => void;
}

const tipoConfig = {
  aperta: { label: 'Aperta', icon: Globe, color: 'text-hiko-primary bg-hiko-primary/20' },
  approvazione: { label: 'Su richiesta', icon: UserCheck, color: 'text-yellow-400 bg-yellow-400/20' },
  privata: { label: 'Privata', icon: Lock, color: 'text-white/50 bg-white/10' },
};

export function CommunityCard({ community, friendsCount, onJoin }: Props) {
  const tipo = tipoConfig[community.tipo];
  const TipoIcon = tipo.icon;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {community.immagine_url ? (
        <img src={community.immagine_url} alt={community.nome} className="w-full h-32 object-cover" />
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-hiko-dark to-hiko-muted flex items-center justify-center">
          <Users size={40} className="text-hiko-primary/40" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold truncate">{community.nome}</h3>
              {community.badge_ufficiale && (
                <span className="text-xs bg-hiko-primary text-hiko-deep font-bold px-1.5 py-0.5 rounded-md shrink-0">✓</span>
              )}
            </div>
            {community.citta && (
              <p className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                <MapPin size={11} /> {community.citta}
              </p>
            )}
          </div>
          <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1 ${tipo.color}`}>
            <TipoIcon size={11} /> {tipo.label}
          </span>
        </div>

        {community.descrizione && (
          <p className="text-white/60 text-xs mb-3 line-clamp-2">{community.descrizione}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1"><Users size={12} /> {community.membri_count}</span>
            {friendsCount != null && friendsCount > 0 && (
              <span className="text-hiko-primary font-medium">{friendsCount} tuoi amici</span>
            )}
          </div>
          <button
            onClick={onJoin}
            className="bg-hiko-primary text-hiko-deep text-xs font-bold px-4 py-1.5 rounded-xl hover:bg-hiko-primary/90 transition-colors"
          >
            {community.tipo === 'privata' ? 'Bloccata' : community.tipo === 'approvazione' ? 'Richiedi' : 'Unisciti'}
          </button>
        </div>
      </div>
    </div>
  );
}
