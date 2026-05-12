import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// Local Run type — field names based on useRunStore.
// Cazzaniga Samuele (UI/UX)
interface Run {
  id?: string;
  currentPace: number;  // seconds per km
  date: string;         // ISO string — x-axis label
}

// ─── Helpers (presentation only) ─────────────────────────────────────────────

function formatPaceLabel(secondsPerKm: number): string {
  if (!secondsPerKm || !isFinite(secondsPerKm)) return '—';
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2 rounded-xl text-sm text-white">
      <p className="text-white/60 text-xs mb-0.5">{label}</p>
      <p className="font-bold text-hiko-primary">{formatPaceLabel(payload[0].value)} /km</p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             runs
// TIPO:             Run[]
// COSA MOSTRA:      grafico lineare passo medio ultime 10 corse
// COSA MOSTRA VUOTA:placeholder "Nessuna corsa registrata ancora"
// PASSA QUI:        Frontend 2 — dalla query corse utente
// ================================================================

export interface PaceChartProps {
  runs: Run[];
  className?: string;
}

const CHART_HEIGHT = 180;

export function PaceChart({ runs, className = '' }: PaceChartProps) {
  const lastTen = runs.slice(-10).map((r) => ({
    date: shortDate(r.date),
    pace: r.currentPace,
  }));

  const avgPace =
    lastTen.length > 0
      ? lastTen.reduce((s, r) => s + r.pace, 0) / lastTen.length
      : undefined;

  if (lastTen.length === 0) {
    return (
      <div
        className={`glass-panel rounded-2xl flex items-center justify-center ${className}`}
        style={{ height: CHART_HEIGHT }}
      >
        <p className="text-sm text-white/40">Nessuna corsa registrata ancora</p>
      </div>
    );
  }

  return (
    <div className={`glass-panel rounded-2xl p-4 ${className}`} style={{ height: CHART_HEIGHT + 32 }}>
      <p className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">Avg Pace (last 10)</p>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={lastTen} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            tickFormatter={formatPaceLabel}
            axisLine={false}
            tickLine={false}
            reversed
          />
          <Tooltip content={<ChartTooltip />} />
          {avgPace !== undefined && (
            <ReferenceLine
              y={avgPace}
              stroke="rgba(49,233,129,0.3)"
              strokeDasharray="4 4"
              label={{ value: 'avg', fill: 'rgba(49,233,129,0.6)', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="pace"
            stroke="#31E981"
            strokeWidth={2}
            dot={{ fill: '#31E981', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#31E981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
