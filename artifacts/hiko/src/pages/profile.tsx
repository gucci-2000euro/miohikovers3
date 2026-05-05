import { useAuthStore } from '@/store/useAuthStore';
import { Settings, LogOut, Award, Activity, Calendar, Mountain, Footprints, Sunrise, Flame, Timer, TrendingUp, Zap } from 'lucide-react';
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

  const badges = [
    { name: 'Dawn Patrol', Icon: Sunrise },
    { name: '10K Crusher', Icon: Footprints },
    { name: 'Trail Whisperer', Icon: Mountain },
  ];

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
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award size={20} className="text-hiko-primary" /> Earned Badges
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {badges.map(({ name, Icon }, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-hiko-primary/10 border border-hiko-primary/30 rounded-2xl flex items-center justify-center mb-2 transform rotate-45">
                  <div className="-rotate-45">
                    <Icon size={28} className="text-hiko-primary drop-shadow-md" />
                  </div>
                </div>
                <p className="text-[10px] text-center font-medium text-white/70 uppercase tracking-wide px-1">{name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Activity size={18} className="text-white/70" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Evening Run</p>
                    <p className="text-xs text-white/50">{i === 0 ? 'Today' : `${i} days ago`}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{5 + i}.2 km</p>
                  <p className="text-xs text-white/50">{(25 + i * 2)}:00</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
