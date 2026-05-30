import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Logo } from './Logo';

export function AuthModal() {
  const { authModalOpen, authModalReason, closeAuthModal, login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(email, password, isLogin ? undefined : name);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-hiko-deep/80 backdrop-blur-md flex items-center justify-center p-6"
          onClick={closeAuthModal}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md glass-panel border border-white/10 rounded-3xl p-8 overflow-hidden"
            data-testid="auth-modal"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-hiko-primary/20 blur-[80px] rounded-full pointer-events-none" />

            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white z-10"
              data-testid="auth-modal-close"
            >
              <X size={20} />
            </button>

            <div className="relative z-10">
              <div className="flex flex-col items-center mb-6">
                <Logo size={56} className="mb-3" />
                <h2 className="text-xl font-bold text-white mb-1">
                  {isLogin ? 'Welcome back' : 'Join Hiko'}
                </h2>
                <p className="text-sm text-white/60 text-center">
                  {authModalReason || 'Sign in to continue.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 mb-2">
                  <button
                    type="button"
                    className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${isLogin ? 'border-hiko-primary text-white' : 'border-transparent text-white/50'}`}
                    onClick={() => { setIsLogin(true); setError(null); }}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${!isLogin ? 'border-hiko-primary text-white' : 'border-transparent text-white/50'}`}
                    onClick={() => { setIsLogin(false); setError(null); }}
                  >
                    Sign Up
                  </button>
                </div>

                {!isLogin && (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-hiko-primary/50 focus:ring-1 focus:ring-hiko-primary/50 transition-all text-sm"
                    placeholder="Your name"
                  />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-hiko-primary/50 focus:ring-1 focus:ring-hiko-primary/50 transition-all text-sm"
                  placeholder="Email"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-hiko-primary/50 focus:ring-1 focus:ring-hiko-primary/50 transition-all text-sm"
                  placeholder="Password"
                />

                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-hiko-primary hover:bg-hiko-primary/90 disabled:opacity-60 text-hiko-deep font-bold rounded-xl px-4 py-3 transition-all transform active:scale-[0.98] mt-2"
                  data-testid="auth-modal-submit"
                >
                  {loading ? '...' : isLogin ? 'Enter' : 'Join'}
                </button>

                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="w-full text-sm text-white/50 hover:text-white/70 transition-colors pt-1"
                >
                  Continue browsing
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
