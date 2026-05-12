// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             livello
// TIPO:             number
// COSA MOSTRA:      cerchio con gradiente + numero centrato
// COSA MOSTRA VUOTA:cerchio grigio con '?' — mai undefined visibile
// PASSA QUI:        chiunque conosca il livello utente (Frontend 2)
// ================================================================

export interface LevelBadgeProps {
  livello?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function getGradient(n: number): string {
  if (n >= 31) return 'from-purple-400 to-pink-600';
  if (n >= 16) return 'from-yellow-400 to-yellow-600';
  if (n >= 6)  return 'from-gray-300 to-gray-500';
  return 'from-blue-400 to-blue-600';
}

const SIZE: Record<'sm' | 'md' | 'lg', { px: number; text: string }> = {
  sm: { px: 32, text: 'text-xs font-bold' },
  md: { px: 48, text: 'text-sm font-bold' },
  lg: { px: 64, text: 'text-base font-bold' },
};

export function LevelBadge({ livello, size = 'md', showLabel = false, className = '' }: LevelBadgeProps) {
  const level = livello ?? 0;
  const { px, text } = SIZE[size];
  const gradient = level > 0 ? getGradient(level) : 'from-gray-600 to-gray-700';

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div
        className={`rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white ${text} shrink-0 shadow-lg`}
        style={{ width: px, height: px }}
        aria-label={`Level ${level}`}
      >
        {level > 0 ? level : '?'}
      </div>
      {showLabel && (
        <span className="text-xs text-white/50">Lv. {level}</span>
      )}
    </div>
  );
}
