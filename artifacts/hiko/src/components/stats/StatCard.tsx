import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             value
// TIPO:             string | number
// COSA MOSTRA:      il valore in text-3xl font-bold
// COSA MOSTRA VUOTA:'—' come fallback visivo
// PASSA QUI:        chiunque usi questo componente — è generico
// ================================================================

export interface StatCardProps {
  label: string;
  value?: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendValue,
  accent = false,
  className = '',
}: StatCardProps) {
  const displayValue = value !== undefined && value !== null && value !== '' ? value : '—';

  return (
    <div
      className={[
        'glass-panel rounded-2xl p-4 flex flex-col gap-1',
        accent ? 'border-hiko-primary/30 bg-hiko-primary/5' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between mb-1">
        {icon ? (
          <span className={`${accent ? 'text-hiko-primary' : 'text-white/40'}`}>{icon}</span>
        ) : (
          <span />
        )}
        {trend && trendValue && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
            trend === 'up'      ? 'text-hiko-primary' :
            trend === 'down'    ? 'text-red-400' :
                                  'text-white/40'
          }`}>
            {trend === 'up'      && <TrendingUp size={11} />}
            {trend === 'down'    && <TrendingDown size={11} />}
            {trend === 'neutral' && <Minus size={11} />}
            {trendValue}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold leading-none ${accent ? 'text-hiko-primary' : 'text-white'}`}>
          {displayValue}
        </span>
        {unit && <span className="text-xs text-white/40">{unit}</span>}
      </div>

      {/* Label */}
      <span className="text-[11px] text-white/50 uppercase tracking-wider font-medium mt-0.5">
        {label}
      </span>
    </div>
  );
}
