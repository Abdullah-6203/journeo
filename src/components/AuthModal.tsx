import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@journeo.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-text/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ivory border border-border w-full max-w-md rounded-2xl shadow-soft-lg p-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-subtle hover:text-text p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="font-serif font-bold text-2xl text-deep-green block">
            Journeo
          </span>
          <p className="text-xs text-text-muted mt-1">
            {mode === 'login' ? 'Sign in to access your saved trips & preferences' : 'Create an account to start personalized travel planning'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-terracotta/10 border border-terracotta/30 text-terracotta-dark p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Demo credentials hint */}
        <div className="mb-4 bg-sage/10 border border-sage/30 text-deep-green p-2.5 rounded-xl text-[11px]">
          <strong>Quick Demo Login:</strong> <br />
          Email: <code className="font-mono bg-white/60 px-1 rounded">demo@journeo.com</code> | Pass: <code className="font-mono bg-white/60 px-1 rounded">Password123!</code>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-text-subtle absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text focus:outline-none focus:border-deep-green"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-subtle absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text focus:outline-none focus:border-deep-green"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-subtle absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text focus:outline-none focus:border-deep-green"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-deep-green hover:bg-deep-green-dark text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-soft-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border/80 text-center text-xs text-text-muted">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-deep-green font-bold hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-deep-green font-bold hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
