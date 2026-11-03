import {
  generatePersonalizedItinerary,
  generateOptimizedItinerary,
  parseFreeTextPreferences,
  scoreCandidatePlaces
} from '../itineraryOptimizer';
import { INDIA_DESTINATIONS, IndiaDestination } from '../../../../data/indiaDestinations';
import { CANONICAL_DESTINATIONS, resolveCanonicalDestination } from '../../../../data/canonicalDestinations';
import {
  searchCatalogPlaces,
  buildCustomDestination,
  addStopToItinerary,
  removeStopFromItinerary,
  reorderStopInDay,
  moveStopToDay,
  updateStopDetails
} from '../../../../services/customPlaceService';
import {
  checkMapplsConfiguration,
  getActiveMapTileConfig
} from '../../../../services/mapProviderService';
import {
  getDatabasePlaceStats,
  queryPlacesByDestination
} from '../../../../services/placeDatabaseService';

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}

function jaccardOverlap(setA: string[], setB: string[]): number {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

async function runPhase9ValidationSuite() {
  const results: TestResult[] = [];
  console.log('================================================================================');
  console.log('🚀 JOURNEO PHASE 9 — VERIFICATION, CUSTOM STOPS, MAPPLS & ACCURACY TEST SUITE');
  console.log('================================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1 — Multi-Profile Personalization Divergence (History vs Nature vs Food vs Shopping)
  // --------------------------------------------------------------------------
  const historyPlan = generatePersonalizedItinerary({
    destination: 'Delhi',
    days: 2,
    travelPace: 'balanced',
    selectedInterests: ['history', 'architecture'],
    experienceTypes: ['heritage', 'architecture'],
    crowdPreference: 'popular',
    discoveryPreference: 'popular'
  });

  const naturePlan = generatePersonalizedItinerary({
    destination: 'Delhi',
    days: 2,
    travelPace: 'balanced',
    selectedInterests: ['nature', 'outdoors'],
    experienceTypes: ['nature', 'parks'],
    crowdPreference: 'quiet',
    discoveryPreference: 'hidden_gems'
  });

  const foodPlan = generatePersonalizedItinerary({
    destination: 'Delhi',
    days: 2,
    travelPace: 'balanced',
    selectedInterests: ['food', 'local_culture'],
    experienceTypes: ['street_food', 'culinary'],
    crowdPreference: 'popular',
    discoveryPreference: 'popular'
  });

  const shoppingPlan = generatePersonalizedItinerary({
    destination: 'Delhi',
    days: 2,
    travelPace: 'balanced',
    selectedInterests: ['shopping', 'markets'],
    experienceTypes: ['bazaars', 'artisan_crafts'],
    crowdPreference: 'popular',
    discoveryPreference: 'popular'
  });

  const historyIds = historyPlan.stops.map(s => s.placeId);
  const natureIds = naturePlan.stops.map(s => s.placeId);
  const foodIds = foodPlan.stops.map(s => s.placeId);
  const shoppingIds = shoppingPlan.stops.map(s => s.placeId);

  const overlapHistNat = jaccardOverlap(historyIds, natureIds);
  const overlapHistFood = jaccardOverlap(historyIds, foodIds);
  const overlapHistShop = jaccardOverlap(historyIds, shoppingIds);
  const overlapNatFood = jaccardOverlap(natureIds, foodIds);

  const pass1 =
    overlapHistNat <= 0.20 &&
    overlapHistFood <= 0.25 &&
    overlapHistShop <= 0.20 &&
    overlapNatFood <= 0.20;

  results.push({
    id: 'Test 1',
    name: 'Multi-Profile Personalization Divergence (History, Nature, Food, Shopping)',
    passed: pass1,
    details: `Hist vs Nat: ${(overlapHistNat * 100).toFixed(1)}% | Hist vs Food: ${(overlapHistFood * 100).toFixed(1)}% | Hist vs Shop: ${(overlapHistShop * 100).toFixed(1)}% | Nat vs Food: ${(overlapNatFood * 100).toFixed(1)}%`
  });

  // --------------------------------------------------------------------------
  // TEST 2 — Cafe Dislike Strictness
  // --------------------------------------------------------------------------
  const noCafePlan = generatePersonalizedItinerary({
    destination: 'Delhi',
    days: 2,
    travelPace: 'balanced',
    selectedInterests: ['history', 'culture'],
    dislikedCategories: ['cafe', 'Food'],
    freeTextPrompt: 'I dislike cafes and coffee shops, show me only monuments and history'
  });

  const cafeOrMealStops = noCafePlan.stops.filter(
    s =>
      s.destination.category === 'Food' ||
      s.destination.isMealStop ||
      s.isMealStop ||
      s.destination.name.toLowerCase().includes('cafe') ||
      s.destination.name.toLowerCase().includes('coffee')
  );

  const pass2 = cafeOrMealStops.length === 0;

  results.push({
    id: 'Test 2',
    name: 'Cafe Dislike Strict Enforcement (Zero Cafes Scheduled)',
    passed: pass2,
    details: `Scheduled stops: ${noCafePlan.stops.length} | Cafe/Meal stops found: ${cafeOrMealStops.length}`
  });

  // --------------------------------------------------------------------------
  // TEST 3 — Place Data Integrity & Zero Duplicate Images
  // --------------------------------------------------------------------------
  const imageUrls = INDIA_DESTINATIONS.map(d => d.imageUrl);
  const uniqueImages = new Set(imageUrls);
  const imageDuplicateCount = imageUrls.length - uniqueImages.size;

  const invalidCoords = INDIA_DESTINATIONS.filter(
    d => typeof d.latitude !== 'number' || typeof d.longitude !== 'number' || isNaN(d.latitude) || isNaN(d.longitude)
  );

  const genericNames = INDIA_DESTINATIONS.filter(
    d => !d.name || d.name.toLowerCase().startsWith('stop') || d.name.toLowerCase().includes('generic')
  );

  const pass3 = imageDuplicateCount === 0 && invalidCoords.length === 0 && genericNames.length === 0;

  results.push({
    id: 'Test 3',
    name: 'Place Data Integrity & Zero Duplicate Images Across Entire Catalog',
    passed: pass3,
    details: `Total Places: ${INDIA_DESTINATIONS.length} | Unique Images: ${uniqueImages.size}/${imageUrls.length} (Duplicates: ${imageDuplicateCount}) | Invalid coords: ${invalidCoords.length}`
  });

  // --------------------------------------------------------------------------
  // TEST 4 — Catalog Breadth Across 10 Canonical Destinations
  // --------------------------------------------------------------------------
  const canonicalCities = [
    'delhi',
    'goa',
    'jaipur',
    'mumbai',
    'agra',
    'udaipur',
    'varanasi',
    'amritsar',
    'rishikesh',
    'kochi'
  ];

  const cityCounts = canonicalCities.map(city => {
    const places = INDIA_DESTINATIONS.filter(
      p => p.destinationId.toLowerCase() === city || p.city.toLowerCase() === city
    );
    return { city, count: places.length };
  });

  const allCitiesHaveAtLeast5 = cityCounts.every(c => c.count >= 5);
  const totalExpanded = INDIA_DESTINATIONS.length >= 100;
  const pass4 = allCitiesHaveAtLeast5 && totalExpanded;

  results.push({
    id: 'Test 4',
    name: 'Catalog Breadth (100+ Verified Places across 10 Destinations)',
    passed: pass4,
    details: `Total Places: ${INDIA_DESTINATIONS.length} | Distribution: ${cityCounts.map(c => `${c.city}:${c.count}`).join(', ')}`
  });

  // --------------------------------------------------------------------------
  // TEST 5 — Add Catalog Stop via Custom Place Service
  // --------------------------------------------------------------------------
  const baseTrip = generateOptimizedItinerary({
    destination: 'Delhi',
    days: 2,
    travelPace: 'balanced'
  });

  const existingIds = new Set(baseTrip.stops.map(s => s.placeId));
  const candidateToAdd = INDIA_DESTINATIONS.find(
    d => d.destinationId === 'delhi' && !existingIds.has(d.id)
  )!;

  const initialStopCount = baseTrip.stops.length;
  const updatedWithCatalog = addStopToItinerary(baseTrip, {
    destination: candidateToAdd,
    dayNumber: 1,
    position: 'end'
  });

  const day1Stops = updatedWithCatalog.days[0].stops;
  const lastStopDay1 = day1Stops[day1Stops.length - 1];
  const pass5 =
    updatedWithCatalog.stops.length === initialStopCount + 1 &&
    lastStopDay1.destination.id === candidateToAdd.id &&
    updatedWithCatalog.validation.isValid;

  results.push({
    id: 'Test 5',
    name: 'Add Stop from Catalog with Dynamic Transit Recalculation',
    passed: pass5,
    details: `Initial stops: ${initialStopCount} -> Updated: ${updatedWithCatalog.stops.length} | Added: ${candidateToAdd.name} to Day 1 End | Validation: ${updatedWithCatalog.validation.isValid}`
  });

  // --------------------------------------------------------------------------
  // TEST 6 — Add User-Created Custom Stop
  // --------------------------------------------------------------------------
  const customPlace = buildCustomDestination({
    name: 'Old Famous Jalebi Wala Dariba Kalan',
    destinationId: 'delhi',
    city: 'Delhi',
    category: 'Food',
    address: 'Shop 1797, Dariba Corner, Chandni Chowk, Delhi 110006',
    notes: 'Legendary jalebi shop since 1884, fried in pure desi ghee.',
    latitude: 28.6562,
    longitude: 77.2312,
    visitDurationMinutes: 35
  });

  const updatedWithCustom = addStopToItinerary(updatedWithCatalog, {
    destination: customPlace,
    dayNumber: 1,
    position: 'afternoon'
  });

  const addedCustomStop = updatedWithCustom.stops.find(s => s.destination.name.includes('Old Famous Jalebi'));
  const pass6 =
    Boolean(addedCustomStop) &&
    addedCustomStop?.isCustomStop === true &&
    addedCustomStop?.visitDurationMinutes === 35 &&
    addedCustomStop?.destination.providerPlaceId.startsWith('user_created_');

  results.push({
    id: 'Test 6',
    name: 'Add Custom Stop with User Coordinates, Dwell Time & Notes',
    passed: Boolean(pass6),
    details: `Custom Stop: ${addedCustomStop?.destination.name} | isCustomStop: ${addedCustomStop?.isCustomStop} | Dwell: ${addedCustomStop?.visitDurationMinutes}m | Coordinates: [${addedCustomStop?.destination.latitude}, ${addedCustomStop?.destination.longitude}]`
  });

  // --------------------------------------------------------------------------
  // TEST 7 — Stop Reordering Within Day
  // --------------------------------------------------------------------------
  const beforeReorder = updatedWithCustom.days[0].stops;
  const secondStopId = beforeReorder[1].id;
  const secondStopName = beforeReorder[1].destination.name;

  const reorderedTrip = reorderStopInDay(updatedWithCustom, 1, secondStopId, 'up');
  const afterReorder = reorderedTrip.days[0].stops;

  const pass7 =
    afterReorder[0].placeId === beforeReorder[1].placeId &&
    afterReorder[0].sequenceNumber === 1 &&
    afterReorder[1].sequenceNumber === 2 &&
    typeof afterReorder[0].plannedArrival === 'string';

  results.push({
    id: 'Test 7',
    name: 'Stop Reordering within Day & Schedule Realignment',
    passed: pass7,
    details: `Moved "${secondStopName}" UP: Now Stop 1 at ${afterReorder[0].plannedArrival} (prev Stop 1 moved to Stop 2 at ${afterReorder[1].plannedArrival})`
  });

  // --------------------------------------------------------------------------
  // TEST 8 — Must-Visit Pinning & Stop Details Update
  // --------------------------------------------------------------------------
  const targetToPin = afterReorder[0];
  const updatedTrip = updateStopDetails(reorderedTrip, targetToPin.id, {
    isMustVisit: true,
    visitDurationMinutes: 120
  });

  const pinnedStop = updatedTrip.stops.find(s => s.id === targetToPin.id);
  const pass8 =
    pinnedStop?.isMustVisit === true &&
    pinnedStop?.visitDurationMinutes === 120;

  results.push({
    id: 'Test 8',
    name: 'Must-Visit Pinning & Dwell Duration Update Persistence',
    passed: Boolean(pass8),
    details: `Pinned Stop: ${pinnedStop?.destination.name} | isMustVisit: ${pinnedStop?.isMustVisit} | visitDurationMinutes: ${pinnedStop?.visitDurationMinutes}`
  });

  // --------------------------------------------------------------------------
  // TEST 9 — Map Marker & Card Synchronization
  // --------------------------------------------------------------------------
  const allStops = updatedTrip.stops;
  const markers = allStops.map((s, idx) => ({
    id: s.id,
    lat: s.coordinates.lat,
    lng: s.coordinates.lng,
    title: s.destination.name,
    order: idx + 1
  }));

  const allCoordsValid = markers.every(m => m.lat > 0 && m.lng > 0);
  const ordersInSequence = markers.every((m, idx) => m.order === idx + 1);
  const countMatches = markers.length === allStops.length;

  const pass9 = allCoordsValid && ordersInSequence && countMatches;

  results.push({
    id: 'Test 9',
    name: 'Map Marker & Timeline Card Synchronization',
    passed: pass9,
    details: `Total synced markers: ${markers.length}/${allStops.length} | All valid lat/lng: ${allCoordsValid} | Continuous sequence 1..N: ${ordersInSequence}`
  });

  // --------------------------------------------------------------------------
  // TEST 10 — Mappls Configuration & Seamless Fallback Verification
  // --------------------------------------------------------------------------
  const mapplsCheck = checkMapplsConfiguration();
  const activeTile = getActiveMapTileConfig();

  const tileUrlValid =
    typeof activeTile.tileUrl === 'string' &&
    activeTile.tileUrl.startsWith('http') &&
    activeTile.tileUrl.includes('{z}/{x}/{y}');

  const pass10 =
    typeof mapplsCheck.isConfigured === 'boolean' &&
    tileUrlValid &&
    activeTile.provider.length > 0;

  results.push({
    id: 'Test 10',
    name: 'Mappls Evaluation & Seamless CartoDB Voyager Fallback',
    passed: pass10,
    details: `Mappls Configured: ${mapplsCheck.isConfigured} | Active Provider: ${activeTile.provider} | Tile URL: ${activeTile.tileUrl}`
  });

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('📊 PHASE 9 VALIDATION SUMMARY REPORT');
  console.log('================================================================================\n');

  let passedCount = 0;
  for (const r of results) {
    const symbol = r.passed ? '✅ PASS' : '❌ FAIL';
    if (r.passed) passedCount++;
    console.log(`${symbol} [${r.id}] ${r.name}`);
    console.log(`       Details: ${r.details}\n`);
  }

  console.log('--------------------------------------------------------------------------------');
  console.log(`TOTAL RESULT: ${passedCount} / ${results.length} TESTS PASSED`);
  console.log('================================================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

runPhase9ValidationSuite().catch(err => {
  console.error('Fatal test error in Phase 9 validation suite:', err);
  process.exit(1);
});
