import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, User, LogOut, Bookmark, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F7F4EA]/95 backdrop-blur-md border-b border-border shadow-soft-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" onClick={closeMobile} className="flex items-center gap-3 group">
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

        {/* Centre: Desktop Nav links */}
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
            href="/#how-it-works"
            className="transition-colors hover:text-deep-green"
          >
            How It Works
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
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
                <span>{user.name.split(' ')[0]}</span>
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
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-text hover:text-deep-green transition-colors"
              >
                Login / Sign Up
              </Link>
            </div>
          )}

          {/* Dark Green CTA */}
          <Link
            to="/plan"
            className="px-5 py-2.5 rounded-xl bg-deep-green hover:bg-deep-green-dark text-white font-semibold text-xs tracking-wide shadow-soft-sm hover:shadow-soft-md transition-all flex items-center gap-1.5 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-sage-light group-hover:rotate-12 transition-transform" />
            <span>Plan My Trip</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link
            to="/plan"
            className="px-3 py-1.5 rounded-lg bg-deep-green text-white text-xs font-semibold"
          >
            Plan
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-text hover:bg-ivory-dark"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-[#F7F4EA] px-4 pt-4 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link
              to="/"
              onClick={closeMobile}
              className={`p-2 rounded-lg hover:bg-ivory-dark ${isActive('/') ? 'text-deep-green font-bold bg-sage/10' : 'text-text'}`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={closeMobile}
              className={`p-2 rounded-lg hover:bg-ivory-dark ${isActive('/explore') ? 'text-deep-green font-bold bg-sage/10' : 'text-text'}`}
            >
              Explore
            </Link>
            <Link
              to="/destinations"
              onClick={closeMobile}
              className={`p-2 rounded-lg hover:bg-ivory-dark ${isActive('/destinations') ? 'text-deep-green font-bold bg-sage/10' : 'text-text'}`}
            >
              Destinations
            </Link>
            <a
              href="/#how-it-works"
              onClick={closeMobile}
              className="p-2 rounded-lg hover:bg-ivory-dark text-text"
            >
              How It Works
            </a>
            {user ? (
              <>
                <Link
                  to="/my-trips"
                  onClick={closeMobile}
                  className="p-2 rounded-lg hover:bg-ivory-dark text-text flex items-center justify-between"
                >
                  <span>My Trips</span>
                  <Bookmark className="w-4 h-4 text-deep-green" />
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMobile}
                  className="p-2 rounded-lg hover:bg-ivory-dark text-text flex items-center justify-between"
                >
                  <span>Profile ({user.name})</span>
                  <User className="w-4 h-4 text-deep-green" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobile();
                  }}
                  className="p-2 rounded-lg hover:bg-terracotta/10 text-terracotta text-left flex items-center justify-between"
                >
                  <span>Log Out</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="p-2 rounded-lg bg-sage/15 text-deep-green font-bold text-center mt-2"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
