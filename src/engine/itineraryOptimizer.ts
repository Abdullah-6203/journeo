import { HeritageSite, HERITAGE_SITES } from '../data/heritageSites';
import { UserPreferences } from '../data/sampleDemoPlan';

export interface ItineraryStop {
  id: string;
  stopOrder: number;
  site: HeritageSite;
  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;
  transitInstruction: string;
  transitMinutes: number;
  distanceFromPrevKm: number;
  isMustVisit: boolean;
}

export interface OptimizedItinerary {
  id: string;
  title: string;
  generatedAt: string;
  stops: ItineraryStop[];
  totalTravelDistanceKm: number;
  totalDurationMinutes: number;
  optimizationScore: number;
  startingPoint: {
    lat: number;
    lng: number;
    address: string;
  };
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = Math.max(0, Math.round(totalMinutes)) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function generateOptimizedItinerary(prefs: UserPreferences): OptimizedItinerary {
  const mustVisitSites: HeritageSite[] = [];
  const optionalSites: HeritageSite[] = [];

  HERITAGE_SITES.forEach(site => {
    if (prefs.mustVisitSiteIds.includes(site.id) || site.mustVisit) {
      mustVisitSites.push(site);
    } else {
      optionalSites.push(site);
    }
  });

  // Prioritize must-visit sites, then append high-ranking cultural stops
  const selectedSites: HeritageSite[] = [...mustVisitSites];
  for (const opt of optionalSites) {
    if (selectedSites.length < (prefs.maxStops || 4)) {
      if (!selectedSites.some(s => s.id === opt.id)) {
        selectedSites.push(opt);
      }
    }
  }

  // Route optimization: Nearest Neighbor heuristic starting from startingPoint
  let currentLat = prefs.startingPoint.lat;
  let currentLng = prefs.startingPoint.lng;
  const unvisited = [...selectedSites];
  const orderedSites: HeritageSite[] = [];

  while (unvisited.length > 0) {
    // Find closest site
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(currentLat, currentLng, unvisited[i].location.lat, unvisited[i].location.lng);
      // Give strong weight to must-visits to preserve chronological elegance
      const weight = prefs.mustVisitSiteIds.includes(unvisited[i].id) ? 0.7 : 1.0;
      if (dist * weight < minDistance) {
        minDistance = dist * weight;
        closestIndex = i;
      }
    }

    const nextSite = unvisited.splice(closestIndex, 1)[0];
    orderedSites.push(nextSite);
    currentLat = nextSite.location.lat;
    currentLng = nextSite.location.lng;
  }

  // Build scheduled stops
  let currentClockMinutes = parseTimeToMinutes(prefs.startTime);
  const startClock = currentClockMinutes;
  let totalKm = 0;
  let lastLat = prefs.startingPoint.lat;
  let lastLng = prefs.startingPoint.lng;

  const stops: ItineraryStop[] = orderedSites.map((site, index) => {
    const dist = calculateDistanceKm(lastLat, lastLng, site.location.lat, site.location.lng);
    totalKm += dist;

    // Realistic urban speed: 20 km/h + 5 min traffic buffer
    const transitMin = Math.max(12, Math.round((dist / 22) * 60) + 5);
    const arrivalClock = currentClockMinutes + transitMin;
    const stayDuration = site.timeRecommendedMinutes;
    const departureClock = arrivalClock + stayDuration;

    currentClockMinutes = departureClock;
    lastLat = site.location.lat;
    lastLng = site.location.lng;

    const transitText = index === 0
      ? `Depart ${prefs.startingPoint.address.split(',')[0]} • ${dist} km (${transitMin} min drive)`
      : `Transit from ${orderedSites[index - 1].name.split('(')[0].trim()} • ${dist} km (${transitMin} min drive)`;

    return {
      id: `stop_${site.id}_${index + 1}`,
      stopOrder: index + 1,
      site,
      arrivalTime: formatMinutesToTime(arrivalClock),
      departureTime: formatMinutesToTime(departureClock),
      durationMinutes: stayDuration,
      transitInstruction: transitText,
      transitMinutes: transitMin,
      distanceFromPrevKm: dist,
      isMustVisit: prefs.mustVisitSiteIds.includes(site.id) || !!site.mustVisit
    };
  });

  const totalDurationMinutes = currentClockMinutes - startClock;

  // Optimization score calculation (0 - 100)
  // Higher if must-visits are satisfied and minimal backtrack distance
  const mustVisitSatisfied = prefs.mustVisitSiteIds.every(id => stops.some(s => s.site.id === id));
  const efficiencyBonus = totalKm < 30 ? 25 : 15;
  const optimizationScore = Math.min(98, (mustVisitSatisfied ? 70 : 40) + efficiencyBonus);

  return {
    id: `JRN-${Date.now().toString().slice(-6)}`,
    title: 'Imperial Delhi Royal Heritage Circuit',
    generatedAt: new Date().toISOString(),
    stops,
    totalTravelDistanceKm: Math.round(totalKm * 10) / 10,
    totalDurationMinutes,
    optimizationScore,
    startingPoint: prefs.startingPoint
  };
}
