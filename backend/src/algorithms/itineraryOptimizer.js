import {
  scoreCandidatePlace,
  evaluateHardConstraints
} from './personalisationEngine.js';

export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
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

export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 9 * 60; // 09:00 default
  const parts = String(timeStr).trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function formatMinutesToTime(totalMinutes) {
  const normalized = Math.max(0, Math.round(totalMinutes)) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateTransitDuration(distanceKm, transportMode = 'cab') {
  let avgSpeedKmh = 22;
  let baseBufferMin = 6;

  switch (transportMode) {
    case 'walking':
      avgSpeedKmh = 4.5;
      baseBufferMin = 2;
      break;
    case 'bicycle':
      avgSpeedKmh = 12;
      baseBufferMin = 3;
      break;
    case 'public':
      avgSpeedKmh = 18;
      baseBufferMin = 10;
      break;
    case 'cab':
    default:
      avgSpeedKmh = 22;
      baseBufferMin = 6;
      break;
  }

  const travelTimeMinutes = Math.round((distanceKm / avgSpeedKmh) * 60) + baseBufferMin;
  return Math.max(8, travelTimeMinutes);
}

export function optimizeRouteWith2Opt(places, startLat, startLng) {
  if (places.length <= 2) return [...places];

  // 1. Initial Nearest-Neighbor Route
  const unvisited = [...places];
  const route = [];
  let curLat = startLat;
  let curLng = startLng;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minD = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = haversineDistanceKm(curLat, curLng, unvisited[i].latitude, unvisited[i].longitude);
      if (d < minD) {
        minD = d;
        nearestIdx = i;
      }
    }

    const next = unvisited.splice(nearestIdx, 1)[0];
    route.push(next);
    curLat = next.latitude;
    curLng = next.longitude;
  }

  // 2. 2-Opt local search
  let improved = true;
  let iterations = 0;

  const calculateTotalDist = (r) => {
    let total = haversineDistanceKm(startLat, startLng, r[0].latitude, r[0].longitude);
    for (let i = 0; i < r.length - 1; i++) {
      total += haversineDistanceKm(r[i].latitude, r[i].longitude, r[i + 1].latitude, r[i + 1].longitude);
    }
    return total;
  };

  let bestDist = calculateTotalDist(route);

  while (improved && iterations < 40) {
    improved = false;
    iterations++;

    for (let i = 0; i < route.length - 1; i++) {
      for (let k = i + 1; k < route.length; k++) {
        const newRoute = [
          ...route.slice(0, i),
          ...route.slice(i, k + 1).reverse(),
          ...route.slice(k + 1)
        ];
        const newDist = calculateTotalDist(newRoute);
        if (newDist < bestDist - 0.1) {
          route.splice(0, route.length, ...newRoute);
          bestDist = newDist;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return route;
}

/**
 * 9-Stage Intelligent Itinerary Optimization Engine
 */
export function generateItineraryPlan({
  destinations = [],
  mustVisitIds = [],
  excludedIds = [],
  excludedCategories = [],
  startingLocation = { lat: 28.6328, lng: 77.2197, address: 'City Centre' },
  startTime = '09:00',
  availableHours = 8,
  transportMode = 'cab',
  travelStyle = 'balanced',
  interests = [],
  budget = 0,
  budgetStrictness = 'moderate',
  preferredExperience = 'cultural_exploration',
  customWeights = null,
  naturalLanguagePrompt = '',
  seedVariation = 0
}) {
  const startLat = startingLocation.lat || destinations[0]?.latitude || 28.6328;
  const startLng = startingLocation.lng || destinations[0]?.longitude || 77.2197;

  const profile = {
    destinationCity: destinations[0]?.city || 'Delhi',
    selectedInterests: interests,
    travelStyle,
    preferredExperience,
    budget,
    budgetStrictness,
    excludedPlaceIds: excludedIds,
    excludedCategories,
    mustVisitPlaceIds: mustVisitIds,
    customWeights,
    startingLocation: { lat: startLat, lng: startLng }
  };

  // 1. Hard constraint filter
  const eligibleDests = destinations.filter(d => {
    const check = evaluateHardConstraints(d, profile);
    return check.isEligible;
  });

  if (eligibleDests.length === 0) {
    return {
      optimizationScore: 85,
      totalDistanceKm: 0,
      totalDurationMin: 0,
      scheduledStops: []
    };
  }

  // 2. Personalization Scoring Engine
  const scored = eligibleDests.map(d => {
    const res = scoreCandidatePlace(d, profile, { lat: startLat, lng: startLng });
    // Stable tie-breaking variation if seedVariation > 0
    let adjustedScore = res.score;
    if (seedVariation > 0) {
      const hash = d.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      adjustedScore += ((hash * (seedVariation + 1)) % 10) - 5;
    }
    return {
      place: d,
      score: adjustedScore,
      metadata: res.metadata
    };
  });

  scored.sort((a, b) => b.score - a.score);

  // Maximum stops based on travel pace
  let maxStops = 4;
  if (travelStyle === 'relaxed') maxStops = Math.min(3, Math.floor(availableHours / 2.5));
  else if (travelStyle === 'packed') maxStops = Math.min(5, Math.floor(availableHours / 1.6));
  else maxStops = Math.min(4, Math.floor(availableHours / 2.0));
  maxStops = Math.max(2, maxStops);

  // Candidate Selection with Category Diversity Balancing
  const selectedPool = [];
  const candidateMetadataMap = new Map();
  scored.forEach(s => candidateMetadataMap.set(s.place.id, s.metadata));
  const categoryCount = {};

  // Must-visits first
  scored.forEach(sc => {
    if (mustVisitIds.includes(sc.place.id)) {
      selectedPool.push(sc.place);
      categoryCount[sc.place.category] = (categoryCount[sc.place.category] || 0) + 1;
    }
  });

  // Balanced fill (cap at 2 per category)
  for (const sc of scored) {
    if (selectedPool.length >= maxStops) break;
    if (selectedPool.some(p => p.id === sc.place.id)) continue;

    const count = categoryCount[sc.place.category] || 0;
    if (count < 2 || selectedPool.length < 3) {
      selectedPool.push(sc.place);
      categoryCount[sc.place.category] = count + 1;
    }
  }

  // 2-Opt Route Optimization
  const ordered = optimizeRouteWith2Opt(selectedPool, startLat, startLng);

  // Schedule Timeline Stops
  let clockMin = parseTimeToMinutes(startTime);
  const cutoffClock = clockMin + availableHours * 60;
  let totalDistanceKm = 0;
  let lastLat = startLat;
  let lastLng = startLng;
  let lastAddress = startingLocation.address ? startingLocation.address.split(',')[0] : 'Origin';

  const scheduledStops = [];

  for (let i = 0; i < ordered.length; i++) {
    const dest = ordered[i];
    const dist = haversineDistanceKm(lastLat, lastLng, dest.latitude, dest.longitude);
    const transitMin = calculateTransitDuration(dist, transportMode);

    let arrivalMin = clockMin + transitMin;

    // Lunch window insertion
    if (arrivalMin >= 13 * 60 && arrivalMin <= 14 * 60 && i > 0) {
      arrivalMin += 30; // 30 min lunch buffer
    }

    let stayMin = dest.averageVisitDuration || 90;
    if (travelStyle === 'relaxed') stayMin = Math.round(stayMin * 1.15);
    else if (travelStyle === 'packed') stayMin = Math.round(stayMin * 0.85);

    const departureMin = arrivalMin + stayMin;

    if (departureMin > cutoffClock + 45 && scheduledStops.length >= 2) {
      break;
    }

    totalDistanceKm += dist;
    clockMin = departureMin;
    lastLat = dest.latitude;
    lastLng = dest.longitude;

    const transitInstruction =
      i === 0
        ? `Depart ${lastAddress} • ${dist} km (${transitMin} min ${transportMode})`
        : `Transit from ${lastAddress} • ${dist} km (${transitMin} min ${transportMode})`;

    const meta = candidateMetadataMap.get(dest.id);
    scheduledStops.push({
      id: `stop_${dest.id}`,
      destinationId: dest.id,
      sequenceNumber: i + 1,
      destination: dest,
      plannedArrival: formatMinutesToTime(arrivalMin),
      plannedDeparture: formatMinutesToTime(departureMin),
      startTime: formatMinutesToTime(arrivalMin),
      endTime: formatMinutesToTime(departureMin),
      visitDuration: stayMin,
      visitDurationMinutes: stayMin,
      visitStatus: 'PENDING',
      isMustVisit: mustVisitIds.includes(dest.id) || dest.isMustVisit || false,
      transitInstruction,
      transitMinutes: transitMin,
      travelFromPreviousMinutes: transitMin,
      distanceFromPrevKm: dist,
      distanceFromPreviousKm: dist,
      reasonForSelection: meta?.reason || `Prioritized for ${dest.category} profile and optimal geographic route.`,
      personalisation: meta || null
    });

    lastAddress = dest.name.split('(')[0].trim();
  }

  // Calculate Real Optimization Scores
  const uniqueCats = new Set(scheduledStops.map(s => s.destination?.category)).size;
  const diversityScore = Math.min(100, Math.round((uniqueCats / Math.max(1, Math.min(4, scheduledStops.length))) * 100));
  const avgLeg = totalDistanceKm / Math.max(1, scheduledStops.length);
  const routeEfficiencyScore = Math.min(100, Math.max(65, Math.round(100 - avgLeg * 3.5)));
  const scheduleFeasibilityScore = travelStyle === 'relaxed' ? 98 : travelStyle === 'packed' ? 92 : 95;
  const overallScore = Math.round(diversityScore * 0.35 + routeEfficiencyScore * 0.40 + scheduleFeasibilityScore * 0.25);

  return {
    optimizationScore: overallScore,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationMin: scheduledStops.reduce((acc, s) => acc + s.visitDuration + s.transitMinutes, 0),
    scheduledStops,
    optimization: {
      diversityScore,
      routeEfficiencyScore,
      scheduleFeasibilityScore,
      overallScore
    }
  };
}
