import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

interface AuthCardProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  redirectPath?: string;
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  initialMode = 'login',
  onSuccess,
  redirectPath = '/my-trips',
  className = ''
}) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isActive, setIsActive] = useState<boolean>(initialMode === 'register');

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
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectPath);
      }
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
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(redirectPath);
      }
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
    <div className={`auth-container shadow-2xl ${isActive ? 'active' : ''} ${className}`} id="container">
      {/* SIGN UP FORM CONTAINER */}
      <div className="form-container sign-up">
        <form className="auth-form" onSubmit={handleRegister}>
          <h2 className="font-serif text-2xl font-bold text-text mb-1">
            Create Account
          </h2>

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

          <span className="sub-text text-[11px]">or register with your email</span>

          {registerError && (
            <div className="auth-error-badge flex items-center gap-1.5 my-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{registerError}</span>
            </div>
          )}

          <div className="w-full space-y-1 text-left">
            <input
              type="text"
              placeholder="Full Name"
              className="auth-input py-2 text-xs"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              className="auth-input py-2 text-xs"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                placeholder="Password (min. 6 chars)"
                className="auth-input pr-8 py-2 text-xs"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                className="absolute right-2.5 top-2.5 text-text-subtle hover:text-text"
              >
                {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <input
              type={showRegisterPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              className="auth-input py-2 text-xs"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-btn-primary py-2.5 text-xs w-full mt-2"
            disabled={registerLoading}
          >
            {registerLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Mobile toggle link */}
        <div className="mobile-toggle">
          <span>Already have an account?</span>
          <button type="button" onClick={() => setIsActive(false)}>
            Sign In
          </button>
        </div>
      </div>

      {/* SIGN IN FORM CONTAINER */}
      <div className="form-container sign-in">
        <form className="auth-form" onSubmit={handleLogin}>
          <h2 className="font-serif text-2xl font-bold text-text mb-1">
            Sign In
          </h2>

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

          <span className="sub-text text-[11px]">or sign in with email & password</span>

          {loginError && (
            <div className="auth-error-badge flex items-center gap-1.5 my-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="w-full space-y-1 text-left">
            <input
              type="email"
              placeholder="Enter E-mail"
              className="auth-input py-2 text-xs"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <div className="relative">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                className="auth-input pr-8 py-2 text-xs"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-2.5 top-2.5 text-text-subtle hover:text-text"
              >
                {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs my-1.5">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-terracotta hover:underline font-semibold text-[11px]"
            >
              Demo Account Fill
            </button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link has been dispatched to your email.');
              }}
              className="forgot-link text-[11px]"
            >
              Forgot?
            </a>
          </div>

          <button
            type="submit"
            className="auth-btn-primary py-2.5 text-xs w-full"
            disabled={loginLoading}
          >
            {loginLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Mobile toggle link */}
        <div className="mobile-toggle">
          <span>Don't have an account?</span>
          <button type="button" onClick={() => setIsActive(true)}>
            Sign Up
          </button>
        </div>
      </div>

      {/* SLIDING TOGGLE OVERLAY (DESKTOP) */}
      <div className="toggle-container">
        <div className="toggle">
          {/* Left Toggle Panel (Shown when active = registering, invites to login) */}
          <div className="toggle-panel toggle-left">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2">
              <Compass className="w-6 h-6 text-ivory" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              Welcome Back!
            </h3>
            <p className="text-xs text-ivory/90 leading-relaxed max-w-[200px] mb-3">
              Sign in to resume your personalized journeys and saved trips.
            </p>
            <button
              type="button"
              className="auth-btn-ghost py-2 text-xs"
              id="login"
              onClick={() => setIsActive(false)}
            >
              Sign In
            </button>
          </div>

          {/* Right Toggle Panel (Shown when not active = logging in, invites to register) */}
          <div className="toggle-panel toggle-right">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-sage-light" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
              New to Journeo?
            </h3>
            <p className="text-xs text-ivory/90 leading-relaxed max-w-[200px] mb-3">
              Create your account to unlock AI-powered itineraries and adaptive travel tools.
            </p>
            <button
              type="button"
              className="auth-btn-ghost py-2 text-xs"
              id="register"
              onClick={() => setIsActive(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
