import { useAuthStore } from '@/store/useAuthStore';
import { Settings, LogOut, Award, Activity, Calendar, Flame, Timer, TrendingUp, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { Logo } from '@/components/Logo';

function formatPace(seconds: number) {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatCalories(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function Profile() {
  const { user, logout, openAuthModal } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-hiko-deep text-white pb-24 flex flex-col items-center justify-center px-6">
        <Logo size={72} className="mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-center">Your runs, your story.</h2>
        <p className="text-white/60 text-center mb-8 max-w-xs">
          Sign in to track your runs, earn badges, and watch your stats grow.
        </p>
        <button
          onClick={() => openAuthModal('Sign in to view your profile and stats.')}
          className="bg-hiko-primary text-hiko-deep font-bold py-4 px-8 rounded-2xl hover:bg-hiko-primary/90 transition-colors"
          data-testid="button-profile-signin"
        >
          Sign in or create account
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Distance',
      value: (user.totalKm ?? 0).toFixed(1),
      unit: 'km',
      Icon: Activity,
    },
    {
      label: 'Total Runs',
      value: (user.totalRuns ?? 0).toString(),
      unit: 'runs',
      Icon: Calendar,
    },
    {
      label: 'Longest Run',
      value: (user.longestRun ?? 0).toFixed(1),
      unit: 'km',
      Icon: TrendingUp,
    },
    {
      label: 'Weekly Avg',
      value: (user.weeklyAvg ?? 0).toFixed(1),
      unit: 'km',
      Icon: Zap,
    },
    {
      label: 'Avg Pace',
      value: formatPace(user.avgPace ?? 0),
      unit: 'min/km',
      Icon: Timer,
    },
    {
      label: 'Calories This Week',
      value: formatCalories(user.weeklyCalories ?? 0),
      unit: 'kcal',
      Icon: Flame,
      accent: true,
    },
    {
      label: 'Total Calories Burned',
      value: formatCalories(user.totalCalories ?? 0),
      unit: 'kcal total',
      Icon: Flame,
    },
  ];

  return (
    <div className="min-h-screen bg-hiko-deep text-white pb-24 overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-gradient-to-b from-hiko-muted/30 to-transparent relative">
        <div className="absolute top-6 left-6">
          <Logo size={36} />
        </div>
        <div className="absolute top-6 right-6 flex gap-3">
          <button className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 glass-panel rounded-full hover:bg-red-500/20 text-red-400 transition-colors" data-testid="button-logout">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center mt-6">
          <div className="relative mb-4">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-hiko-primary p-1" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-hiko-primary text-hiko-deep text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Lv {user.level}
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
          <p className="text-hiko-primary font-medium text-sm">{user.title}</p>
        </div>
      </div>

      <div className="px-6 space-y-6">

        {/* Records grid — 2 columns, last item full-width if odd */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-hiko-primary" /> My Records
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, unit, Icon, accent }, i) => {
              const isLast = i === stats.length - 1;
              const isOdd = stats.length % 2 !== 0;
              const fullWidth = isLast && isOdd;
              return (
                <div
                  key={label}
                  className={`glass-panel p-4 rounded-2xl flex flex-col gap-1 ${fullWidth ? 'col-span-2' : ''} ${accent ? 'border border-hiko-primary/30 bg-hiko-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium uppercase tracking-wider">
                    <Icon size={12} className={accent ? 'text-hiko-primary' : ''} />
                    {label}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold ${accent ? 'text-hiko-primary' : ''}`}>{value}</span>
                    <span className="text-xs text-white/40">{unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges Section */}
        {/* TODO [BE]: fornire array badge guadagnati — GET /api/badges?userId=...
            TODO [FE2]: mappare qui i badge reali; finché non arrivano mostrare sezione vuota o nascosta */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award size={20} className="text-hiko-primary" /> Earned Badges
          </h3>
          <p className="text-sm text-white/40 text-center py-6">No badges yet — complete challenges to earn them.</p>
        </div>

        {/* Recent Activities */}
        {/* TODO [BE]: esporre storico corse — GET /api/runs?userId=&limit=5 (già presente via saveRun)
            TODO [FE2]: usare useRuns hook (TanStack Query) e mappare qui le ultime corse */}
        <div>
          <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
          <p className="text-sm text-white/40 text-center py-6">No runs recorded yet.</p>
        </div>
      </div>
    </div>
  );
}
