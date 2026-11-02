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
  AlertTriangle,
  Flag,
  Trophy,
  Award,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { MapComponent } from '../components/MapComponent';
import { Button } from '../components/ui/Button';

export const JourneyModePage: React.FC = () => {
  const navigate = useNavigate();
  const [stops, setStops] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [tripCompleted, setTripCompleted] = useState<boolean>(false);
  const [completionStats, setCompletionStats] = useState<any>(null);

  useEffect(() => {
    const cachedStops = sessionStorage.getItem('journeo_active_journey_stops');
    const cachedMeta = sessionStorage.getItem('journeo_active_journey_meta');

    if (cachedStops) {
      try {
        const parsed = JSON.parse(cachedStops);
        setStops(parsed);
        // Find first non-visited
        const firstPending = parsed.findIndex(
          (s: any) => s.visitStatus !== 'VISITED' && s.visitStatus !== 'SKIPPED'
        );
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
    updated[idx].actualVisitTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    } else {
      // All stops addressed - prompt completion
      triggerEndTripPrompt();
    }
  };

  const triggerEndTripPrompt = () => {
    setShowEndModal(true);
  };

  const confirmEndTrip = async () => {
    const visited = stops.filter(s => s.visitStatus === 'VISITED');
    const skipped = stops.filter(s => s.visitStatus === 'SKIPPED');

    const stats = {
      title: meta?.title || 'Indian Odyssey Journey',
      city: meta?.destinationCity || meta?.tripConfig?.city || 'India',
      totalStops: stops.length,
      visitedCount: visited.length,
      skippedCount: skipped.length,
      completionRate: Math.round((visited.length / Math.max(1, stops.length)) * 100),
      endedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCompletionStats(stats);
    setTripCompleted(true);

    // Persist completed trip to localStorage for MyTrips
    try {
      const savedTrips = JSON.parse(localStorage.getItem('journeo_saved_trips') || '[]');
      const updatedTrips = savedTrips.map((t: any) => {
        if (t.title === stats.title || t.id === meta?.tripId) {
          return { ...t, status: 'COMPLETED', stops };
        }
        return t;
      });
      localStorage.setItem('journeo_saved_trips', JSON.stringify(updatedTrips));
    } catch {}

    // Update backend if tripId exists
    if (meta?.tripId) {
      try {
        await api.updateTrip(meta.tripId, { status: 'COMPLETED' });
      } catch {}
    }
  };

  const completedCount = stops.filter(s => s.visitStatus === 'VISITED').length;
  const skippedCount = stops.filter(s => s.visitStatus === 'SKIPPED').length;
  const progressPercent =
    stops.length > 0 ? Math.round(((completedCount + skippedCount) / stops.length) * 100) : 0;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Top Journey Tracker Bar */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-deep-green/10 text-deep-green text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Active Journey Tracking Mode</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              {meta?.title || 'Personalized Travel Journey'}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Live route monitoring, check-ins, and adaptive progress across India
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/itinerary/preview">
              <Button variant="outline" size="sm">
                Exit to Timeline
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={triggerEndTripPrompt}
              icon={<Flag className="w-4 h-4" />}
            >
              End Trip
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text">
              Journey Progress: {completedCount} of {stops.length} Places Visited ({skippedCount} skipped)
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
                  Current Stop #{currentIdx + 1}
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
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-deep-green shadow-soft-sm">
                    ⏱️ {currentStop.visitDuration || 90} mins planned stay
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
                      Significance & Heritage Context:
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
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    (currentStop.destination?.name || '') + ' ' + (currentStop.destination?.city || '')
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-border bg-ivory hover:bg-ivory-dark text-xs font-semibold text-text flex items-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-sage" />
                  <span>Navigate in Maps</span>
                  <ExternalLink className="w-3 h-3 text-text-subtle" />
                </a>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkStatus(currentIdx, 'SKIPPED')}
                    icon={<XCircle className="w-4 h-4 text-text-muted" />}
                  >
                    Skip Stop
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleMarkStatus(currentIdx, 'VISITED')}
                    icon={<CheckCircle2 className="w-4 h-4 text-sage-light" />}
                  >
                    Mark as Visited
                  </Button>
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
                <span>Active Route Map & Check-ins</span>
              </span>
              <span className="text-xs text-text-muted">
                Stop {currentIdx + 1} of {stops.length} Active
              </span>
            </div>

            <MapComponent
              markers={mapMarkers}
              selectedMarkerId={currentStop?.id}
              height="480px"
              showRoute={true}
            />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border text-xs text-text-muted space-y-2">
            <div className="font-bold text-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-terracotta" />
              <span>Running late or changing your mind?</span>
            </div>
            <p className="leading-relaxed">
              If traffic delays your arrival, you can adjust dwell times or simulate an adaptive replan anytime.
            </p>
            <Link
              to="/itinerary/preview"
              className="inline-block text-xs font-bold text-deep-green hover:underline pt-1"
            >
              ← Return to Itinerary Timeline to Adapt Route
            </Link>
          </div>
        </div>
      </div>

      {/* CONFIRMATION / COMPLETION MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-[3000] bg-text/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-ivory border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 relative">
            {!tripCompleted ? (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-terracotta/15 text-terracotta flex items-center justify-center mx-auto">
                  <Flag className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-text">
                    End Active Journey?
                  </h3>
                  <p className="text-xs text-text-muted max-w-xs mx-auto">
                    Are you ready to conclude your trip? Your visited places and journey history will be permanently saved to your profile.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Places Visited:</span>
                    <span className="font-bold text-deep-green">{completedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Places Skipped:</span>
                    <span className="font-bold text-terracotta">{skippedCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Remaining Pending:</span>
                    <span className="font-bold text-text">
                      {Math.max(0, stops.length - completedCount - skippedCount)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowEndModal(false)}
                  >
                    Resume Journey
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={confirmEndTrip}
                  >
                    Confirm & Complete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-center">
                <div className="w-16 h-16 rounded-3xl bg-deep-green text-white flex items-center justify-center mx-auto shadow-soft-lg animate-bounce">
                  <Trophy className="w-8 h-8 text-sage-light" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
                    Journey Complete!
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-text">
                    Splendid Voyage!
                  </h3>
                  <p className="text-xs text-text-muted">
                    Your {completionStats?.city} expedition has been officially completed.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-border grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-0.5">
                    <div className="font-serif text-2xl font-bold text-deep-green">
                      {completionStats?.visitedCount} / {completionStats?.totalStops}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-text-subtle">
                      Places Explored
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-serif text-2xl font-bold text-terracotta">
                      {completionStats?.completionRate}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-text-subtle">
                      Route Completion
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate('/my-trips')}
                    icon={<Award className="w-4 h-4 text-sage-light" />}
                  >
                    View in My Trips Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                  >
                    Return to Home Page
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
