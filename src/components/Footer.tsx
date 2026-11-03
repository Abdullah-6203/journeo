import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Globe, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#DCE2D2] border-t border-[#C9D0BF] mt-auto pt-16 pb-12 text-[#344B3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#49634F] text-white flex items-center justify-center shadow-soft-sm">
                <Compass className="w-5 h-5 text-[#E8E9DC]" />
              </div>
              <span className="font-serif font-bold text-xl text-[#344B3C]">Journeo</span>
            </div>
            <p className="text-xs text-[#5C6B5B] leading-relaxed">
              "Travel at your own pace. Discover places that match your interests. Let Journeo plan the journey."
            </p>
            <p className="text-[11px] text-[#667363]">
              Curated heritage citations from Archaeological Survey of India (ASI) & UNESCO World Heritage Centre.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#344B3C] mb-3">Explore Destinations</h4>
            <ul className="space-y-2 text-xs text-[#5C6B5B]">
              <li><Link to="/explore?destination=Delhi" className="hover:text-[#49634F] transition-colors">Delhi Royal Citadels</Link></li>
              <li><Link to="/explore?destination=Jaipur" className="hover:text-[#49634F] transition-colors">Jaipur Rajput Forts</Link></li>
              <li><Link to="/explore?destination=Agra" className="hover:text-[#49634F] transition-colors">Agra Mughal Architecture</Link></li>
              <li><Link to="/explore?destination=Varanasi" className="hover:text-[#49634F] transition-colors">Varanasi Spiritual Ghats</Link></li>
              <li><Link to="/explore?destination=Udaipur" className="hover:text-[#49634F] transition-colors">Udaipur Lake Palaces</Link></li>
              <li><Link to="/explore?destination=Goa" className="hover:text-[#49634F] transition-colors">Goa Heritage & Beaches</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#344B3C] mb-3">Platform & Features</h4>
            <ul className="space-y-2 text-xs text-[#5C6B5B]">
              <li><Link to="/plan" className="hover:text-[#49634F] transition-colors">AI Itinerary Optimizer</Link></li>
              <li><Link to="/explore" className="hover:text-[#49634F] transition-colors">Destination Discovery</Link></li>
              <li><a href="/#how-it-works" className="hover:text-[#49634F] transition-colors">Adaptive Replanner</a></li>
              <li><Link to="/my-trips" className="hover:text-[#49634F] transition-colors">Journey Tracking Mode</Link></li>
              <li><Link to="/profile" className="hover:text-[#49634F] transition-colors">Travel Preferences</Link></li>
            </ul>
          </div>

          {/* About & Trust */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#344B3C] mb-3">About & Trust</h4>
            <ul className="space-y-2 text-xs text-[#5C6B5B]">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[#A98954]" /> Verified Official Data</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#A98954]" /> Google Maps Layer</li>
              <li className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#A98954]" /> contact@journeo.travel</li>
              <li className="pt-2 text-[11px] text-[#667363]">Privacy Policy • Terms & Conditions</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#C9D0BF] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#667363] gap-4">
          <p>© {new Date().getFullYear()} Journeo Travel Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with precision for thoughtful travelers
          </p>
        </div>
      </div>
    </footer>
  );
};
