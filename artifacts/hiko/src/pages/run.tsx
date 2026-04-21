import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useRunStore } from '@/store/useRunStore';
import { useDataStore, Route } from '@/store/useDataStore';
import MapView from '@/components/MapView';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, FastForward, Activity } from 'lucide-react';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatPace = (paceSecs: number) => {
  if (paceSecs === 0 || !isFinite(paceSecs)) return "--:--";
  const m = Math.floor(paceSecs / 60);
  const s = Math.floor(paceSecs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function RunSession() {
  const { routeId } = useParams();
  const [, setLocation] = useLocation();
  const { routes } = useDataStore();
  const { isTracking, elapsedTime, distance, currentPace, startRun, endRun, tick, updateMetrics } = useRunStore();
  
  const [route, setRoute] = useState<Route | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (routeId) {
      const r = routes.find(r => r.id === routeId);
      if (r) {
        setRoute(r);
        setUserPos(r.waypoints[0]);
        startRun(r.id);
      }
    }
    return () => endRun();
  }, [routeId, routes, startRun, endRun]);

  useEffect(() => {
    if (!isTracking) return;
    const interval = setInterval(() => {
      tick();
      updateMetrics(0.015); // simulate moving 15m every second
    }, 1000);
    return () => clearInterval(interval);
  }, [isTracking, tick, updateMetrics]);

  // Simulate movement along waypoints
  useEffect(() => {
    if (!isTracking || !route) return;
    const interval = setInterval(() => {
      setUserPos(prev => {
        if (!prev) return route.waypoints[0];
        // naive simulation: just drift slightly
        return [
          prev[0] + (Math.random() - 0.5) * 0.0002,
          prev[1] + (Math.random() - 0.5) * 0.0002
        ];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isTracking, route]);

  // Voice guidance toasts
  useEffect(() => {
    if (!isTracking) return;
    const messages = [
      "Maintain your pace.",
      "1.2 km to next checkpoint.",
      "You're ahead of your record.",
      "Keep breathing steady.",
      "Halfway there!"
    ];
    
    const interval = setInterval(() => {
      setToastMessage(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setToastMessage(null), 4000);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isTracking]);

  const handleEndRun = () => {
    setShowEndModal(true);
  };

  const handleCloseModal = () => {
    setShowEndModal(false);
    setLocation('/');
  };

  if (!route) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-hiko-deep text-white">
      {/* Immersive Map */}
      <div className="absolute inset-0 z-0 opacity-70">
        <MapView 
          center={route.center} 
          zoom={16} 
          activeRoute={route}
          userPos={userPos || route.center}
          interactive={false}
        />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 pt-12 flex justify-between items-center pointer-events-none">
        <button 
          onClick={handleEndRun}
          className="glass-panel p-3 rounded-full text-white hover:bg-white/20 transition-colors pointer-events-auto"
        >
          <X size={24} />
        </button>
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-hiko-primary animate-pulse" />
          <span className="text-sm font-bold text-hiko-primary tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Voice Guidance Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="absolute top-32 left-1/2 z-20 glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 border-hiko-primary/30"
          >
            <Activity size={18} className="text-hiko-primary" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 pb-12 bg-gradient-to-t from-hiko-deep via-hiko-deep/80 to-transparent">
        <div className="text-center mb-8">
          <p className="text-[5rem] leading-none font-bold tracking-tighter text-white mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(elapsedTime)}
          </p>
          <p className="text-hiko-primary font-medium tracking-widest uppercase">Time</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center">
            <p className="text-3xl font-bold mb-1" style={{ fontVariantNumeric: 'tabular-nums' }}>{distance.toFixed(2)}</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Kilometers</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center">
            <p className="text-3xl font-bold mb-1" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatPace(currentPace)}</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Avg Pace</p>
          </div>
        </div>
      </div>

      {/* End Run Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-hiko-deep/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-8 relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-hiko-primary/20 blur-[50px] rounded-full" />
              
              <div className="text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-hiko-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-hiko-primary/50">
                  <Trophy className="text-hiko-primary" size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Run Completed</h2>
                <p className="text-white/60">{route.name}</p>
              </div>

              <div className="space-y-4 mb-8 relative z-10">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Distance</p>
                    <p className="text-2xl font-bold">{distance.toFixed(2)} <span className="text-base text-white/50">km</span></p>
                  </div>
                  <div className="text-hiko-primary text-sm flex items-center gap-1">
                    <FastForward size={14} /> Personal Best
                  </div>
                </div>
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Time</p>
                    <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Avg Pace</p>
                    <p className="text-2xl font-bold">{formatPace(currentPace)} <span className="text-base text-white/50">/km</span></p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCloseModal}
                className="w-full bg-hiko-primary text-hiko-deep font-bold py-4 rounded-xl hover:bg-hiko-primary/90 transition-colors relative z-10"
              >
                Save & Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
