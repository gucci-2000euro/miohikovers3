import { useState } from 'react';
import { Layers } from 'lucide-react';
import { useMapStore, MAP_STYLES, mapPanel } from '@/store/useMapStore';

interface Props {
  isDark: boolean;
  className?: string;
}

export function MapStyleButton({ isDark, className = '' }: Props) {
  const { styleId, setStyleId } = useMapStore();
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {open && (
        <>
          {/* Backdrop per chiudere */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Popup stili */}
          <div className={`absolute bottom-12 right-0 z-50 ${mapPanel(isDark)} rounded-2xl p-1.5 min-w-[140px] flex flex-col gap-0.5`}>
            {MAP_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => { setStyleId(style.id); setOpen(false); }}
                aria-label={`Stile mappa: ${style.name}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                  styleId === style.id
                    ? 'bg-hiko-primary text-hiko-deep'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="text-base leading-none">{style.emoji}</span>
                <span>{style.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Cambia stile mappa"
        aria-expanded={open}
        className={`${mapPanel(isDark)} w-10 h-10 flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors`}
      >
        <Layers size={18} />
      </button>
    </div>
  );
}
