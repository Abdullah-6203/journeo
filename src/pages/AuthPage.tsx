import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Compass, ArrowLeft, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register } = useAuth();

  // Mode is either register (active = true) or login (active = false)
  const initialMode = searchParams.get('mode') === 'register' || location.pathname === '/register';
  const [isActive, setIsActive] = useState<boolean>(initialMode);

  // Sign In form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up form states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      const redirectUrl = searchParams.get('redirect') || (location.state as any)?.from || '/my-trips';
      navigate(redirectUrl, { replace: true });
    }
  }, [user, navigate, searchParams, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      const redirectUrl = searchParams.get('redirect') || (location.state as any)?.from || '/my-trips';
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    if (!registerName.trim()) {
      setRegisterError('Please enter your full name.');
      return;
    }
    if (!registerEmail.trim()) {
      setRegisterError('Please enter your email address.');
      return;
    }
    if (registerPassword.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setRegisterLoading(true);
    try {
      await register(registerName.trim(), registerEmail.trim(), registerPassword);
      const redirectUrl = searchParams.get('redirect') || (location.state as any)?.from || '/my-trips';
      navigate(redirectUrl, { replace: true });
    } catch (err: any) {
      setRegisterError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setLoginEmail('demo@journeo.com');
    setLoginPassword('Password123!');
    setLoginError(null);
  };

  return (
    <div className="auth-wrapper font-sans">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Top return link */}
        <div className="w-full max-w-[820px] flex items-center justify-between mb-4 px-2">
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

        {/* Sliding Auth Container */}
        <div className={`auth-container ${isActive ? 'active' : ''}`} id="container">
          {/* SIGN UP FORM CONTAINER */}
          <div className="form-container sign-up">
            <form className="auth-form" onSubmit={handleRegister}>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text mb-1">
                Create Account
              </h1>

              <div className="social-icons">
                <button
                  type="button"
                  title="Sign up with Google"
                  onClick={() => alert('Social sign-in will be available in the upcoming release. Please register with email below.')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Sign up with Facebook"
                  onClick={() => alert('Social sign-in will be available in the upcoming release.')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Sign up with GitHub"
                  onClick={() => alert('Social sign-in will be available in the upcoming release.')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </button>
              </div>

              <span className="sub-text">or register with your email address</span>

              {registerError && (
                <div className="auth-error-badge flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              <div className="w-full space-y-1 text-left">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="auth-input"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="auth-input"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="Create Password (min. 6 chars)"
                    className="auth-input pr-9"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-2.5 top-3 text-text-subtle hover:text-text"
                  >
                    {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="auth-input"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={registerLoading}
              >
                {registerLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            {/* Mobile switch to sign in */}
            <div className="mobile-toggle">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => setIsActive(false)}
              >
                Sign In
              </button>
            </div>
          </div>

          {/* SIGN IN FORM CONTAINER */}
          <div className="form-container sign-in">
            <form className="auth-form" onSubmit={handleLogin}>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text mb-1">
                Sign In
              </h1>

              <div className="social-icons">
                <button
                  type="button"
                  title="Sign in with Google"
                  onClick={() => alert('Social sign-in will be available in the upcoming release. Please sign in with email below.')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Sign in with Facebook"
                  onClick={() => alert('Social sign-in will be available in the upcoming release.')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="Sign in with GitHub"
                  onClick={() => alert('Social sign-in will be available in the upcoming release.')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </button>
              </div>

              <span className="sub-text">or log in with your email & password</span>

              {loginError && (
                <div className="auth-error-badge flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="w-full space-y-1 text-left">
                <input
                  type="email"
                  placeholder="Enter E-mail"
                  className="auth-input"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    className="auth-input pr-9"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-3 text-text-subtle hover:text-text"
                  >
                    {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="w-full flex items-center justify-between text-xs my-2">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-terracotta hover:underline font-medium text-[11px]"
                >
                  Autofill Demo Account
                </button>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link has been dispatched to your email address.');
                  }}
                  className="forgot-link"
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loginLoading}
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Mobile switch to sign up */}
            <div className="mobile-toggle">
              <span>Don't have an account?</span>
              <button
                type="button"
                onClick={() => setIsActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* SLIDING TOGGLE OVERLAY (DESKTOP) */}
          <div className="toggle-container">
            <div className="toggle">
              {/* Left Toggle Panel (Shown when active = registering, invites to login) */}
              <div className="toggle-panel toggle-left">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                  <Compass className="w-7 h-7 text-ivory" />
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-white mb-1">
                  Welcome to <br />Journeo
                </h1>
                <p className="text-xs sm:text-sm text-ivory/90 leading-relaxed max-w-[240px]">
                  Sign in with your email & password to access your personalized itineraries and trips.
                </p>
                <button
                  type="button"
                  className="auth-btn-ghost"
                  id="login"
                  onClick={() => setIsActive(false)}
                >
                  Sign In
                </button>
              </div>

              {/* Right Toggle Panel (Shown when not active = logging in, invites to register) */}
              <div className="toggle-panel toggle-right">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
                  <Compass className="w-7 h-7 text-ivory" />
                </div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-white mb-1">
                  Begin Your <br />Journey
                </h1>
                <p className="text-xs sm:text-sm text-ivory/90 leading-relaxed max-w-[240px]">
                  Register your account to unlock AI-powered travel planning, curated heritage circuits and adaptive travel tracking.
                </p>
                <button
                  type="button"
                  className="auth-btn-ghost"
                  id="register"
                  onClick={() => setIsActive(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials Helper Card */}
        <div className="mt-6 p-4 rounded-xl bg-ivory-dark/60 border border-border text-center text-xs text-text-muted max-w-[820px] w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />
            <span>
              <strong>Pre-seeded Demo Account:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-deep-green">demo@journeo.com</code> / <code className="bg-white px-1.5 py-0.5 rounded text-deep-green">Password123!</code>
            </span>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="px-3 py-1 bg-white hover:bg-sage/20 text-deep-green border border-border rounded-lg text-xs font-semibold transition-colors"
          >
            Load Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
