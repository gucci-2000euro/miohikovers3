import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const login = useAuthStore(state => state.login);
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, isLogin ? 'Mara' : name);
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-hiko-deep flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
            <Leaf className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Hiko</h1>
          <p className="text-white/60 text-center">Your city in motion.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className={`flex-1 pb-2 font-medium transition-colors border-b-2 ${isLogin ? 'border-primary text-white' : 'border-transparent text-white/50'}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 pb-2 font-medium transition-colors border-b-2 ${!isLogin ? 'border-primary text-white' : 'border-transparent text-white/50'}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs text-white/60 font-medium ml-1">Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Mara"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-white/60 font-medium ml-1">Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="mara@example.com"
            />
          </div>

          <div className="space-y-1 pb-4">
            <label className="text-xs text-white/60 font-medium ml-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-hiko-deep font-semibold rounded-xl px-4 py-3 transition-all transform active:scale-[0.98]"
          >
            {isLogin ? 'Enter' : 'Join'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
