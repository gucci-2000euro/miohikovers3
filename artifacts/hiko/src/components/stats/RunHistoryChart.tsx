import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Local Run type — field names based on useRunStore + what a saved run would have.
// Cazzaniga Samuele (UI/UX)
interface Run {
  id?: string;
  distance: number;   // km
  date: string;       // ISO string — used to group by week
}

// ─── Week aggregation (pure presentation logic) ───────────────────────────────

function aggregateByWeek(runs: Run[]): { week: string; km: number }[] {
  const map: Record<string, number> = {};
  for (const run of runs) {
    const d = new Date(run.date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d);
    monday.setDate(diff);
    const key = monday.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    map[key] = (map[key] ?? 0) + run.distance;
  }
  return Object.entries(map).map(([week, km]) => ({
    week,
    km: Math.round(km * 10) / 10,
  }));
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2 rounded-xl text-sm text-white">
      <p className="text-white/60 text-xs mb-0.5">{label}</p>
      <p className="font-bold text-hiko-primary">{payload[0].value} km</p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             runs
// TIPO:             Run[]
// COSA MOSTRA:      grafico barre km/settimana
// COSA MOSTRA VUOTA:placeholder "Nessuna corsa registrata ancora"
// PASSA QUI:        Frontend 2 — dalla query corse utente
// ================================================================

export interface RunHistoryChartProps {
  runs: Run[];
  className?: string;
}

const CHART_HEIGHT = 200;

export function RunHistoryChart({ runs, className = '' }: RunHistoryChartProps) {
  const weeklyData = aggregateByWeek(runs);

  if (runs.length === 0) {
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
      <p className="text-xs text-white/50 uppercase tracking-wider font-medium mb-3">KM / Week</p>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar dataKey="km" fill="#31E981" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
