import { useState } from 'react';

import { RouteCard } from '@/components/route';
import { StatsGrid, RunHistoryChart, PaceChart, StatCard } from '@/components/stats';
import {
  LevelBadge,
  ScoreProgress,
  ChallengeBadge,
  ConfettiEffect,
  ChallengeCompleteModal,
  RunSummaryCard,
} from '@/components/gamification';
import { Activity } from 'lucide-react';

// ─── Mock data (niente DB, niente store) ─────────────────────────────────────

const MOCK_ROUTES = [
  { id: '1', name: 'Navigli Loop',       distance: 6.2,  elevation: 18,  difficulty: 'easy'   as const, terrain: 'asphalt' as const, bestTime: '31:40', activeRunners: 4 },
  { id: '2', name: 'Parco Sempione',     distance: 4.5,  elevation: 35,  difficulty: 'medium' as const, terrain: 'mixed'   as const, bestTime: '24:10', activeRunners: 2 },
  { id: '3', name: 'Monte Stella Trail', distance: 9.8,  elevation: 210, difficulty: 'hard'   as const, terrain: 'trail'   as const },
];

const MOCK_PROFILE = {
  totalKm: 247.3, totalRuns: 38, longestRun: 21.1,
  weeklyAvg: 24.5, avgPace: 312, weeklyCalories: 1840,
  totalCalories: 18400, level: 5,
};

const MOCK_RUNS = [
  { id: 'r1',  distance: 6.2,  date: '2026-04-07', currentPace: 318 },
  { id: 'r2',  distance: 8.5,  date: '2026-04-10', currentPace: 305 },
  { id: 'r3',  distance: 5.0,  date: '2026-04-14', currentPace: 330 },
  { id: 'r4',  distance: 10.1, date: '2026-04-17', currentPace: 298 },
  { id: 'r5',  distance: 7.3,  date: '2026-04-21', currentPace: 310 },
  { id: 'r6',  distance: 6.8,  date: '2026-04-24', currentPace: 302 },
  { id: 'r7',  distance: 9.0,  date: '2026-04-28', currentPace: 295 },
  { id: 'r8',  distance: 5.5,  date: '2026-05-01', currentPace: 322 },
  { id: 'r9',  distance: 12.0, date: '2026-05-05', currentPace: 290 },
  { id: 'r10', distance: 6.0,  date: '2026-05-09', currentPace: 307 },
];

const MOCK_CHALLENGES = [
  {
    challenge:     { id: 'c1', title: 'Run 5 km without stopping', difficulty: 'easy'   as const, rewardPoints: 50,  type: 'personal'  as const },
    userChallenge: { state: 'available' as const, progress: 0,   target: 5,   unit: 'km' },
  },
  {
    challenge:     { id: 'c2', title: 'Weekly 30 km',              difficulty: 'medium' as const, rewardPoints: 120, type: 'personal'  as const },
    userChallenge: { state: 'active'    as const, progress: 18,  target: 30,  unit: 'km' },
  },
  {
    challenge:     { id: 'c3', title: 'Community 100k Month',      difficulty: 'hard'   as const, rewardPoints: 300, type: 'community' as const },
    userChallenge: { state: 'completed' as const, progress: 100, target: 100, unit: 'km' },
  },
];

const MOCK_RUN = { elapsedTime: 2340, distance: 6.2, currentPace: 377 };
const MOCK_MODAL_CHALLENGE = { id: 'cm1', title: 'Run 5 km without stopping', rewardPoints: 50 };

// ─── Section header ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-hiko-primary mb-4 border-b border-white/10 pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── UIPreview page ───────────────────────────────────────────────────────────

