import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  XCircle,
  Navigation,
  ExternalLink,
  RotateCcw,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { MapComponent } from '../components/MapComponent';

export const JourneyModePage: React.FC = () => {
  const navigate = useNavigate();
  const [stops, setStops] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  useEffect(() => {
    const cachedStops = sessionStorage.getItem('journeo_active_journey_stops');
    const cachedMeta = sessionStorage.getItem('journeo_active_journey_meta');

    if (cachedStops) {
      try {
        const parsed = JSON.parse(cachedStops);
        setStops(parsed);
        // Find first non-visited
        const firstPending = parsed.findIndex((s: any) => s.visitStatus !== 'VISITED' && s.visitStatus !== 'SKIPPED');
        if (firstPending !== -1) setCurrentIdx(firstPending);
      } catch (err) {
        console.error('Error loading journey:', err);
      }
    }
    if (cachedMeta) {
      try {
        setMeta(JSON.parse(cachedMeta));
      } catch (err) {}
    }
  }, []);

  const handleMarkStatus = async (idx: number, status: 'VISITED' | 'SKIPPED') => {
    const updated = [...stops];
    updated[idx].visitStatus = status;
    setStops(updated);
    sessionStorage.setItem('journeo_active_journey_stops', JSON.stringify(updated));

    if (updated[idx].id && meta?.tripId) {
      try {
        await api.updateStopStatus(updated[idx].id, status);
      } catch (err) {}
    }

    // Advance to next stop if possible
    if (idx + 1 < updated.length) {
      setCurrentIdx(idx + 1);
    }
  };

  const completedCount = stops.filter(s => s.visitStatus === 'VISITED').length;
  const skippedCount = stops.filter(s => s.visitStatus === 'SKIPPED').length;
  const progressPercent = stops.length > 0 ? Math.round(((completedCount + skippedCount) / stops.length) * 100) : 0;

  const currentStop = stops[currentIdx] || stops[0];
  const nextStop = stops[currentIdx + 1];

  const mapMarkers = stops.map((s, i) => {
    const dest = s.destination || {};
    return {
      id: s.id || String(i),
      lat: dest.latitude || 28.6,
      lng: dest.longitude || 77.2,
      title: dest.name || 'Stop',
      order: i + 1,
      status: s.visitStatus,
      isMustVisit: s.isMustVisit,
      timing: `${s.plannedArrival} - ${s.plannedDeparture}`,
      imageUrl: dest.imageUrl,
      description: dest.description
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Journey Tracker Bar */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-deep-green/10 text-deep-green text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Active Journey Tracking Mode</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              {meta?.title || 'Imperial Delhi Royal Heritage Circuit'}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Live route monitoring & real-time monument check-in
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/itinerary/preview"
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-ivory"
            >
              Exit to Timeline
            </Link>
            <Link
              to="/my-trips"
              className="px-5 py-2 rounded-xl bg-deep-green text-white text-xs font-semibold hover:bg-deep-green-dark transition-colors shadow-soft-sm"
            >
              My Trips Dashboard
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text">
              Trip Progress: {completedCount} of {stops.length} Monuments Visited
            </span>
            <span className="font-mono font-bold text-deep-green">{progressPercent}%</span>
          </div>
          <div className="w-full bg-ivory-dark h-3 rounded-full overflow-hidden border border-border/80">
            <div
              className="bg-deep-green h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Interface: Left Active Stop & Next Stop, Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (6 cols): Current Stop & Queue */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Stop Focus Card */}
          {currentStop && (
            <div className="bg-white rounded-3xl border-2 border-deep-green p-6 sm:p-7 shadow-soft-lg space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white bg-deep-green px-3 py-1 rounded-full">
                  Current Destination (Stop {currentIdx + 1})
                </span>
                <span className="text-xs text-text-subtle font-mono">
                  Planned: {currentStop.plannedArrival} - {currentStop.plannedDeparture}
                </span>
              </div>

              <div className="space-y-3">
                <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-border">
                  <img
                    src={currentStop.destination?.imageUrl}
                    alt={currentStop.destination?.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-deep-green">
                    ⏱️ {currentStop.visitDuration} mins allocated stay
                  </div>
                </div>

                <h2 className="font-serif text-2xl font-bold text-text">
                  {currentStop.destination?.name}
                </h2>

                <p className="text-xs text-text-muted leading-relaxed">
                  {currentStop.destination?.description}
                </p>

                {currentStop.destination?.historicalSignificance && (
                  <div className="bg-ivory p-3.5 rounded-xl border border-border text-xs text-text space-y-1">
                    <span className="font-bold text-deep-green block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                      Historical Significance:
                    </span>
                    <p className="text-text-muted leading-relaxed">
                      {currentStop.destination.historicalSignificance}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons for Current Stop */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentStop.destination?.name + ' ' + currentStop.destination?.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-border bg-ivory hover:bg-ivory-dark text-xs font-semibold text-text flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-sage" />
                  <span>Navigate in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-text-subtle" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkStatus(currentIdx, 'SKIPPED')}
                    className="px-3.5 py-2.5 rounded-xl border border-border text-xs font-semibold text-text-muted hover:text-terracotta hover:bg-terracotta/10 transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Skip Stop</span>
                  </button>

                  <button
                    onClick={() => handleMarkStatus(currentIdx, 'VISITED')}
                    className="px-5 py-2.5 rounded-xl bg-deep-green hover:bg-deep-green-dark text-white text-xs font-bold transition-all shadow-soft-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sage-light" />
                    <span>Mark as Visited</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Up Next Preview */}
          {nextStop && (
            <div className="bg-ivory rounded-2xl border border-border p-5 space-y-2">
              <div className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">
                Up Next: Stop {currentIdx + 2}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-text">
                    {nextStop.destination?.name}
                  </h4>
                  <p className="text-xs text-text-muted">
                    Arrival at {nextStop.plannedArrival} • {nextStop.visitDuration}m stay
                  </p>
                </div>
                <img
                  src={nextStop.destination?.imageUrl}
                  alt={nextStop.destination?.name}
                  className="w-12 h-12 rounded-xl object-cover border border-border"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column (6 cols): Live Map Route */}
        <div className="lg:col-span-6 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-border p-4 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="font-serif font-bold text-base text-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-deep-green" />
                <span>Active Journey Route Map</span>
              </span>
              <span className="text-xs text-text-muted">
                Stop {currentIdx + 1} of {stops.length} Active
              </span>
            </div>

            <MapComponent
              markers={mapMarkers}
              selectedMarkerId={currentStop?.id}
              height="500px"
              showRoute={true}
            />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border text-xs text-text-muted space-y-2">
            <div className="font-bold text-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-terracotta" />
              <span>Need to adapt your route due to unexpected delays?</span>
            </div>
            <p className="leading-relaxed">
              If traffic or extended visits push your timetable, you can trigger the adaptive replanner anytime from your timeline.
            </p>
            <Link
              to="/itinerary/preview"
              className="inline-block text-xs font-bold text-deep-green hover:underline pt-1"
            >
              ← Return to Itinerary Timeline to Simulate Delays
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
