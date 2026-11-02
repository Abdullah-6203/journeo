import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Clock, Filter, ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const CITIES = ['All', 'Delhi', 'Jaipur', 'Agra', 'Varanasi', 'Udaipur', 'Hampi'];
const CATEGORIES = ['All', 'Heritage', 'Monument', 'Religious Heritage', 'Museums', 'Nature', 'Hidden Gems'];

export const DestinationsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || 'All';

  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (selectedCity !== 'All') params.city = selectedCity;
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;

    api.getDestinations(params).then(data => {
      setDestinations(data.destinations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedCity, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-border p-8 shadow-soft-sm space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
            Destination Catalogue
          </span>
          <h1 className="font-serif text-3xl font-bold text-text mt-1">
            Discover Historic India
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Explore verified architectural wonders, ancient citadels, and holy riverbanks documented with official citations.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="pt-4 border-t border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search monuments, stepwells, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ivory border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-deep-green"
            />
          </div>

          {/* City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => { setSelectedCity(c); setSearchParams(c === 'All' ? {} : { city: c }); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCity === c
                    ? 'bg-deep-green text-white shadow-soft-sm'
                    : 'bg-ivory border border-border text-text hover:bg-ivory-dark'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] font-bold text-text-subtle mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-sage text-white font-bold'
                  : 'bg-ivory-dark text-text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Destination Cards */}
      {loading ? (
        <div className="p-20 text-center text-xs text-text-muted">
          Loading destination catalogue...
        </div>
      ) : destinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(dest => (
            <div
              key={dest.id}
              className="bg-white rounded-3xl overflow-hidden border border-border shadow-soft-sm hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-deep-green">
                    {dest.city}
                  </div>
                  {dest.isMustVisit && (
                    <div className="absolute top-3 right-3 bg-terracotta text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" /> Must Visit
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-sage-dark bg-sage/15 px-2 py-0.5 rounded">
                      {dest.category}
                    </span>
                    <span className="text-[11px] text-text-subtle">
                      ⏱️ {dest.averageVisitDuration}m dwell
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-text group-hover:text-deep-green transition-colors leading-snug">
                    {dest.name}
                  </h3>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {(dest.interestTags || []).slice(0, 2).map((t: string) => (
                      <span key={t} className="text-[10px] bg-ivory text-text-muted px-2 py-0.5 rounded border border-border/60">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono text-text-subtle">
                  {dest.entryFeeINR === 0 ? 'Free Entry' : `₹${dest.entryFeeINR} Entry`}
                </span>

                <Link
                  to={`/destinations/${dest.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-ivory hover:bg-sage hover:text-white text-xs font-semibold text-text transition-colors flex items-center gap-1"
                >
                  <span>Explore Site</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border p-16 text-center text-xs text-text-muted">
          No destinations found matching your filters. Try adjusting city or category search.
        </div>
      )}
    </div>
  );
};
