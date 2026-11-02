import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, Globe, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ivory-dark border-t border-border mt-auto pt-16 pb-12 text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-deep-green text-white flex items-center justify-center">
                <Compass className="w-5 h-5 text-ivory" />
              </div>
              <span className="font-serif font-bold text-xl text-text">Journeo</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              "Travel at your own pace. Discover places that match your interests. Let Journeo plan the journey."
            </p>
            <p className="text-[11px] text-text-subtle">
              Curated heritage citations from Archaeological Survey of India (ASI) & UNESCO World Heritage Centre.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-sm text-text mb-3">Explore Destinations</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li><Link to="/destinations?city=Delhi" className="hover:text-deep-green transition-colors">Delhi Royal Citadels</Link></li>
              <li><Link to="/destinations?city=Jaipur" className="hover:text-deep-green transition-colors">Jaipur Rajput Forts</Link></li>
              <li><Link to="/destinations?city=Agra" className="hover:text-deep-green transition-colors">Agra Mughal Architecture</Link></li>
              <li><Link to="/destinations?city=Varanasi" className="hover:text-deep-green transition-colors">Varanasi Spiritual Ghats</Link></li>
              <li><Link to="/destinations?city=Udaipur" className="hover:text-deep-green transition-colors">Udaipur Lake Palaces</Link></li>
              <li><Link to="/destinations?city=Hampi" className="hover:text-deep-green transition-colors">Hampi Vijayanagara Ruins</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-serif font-bold text-sm text-text mb-3">Platform & Features</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li><Link to="/plan" className="hover:text-deep-green transition-colors">AI Itinerary Optimizer</Link></li>
              <li><Link to="/explore" className="hover:text-deep-green transition-colors">Destination Discovery</Link></li>
              <li><a href="#how-it-works" className="hover:text-deep-green transition-colors">Adaptive Replanner</a></li>
              <li><Link to="/my-trips" className="hover:text-deep-green transition-colors">Journey Tracking Mode</Link></li>
              <li><Link to="/profile" className="hover:text-deep-green transition-colors">Travel Preferences</Link></li>
            </ul>
          </div>

          {/* About & Trust */}
          <div>
            <h4 className="font-serif font-bold text-sm text-text mb-3">About & Trust</h4>
            <ul className="space-y-2 text-xs text-text-muted">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-sage" /> Verified Official Data</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-sage" /> Google Maps Layer</li>
              <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-sage" /> contact@journeo.travel</li>
              <li className="pt-2 text-[11px] text-text-subtle">Privacy Policy • Terms & Conditions</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-subtle gap-4">
          <p>© 2026 Journeo Travel Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with precision for thoughtful travelers
          </p>
        </div>
      </div>
    </footer>
  );
};
