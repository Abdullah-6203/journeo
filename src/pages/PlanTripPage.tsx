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
  Plus,
  Trash2,
  Star,
  Layers,
  Sliders,
  DollarSign,
  Users,
  Car,
  Footprints,
  Train,
  Bike
} from 'lucide-react';
import { api } from '../services/api';
import { MapComponent } from '../components/MapComponent';

const INTEREST_CARDS = [
  { id: 'Historical Monuments', label: 'Historical Monuments', icon: '🏛️', desc: 'Ancient citadels, forts and royal memorials' },
  { id: 'Ancient Architecture', label: 'Ancient Architecture', icon: '📐', desc: 'Intricate domes, stone arches and stepwells' },
  { id: 'Religious Heritage', label: 'Religious Heritage', icon: '🛕', desc: 'Sacred mosques, river ghats and spiritual sanctums' },
  { id: 'Museums', label: 'Museums', icon: '🏺', desc: 'Relics from Harappa, Maurya and Mughal eras' },
  { id: 'Nature and Landscapes', label: 'Nature and Landscapes', icon: '🌿', desc: 'Serene botanical gardens and royal lakes' },
  { id: 'Food and Local Culture', label: 'Food and Local Culture', icon: '🍛', desc: 'Street culinary trails and historic bazaars' },
  { id: 'Adventure', label: 'Adventure', icon: '🧭', desc: 'Rampart explorations and rustic trails' },
  { id: 'Photography', label: 'Photography', icon: '📸', desc: 'Symmetrical perspectives and golden hour viewpoints' },
  { id: 'Hidden Gems', label: 'Hidden Gems', icon: '✨', desc: 'Forgotten stepwells, pavilions and offbeat spots' },
  { id: 'Local Experiences', label: 'Local Experiences', icon: '🎭', desc: 'Heritage walks and authentic artisan quarters' }
];

