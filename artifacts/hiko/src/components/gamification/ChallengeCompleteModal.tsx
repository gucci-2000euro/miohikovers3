import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ConfettiEffect } from './ConfettiEffect';
import { LevelBadge } from './LevelBadge';

// Local Challenge type — field names match useChallengeStore exactly.
// Cazzaniga Samuele (UI/UX)
interface Challenge {
  id: string;
  title: string;
  rewardPoints: number;
}

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             challenge
// TIPO:             Challenge
// COSA MOSTRA:      titolo sfida e punti nella modale
// PASSA QUI:        Frontend 2 — la sfida appena completata
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             punteggio_guadagnato
// TIPO:             number
// COSA MOSTRA:      "+N pts" animato nella modale celebrativa
// PASSA QUI:        Frontend 2 — il punteggio della sfida
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             nuovo_livello
// TIPO:             number | undefined
// COSA MOSTRA:      sezione level-up con LevelBadge e testo dorato
// COSA MOSTRA VUOTA:nessuna sezione level-up
// PASSA QUI:        Frontend 2 — solo se l'utente è salito di livello
// ================================================================

// ================================================================
// PLACEHOLDER — Cazzaniga Samuele (UI/UX)
// ----------------------------------------------------------------
// PROP:             onClose
// TIPO:             () => void
// COSA MOSTRA:      bottone "Continue" visibile dopo 1.5s
// COSA FA:          chiude la modale — cosa succede dopo lo decide Frontend 2
// PASSA QUI:        Frontend 2 — gestisce il flusso post-completamento
// ================================================================

export interface ChallengeCompleteModalProps {
  challenge: Challenge;
  punteggio_guadagnato: number;
  nuovo_livello?: number;
  onClose: () => void;
  open: boolean;
}

export function ChallengeCompleteModal({
  challenge,
  punteggio_guadagnato,
  nuovo_livello,
  onClose,
  open,
}: ChallengeCompleteModalProps) {
  // Animation sequence: 0=hidden, 1=scaled, 2=icon, 3=text, 4=pts, 5=levelup, 6=button
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!open) { setStep(0); return; }
    const timers = [
      setTimeout(() => setStep(1), 0),
      setTimeout(() => setStep(2), 300),
      setTimeout(() => setStep(3), 600),
      setTimeout(() => setStep(4), 900),
      setTimeout(() => setStep(5), 1200),
      setTimeout(() => setStep(6), 1500),
    ];
    return () => { timers.forEach(clearTimeout); };
  }, [open]);

  return (
    <>
      <ConfettiEffect active={open} duration={3000} />
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="bg-hiko-deep border-white/10 text-white rounded-3xl max-w-sm mx-4 p-0 overflow-hidden">
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            {/* Check icon */}
            <div
              className={`w-20 h-20 rounded-full bg-hiko-primary/15 border border-hiko-primary/30 flex items-center justify-center transition-all duration-300 ${step >= 2 ? 'animate-bounce' : 'opacity-0 scale-0'}`}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#31E981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            {/* Title + challenge name */}
            <div
              className="transition-all duration-300"
              style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'translateY(0)' : 'translateY(12px)' }}
            >
              <h2 className="text-2xl font-bold">Challenge Complete!</h2>
              <p className="text-white/60 text-sm mt-1">{challenge.title}</p>
            </div>

            {/* Points */}
            <div
              className="transition-all duration-300"
              style={{ opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? 'translateY(0)' : 'translateY(12px)' }}
            >
              <span className="text-4xl font-bold text-hiko-primary">+{punteggio_guadagnato}</span>
              <span className="text-lg text-hiko-primary ml-1">pts</span>
            </div>

            {/* Level-up block */}
            {nuovo_livello != null && (
              <div
                className="flex flex-col items-center gap-2 transition-all duration-300"
                style={{ opacity: step >= 5 ? 1 : 0, transform: step >= 5 ? 'translateY(0)' : 'translateY(12px)' }}
              >
                <p className="text-xs text-yellow-400 font-bold uppercase tracking-widest">🎉 Level Up!</p>
                <LevelBadge livello={nuovo_livello} size="lg" showLabel />
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-hiko-primary text-hiko-deep font-bold text-base hover:bg-hiko-primary/90 active:scale-95 transition-all duration-200"
              style={{
                opacity: step >= 6 ? 1 : 0,
                pointerEvents: step >= 6 ? 'auto' : 'none',
                transition: 'opacity 300ms, transform 200ms, background-color 200ms',
              }}
            >
              Continue
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
