import { useState, useEffect } from 'react';
import type { Community } from '@/types/index';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Map, Trophy } from 'lucide-react';

interface Props {
  community: Community;
  memberNumber: number;
  onComplete: () => void;
  hasCompletedAction: boolean;
}

const STEPS = ['benvenuto', 'percorsi', 'risultati', 'settimana'] as const;

export function OnboardingFlow({ community, memberNumber, onComplete, hasCompletedAction }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (hasCompletedAction) {
      setVisible(false);
      onComplete();
    }
  }, [hasCompletedAction, onComplete]);

  if (!visible) return null;

  const advance = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else { setVisible(false); onComplete(); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="fixed inset-x-0 bottom-0 z-50 glass-panel rounded-t-3xl p-6 pb-12 max-w-md mx-auto"
      >
        <button onClick={() => { setVisible(false); onComplete(); }} className="absolute top-4 right-4 text-white/40 hover:text-white">
          <X size={18} />
        </button>

        <div className="flex gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-hiko-primary' : 'bg-white/10'}`} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <p className="text-4xl mb-3">👋</p>
            <h2 className="text-white font-bold text-xl mb-2">Benvenuto/a in {community.nome}!</h2>
            <p className="text-white/60 text-sm">Sei il membro <span className="text-hiko-primary font-bold">#{memberNumber}</span> della community. Siamo felici di averti qui.</p>
          </div>
        )}
        {step === 1 && (
          <div>
            <Map size={32} className="text-hiko-primary mb-3" />
            <h2 className="text-white font-bold text-xl mb-2">Scopri i percorsi</h2>
            <p className="text-white/60 text-sm mb-4">Abbiamo selezionato i percorsi migliori nelle vicinanze, già corsi dai membri della community.</p>
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                  <div className="w-8 h-8 bg-hiko-primary/20 rounded-lg flex items-center justify-center">
                    <Map size={14} className="text-hiko-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/10 rounded animate-pulse w-3/4 mb-1" />
                    <div className="h-2 bg-white/5 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <Trophy size={32} className="text-hiko-primary mb-3" />
            <h2 className="text-white font-bold text-xl mb-2">La tua prima sfida</h2>
            <p className="text-white/60 text-sm">Unisciti alla sfida attiva della community e guadagna i tuoi primi punti.</p>
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="text-4xl mb-3">🤝</p>
            <h2 className="text-white font-bold text-xl mb-2">Trova i tuoi amici</h2>
            <p className="text-white/60 text-sm">Alcuni tuoi amici sono già qui. Seguitevi per vedere le vostre corse in tempo reale.</p>
          </div>
        )}

        <button
          onClick={advance}
          className="mt-6 w-full bg-hiko-primary text-hiko-deep font-bold py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          {step < STEPS.length - 1 ? 'Avanti' : 'Inizia!'} <ChevronRight size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
