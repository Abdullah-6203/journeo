import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, User, LogOut, Bookmark, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#F7F4EA]/95 backdrop-blur-md border-b border-border shadow-soft-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-deep-green text-white flex items-center justify-center font-serif text-xl shadow-soft-sm group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-ivory" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-2xl tracking-tight text-text">
                Journeo
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta mb-1" />
            </div>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-text-subtle block -mt-1">
              Personalized Travel Companion
            </span>
          </div>
        </Link>

        {/* Centre: Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
          <Link
            to="/"
            className={`transition-colors hover:text-deep-green ${isActive('/') ? 'text-deep-green font-semibold' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={`transition-colors hover:text-deep-green ${isActive('/explore') ? 'text-deep-green font-semibold' : ''}`}
          >
            Explore
          </Link>
          <Link
            to="/destinations"
            className={`transition-colors hover:text-deep-green ${isActive('/destinations') ? 'text-deep-green font-semibold' : ''}`}
          >
            Destinations
          </Link>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-deep-green"
          >
            How It Works
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/my-trips"
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/my-trips')
                    ? 'bg-sage/20 text-deep-green font-bold'
                    : 'text-text-muted hover:text-text hover:bg-ivory-dark/60'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Trips</span>
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/profile')
                    ? 'bg-sage/20 text-deep-green font-bold'
                    : 'text-text-muted hover:text-text hover:bg-ivory-dark/60'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-text-subtle hover:text-terracotta transition-colors rounded-lg hover:bg-ivory-dark/50"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/my-trips"
                className="text-xs font-semibold text-text-muted hover:text-text px-2.5 py-1.5 transition-colors hidden sm:block"
              >
                My Trips
              </Link>
              <button
                onClick={() => onOpenAuth ? onOpenAuth('login') : navigate('/login')}
                className="px-3.5 py-2 text-xs font-semibold text-text hover:text-deep-green transition-colors"
              >
                Login / Sign Up
              </button>
            </div>
          )}

          {/* Prominent Dark Green CTA */}
          <Link
            to="/plan"
            className="px-5 py-2.5 rounded-xl bg-deep-green hover:bg-deep-green-dark text-white font-semibold text-xs tracking-wide shadow-soft-sm hover:shadow-soft-md transition-all flex items-center gap-1.5 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-sage-light group-hover:rotate-12 transition-transform" />
            <span>Plan My Trip</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
