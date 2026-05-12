import { useEffect, useMemo, useRef } from 'react';

export interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
  onComplete?: () => void;
}

const COLORS = ['#31E981', '#facc15', '#f472b6', '#38bdf8', '#fb923c', '#a78bfa', '#f43f5e', '#4ade80'];

interface Particle {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  shape: 'circle' | 'rect' | 'diamond';
}

function generate(): Particle[] {
  return Array.from({ length: 36 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    size: 6 + Math.random() * 8,
    delay: Math.random() * 700,
    duration: 1800 + Math.random() * 1200,
    rotate: Math.random() * 360,
    shape: (['circle', 'rect', 'diamond'] as const)[i % 3],
  }));
}

export function ConfettiEffect({ active, duration = 3000, onComplete }: ConfettiEffectProps) {
  const particles = useMemo(generate, []);
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    if (!active) return;
    const id = setTimeout(() => cbRef.current?.(), duration);
    return () => clearTimeout(id);
  }, [active, duration]);

  if (!active) return null;

  return (
    <>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-24px) rotate(0deg); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: -24,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '2px' : '1px',
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}ms ease-in ${p.delay}ms both`,
            }}
          />
        ))}
      </div>
    </>
  );
}
