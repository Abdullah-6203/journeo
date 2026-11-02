import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Ticket,
  ShieldCheck,
  Star,
  Bookmark,
  Share2,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Compass,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from '../components/MapComponent';

export const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [destination, setDestination] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getDestinationById(id).then(data => {
      setDestination(data.destination);
      setSimilar(data.similarDestinations || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleToggleSave = async () => {
    if (!user) {
      alert('Please log in to save this destination to your profile.');
      return;
    }
    if (!id) return;
    try {
      const res = await api.toggleSaveDestination(id);
      setSaved(res.saved);
      setNotice(res.message);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving destination');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-text-muted">
        Loading monument details and historical citations...
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-text">Destination Not Found</h2>
        <Link to="/destinations" className="text-xs text-deep-green font-bold underline">
          Return to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              saved
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-white border-border text-text hover:bg-ivory'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
            <span>{saved ? 'Saved' : 'Save to Favorites'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-deep-green text-white text-xs font-semibold py-2 px-4 rounded-xl text-center shadow-sm">
          {notice}
        </div>
      )}

      {/* Hero Visual Section */}
      <div className="relative h-80 sm:h-[420px] rounded-3xl overflow-hidden border border-border shadow-soft-lg">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#223325]/85 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
              {destination.city}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-terracotta px-2.5 py-1 rounded-md">
              {destination.category}
            </span>
            {destination.isMustVisit && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gold text-white px-2.5 py-1 rounded-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" /> Must Visit Landmark
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {destination.name}
          </h1>

          <p className="text-xs sm:text-sm text-ivory/90 max-w-2xl font-light">
            Verified data provided by {destination.officialSource || 'Archaeological Survey of India & UNESCO World Heritage'}.
          </p>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Description, Story, Highlights */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview Card */}
          <div className="bg-white rounded-3xl border border-border p-7 shadow-soft-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-text">
              Architectural Overview & Highlights
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed font-sans">
              {destination.description}
            </p>

            {/* Interest Tags */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              {(destination.interestTags || []).map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs font-semibold bg-ivory text-text-muted px-3 py-1 rounded-full border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Dedicated Section: Discover Its Story (Section 12 requirement) */}
          <div className="bg-[#FAF7F0] rounded-3xl border border-border p-7 shadow-soft-sm space-y-3">
            <div className="flex items-center gap-2 text-deep-green font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-terracotta" />
              <span>Discover Its Story — Historical Significance</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-text">
              Royal Heritage & Cultural Context
            </h3>
            <p className="text-xs sm:text-sm text-text leading-relaxed font-serif italic text-[#3F3B35]">
              "{destination.historicalSignificance || destination.description}"
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs text-text-subtle">
              <ShieldCheck className="w-4 h-4 text-deep-green" />
              <span>Citation: {destination.officialSource || 'Archaeological Survey of India (ASI)'}</span>
            </div>
          </div>

          {/* Highlights List */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-7 shadow-soft-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-text">
                Notable Architectural Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destination.highlights.map((h: string, idx: number) => (
                  <div key={idx} className="bg-ivory p-3 rounded-xl border border-border text-xs text-text flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sage/20 text-deep-green flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location on Map */}
          <div className="bg-white rounded-3xl border border-border p-6 shadow-soft-sm space-y-3">
            <h3 className="font-serif text-lg font-bold text-text flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta" />
              <span>Geographic Location</span>
            </h3>
            <MapComponent
              markers={[{
                id: destination.id,
                lat: destination.latitude,
                lng: destination.longitude,
                title: destination.name,
                order: 1,
                isMustVisit: destination.isMustVisit
              }]}
              center={[destination.latitude, destination.longitude]}
              zoom={14}
              height="350px"
              showRoute={false}
            />
          </div>
        </div>

        {/* Right Column (4 cols): Quick Facts, Add to Trip */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-white rounded-3xl border border-border p-6 shadow-soft-sm space-y-5">
            <h3 className="font-serif font-bold text-lg text-text">
              Visiting Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-ivory p-3 rounded-xl border border-border flex items-center gap-3">
                <Clock className="w-4 h-4 text-deep-green flex-shrink-0" />
                <div>
                  <div className="text-text-subtle text-[11px]">Visiting Hours</div>
                  <div className="font-semibold text-text">{destination.openingHours}</div>
                </div>
              </div>

              <div className="bg-ivory p-3 rounded-xl border border-border flex items-center gap-3">
                <Ticket className="w-4 h-4 text-terracotta flex-shrink-0" />
                <div>
                  <div className="text-text-subtle text-[11px]">Entry Ticket (ASI)</div>
                  <div className="font-semibold text-text">
                    {destination.entryFeeINR === 0 ? 'Free Entry' : `₹${destination.entryFeeINR} per visitor`}
                  </div>
                </div>
              </div>

              <div className="bg-ivory p-3 rounded-xl border border-border flex items-center gap-3">
                <Compass className="w-4 h-4 text-sage flex-shrink-0" />
                <div>
                  <div className="text-text-subtle text-[11px]">Recommended Dwell Time</div>
                  <div className="font-semibold text-text">{destination.averageVisitDuration} minutes</div>
                </div>
              </div>
            </div>

            <Link
              to="/plan"
              className="w-full py-3 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-soft-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-sage-light" />
              <span>Add to New Itinerary</span>
            </Link>
          </div>

          {/* Similar Nearby Destinations */}
          {similar.length > 0 && (
            <div className="bg-white rounded-3xl border border-border p-6 shadow-soft-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-text">
                Similar Nearby Destinations
              </h3>
              <div className="space-y-3">
                {similar.map(s => (
                  <Link
                    key={s.id}
                    to={`/destinations/${s.id}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-ivory transition-colors group"
                  >
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-xs text-text truncate group-hover:text-deep-green">
                        {s.name}
                      </h4>
                      <div className="text-[10px] text-text-subtle">{s.city} • {s.averageVisitDuration}m</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
