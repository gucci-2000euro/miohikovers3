import { useState } from 'react';
import { useChallengeStore, Challenge } from '@/store/useChallengeStore';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle, Star } from 'lucide-react';

export default function Challenges() {
  const { challenges, totalPoints } = useChallengeStore();
  const [tab, setTab] = useState<'community' | 'personal'>('community');

  const filtered = challenges.filter(c => c.type === tab);

  return (
    <div className="min-h-screen bg-hiko-deep text-white pb-24">
      <div className="px-6 py-8 bg-gradient-to-b from-hiko-muted/50 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-hiko-primary/20 flex items-center justify-center">
            <Trophy className="text-hiko-primary" size={20} />
          </div>
          <h1 className="text-3xl font-bold">Challenges</h1>
        </div>
        <p className="text-hiko-primary text-xl font-bold flex items-center gap-2">
          {totalPoints} <span className="text-sm text-white/60 font-medium">Total Points</span>
        </p>
      </div>

      <div className="px-6 mb-6">
        <div className="glass-panel p-1 rounded-xl flex">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'community' ? 'bg-white/10 text-white' : 'text-white/50'}`}
            onClick={() => setTab('community')}
          >
            Community
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'personal' ? 'bg-white/10 text-white' : 'text-white/50'}`}
            onClick={() => setTab('personal')}
          >
            Personal
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4">
        {filtered.map((challenge, i) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-panel p-5 rounded-2xl border ${challenge.state === 'completed' ? 'border-hiko-primary/30' : 'border-white/5'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold pr-4">{challenge.title}</h3>
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md text-xs font-medium text-hiko-primary">
                <Star size={12} className="fill-hiko-primary" /> {challenge.rewardPoints}
              </div>
            </div>
            
            <p className="text-sm text-white/60 mb-5">{challenge.description}</p>
            
            {challenge.state === 'completed' ? (
              <div className="flex items-center gap-2 text-hiko-primary font-medium text-sm bg-hiko-primary/10 w-fit px-3 py-1.5 rounded-lg">
                <CheckCircle size={16} /> Completed
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs font-medium mb-2">
                  <span>{challenge.progress} {challenge.unit}</span>
                  <span className="text-white/50">{challenge.target} {challenge.unit}</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-hiko-primary rounded-full"
                  />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
