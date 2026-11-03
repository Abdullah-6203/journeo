import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  MapPin,
  Clock,
  Sparkles,
  Compass,
  Check,
  Building,
  TreePine,
  Coffee,
  ShoppingBag,
  Landmark,
  Camera
} from 'lucide-react';
import { IndiaDestination } from '../data/indiaDestinations';
import {
  searchCatalogPlaces,
  buildCustomDestination,
  AddStopRequest
} from '../services/customPlaceService';

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId: string;
  cityName: string;
  totalDays: number;
  initialDay?: number;
  existingPlaceIds?: string[];
  onAddStop: (req: AddStopRequest) => void;
}

export const AddStopModal: React.FC<AddStopModalProps> = ({
  isOpen,
  onClose,
  destinationId,
  cityName,
  totalDays,
  initialDay = 1,
  existingPlaceIds = [],
  onAddStop
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [targetDay, setTargetDay] = useState<number>(initialDay);
  const [targetPosition, setTargetPosition] = useState<'morning' | 'afternoon' | 'end'>('end');

  // Custom Place Form State
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<IndiaDestination['category']>('Culture');
  const [customAddress, setCustomAddress] = useState('');
  const [customDuration, setCustomDuration] = useState<number>(60);
  const [customNotes, setCustomNotes] = useState('');
  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');
  const [customIsMustVisit, setCustomIsMustVisit] = useState(true);

  // Search Results
  const searchResults = useMemo(() => {
    const raw = searchCatalogPlaces(searchQuery, destinationId, existingPlaceIds);
    if (selectedCategory === 'all') return raw;
    return raw.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [searchQuery, destinationId, existingPlaceIds, selectedCategory]);

  if (!isOpen) return null;

  const handleSelectCatalogPlace = (place: IndiaDestination) => {
    onAddStop({
      destination: place,
      dayNumber: targetDay,
      position: targetPosition,
      isMustVisit: true
    });
    onClose();
  };

  const handleCreateCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const latNum = customLat ? parseFloat(customLat) : undefined;
    const lngNum = customLng ? parseFloat(customLng) : undefined;

    const customDest = buildCustomDestination({
      name: customName.trim(),
      destinationId,
      city: cityName,
      category: customCategory,
      address: customAddress.trim() || undefined,
      notes: customNotes.trim() || undefined,
      latitude: !isNaN(latNum!) ? latNum : undefined,
      longitude: !isNaN(lngNum!) ? lngNum : undefined,
      visitDurationMinutes: customDuration
    });

    onAddStop({
      destination: customDest,
      dayNumber: targetDay,
      position: targetPosition,
      notes: customNotes.trim() || undefined,
      isMustVisit: customIsMustVisit
    });

    onClose();
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'heritage', label: 'Heritage' },
    { id: 'nature', label: 'Nature' },
    { id: 'food', label: 'Food & Cafes' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'culture', label: 'Culture & Art' },
    { id: 'spiritual', label: 'Spiritual' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-2xl bg-[#F7F6EE] border border-[#C9D0BF] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#E8E9DC] border-b border-[#C9D0BF] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#344B3C] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C5A36A]" />
              <span>Add a Stop to Your {cityName} Itinerary</span>
            </h2>
            <p className="text-xs text-[#667363] mt-0.5">
              Search verified local landmarks or enter a personal place you want to visit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#667363] hover:text-[#344B3C] hover:bg-[#D9DCBE]/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day & Position Controls */}
        <div className="px-6 py-3.5 bg-[#FAF9F2] border-b border-[#E1E4D4] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#344B3C]">Target Day:</span>
            <select
              value={targetDay}
              onChange={e => setTargetDay(Number(e.target.value))}
              className="px-3 py-1.5 bg-white border border-[#C9D0BF] rounded-lg text-[#344B3C] font-semibold focus:outline-none focus:ring-1 focus:ring-[#193D2D]"
            >
              {Array.from({ length: totalDays }, (_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Day {idx + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#344B3C]">Time of Day:</span>
            <div className="inline-flex rounded-lg border border-[#C9D0BF] bg-white p-0.5">
              {(['morning', 'afternoon', 'end'] as const).map(pos => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setTargetPosition(pos)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${
                    targetPosition === pos
                      ? 'bg-[#193D2D] text-white shadow-xs'
                      : 'text-[#667363] hover:text-[#344B3C]'
                  }`}
                >
                  {pos === 'end' ? 'Evening / End' : pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#C9D0BF] bg-[#ECEEE1] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'search'
                ? 'border-[#193D2D] text-[#193D2D] bg-[#F7F6EE] font-bold'
                : 'border-transparent text-[#667363] hover:text-[#344B3C]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Verified Places ({searchResults.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'custom'
                ? 'border-[#193D2D] text-[#193D2D] bg-[#F7F6EE] font-bold'
                : 'border-transparent text-[#667363] hover:text-[#344B3C]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Place (Manual Details)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9888]" />
                <input
                  type="text"
                  placeholder={`Search places, cafes, temples, or parks in ${cityName}...`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C9D0BF] rounded-xl text-xs text-[#344B3C] placeholder-[#8C9888] focus:outline-none focus:ring-2 focus:ring-[#193D2D]/30"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-[#193D2D] text-white shadow-xs'
                        : 'bg-white border border-[#C9D0BF] text-[#667363] hover:text-[#344B3C]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <div className="py-12 text-center text-[#667363] space-y-2">
                    <p className="text-sm font-semibold">No verified places found matching "{searchQuery}"</p>
                    <p className="text-xs">
                      Try adjusting your keywords or switch to the <strong>Add Custom Place</strong> tab to add it manually.
                    </p>
                  </div>
                ) : (
                  searchResults.map(place => (
                    <div
                      key={place.id}
                      className="p-3.5 bg-white rounded-2xl border border-[#D9DCBE] shadow-xs hover:border-[#193D2D]/50 hover:shadow-soft-sm transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-[#E1E4D4]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-sm text-[#344B3C] truncate">
                              {place.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#ECEEE1] text-[#49634F] flex-shrink-0">
                              {place.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#667363] truncate mt-0.5">
                            {place.subcategory || place.area} • {place.area}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-[#8C9888] mt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#C5A36A]" />
                              {place.averageVisitDuration}m
                            </span>
                            <span>
                              {place.entryFeeINR === 0 ? 'Free Entry' : `₹${place.entryFeeINR}`}
                            </span>
                            <span>{place.openingHours}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCatalogPlace(place)}
                        className="px-3.5 py-2 bg-[#193D2D] hover:bg-[#174B38] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C5A36A]" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateCustomPlace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#344B3C] mb-1">
                  Place Name <span className="text-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma's Secret Tea Stall, Friends Art Studio..."
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C9D0BF] rounded-xl text-xs text-[#344B3C] focus:outline-none focus:ring-2 focus:ring-[#193D2D]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#344B3C] mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={e => setCustomCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-white border border-[#C9D0BF] rounded-xl text-xs text-[#344B3C] focus:outline-none focus:ring-2 focus:ring-[#193D2D]/30"
                  >
                    <option value="Culture">Culture & Arts</option>
                    <option value="Heritage">Heritage & Monuments</option>
                    <option value="Nature">Nature & Outdoors</option>
                    <option value="Food">Food, Dining & Cafes</option>
                    <option value="Shopping">Shopping & Markets</option>
                    <option value="Spiritual">Spiritual & Sacred</option>
                    <option value="Adventure">Adventure & Sports</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#344B3C] mb-1">
                    Estimated Visit Duration
                  </label>
                  <select
                    value={customDuration}
                    onChange={e => setCustomDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-[#C9D0BF] rounded-xl text-xs text-[#344B3C] focus:outline-none focus:ring-2 focus:ring-[#193D2D]/30"
                  >
                    <option value={30}>30 mins (Quick Stop)</option>
                    <option value={45}>45 mins (Moderate)</option>
                    <option value={60}>1 hour (Standard)</option>
                    <option value={90}>1.5 hours (Extended)</option>
                    <option value={120}>2 hours (Deep Visit)</option>
                    <option value={180}>3 hours (Half Day)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344B3C] mb-1">
                  Address or Area (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Hauz Khas Village, South Delhi"
                  value={customAddress}
                  onChange={e => setCustomAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#C9D0BF] rounded-xl text-xs text-[#344B3C] focus:outline-none focus:ring-2 focus:ring-[#193D2D]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344B3C] mb-1">
                  Personal Notes / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Recommended by a friend for sunset views and cutting chai..."
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#C9D0BF] rounded-xl text-xs text-[#344B3C] focus:outline-none focus:ring-2 focus:ring-[#193D2D]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#344B3C] mb-1">
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 28.6139"
                    value={customLat}
                    onChange={e => setCustomLat(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#C9D0BF] rounded-xl text-xs font-mono text-[#344B3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#344B3C] mb-1">
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="e.g. 77.2090"
                    value={customLng}
                    onChange={e => setCustomLng(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#C9D0BF] rounded-xl text-xs font-mono text-[#344B3C]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-[#344B3C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customIsMustVisit}
                    onChange={e => setCustomIsMustVisit(e.target.checked)}
                    className="rounded text-[#193D2D] focus:ring-[#193D2D]"
                  />
                  <span>Mark as Must-Visit Stop</span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#193D2D] hover:bg-[#174B38] text-white text-xs font-semibold rounded-xl transition-all shadow-soft-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#C5A36A]" />
                  <span>Add Custom Stop to Day {targetDay}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

