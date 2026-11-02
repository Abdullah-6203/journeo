import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Play,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ShieldCheck,
  Star,
  ChevronDown,
  Layers,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapComponent } from '../components/MapComponent';

export const ItineraryResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [itineraryData, setItineraryData] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  // Replan modal
  const [replanOpen, setReplanOpen] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [replanScenario, setReplanScenario] = useState<any>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('prioritize_must_visits');

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('journeo_generated_plan');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setItineraryData(parsed);
        const scheduled = parsed.plan?.scheduledStops || parsed.stops || [];
        setStops(scheduled);
        if (scheduled.length > 0) {
          setSelectedStopId(scheduled[0].id || scheduled[0].destinationId);
        }
      } catch (err) {
        console.error('Error loading cached itinerary:', err);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRemoveStop = (idx: number) => {
    if (stops.length <= 2) {
      alert('An itinerary requires at least 2 stops for a complete route.');
      return;
    }
    const updated = stops.filter((_, i) => i !== idx).map((s, newIdx) => ({
      ...s,
      sequenceNumber: newIdx + 1
    }));
    setStops(updated);
    showToast('Stop removed. Route and schedule adjusted.');
  };

  const handleEditDuration = (idx: number, delta: number) => {
    const updated = [...stops];
    const target = updated[idx];
    const newDur = Math.max(30, Math.min(240, (target.visitDuration || 60) + delta));
    target.visitDuration = newDur;
    setStops(updated);
    showToast(`Dwell time updated to ${newDur} mins.`);
  };

  const handleSaveTrip = async () => {
    if (!user) {
      alert('Please log in or click Quick Demo Login to save your trip.');
      return;
    }
    setSaving(true);
    try {
      const config = itineraryData?.tripConfig || {};
      const payload = {
        title: itineraryData?.title || `${itineraryData?.destinationCity || 'India'} Personalised Circuit`,
        destinationCity: itineraryData?.destinationCity || config.city || 'India',
        startDate: config.startDate || new Date().toISOString().split('T')[0],
        endDate: config.startDate || new Date().toISOString().split('T')[0],
        startingLocation: config.startingLocation || 'City Centre',
        budget: config.budget || 3000,
        groupSize: config.groupSize || 2,
        transportation: config.transportation || 'cab',
        travelStyle: config.travelStyle || 'balanced',
        status: 'UPCOMING',
        optimizationScore: itineraryData?.plan?.optimizationScore || 95,
        totalDistanceKm: itineraryData?.plan?.totalDistanceKm || 20.9,
        totalDurationMin: itineraryData?.plan?.totalDurationMin || 420,
        stops: stops.map((s, idx) => ({
          destinationId: s.destinationId || s.destination?.id || `dest-${idx + 1}`,
          sequenceNumber: idx + 1,
          destination: s.destination || { name: s.destinationId || `Stop ${idx + 1}`, imageUrl: '' },
          plannedArrival: s.plannedArrival,
          plannedDeparture: s.plannedDeparture,
          visitDuration: s.visitDuration,
          visitStatus: s.visitStatus || 'PENDING',
          isMustVisit: s.isMustVisit || false,
          transitInstruction: s.transitInstruction || '',
          transitMinutes: s.transitMinutes || 15,
          distanceFromPrevKm: s.distanceFromPrevKm || 3.0
        }))
      };

      // Always save to localStorage so My Trips is populated immediately
      const savedTrips = JSON.parse(localStorage.getItem('journeo_saved_trips') || '[]');
      const newTripRecord = {
        id: 'trip_' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('journeo_saved_trips', JSON.stringify([newTripRecord, ...savedTrips.filter((t: any) => t.title !== payload.title)]));

      // Attempt backend persistence if available
      try {
        const res = await api.createTrip(payload);
        if (res?.trip) {
          sessionStorage.setItem('journeo_active_trip', JSON.stringify(res.trip));
        }
      } catch (backendErr) {
        console.warn('Backend API save skipped, saved locally:', backendErr);
      }

      showToast('🎉 Trip saved successfully to My Trips!');
    } catch (err: any) {
      alert(err.message || 'Failed to save trip');
    } finally {
      setSaving(false);
    }
  };

  const handleStartJourney = async () => {
    // If not saved yet, save automatically or stash in session
    if (user && !itineraryData?.tripId) {
      await handleSaveTrip();
    }
    sessionStorage.setItem('journeo_active_journey_stops', JSON.stringify(stops));
    sessionStorage.setItem('journeo_active_journey_meta', JSON.stringify(itineraryData));
    navigate('/journey');
  };

  // Adaptive Replanner Simulation Trigger
  const handleOpenReplan = async (delayedIndex: number = 0, delayMinutes: number = 45) => {
    setReplanning(true);
    setReplanOpen(true);
    try {
      const scenario = await api.replanItinerary('preview', {
        delayedStopIndex: delayedIndex,
        delayMinutes,
        reason: 'running_late',
        stops
      });
      setReplanScenario(scenario);
    } catch (err) {
      console.error('Replan API failed:', err);
    } finally {
      setReplanning(false);
    }
  };

  const handleApplyStrategy = () => {
    if (!replanScenario) return;
    const strat = replanScenario.strategies.find((s: any) => s.id === selectedStrategyId) || replanScenario.strategies[0];
    if (strat && strat.stops) {
      setStops(strat.stops);
      setReplanOpen(false);
      showToast(`✅ Applied "${strat.title}". Downstream stops adapted.`);
    }
  };

  const mapMarkers = stops.map((s, idx) => {
    const dest = s.destination || {};
    return {
      id: s.id || dest.id || String(idx),
      lat: dest.latitude || 28.6,
      lng: dest.longitude || 77.2,
      title: dest.name || 'Monument',
      order: idx + 1,
      isMustVisit: s.isMustVisit,
      timing: `${s.plannedArrival} - ${s.plannedDeparture}`,
      imageUrl: dest.imageUrl,
      description: dest.description
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="bg-deep-green text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-soft-md text-center sticky top-24 z-40 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header & Metrics Strip */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                Optimized Heritage Itinerary
              </span>
              <span className="text-[11px] font-semibold text-deep-green bg-sage/15 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ASI / UNESCO Verified
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              {itineraryData?.title || 'Delhi Royal Heritage Circuit'}
            </h1>
            <p className="text-xs text-text-muted mt-1">
              Starting from {itineraryData?.tripConfig?.startingLocation || 'Connaught Place'} • {stops.length} Curated Stops
            </p>
          </div>

          {/* Core Actions: Save, Replan, Start Journey */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenReplan(0, 45)}
              className="px-4 py-2.5 rounded-xl border border-terracotta/40 bg-terracotta/10 hover:bg-terracotta/20 text-terracotta-dark text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Simulate 45-min delay and test adaptive replanning"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-terracotta" />
              <span>Simulate Delay</span>
            </button>

            <button
              onClick={handleSaveTrip}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-border bg-ivory hover:bg-ivory-dark text-text text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-text-subtle" />
              <span>{saving ? 'Saving...' : 'Save Trip'}</span>
            </button>

            <button
              onClick={handleStartJourney}
              className="px-5 py-2.5 rounded-xl bg-deep-green hover:bg-deep-green-dark text-white text-xs font-bold transition-all shadow-soft-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Journey Mode</span>
            </button>
          </div>
        </div>

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
          <div className="bg-ivory rounded-xl p-3 border border-border/70 text-center">
            <span className="text-[11px] text-text-subtle block">Total Stops</span>
            <span className="font-serif font-bold text-lg text-text">{stops.length}</span>
          </div>

          <div className="bg-ivory rounded-xl p-3 border border-border/70 text-center">
            <span className="text-[11px] text-text-subtle block">Est. Travel Distance</span>
            <span className="font-serif font-bold text-lg text-text">
              {itineraryData?.plan?.totalDistanceKm || 20.9} km
            </span>
          </div>

          <div className="bg-ivory rounded-xl p-3 border border-border/70 text-center">
            <span className="text-[11px] text-text-subtle block">Total Duration</span>
            <span className="font-serif font-bold text-lg text-text">
              {Math.round(((itineraryData?.plan?.totalDurationMin || 420) / 60) * 10) / 10} hrs
            </span>
          </div>

          <div className="bg-ivory rounded-xl p-3 border border-border/70 text-center">
            <span className="text-[11px] text-text-subtle block">Route Score</span>
            <span className="font-serif font-bold text-lg text-deep-green">
              {itineraryData?.plan?.optimizationScore || 96}%
            </span>
          </div>
        </div>
      </div>

      {/* SPLIT SCREEN: LEFT TIMELINE (5 cols), RIGHT MAP (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE: ITINERARY TIMELINE */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-text">
              Schedule & Stops Timeline
            </h2>
            <span className="text-xs text-text-muted">
              Click duration to adjust dwell time
            </span>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-sage/40">
            {stops.map((stop, idx) => {
              const dest = stop.destination || {};
              const isSelected = selectedStopId === (stop.id || dest.id);

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Stop Dot */}
                  <div className={`absolute -left-6 top-4 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-sm ${
                    stop.isMustVisit ? 'bg-terracotta text-white' : 'bg-deep-green text-white'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Transit Callout */}
                  <div className="text-[11px] text-text-subtle font-medium mb-1.5 flex items-center gap-1.5 pl-2">
                    <Navigation className="w-3 h-3 text-sage" />
                    <span>{stop.transitInstruction || `Transit to ${dest.name}`}</span>
                  </div>

                  {/* Stop Card */}
                  <div
                    onClick={() => setSelectedStopId(stop.id || dest.id)}
                    className={`bg-white rounded-2xl p-5 border transition-all ${
                      isSelected
                        ? 'border-deep-green shadow-soft-md ring-1 ring-deep-green/30'
                        : 'border-border hover:border-sage'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold text-deep-green bg-sage/15 px-2 py-0.5 rounded">
                            Stop {idx + 1}
                          </span>
                          {stop.isMustVisit && (
                            <span className="text-[10px] font-bold text-terracotta-dark bg-terracotta/15 px-2 py-0.5 rounded flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Must Visit
                            </span>
                          )}
                          <span className="text-[10px] text-text-subtle font-mono">
                            {dest.category || 'Monument'}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold text-base text-text">
                          {dest.name}
                        </h3>

                        <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                          {dest.description}
                        </p>
                      </div>

                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="w-16 h-16 rounded-xl object-cover border border-border flex-shrink-0"
                      />
                    </div>

                    {/* Time & Dwell Controls */}
                    <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-deep-green" />
                          {stop.plannedArrival} - {stop.plannedDeparture}
                        </span>
                        <div className="flex items-center gap-1 bg-ivory border border-border px-2 py-0.5 rounded-lg text-[11px]">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditDuration(idx, -15); }}
                            className="text-text-subtle hover:text-text px-1 font-bold"
                          >
                            -
                          </button>
                          <span>{stop.visitDuration}m stay</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditDuration(idx, 15); }}
                            className="text-text-subtle hover:text-text px-1 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Card Action */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveStop(idx); }}
                        className="text-text-subtle hover:text-terracotta p-1 transition-colors"
                        title="Remove stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: INTERACTIVE GOOGLE MAP */}
        <div className="lg:col-span-6 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-border p-4 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="font-serif font-bold text-base text-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>Geographic Circuit Route</span>
              </h3>
              <span className="text-xs text-text-muted">
                {stops.length} Ordered Coordinates
              </span>
            </div>

            <MapComponent
              markers={mapMarkers}
              selectedMarkerId={selectedStopId || undefined}
              height="520px"
              showRoute={true}
            />
          </div>

          {/* Information Callout */}
          <div className="bg-ivory-dark p-4 rounded-2xl border border-border text-xs text-text-muted space-y-1.5">
            <div className="font-bold text-text flex items-center gap-1.5">
              <span>🏛️ Archaeological Survey of India (ASI) Gate Schedule:</span>
            </div>
            <p className="leading-relaxed">
              Ticket counters at Red Fort, Humayun's Tomb, and Qutub Minar close strictly at 17:00 / 17:30. Journeo's route ensures all stops complete before sunset.
            </p>
          </div>
        </div>
      </div>

      {/* ADAPTIVE REPLANNING MODAL (Section 9) */}
      {replanOpen && (
        <div className="fixed inset-0 z-[3000] bg-text/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-border w-full max-w-3xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                  Adaptive Replanning Engine
                </span>
                <h3 className="font-serif text-2xl font-bold text-text mt-1">
                  Delay Simulation (+45 mins at {stops[0]?.destination?.name || 'Stop 1'})
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  The system recalculated remaining daylight, traffic, and closing gates.
                </p>
              </div>
              <button
                onClick={() => setReplanOpen(false)}
                className="text-text-subtle hover:text-text p-1"
              >
                ✕
              </button>
            </div>

            {/* Threatened Stops */}
            {replanScenario?.threatenedStops?.length > 0 && (
              <div className="bg-terracotta/10 border border-terracotta/30 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-xs text-terracotta-dark flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-terracotta" />
                  <span>Downstream Stops at Risk of Gate Closure:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {replanScenario.threatenedStops.map((t: any, i: number) => (
                    <div key={i} className="bg-white/80 p-2.5 rounded-xl border border-terracotta/20">
                      <div className="font-semibold text-text">{t.destinationName}</div>
                      <div className="text-[11px] text-terracotta-dark">{t.issue}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategies Options */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-text">
                Select Recovery Strategy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {replanScenario?.strategies?.map((strat: any) => {
                  const isSel = selectedStrategyId === strat.id;
                  return (
                    <div
                      key={strat.id}
                      onClick={() => setSelectedStrategyId(strat.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSel
                          ? 'bg-white border-deep-green shadow-soft-md ring-2 ring-deep-green/20'
                          : 'bg-white/60 hover:bg-white border-border'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                          <span className="text-terracotta">{strat.badge}</span>
                          <span className="text-deep-green">{strat.score}% Match</span>
                        </div>
                        <h5 className="font-serif font-bold text-xs text-text mb-1">
                          {strat.title}
                        </h5>
                        <p className="text-[11px] text-text-muted leading-relaxed line-clamp-3">
                          {strat.explanation}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-border/60 text-[10px] font-medium text-text-subtle flex justify-between">
                        <span>{strat.stopsCount} stops remaining</span>
                        <span className="text-deep-green font-bold">+{strat.timeSavedMinutes}m saved</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                onClick={() => setReplanOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyStrategy}
                className="px-6 py-2.5 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-soft-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Selected Strategy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
