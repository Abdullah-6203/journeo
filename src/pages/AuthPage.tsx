import React, { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthCard } from '../components/AuthCard';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialMode = searchParams.get('mode') === 'register' || location.pathname === '/register' ? 'register' : 'login';
  const redirectUrl = searchParams.get('redirect') || (location.state as any)?.from || '/my-trips';

  useEffect(() => {
    if (user) {
      navigate(redirectUrl, { replace: true });
    }
  }, [user, navigate, redirectUrl]);

  return (
    <div className="auth-wrapper font-sans">
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Top return link */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-deep-green transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journeo</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-deep-green animate-pulse" />
            <span className="text-[11px] text-text-subtle font-medium">Secure Travel Portal</span>
          </div>
        </div>

        {/* Reusable Sliding Auth Card */}
        <AuthCard initialMode={initialMode} redirectPath={redirectUrl} />

        {/* Demo Credentials Helper Card */}
        <div className="mt-6 p-4 rounded-xl bg-ivory-dark/60 border border-border text-center text-xs text-text-muted w-full flex flex-col sm:flex-row items-center justify-between gap-3 shadow-soft-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
            <span>
              <strong>Pre-seeded Demo:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-deep-green font-mono">demo@journeo.com</code> / <code className="bg-white px-1.5 py-0.5 rounded text-deep-green font-mono">Password123!</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
