import { IndiaDestination, INDIA_DESTINATIONS } from '../data/indiaDestinations';
import {
  OptimizedItineraryResponse,
  ItineraryStopOutput,
  ItineraryDayOutput,
  selectLegTransportMode,
  calculateTransitDuration,
  haversineDistanceKm,
  formatMinutesToTime,
  parseTimeToMinutes,
  validateGeneratedItinerary
} from '../features/itinerary/services/itineraryOptimizer';
import {
  queryPlacesByDestination,
  persistTripItineraryToDatabase
} from './placeDatabaseService';
import { resolveCanonicalDestination } from '../data/canonicalDestinations';

export interface CustomPlaceInput {
  name: string;
  destinationId: string;
  city?: string;
  category?: IndiaDestination['category'];
  subcategory?: string;
  address?: string;
  notes?: string;
  url?: string;
  latitude?: number;
  longitude?: number;
  visitDurationMinutes?: number;
}

export interface AddStopRequest {
  destination: IndiaDestination;
  dayNumber: number;
  position?: 'morning' | 'afternoon' | 'evening' | 'end';
  notes?: string;
  isMustVisit?: boolean;
}

/**
 * Searches verified catalog places in the given destination matching a search query.
 */
export function searchCatalogPlaces(
  query: string,
  destinationId: string,
  excludedPlaceIds: string[] = []
): IndiaDestination[] {
  const normDest = (destinationId || '').toLowerCase().trim();
  const normQ = (query || '').toLowerCase().trim();
  const excludedSet = new Set(excludedPlaceIds);

  // Retrieve from database or fallback catalog
  const dbResult = queryPlacesByDestination(normDest);
  const pool =
    dbResult.places.length > 0
      ? dbResult.places
      : INDIA_DESTINATIONS.filter(
          p => p.destinationId.toLowerCase() === normDest || p.city.toLowerCase() === normDest
        );

  return pool
    .filter(p => !excludedSet.has(p.id))
    .filter(p => {
      if (!normQ) return true;
      const text = `${p.name} ${p.subcategory || ''} ${p.category} ${p.area} ${p.description} ${p.highlights.join(' ')}`.toLowerCase();
      return text.includes(normQ);
    })
    .slice(0, 20);
}

/**
 * Creates a valid canonical IndiaDestination object for a user-created custom place.
 */
export function buildCustomDestination(input: CustomPlaceInput): IndiaDestination {
  const canonical = resolveCanonicalDestination(input.destinationId || input.city || 'delhi');
  const city = input.city || canonical?.destinationName || 'India';
  const customId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Default coordinates to destination center if not provided
  const lat = typeof input.latitude === 'number' && !isNaN(input.latitude)
    ? input.latitude
    : canonical?.center.lat || 28.6139;
  const lng = typeof input.longitude === 'number' && !isNaN(input.longitude)
    ? input.longitude
    : canonical?.center.lng || 77.2090;

  const category = input.category || 'Culture';
  const duration = Math.max(20, Math.min(360, input.visitDurationMinutes || 60));

  return {
    id: customId,
    providerPlaceId: `user_created_${customId}`,
    name: input.name.trim(),
    destinationId: canonical?.destinationId || input.destinationId.toLowerCase(),
    city,
    state: canonical?.state || city,
    category,
    subcategory: input.subcategory || 'User Custom Stop',
    description: input.notes
      ? `User note: ${input.notes.trim()}`
      : `Personalized custom stop created by traveler in ${city}.`,
    interestTags: ['Custom Stop', category, 'User Planned'],
    latitude: lat,
    longitude: lng,
    averageVisitDuration: duration,
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    imageSource: 'Traveler Custom Addition',
    officialSource: 'User-Added Place',
    openingHours: 'Open Daily (Flexible)',
    entryFeeINR: 0,
    highlights: input.notes ? [input.notes] : ['User Custom Landmark'],
    isMustVisit: true,
    bestTimeOfDay: 'any',
    area: input.address || `${city} Area`,
    originalData: {
      source: 'User Custom Place',
      sourceId: customId,
      sourceUrl: input.url || undefined,
      originalName: input.name.trim(),
      originalDescription: input.notes || 'User added stop',
      openingHours: 'Open Daily',
      entryFeeINR: 0,
      address: input.address,
      lastVerifiedAt: new Date().toISOString().split('T')[0],
      verificationStatus: 'unverified'
    },
    enrichment: {
      interestTags: ['Custom Stop', category],
      experienceTypes: ['local_culture'],
      crowdLevel: 'moderate',
      indoorOutdoor: 'mixed',
      walkingIntensity: 'low',
      estimatedVisitDurationMinutes: duration,
      dataConfidence: 0.90
    }
  };
}

