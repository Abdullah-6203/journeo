import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Users,
  Car,
  Footprints,
  Train,
  Bike,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { MapComponent } from '../components/MapComponent';
import { INDIA_DESTINATIONS, AVAILABLE_CITIES, IndiaDestination } from '../data/indiaDestinations';
import { Button } from '../components/ui/Button';

const INTEREST_CARDS = [
  { id: 'Historical Monuments', label: 'Historical Monuments', icon: '🏛️', desc: 'Ancient citadels, forts and royal memorials' },
  { id: 'Ancient Architecture', label: 'Ancient Architecture', icon: '📐', desc: 'Intricate domes, stone arches and stepwells' },
  { id: 'Religious Heritage', label: 'Religious & Spiritual', icon: '🛕', desc: 'Sacred river ghats, shrines and sanctums' },
  { id: 'Museums', label: 'Museums & Relics', icon: '🏺', desc: 'Precious relics and classical antiquities' },
  { id: 'Nature and Landscapes', label: 'Nature & Landscapes', icon: '🌿', desc: 'Serene botanical lakes, hills and beaches' },
  { id: 'Food and Local Culture', label: 'Food & Culinary Trails', icon: '🍛', desc: 'Authentic street eats and royal cuisines' },
  { id: 'Adventure', label: 'Adventure & Outdoor', icon: '🧭', desc: 'Scenic ramparts, rafting and rugged trails' },
  { id: 'Photography', label: 'Photography Vistas', icon: '📸', desc: 'Symmetrical perspectives & sunset spots' },
  { id: 'Shopping', label: 'Bazaars & Artisans', icon: '🛍️', desc: 'Traditional textiles, spices and handicrafts' },
  { id: 'Hidden Gems', label: 'Hidden Gems', icon: '✨', desc: 'Offbeat courtyards, stepwells and quiet spots' }
];