export const PlanTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);

  // Step 1: Preferences
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Historical Monuments',
    'Ancient Architecture'
  ]);
  const [travelStyle, setTravelStyle] = useState<'relaxed' | 'balanced' | 'packed'>('balanced');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');

  // Step 2: Trip Config
  const [city, setCity] = useState('Delhi');
  const [startingAddress, setStartingAddress] = useState('Connaught Place, Central Delhi');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableHours, setAvailableHours] = useState(8);
  const [groupSize, setGroupSize] = useState(2);
  const [budget, setBudget] = useState(2500);
  const [transportMode, setTransportMode] = useState<'cab' | 'public' | 'walking' | 'bicycle'>('cab');

  // Step 3: Destination selection
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>([]);
  const [mustVisitIds, setMustVisitIds] = useState<string[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load destinations when city changes or entering Step 3
  useEffect(() => {
    setLoadingDestinations(true);
    api.getDestinations({ city }).then(data => {
      const dests = data.destinations || [];
      setAllDestinations(dests);
      // Auto-select top matching monuments by default
      const defaults = dests.slice(0, 4).map((d: any) => d.id);
      setSelectedDestIds(defaults);
      const musts = dests.filter((d: any) => d.isMustVisit).map((d: any) => d.id);
      setMustVisitIds(musts);
      setLoadingDestinations(false);
    }).catch(() => setLoadingDestinations(false));
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

  // Step 4: Generate & Optimize
  const handleGenerateItinerary = async () => {
    setGenerating(true);
    try {
      const payload = {
        city,
        destinationIds: selectedDestIds,
        mustVisitIds,
        startingLocation: {
          lat: 28.6328,
          lng: 77.2197,
          address: startingAddress
        },
        startTime: '09:00',
        availableHours,
        transportMode,
        travelStyle,
        naturalLanguagePrompt: naturalLanguageInput,
        interests: selectedInterests
      };

      const result = await api.generateItinerary(payload);

      // Save plan in sessionStorage for results page
      sessionStorage.setItem('journeo_generated_plan', JSON.stringify({
        ...result,
        tripConfig: {
          city,
          startDate,
          startingLocation: startingAddress,
          budget,
          groupSize,
          transportation: transportMode,
          travelStyle
        }
      }));

      navigate('/itinerary/preview');
    } catch (err: any) {
      alert(err.message || 'Error generating itinerary');
    } finally {
      setGenerating(false);
    }
  };

  const selectedDestObjects = allDestinations.filter(d => selectedDestIds.includes(d.id));
  const mapMarkers = selectedDestObjects.map((d, index) => ({
    id: d.id,
    lat: d.latitude,
    lng: d.longitude,
    title: d.name,
    order: index + 1,
    isMustVisit: mustVisitIds.includes(d.id),
    imageUrl: d.imageUrl,
    description: d.description
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Stepper Progress Header */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-soft-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
              Trip Planner Workflow
            </span>
            <h1 className="font-serif text-2xl font-bold text-text mt-1">
              Design Your Personalized Itinerary
            </h1>
          </div>

          {/* Stepper Circles */}
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                    step === s
                      ? 'bg-deep-green text-white ring-2 ring-sage'
                      : step > s
                      ? 'bg-sage text-white'
                      : 'bg-ivory-dark text-text-subtle'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                <span className="text-xs font-semibold hidden md:inline text-text">
                  {s === 1 ? 'Preferences' : s === 2 ? 'Configuration' : 'Destinations'}
                </span>
                {s < 3 && <div className="w-6 h-0.5 bg-border hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STEP 1: USER PREFERENCES */}
      {step === 1 && (
        <div className="space-y-8 bg-white rounded-3xl border border-border p-8 shadow-soft-md">
          <div>
            <h2 className="font-serif text-2xl font-bold text-text">
              1. What Interests You Most?
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Select one or more categories that define your ideal journey.
            </p>
          </div>

          {/* Selectable Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {INTEREST_CARDS.map(card => {
              const isSelected = selectedInterests.includes(card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => toggleInterest(card.id)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sage/15 border-deep-green shadow-soft-sm ring-1 ring-deep-green'
                      : 'bg-ivory hover:bg-white border-border hover:border-sage'
                  }`}
                >
                  <div>
                    <span className="text-2xl block mb-2">{card.icon}</span>
                    <h3 className="font-semibold text-xs text-text">{card.label}</h3>
                    <p className="text-[11px] text-text-subtle mt-1 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-deep-green text-white border-deep-green' : 'border-border bg-white'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Travel Style Selector */}
          <div className="pt-6 border-t border-border space-y-3">
            <h3 className="font-serif text-lg font-bold text-text">
              Select Travel Style & Pace
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'relaxed', label: 'Relaxed', desc: '2-3 monuments max. Plentiful time for photography and unhurried garden walks.' },
                { id: 'balanced', label: 'Balanced', desc: '3-4 monuments. Optimized schedule with balanced travel time and verified visits.' },
                { id: 'packed', label: 'Packed / Exploratory', desc: '5+ monuments. Fast-paced explorer route capturing maximum sights.' }
              ].map(s => (
                <div
                  key={s.id}
                  onClick={() => setTravelStyle(s.id as any)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    travelStyle === s.id
                      ? 'bg-deep-green text-white border-deep-green shadow-soft-md'
                      : 'bg-ivory hover:bg-white border-border text-text'
                  }`}
                >
                  <div className="font-bold text-sm">{s.label}</div>
                  <div className={`text-xs mt-1 leading-relaxed ${travelStyle === s.id ? 'text-ivory/80' : 'text-text-muted'}`}>
                    {s.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Natural Language Prompt */}
          <div className="pt-6 border-t border-border space-y-2">
            <label className="block font-serif text-lg font-bold text-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>Describe your ideal travel experience (Optional AI Prompt)</span>
            </label>
            <p className="text-xs text-text-muted">
              Journeo's AI will parse your natural-language intent and adjust the schedule accordingly.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. I love Mughal sandstone architecture, prefer quiet morning gardens, and want to avoid an overly rushed timetable..."
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="w-full bg-ivory border border-border rounded-2xl p-4 text-xs text-text focus:outline-none focus:border-deep-green"
            />
          </div>

          {/* Step 1 Actions */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-semibold transition-colors shadow-soft-sm flex items-center gap-2"
            >
              <span>Continue to Trip Configuration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CONFIGURE THE TRIP */}
      {step === 2 && (
        <div className="space-y-8 bg-white rounded-3xl border border-border p-8 shadow-soft-md">
          <div>
            <h2 className="font-serif text-2xl font-bold text-text">
              2. Trip Logistics & Constraints
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Provide starting details so Journeo can calculate realistic routes and transit times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">Destination City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-ivory border border-border rounded-xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-deep-green"
              >
                <option value="Delhi">Delhi (Imperial Mughal & Sultanate Heritage)</option>
                <option value="Jaipur">Jaipur (Pink City Rajput Forts)</option>
                <option value="Agra">Agra (Taj Mahal & Yamuna Heritage)</option>
                <option value="Varanasi">Varanasi (Sacred Ghats & Ganga)</option>
                <option value="Udaipur">Udaipur (Mewar Lake Palaces)</option>
                <option value="Hampi">Hampi (Vijayanagara Empire Ruins)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">Starting Location (Origin)</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-terracotta absolute left-3 top-3" />
                <input
                  type="text"
                  value={startingAddress}
                  onChange={(e) => setStartingAddress(e.target.value)}
                  placeholder="e.g. Connaught Place, Central Delhi"
                  className="w-full bg-ivory border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-deep-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">Travel Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-ivory border border-border rounded-xl px-4 py-2.5 text-xs text-text focus:outline-none focus:border-deep-green"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">Available Hours per Day</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="flex-1 accent-deep-green"
                />
                <span className="font-mono text-xs font-bold text-deep-green w-16">
                  {availableHours} hours
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">Group Size</label>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGroupSize(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      groupSize === num
                        ? 'bg-deep-green text-white border-deep-green'
                        : 'bg-ivory border-border text-text'
                    }`}
                  >
                    {num === 1 ? 'Solo' : num === 2 ? 'Couple' : `${num} People`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">Estimated Budget (INR)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-sage absolute left-3 top-3" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-ivory border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text focus:outline-none focus:border-deep-green"
                />
              </div>
            </div>
          </div>

          {/* Transport Mode Options */}
          <div className="pt-6 border-t border-border space-y-3">
            <label className="block text-xs font-semibold text-text">Preferred Mode of Transportation</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'cab', label: 'Car / Cab', icon: Car, desc: 'AC Cab & Taxi' },
                { id: 'public', label: 'Metro / Public', icon: Train, desc: 'Delhi Metro' },
                { id: 'walking', label: 'Walking', icon: Footprints, desc: 'On foot heritage trails' },
                { id: 'bicycle', label: 'Bicycle', icon: Bike, desc: 'Eco cycling tours' }
              ].map(m => {
                const Icon = m.icon;
                const isSel = transportMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setTransportMode(m.id as any)}
                    className={`cursor-pointer p-3.5 rounded-xl border text-center transition-all ${
                      isSel
                        ? 'bg-sage/20 border-deep-green text-deep-green font-bold'
                        : 'bg-ivory hover:bg-white border-border text-text-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-deep-green" />
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[10px] text-text-subtle mt-0.5">{m.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2 Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-border">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-ivory transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-semibold transition-colors shadow-soft-sm flex items-center gap-2"
            >
              <span>Discover & Select Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DISCOVER AND SELECT DESTINATIONS */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-border p-6 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                Step 3 of 3
              </span>
              <h2 className="font-serif text-2xl font-bold text-text mt-1">
                Curate Monuments for {city}
              </h2>
              <p className="text-xs text-text-muted">
                {selectedDestIds.length} destinations selected ({mustVisitIds.length} marked Must-Visit).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-text hover:bg-ivory transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust Logistics</span>
              </button>

              <button
                onClick={handleGenerateItinerary}
                disabled={generating || selectedDestIds.length === 0}
                className="px-6 py-3 bg-deep-green hover:bg-deep-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-soft-md flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-sage-light" />
                <span>{generating ? 'Optimizing Routes...' : 'Generate My Itinerary'}</span>
              </button>
            </div>
          </div>

          {/* Split Screen: Destination Cards on Left, Map on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Destination Cards List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {loadingDestinations ? (
                <div className="p-12 text-center text-xs text-text-muted">
                  Loading verified monuments...
                </div>
              ) : (
                allDestinations.map((dest) => {
                  const isSelected = selectedDestIds.includes(dest.id);
                  const isMust = mustVisitIds.includes(dest.id);

                  return (
                    <div
                      key={dest.id}
                      onClick={() => toggleSelectDest(dest.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'bg-white border-deep-green shadow-soft-md ring-1 ring-deep-green/30'
                          : 'bg-white/70 hover:bg-white border-border'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <img
                          src={dest.imageUrl}
                          alt={dest.name}
                          className="w-20 h-20 rounded-xl object-cover border border-border flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-sage-dark bg-sage/15 px-2 py-0.5 rounded">
                              {dest.category}
                            </span>
                            <span className="text-[11px] text-text-subtle">
                              ⏱️ {dest.averageVisitDuration}m dwell
                            </span>
                            {dest.entryFeeINR === 0 ? (
                              <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Free
                              </span>
                            ) : (
                              <span className="text-[10px] text-text-subtle font-mono">
                                ₹{dest.entryFeeINR}
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif font-bold text-sm text-text">
                            {dest.name}
                          </h3>

                          <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                            {dest.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        <button
                          type="button"
                          onClick={(e) => toggleMustVisit(dest.id, e)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                            isMust
                              ? 'bg-terracotta text-white shadow-soft-sm'
                              : 'bg-ivory hover:bg-ivory-dark text-text-muted'
                          }`}
                          title="Prioritize this stop in itinerary"
                        >
                          <Star className={`w-3 h-3 ${isMust ? 'fill-current' : ''}`} />
                          <span>{isMust ? 'Must Visit' : 'Mark Must'}</span>
                        </button>

                        <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          isSelected ? 'bg-sage/20 text-deep-green font-bold' : 'text-text-subtle'
                        }`}>
                          {isSelected ? '✓ Selected' : '+ Add'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Interactive Map (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-border shadow-soft-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-sm text-text">
                    Circuit Map Preview
                  </span>
                  <span className="text-xs text-text-muted">
                    {mapMarkers.length} Markers Placed
                  </span>
                </div>
                <MapComponent
                  markers={mapMarkers}
                  height="460px"
                  showRoute={true}
                />
              </div>

              <div className="bg-ivory-dark p-4 rounded-xl text-xs text-text-muted border border-border">
                💡 <strong>Optimization Tip:</strong> Marking monuments with the terracotta <strong>"Must Visit"</strong> badge ensures the algorithm will protect them even if daylight or traffic delays occur.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
