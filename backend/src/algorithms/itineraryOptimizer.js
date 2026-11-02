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
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutesToTime(totalMinutes) {
  const normalized = Math.max(0, Math.round(totalMinutes)) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateTransitDuration(distanceKm, transportMode = 'cab') {
  let avgSpeedKmh = 22; // default urban cab speed in Delhi
  let baseBufferMin = 5;

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
      baseBufferMin = 10; // metro wait & transfer buffer
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

/**
 * Greedy nearest-feasible-destination with priority scoring
 */
export function generateItineraryPlan({
  destinations,
  mustVisitIds = [],
  excludedIds = [],
  startingLocation = { lat: 28.6328, lng: 77.2197, address: 'Connaught Place, Central Delhi' },
  startTime = '09:00',
  availableHours = 8,
  transportMode = 'cab',
  travelStyle = 'balanced' // relaxed, balanced, packed
}) {
  const validDests = destinations.filter(d => !excludedIds.includes(d.id));

  // Partition into must-visit and optional candidates
  const mustVisits = validDests.filter(d => mustVisitIds.includes(d.id) || d.isMustVisit);
  const optionals = validDests.filter(d => !mustVisitIds.includes(d.id) && !d.isMustVisit);

  // Maximum stops based on travel style and available hours
  let maxStopsTarget = 4;
  if (travelStyle === 'relaxed') maxStopsTarget = Math.min(3, Math.floor(availableHours / 2.5));
  else if (travelStyle === 'packed') maxStopsTarget = Math.min(6, Math.floor(availableHours / 1.5));
  else maxStopsTarget = Math.min(4, Math.floor(availableHours / 2.0));

  maxStopsTarget = Math.max(3, maxStopsTarget);

  // Combine candidates, prioritizing must-visits
  const pool = [...mustVisits];
  for (const opt of optionals) {
    if (pool.length < maxStopsTarget && !pool.some(p => p.id === opt.id)) {
      pool.push(opt);
    }
  }

  // Nearest-Neighbor Route Ordering Heuristic
  let curLat = startingLocation.lat || 28.6328;
  let curLng = startingLocation.lng || 77.2197;
  const unvisited = [...pool];
  const ordered = [];

  while (unvisited.length > 0) {
    let bestIdx = 0;
    let bestScore = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = unvisited[i];
      const dist = haversineDistanceKm(curLat, curLng, d.latitude, d.longitude);
      // Give 30% distance bonus to must-visits
      const isMust = mustVisitIds.includes(d.id) || d.isMustVisit;
      const score = dist * (isMust ? 0.7 : 1.0);
      if (score < bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    const nextDest = unvisited.splice(bestIdx, 1)[0];
    ordered.push(nextDest);
    curLat = nextDest.latitude;
    curLng = nextDest.longitude;
  }

  // Schedule Timeline Stops
  let clockMin = parseTimeToMinutes(startTime);
  const startClock = clockMin;
  const cutoffClock = startClock + availableHours * 60;
  let totalDistanceKm = 0;
  let lastLat = startingLocation.lat || 28.6328;
  let lastLng = startingLocation.lng || 77.2197;
  let lastAddress = startingLocation.address ? startingLocation.address.split(',')[0] : 'Origin';

  const scheduledStops = [];

  for (let i = 0; i < ordered.length; i++) {
    const dest = ordered[i];
    const dist = haversineDistanceKm(lastLat, lastLng, dest.latitude, dest.longitude);
    const transitMin = calculateTransitDuration(dist, transportMode);

    const arrivalMin = clockMin + transitMin;
    let stayMin = dest.averageVisitDuration || 90;

    // Adjust stay duration based on style
    if (travelStyle === 'relaxed') stayMin = Math.round(stayMin * 1.15);
    else if (travelStyle === 'packed') stayMin = Math.round(stayMin * 0.85);

    const departureMin = arrivalMin + stayMin;

    // Check if this exceeds day's available hours
    if (departureMin > cutoffClock + 40 && scheduledStops.length >= 3) {
      break; // preserve feasible schedule
    }

    totalDistanceKm += dist;
    clockMin = departureMin;
    lastLat = dest.latitude;
    lastLng = dest.longitude;

    const transitText = i === 0
      ? `Depart ${lastAddress} • ${dist} km (${transitMin} min ${transportMode})`
      : `Transit from ${lastAddress} • ${dist} km (${transitMin} min ${transportMode})`;

    lastAddress = dest.name.split('(')[0].trim();

    scheduledStops.push({
      destinationId: dest.id,
      destination: dest,
      sequenceNumber: scheduledStops.length + 1,
      plannedArrival: formatMinutesToTime(arrivalMin),
      plannedDeparture: formatMinutesToTime(departureMin),
      visitDuration: stayMin,
      visitStatus: 'PENDING',
      isMustVisit: mustVisitIds.includes(dest.id) || !!dest.isMustVisit,
      transitInstruction: transitText,
      transitMinutes: transitMin,
      distanceFromPrevKm: dist
    });
  }

  const totalDurationMin = clockMin - startClock;
  const mustVisitCount = mustVisits.length;
  const mustVisitSatisfied = scheduledStops.filter(s => s.isMustVisit).length;
  const satisfactionRate = mustVisitCount > 0 ? (mustVisitSatisfied / mustVisitCount) : 1;
  const optimizationScore = Math.min(98, Math.round(75 + satisfactionRate * 15 + (totalDistanceKm < 25 ? 8 : 2)));

  return {
    scheduledStops,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationMin,
    optimizationScore,
    startingLocation
  };
}