export default function UIPreview() {
  const [showModal,   setShowModal]   = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [confetti,    setConfetti]    = useState(false);

  return (
    <div className="min-h-screen bg-hiko-deep text-white px-4 pt-8 pb-40 overflow-y-auto">
      <div className="max-w-md mx-auto">

        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-8 text-center">
          UIPreview · Cazzaniga Samuele · dati mock · nessun DB
        </p>

        {/* ── RouteCard ────────────────────────────────────────────── */}
        <Section title="RouteCard — skeleton + 3 varianti">
          <div className="flex flex-col gap-3">
            <RouteCard />
            {MOCK_ROUTES.map((r, i) => (
              <RouteCard key={r.id} route={r} isCompleted={i === 0} onClick={() => {}} />
            ))}
          </div>
        </Section>

        {/* ── StatsGrid ────────────────────────────────────────────── */}
        <Section title="StatsGrid — con dati">
          <StatsGrid profile={MOCK_PROFILE} />
        </Section>

        <Section title="StatsGrid — skeleton (profile undefined)">
          <StatsGrid />
        </Section>

        <Section title="StatCard — varianti">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Distance" value="12.4" unit="km" icon={<Activity size={14} />} accent />
            <StatCard label="Pace"     value="5:12" unit="/km" trend="up"   trendValue="+8s" />
            <StatCard label="Runs"     value={38}              trend="down" trendValue="-2"  />
            <StatCard label="No data" />
          </div>
        </Section>

        {/* ── Charts ───────────────────────────────────────────────── */}
        <Section title="RunHistoryChart">
          <RunHistoryChart runs={MOCK_RUNS} />
        </Section>

        <Section title="PaceChart">
          <PaceChart runs={MOCK_RUNS} />
        </Section>

        <Section title="Charts — empty state">
          <div className="flex flex-col gap-3">
            <RunHistoryChart runs={[]} />
            <PaceChart runs={[]} />
          </div>
        </Section>

        {/* ── LevelBadge ───────────────────────────────────────────── */}
        <Section title="LevelBadge — tutti i tier + size">
          <div className="flex items-end gap-4 flex-wrap mb-4">
            {[0, 1, 5, 10, 20, 25].map((lv) => (
              <div key={lv} className="flex flex-col items-center gap-1">
                <LevelBadge livello={lv} size="lg" showLabel />
                <span className="text-[10px] text-white/30">lv {lv}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <LevelBadge livello={7} size="sm" />
            <LevelBadge livello={7} size="md" />
            <LevelBadge livello={7} size="lg" showLabel />
          </div>
        </Section>

        {/* ── ScoreProgress ────────────────────────────────────────── */}
        <Section title="ScoreProgress — 3 scenari">
          <div className="flex flex-col gap-4">
            <ScoreProgress livello={1} punteggio_totale={30}   />
            <ScoreProgress livello={5} punteggio_totale={820}  />
            <ScoreProgress livello={9} punteggio_totale={3900} />
          </div>
        </Section>

        {/* ── ChallengeBadge ───────────────────────────────────────── */}
        <Section title="ChallengeBadge — available / active / completed / vuoto">
          <div className="flex flex-col gap-3 mb-4">
            {MOCK_CHALLENGES.map(({ challenge, userChallenge }) => (
              <ChallengeBadge
                key={challenge.id}
                challenge={challenge}
                userChallenge={userChallenge}
                showProgress={userChallenge.state === 'active'}
                onAction={userChallenge.state !== 'completed' ? () => {} : undefined}
              />
            ))}
            <ChallengeBadge />
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_CHALLENGES.slice(0, 2).map(({ challenge, userChallenge }) => (
              <ChallengeBadge key={challenge.id} challenge={challenge} userChallenge={userChallenge} size="sm" />
            ))}
          </div>
        </Section>

        {/* ── Animazioni ───────────────────────────────────────────── */}
        <Section title="Animazioni">
          <div className="flex flex-col gap-3">

            <button
              onClick={() => { setConfetti(true); setTimeout(() => setConfetti(false), 3200); }}
              className="w-full py-3 rounded-2xl bg-hiko-primary/10 border border-hiko-primary/30 text-hiko-primary font-semibold text-sm active:scale-95 transition-transform"
            >
              Lancia confetti 🎉
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 rounded-2xl glass-panel text-white/80 font-semibold text-sm active:scale-95 transition-transform"
            >
              Apri ChallengeCompleteModal
            </button>

            <button
              onClick={() => setShowSummary(true)}
              className="w-full py-3 rounded-2xl glass-panel text-white/80 font-semibold text-sm active:scale-95 transition-transform"
            >
              Apri RunSummaryCard (slide-up)
            </button>

          </div>
        </Section>

      </div>

      {/* ── Overlays ─────────────────────────────────────────────────── */}
      <ConfettiEffect active={confetti} duration={3000} />

      <ChallengeCompleteModal
        open={showModal}
        challenge={MOCK_MODAL_CHALLENGE}
        punteggio_guadagnato={50}
        nuovo_livello={6}
        onClose={() => setShowModal(false)}
      />

      {showSummary && (
        <RunSummaryCard
          run={MOCK_RUN}
          route={{ id: MOCK_ROUTES[1].id, name: MOCK_ROUTES[1].name }}
          completedChallenges={[
            { challenge: MOCK_CHALLENGES[0].challenge, punteggio: 50  },
            { challenge: MOCK_CHALLENGES[2].challenge, punteggio: 300 },
          ]}
          previousBestTime={2500}
          onClose={() => setShowSummary(false)}
          onViewDetails={() => {}}
        />
      )}
    </div>
  );
}