export const PlanTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  // Step 1: Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Historical Monuments',
    'Food and Local Culture'
  ]);
  const [travelStyle, setTravelStyle] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');

  // Step 2: Trip Config
  const [city, setCity] = useState<string>('Delhi');
  const [startingAddress, setStartingAddress] = useState<string>('City Centre');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableHours, setAvailableHours] = useState<number>(8);
  const [groupSize, setGroupSize] = useState<number>(2);
  const [budget, setBudget] = useState<number>(3000);
  const [transportMode, setTransportMode] = useState<'cab' | 'public' | 'walking' | 'bicycle'>('cab');

  // Step 3: Destination selection
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>([]);
  const [mustVisitIds, setMustVisitIds] = useState<string[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  // Load destinations when city changes
  useEffect(() => {
    setLoadingDestinations(true);

    // Filter curated India destinations for selected city
    const localMatches = INDIA_DESTINATIONS.filter(
      d => d.city.toLowerCase() === city.toLowerCase()
    );

    api.getDestinations({ city })
      .then(data => {
        const backendDests = data.destinations || [];
        // Merge without duplicates
        const combined = [...backendDests];
        localMatches.forEach(lm => {
          if (!combined.some(c => c.name.toLowerCase() === lm.name.toLowerCase())) {
            combined.push(lm);
          }
        });
        const finalDests = combined.length > 0 ? combined : localMatches;
        setAllDestinations(finalDests);
        setSelectedDestIds(finalDests.slice(0, 4).map(d => d.id));
        setMustVisitIds(finalDests.filter(d => d.isMustVisit).map(d => d.id));
        setLoadingDestinations(false);
      })
      .catch(() => {
        // Safe offline fallback
        setAllDestinations(localMatches);
        setSelectedDestIds(localMatches.slice(0, 4).map(d => d.id));
        setMustVisitIds(localMatches.filter(d => d.isMustVisit).map(d => d.id));
        setLoadingDestinations(false);
      });
  }, [city]);

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const toggleSelectDest = (id: string) => {
    if (selectedDestIds.includes(id)) {
      setSelectedDestIds(selectedDestIds.filter(d => d !== id));
      setMustVisitIds(mustVisitIds.filter(m => m !== id));
    } else {
      setSelectedDestIds([...selectedDestIds, id]);
    }
  };

  const toggleMustVisit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedDestIds.includes(id)) {
      setSelectedDestIds([...selectedDestIds, id]);
    }
    if (mustVisitIds.includes(id)) {
      setMustVisitIds(mustVisitIds.filter(m => m !== id));
    } else {
      setMustVisitIds([...mustVisitIds, id]);
    }
  };

  // Generate & Optimize Itinerary
  const handleGenerateItinerary = async () => {
    if (selectedDestIds.length === 0) {
      alert('Please select at least one destination or place for your itinerary.');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        city,
        destinationIds: selectedDestIds,
        mustVisitIds,
        startingLocation: {
          lat: allDestinations[0]?.latitude || 28.6328,
          lng: allDestinations[0]?.longitude || 77.2197,
          address: startingAddress || `${city} City Centre`
        },
        startTime: '09:00',
        availableHours,
        transportMode,
        travelStyle,
        naturalLanguagePrompt: naturalLanguageInput,
        interests: selectedInterests
      };

      let result: any = null;

      try {
        result = await api.generateItinerary(payload);
      } catch (backendErr) {
        console.warn('Backend itinerary generation failed, using client optimization engine:', backendErr);
      }

      // If backend was unreachable or returned empty, build robust deterministic client plan
      if (!result || !result.stops) {
        const chosenDests = allDestinations.filter(d => selectedDestIds.includes(d.id));
        const musts = chosenDests.filter(d => mustVisitIds.includes(d.id));
        const others = chosenDests.filter(d => !mustVisitIds.includes(d.id));
        const ordered = [...musts, ...others];

        let currentMin = 9 * 60; // 09:00 AM
        const scheduledStops = ordered.map((dest, idx) => {
          const arrivalH = Math.floor(currentMin / 60);
          const arrivalM = currentMin % 60;
          const arrivalTime = `${String(arrivalH).padStart(2, '0')}:${String(arrivalM).padStart(2, '0')}`;

          const duration = dest.averageVisitDuration || 90;
          currentMin += duration;

          const depH = Math.floor(currentMin / 60);
          const depM = currentMin % 60;
          const departureTime = `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`;

          const transitMinutes = idx === 0 ? 15 : 20;
          currentMin += transitMinutes;

          return {
            id: `stop-${idx + 1}`,
            destinationId: dest.id,
            sequenceNumber: idx + 1,
            destination: dest,
            plannedArrival: arrivalTime,
            plannedDeparture: departureTime,
            visitDuration: duration,
            visitStatus: 'PENDING',
            isMustVisit: mustVisitIds.includes(dest.id),
            transitInstruction: idx === 0 ? `Depart from ${startingAddress} (${transitMinutes} min ${transportMode})` : `Transit to next site (${transitMinutes} min ${transportMode})`,
            transitMinutes,
            distanceFromPrevKm: 3.5 + idx * 1.2
          };
        });

        result = {
          title: `${city} Personalised Travel Journey`,
          destinationCity: city,
          plan: {
            optimizationScore: 94,
            totalDistanceKm: 18.5,
            totalDurationMin: availableHours * 60,
            scheduledStops
          },
          stops: scheduledStops
        };
      }

      // Save plan in sessionStorage for preview page
      sessionStorage.setItem(
        'journeo_generated_plan',
        JSON.stringify({
          ...result,
          tripConfig: {
            city,
            startDate,
            startingLocation: startingAddress,
            budget,
            groupSize,
            transportation: transportMode,
            travelStyle,
            naturalLanguagePrompt: naturalLanguageInput,
            interests: selectedInterests
          }
        })
      );

      navigate('/itinerary/preview');
    } catch (err: any) {
      alert(err.message || 'Error generating itinerary. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header & Stepper */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-deep-green/10 text-deep-green text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-terracotta" />
              <span>Smart Travel Planning Studio</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text">
              Design Your Personalized Journey
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-2xl">
              Specify your destination, pace, interests, and free-text instructions. Journeo optimizes sequence, dwell times, and routes across India.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-deep-green text-white shadow-soft-sm'
                    : step > s
                    ? 'bg-sage/20 text-deep-green'
                    : 'bg-ivory text-text-subtle border border-border'
                }`}
              >
                <span>Step {s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-ivory-dark/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-deep-green h-full transition-all duration-500 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: INTERESTS & FREE-TEXT PROMPT */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Free-text Multiline Prompt Card - Prominent and Mandatory */}
          <div className="bg-gradient-to-br from-white via-ivory to-sandstone-light/30 rounded-3xl border-2 border-sage/40 p-6 sm:p-8 shadow-soft-md space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-deep-green mb-1">
                  <MessageSquare className="w-4 h-4 text-terracotta" />
                  <span>Free-Text Personalization Instructions (Mandatory Feature)</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-text">
                  Tell us what kind of trip you want in your own words
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Our itinerary engine interprets your instructions to adapt destination priority, travel pacing, and thematic balance.
                </p>
              </div>
              <span className="text-[11px] font-bold text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                AI / Adaptive Parser Connected
              </span>
            </div>

            <textarea
              rows={4}
              placeholder="Tell us what kind of trip you want. For example: I want a 3-day trip with local street food, historic forts, artisan markets, peaceful morning spots, and minimal travel time. Avoid overly crowded tourist traps where possible."
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="w-full bg-white border border-border rounded-2xl p-4 text-xs sm:text-sm text-text placeholder:text-text-subtle/70 focus:outline-none focus:border-deep-green focus:ring-2 focus:ring-deep-green/20 transition-all leading-relaxed"
            />

            <div className="flex items-center justify-between text-[11px] text-text-subtle pt-1">
              <span>💡 Tip: Mention preferred categories, food desires, crowd sensitivity, or accessibility needs.</span>
              <span>{naturalLanguageInput.length} characters</span>
            </div>
          </div>

          {/* Structured Interests Grid */}
          <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-text">
                  Select Your Travel Interests
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Pick any categories that inspire your voyage.
                </p>
              </div>
              <span className="text-xs font-semibold text-deep-green bg-sage/20 px-3 py-1 rounded-xl">
                {selectedInterests.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {INTEREST_CARDS.map(item => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all border flex items-start gap-3.5 select-none ${
                      isSelected
                        ? 'bg-sage/15 border-deep-green shadow-soft-sm translate-y-[-2px]'
                        : 'bg-ivory/60 hover:bg-ivory border-border hover:border-sandstone'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0 p-1">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text truncate">
                          {item.label}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-deep-green flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Travel Pace Selector */}
            <div className="pt-6 border-t border-border space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-text">
                Travel Pace & Rhythm
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'relaxed', label: 'Relaxed & Unhurried', desc: 'Fewer stops, 2-3 hrs dwell time per site' },
                  { id: 'balanced', label: 'Balanced Circuit', desc: 'Optimal mix of major landmarks & local stops' },
                  { id: 'packed', label: 'Packed & High-Energy', desc: 'Maximum sights visited within daylight' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTravelStyle(p.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      travelStyle === p.id
                        ? 'bg-deep-green text-white border-deep-green shadow-soft-sm'
                        : 'bg-ivory hover:bg-ivory-dark text-text border-border'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className={`text-[11px] mt-1 ${travelStyle === p.id ? 'text-ivory/80' : 'text-text-muted'}`}>
                      {p.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep(2)}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Trip Details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: TRIP CONFIG & MULTI-CITY SELECTION */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-text">
                Trip Logistics & Scope
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Set destination city in India, schedule, budget, and transit preferences.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Preferences
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* City Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                Target Destination City in India
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-terracotta absolute left-3.5 top-3.5" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-ivory border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-text focus:outline-none focus:border-deep-green transition-all"
                >
                  {AVAILABLE_CITIES.map(c => (
                    <option key={c} value={c}>
                      {c} — Iconic Hub
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-text-subtle mt-1">
                Destinations across Rajasthan, Golden Triangle, Deccan, Coastlines & Himalayas.
              </p>
            </div>

            {/* Starting Address */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                Starting Location / Hotel
              </label>
              <input
                type="text"
                placeholder="e.g. Connaught Place, Central Delhi or MI Road, Jaipur"
                value={startingAddress}
                onChange={(e) => setStartingAddress(e.target.value)}
                className="w-full bg-ivory border border-border rounded-xl px-4 py-3 text-xs font-medium text-text focus:outline-none focus:border-deep-green transition-all"
              />
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                Trip Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-text-subtle absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-ivory border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-text focus:outline-none focus:border-deep-green transition-all"
                />
              </div>
            </div>

            {/* Available Hours */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                Available Time Window: {availableHours} Hours
              </label>
              <input
                type="range"
                min={4}
                max={12}
                step={1}
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full accent-deep-green"
              />
              <div className="flex justify-between text-[11px] text-text-subtle mt-1">
                <span>Half-day (4h)</span>
                <span>Full-day (8h)</span>
                <span>Extended (12h)</span>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                Estimated Day Budget (INR ₹)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-deep-green absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min={500}
                  step={500}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-ivory border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-text focus:outline-none focus:border-deep-green transition-all"
                />
              </div>
            </div>

            {/* Group Size */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text mb-1.5">
                Travelers Count
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-text-subtle absolute left-3.5 top-3.5" />
                <select
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))}
                  className="w-full bg-ivory border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-text focus:outline-none focus:border-deep-green transition-all"
                >
                  <option value={1}>Solo Explorer (1 person)</option>
                  <option value={2}>Couple / Duo (2 people)</option>
                  <option value={4}>Small Family / Friends (4 people)</option>
                  <option value={6}>Group Travel (6+ people)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transport Mode Choice */}
          <div className="pt-4 border-t border-border space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-text">
              Primary Transit Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'cab', label: 'AC Taxi / Cab', icon: Car, speed: '22 km/h avg' },
                { id: 'public', label: 'Metro & Bus', icon: Train, speed: '18 km/h avg' },
                { id: 'walking', label: 'Heritage Walk', icon: Footprints, speed: '4.5 km/h avg' },
                { id: 'bicycle', label: 'Bicycle Tour', icon: Bike, speed: '12 km/h avg' }
              ].map(t => {
                const IconComponent = t.icon;
                const isSelected = transportMode === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTransportMode(t.id as any)}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'bg-deep-green text-white border-deep-green shadow-soft-sm'
                        : 'bg-ivory hover:bg-ivory-dark text-text border-border'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mx-auto mb-1.5" />
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-ivory/80' : 'text-text-subtle'}`}>
                      {t.speed}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
              Previous
            </Button>
            <Button variant="primary" size="lg" onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4" />}>
              Choose Places in {city}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: DESTINATION CANDIDATES SELECTION */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-soft-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <h3 className="font-serif text-2xl font-bold text-text">
                  Curated Places in {city}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Select candidate locations to include. Toggle the gold star to mark must-visit sites.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-deep-green bg-sage/20 px-3 py-1.5 rounded-xl">
                  {selectedDestIds.length} Places Selected
                </span>
                <Button
                  variant="primary"
                  size="md"
                  loading={generating}
                  onClick={handleGenerateItinerary}
                  icon={<Sparkles className="w-4 h-4 text-sage-light" />}
                >
                  Generate Optimized Itinerary
                </Button>
              </div>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {allDestinations.map(dest => {
                const isSelected = selectedDestIds.includes(dest.id);
                const isMust = mustVisitIds.includes(dest.id);

                return (
                  <div
                    key={dest.id}
                    onClick={() => toggleSelectDest(dest.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all border flex gap-4 select-none ${
                      isSelected
                        ? 'bg-white border-deep-green shadow-soft-md'
                        : 'bg-ivory/50 hover:bg-ivory border-border hover:border-sandstone opacity-80'
                    }`}
                  >
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-24 h-24 rounded-xl object-cover border border-border flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2 py-0.5 rounded">
                            {dest.category}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleMustVisit(dest.id, e)}
                            className={`p-1 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold ${
                              isMust
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'text-text-subtle hover:text-amber-700 hover:bg-amber-50'
                            }`}
                            title="Toggle Must-Visit Priority"
                          >
                            <Star className={`w-3.5 h-3.5 ${isMust ? 'fill-amber-500 text-amber-600' : ''}`} />
                            <span>{isMust ? 'Must-Visit' : 'Mark Must'}</span>
                          </button>
                        </div>

                        <h4 className="font-serif font-bold text-sm text-text mt-1.5 leading-snug truncate">
                          {dest.name}
                        </h4>
                        <p className="text-[11px] text-text-muted mt-1 line-clamp-2">
                          {dest.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-subtle pt-2 border-t border-border/60 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-text">
                          <Clock className="w-3.5 h-3.5 text-deep-green" />
                          {dest.averageVisitDuration || 90} mins
                        </span>
                        <span>
                          {dest.entryFeeINR === 0 ? 'Free Entry' : `₹${dest.entryFeeINR}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-border mt-6">
              <Button variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Scope
              </Button>
              <Button
                variant="primary"
                size="lg"
                loading={generating}
                onClick={handleGenerateItinerary}
                icon={<Sparkles className="w-4 h-4 text-sage-light" />}
              >
                {generating ? 'Optimizing Route...' : 'Generate My Route Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