/**
 * Re-schedules the stops for a specific day cleanly recalculating travel times,
 * arrival/departure times, and day busy/free minutes.
 */
export function recalculateDaySchedule(
  dayNumber: number,
  places: { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[],
  itinerary: OptimizedItineraryResponse
): { stops: ItineraryStopOutput[]; totalTravelMin: number; totalVisitMin: number; distanceKm: number } {
  const existingDay = itinerary.days.find(d => d.dayNumber === dayNumber);
  const startTimeStr = dayNumber === 1 && itinerary.intercitySummary
    ? itinerary.intercitySummary.recommendedSightseeingStartDay1
    : '09:00';
  let currentMin = parseTimeToMinutes(startTimeStr);

  const startLat = itinerary.canonicalDestination.suggestedStartingPoint.lat;
  const startLng = itinerary.canonicalDestination.suggestedStartingPoint.lng;
  let prevLat = startLat;
  let prevLng = startLng;
  let prevPlaceName = itinerary.canonicalDestination.suggestedStartingPoint.name;

  let totalTravelMin = 0;
  let totalVisitMin = 0;
  let totalDistanceKm = 0;

  const stops: ItineraryStopOutput[] = [];

  places.forEach((item, index) => {
    const dest = item.destination;
    const distKm = Number(haversineDistanceKm(prevLat, prevLng, dest.latitude, dest.longitude).toFixed(1));
    const mode = selectLegTransportMode(distKm, itinerary.tripConfig?.transportMode || 'cab', 'moderate', []);
    const transitMin = calculateTransitDuration(distKm, mode);
    const dwell = item.customDuration || dest.averageVisitDuration || 60;

    currentMin += transitMin;
    totalTravelMin += transitMin;
    totalDistanceKm += distKm;

    const arrivalTime = formatMinutesToTime(currentMin);
    const departureTime = formatMinutesToTime(currentMin + dwell);

    const isCustom = dest.id.startsWith('custom_') || Boolean(dest.providerPlaceId && dest.providerPlaceId.startsWith('user_created_')) || dest.originalData?.verificationStatus === 'unverified';

    stops.push({
      id: `day${dayNumber}-stop${index + 1}-${dest.id}`,
      placeId: dest.id,
      providerPlaceId: dest.providerPlaceId,
      name: dest.name,
      city: dest.city,
      category: dest.category,
      subcategory: dest.subcategory,
      startTime: arrivalTime,
      endTime: departureTime,
      plannedArrival: arrivalTime,
      plannedDeparture: departureTime,
      visitDurationMinutes: dwell,
      visitDuration: dwell,
      travelFromPreviousMinutes: transitMin,
      transitMinutes: transitMin,
      distanceFromPreviousKm: distKm,
      distanceFromPrevKm: distKm,
      recommendedTransitMode: mode,
      transitInstruction: index === 0
        ? `Depart from ${prevPlaceName} via ${mode} (${distKm} km, ~${transitMin} mins)`
        : `${mode.toUpperCase()} from ${prevPlaceName} (${distKm} km, ~${transitMin} mins)`,
      isMustVisit: item.isMustVisit ?? dest.isMustVisit ?? false,
      isCustomStop: isCustom,
      visitStatus: 'PENDING',
      estimated: false,
      reasonForSelection: isCustom
        ? (item.notes || 'Traveler custom stop added to itinerary')
        : (dest.description || `Verified landmark in ${dest.city}`),
      destination: dest,
      coordinates: { lat: dest.latitude, lng: dest.longitude },
      sequenceNumber: index + 1,
      isMealStop: dest.isMealStop,
      mealType: dest.mealType,
      cuisineType: dest.cuisineType,
      averageCostINR: dest.averageCostPerPersonINR
    });

    currentMin += dwell;
    totalVisitMin += dwell;
    prevLat = dest.latitude;
    prevLng = dest.longitude;
    prevPlaceName = dest.name.split('(')[0].trim();
  });

  return {
    stops,
    totalTravelMin,
    totalVisitMin,
    distanceKm: Number(totalDistanceKm.toFixed(1))
  };
}

/**
 * Rebuilds the entire itinerary response after any stop addition, deletion, move, or edit.
 */
function rebuildItineraryFromDays(
  itinerary: OptimizedItineraryResponse,
  dayPlacesList: Map<number, { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[]>
): OptimizedItineraryResponse {
  const updatedDays: ItineraryDayOutput[] = [];
  const allStops: ItineraryStopOutput[] = [];
  let grandTotalDistanceKm = 0;
  let grandTotalDurationMin = 0;

  for (let d = 1; d <= itinerary.days.length; d++) {
    const existingDay = itinerary.days[d - 1];
    const places = dayPlacesList.get(d) || [];
    const { stops, totalTravelMin, totalVisitMin, distanceKm } = recalculateDaySchedule(d, places, itinerary);

    const availableTimeMin = (itinerary.tripConfig?.availableHoursPerDay || 8) * 60;
    const busyMin = totalTravelMin + totalVisitMin;
    const freeTimeMin = Math.max(0, availableTimeMin - busyMin);

    updatedDays.push({
      ...existingDay,
      stops,
      totalTravelMinutes: totalTravelMin,
      totalVisitMinutes: totalVisitMin,
      freeTimeMinutes: freeTimeMin,
      dayDistanceKm: distanceKm
    });

    stops.forEach(s => allStops.push(s));
    grandTotalDistanceKm += distanceKm;
    grandTotalDurationMin += busyMin;
  }

  const rebuilt: OptimizedItineraryResponse = {
    ...itinerary,
    stops: allStops,
    days: updatedDays,
    plan: {
      ...itinerary.plan,
      totalDistanceKm: Number(grandTotalDistanceKm.toFixed(1)),
      totalDurationMin: grandTotalDurationMin,
      scheduledStops: allStops,
      days: updatedDays
    }
  };

  rebuilt.validation = validateGeneratedItinerary(rebuilt);

  // Persist immediately to SQLite database
  persistTripItineraryToDatabase({
    tripId: rebuilt.tripId,
    itinerary: rebuilt as any
  });

  return rebuilt;
}

/**
 * Adds a place (verified catalog place or custom place) to a specific day and position in the itinerary.
 */
export function addStopToItinerary(
  itinerary: OptimizedItineraryResponse,
  req: AddStopRequest
): OptimizedItineraryResponse {
  const dayPlacesMap = new Map<number, { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[]>();

  itinerary.days.forEach(d => {
    const current = d.stops.map(s => ({
      destination: s.destination,
      customDuration: s.visitDurationMinutes,
      notes: s.reasonForSelection,
      isMustVisit: s.isMustVisit
    }));
    dayPlacesMap.set(d.dayNumber, current);
  });

  const targetDay = Math.max(1, Math.min(itinerary.days.length, req.dayNumber));
  const currentPlaces = dayPlacesMap.get(targetDay) || [];

  const newEntry = {
    destination: req.destination,
    customDuration: req.destination.averageVisitDuration || 60,
    notes: req.notes,
    isMustVisit: req.isMustVisit ?? true
  };

  if (req.position === 'morning') {
    currentPlaces.unshift(newEntry);
  } else if (req.position === 'afternoon') {
    const mid = Math.max(1, Math.floor(currentPlaces.length / 2));
    currentPlaces.splice(mid, 0, newEntry);
  } else {
    currentPlaces.push(newEntry);
  }

  dayPlacesMap.set(targetDay, currentPlaces);
  return rebuildItineraryFromDays(itinerary, dayPlacesMap);
}

/**
 * Removes a stop from the itinerary and recalculates all day times and routes.
 */
export function removeStopFromItinerary(
  itinerary: OptimizedItineraryResponse,
  stopId: string
): OptimizedItineraryResponse {
  const dayPlacesMap = new Map<number, { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[]>();

  itinerary.days.forEach(d => {
    const filtered = d.stops
      .filter(s => s.id !== stopId && s.placeId !== stopId)
      .map(s => ({
        destination: s.destination,
        customDuration: s.visitDurationMinutes,
        notes: s.reasonForSelection,
        isMustVisit: s.isMustVisit
      }));
    dayPlacesMap.set(d.dayNumber, filtered);
  });

  return rebuildItineraryFromDays(itinerary, dayPlacesMap);
}

/**
 * Reorders a stop within its day (moves up or down).
 */
export function reorderStopInDay(
  itinerary: OptimizedItineraryResponse,
  dayNumber: number,
  stopId: string,
  direction: 'up' | 'down'
): OptimizedItineraryResponse {
  const dayPlacesMap = new Map<number, { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[]>();

  itinerary.days.forEach(d => {
    const places = d.stops.map(s => ({
      destination: s.destination,
      customDuration: s.visitDurationMinutes,
      notes: s.reasonForSelection,
      isMustVisit: s.isMustVisit
    }));

    if (d.dayNumber === dayNumber) {
      const idx = d.stops.findIndex(s => s.id === stopId || s.placeId === stopId);
      if (idx !== -1) {
        if (direction === 'up' && idx > 0) {
          const temp = places[idx - 1];
          places[idx - 1] = places[idx];
          places[idx] = temp;
        } else if (direction === 'down' && idx < places.length - 1) {
          const temp = places[idx + 1];
          places[idx + 1] = places[idx];
          places[idx] = temp;
        }
      }
    }

    dayPlacesMap.set(d.dayNumber, places);
  });

  return rebuildItineraryFromDays(itinerary, dayPlacesMap);
}

/**
 * Moves a stop from one day to another day.
 */
export function moveStopToDay(
  itinerary: OptimizedItineraryResponse,
  stopId: string,
  targetDayNumber: number
): OptimizedItineraryResponse {
  const targetDay = Math.max(1, Math.min(itinerary.days.length, targetDayNumber));
  let stopToMove: { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean } | null = null;

  const dayPlacesMap = new Map<number, { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[]>();

  itinerary.days.forEach(d => {
    const remaining: { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[] = [];
    d.stops.forEach(s => {
      const entry = {
        destination: s.destination,
        customDuration: s.visitDurationMinutes,
        notes: s.reasonForSelection,
        isMustVisit: s.isMustVisit
      };
      if (s.id === stopId || s.placeId === stopId) {
        stopToMove = entry;
      } else {
        remaining.push(entry);
      }
    });
    dayPlacesMap.set(d.dayNumber, remaining);
  });

  if (stopToMove) {
    const targetPlaces = dayPlacesMap.get(targetDay) || [];
    targetPlaces.push(stopToMove);
    dayPlacesMap.set(targetDay, targetPlaces);
  }

  return rebuildItineraryFromDays(itinerary, dayPlacesMap);
}

/**
 * Updates visit duration, notes, or must-visit status of a specific stop.
 */
export function updateStopDetails(
  itinerary: OptimizedItineraryResponse,
  stopId: string,
  updates: { visitDurationMinutes?: number; notes?: string; isMustVisit?: boolean }
): OptimizedItineraryResponse {
  const dayPlacesMap = new Map<number, { destination: IndiaDestination; customDuration?: number; notes?: string; isMustVisit?: boolean }[]>();

  itinerary.days.forEach(d => {
    const list = d.stops.map(s => {
      const matches = s.id === stopId || s.placeId === stopId;
      return {
        destination: s.destination,
        customDuration: matches && typeof updates.visitDurationMinutes === 'number'
          ? updates.visitDurationMinutes
          : s.visitDurationMinutes,
        notes: matches && typeof updates.notes === 'string'
          ? updates.notes
          : s.reasonForSelection,
        isMustVisit: matches && typeof updates.isMustVisit === 'boolean'
          ? updates.isMustVisit
          : s.isMustVisit
      };
    });
    dayPlacesMap.set(d.dayNumber, list);
  });

  return rebuildItineraryFromDays(itinerary, dayPlacesMap);
}
