import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/store/useAuthStore';
import { useDataStore, Route } from '@/store/useDataStore';
import MapView from '@/components/MapView';
import { Logo } from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { LocateFixed, Play, Navigation, Users, Zap } from 'lucide-react';

const BARCELONA_CENTER: [number, number] = [41.3851, 2.1734];

export default function Home() {
  const [, setLocation] = useLocation();
  const user = useAuthStore(state => state.user);
  const requireAuth = useAuthStore(state => state.requireAuth);
  const { routes, runners } = useDataStore();
  
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(BARCELONA_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [activeRunners, setActiveRunners] = useState(runners);

  // Nudge runners slightly to make it feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRunners(current => current.map(r => ({
        ...r,
        lat: r.lat + (Math.random() - 0.5) * 0.0005,
        lng: r.lng + (Math.random() - 0.5) * 0.0005
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
    setMapCenter(route.center);
    setMapZoom(16);
  };

  const handleCenterUser = () => {
    setSelectedRoute(null);
    setMapCenter(BARCELONA_CENTER);
    setMapZoom(14);
  };

  const handleStartRun = () => {
    if (!selectedRoute) return;
    requireAuth('Sign in to start tracking your run.', () => {
      setLocation(`/run/${selectedRoute.id}`);
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-hiko-deep">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapView 
          center={mapCenter} 
          zoom={mapZoom} 
          routes={routes} 
          runners={activeRunners}
          userPos={BARCELONA_CENTER}
          onRouteClick={handleRouteClick}
        />
      </div>

      {/* Top Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 pt-12 flex justify-between items-start pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-2xl pointer-events-auto flex items-center gap-3">
          <Logo size={32} />
          {user ? (
            <p className="text-sm text-white/80 font-medium">Hi, <span className="text-white">{user.name}</span></p>
          ) : (
            <p className="text-sm text-white/80 font-medium">Explore Hiko</p>
          )}
        </div>
        {user ? (
          <div className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-2 pointer-events-auto">
            <Zap size={16} className="text-hiko-primary fill-hiko-primary" />
            <span className="text-sm font-bold text-white">{user.currentStreak} Day</span>
          </div>
        ) : (
          <button
            onClick={() => useAuthStore.getState().openAuthModal('Sign in to track your runs and join the community.')}
            className="glass-panel px-4 py-2 rounded-2xl text-sm font-bold text-hiko-primary pointer-events-auto hover:bg-white/10 transition-colors"
            data-testid="button-signin-top"
          >
            Sign in
          </button>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute top-32 right-6 z-10 pointer-events-auto">
        <button 
          onClick={handleCenterUser}
          className="glass-panel p-3 rounded-full text-white hover:text-hiko-primary transition-colors"
        >
          <LocateFixed size={24} />
        </button>
      </div>

      {/* Route Bottom Sheet */}
      <AnimatePresence>
        {selectedRoute && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoute(null)}
              className="absolute inset-0 z-20 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-30 glass-panel rounded-t-3xl p-6 pb-24"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedRoute.name}</h2>
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <span className="capitalize px-2 py-0.5 rounded-md bg-white/10 text-white">{selectedRoute.difficulty}</span>
                    <span className="capitalize">{selectedRoute.terrain}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> {selectedRoute.activeRunners} active</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-xs text-white/50 mb-1">Distance</p>
                  <p className="text-lg font-bold text-white">{selectedRoute.distance} <span className="text-sm text-white/50">km</span></p>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-xs text-white/50 mb-1">Elevation</p>
                  <p className="text-lg font-bold text-white">+{selectedRoute.elevation} <span className="text-sm text-white/50">m</span></p>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <p className="text-xs text-white/50 mb-1">Best Time</p>
                  <p className="text-lg font-bold text-white">{selectedRoute.bestTime}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={handleStartRun}
                  className="flex-1 bg-hiko-primary text-hiko-deep font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-hiko-primary/90 transition-colors"
                >
                  <Play size={20} className="fill-hiko-deep" />
                  START RUN
                </button>
                <button className="bg-white/10 text-white font-medium px-6 py-4 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Navigation size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
