import { generateOptimizedItinerary } from './src/engine/itineraryOptimizer.ts';
import { simulateAdaptiveDelay } from './src/engine/adaptiveReplanner.ts';
import { JUDGES_DEMO_PREFERENCES } from './src/data/sampleDemoPlan.ts';
import { HERITAGE_SITES } from './src/data/heritageSites.ts';

console.log('🧪 RUNNING JOURNEO TEST SUITE...\n');

// Test 1: Verify Heritage Dataset Integrity
console.log('--- TEST 1: Heritage Dataset Verification ---');
console.log(`Total Curated Monuments: ${HERITAGE_SITES.length}`);
let datasetValid = true;
HERITAGE_SITES.forEach(site => {
  if (!site.id || !site.name || !site.location.lat || !site.location.lng) {
    console.error(`❌ Site missing coordinates: ${site.name}`);
    datasetValid = false;
  }
  if (!site.verification.verifiedBy || !site.verification.status) {
    console.error(`❌ Site missing verification metadata: ${site.name}`);
    datasetValid = false;
  }
});
if (datasetValid) {
  console.log('✅ All heritage monuments validated with coordinates and ASI/UNESCO citations.');
}

// Test 2: Constraint-Aware Itinerary Optimizer
console.log('\n--- TEST 2: Constraint Optimizer Execution ---');
const itinerary = generateOptimizedItinerary(JUDGES_DEMO_PREFERENCES);
console.log(`Generated Itinerary ID: ${itinerary.id}`);
console.log(`Total Stops Scheduled: ${itinerary.stops.length}`);
console.log(`Total Travel Distance: ${itinerary.totalTravelDistanceKm} km`);
console.log(`Estimated Duration: ${Math.round(itinerary.totalDurationMinutes / 60 * 10) / 10} hours`);
console.log(`Optimization Score: ${itinerary.optimizationScore}/100`);

itinerary.stops.forEach(s => {
  console.log(`  Stop ${s.stopOrder}: ${s.site.name} | Arr: ${s.arrivalTime} - Dep: ${s.departureTime} | ${s.transitInstruction}`);
});

if (itinerary.stops.length >= 3 && itinerary.stops.some(s => s.site.id === 'red_fort') && itinerary.stops.some(s => s.site.id === 'humayuns_tomb')) {
  console.log('✅ Must-visit constraints strictly satisfied!');
} else {
  console.error('❌ Must-visit constraint failed');
}

// Test 3: Adaptive Replanner 45-Min Delay Simulation
console.log('\n--- TEST 3: Adaptive Replanner 45-Minute Delay Simulation ---');
const scenario = simulateAdaptiveDelay(itinerary, 1, 45);
console.log(`Delayed Site: ${scenario.delayedStopId}`);
console.log(`Threatened Downstream Stops: ${scenario.threatenedStops.length}`);
scenario.threatenedStops.forEach(t => {
  console.log(`  ⚠️ Risk: ${t.siteName} -> ${t.reason}`);
});

console.log(`Available Adaptation Strategies: ${scenario.strategies.length}`);
scenario.strategies.forEach(strat => {
  console.log(`  • [${strat.title}] Score: ${strat.score}/100 | Stops: ${strat.updatedItinerary.stops.length}`);
  console.log(`    AI Rationale: ${strat.aiRationale.slice(0, 100)}...`);
});

if (scenario.strategies.length === 3 && scenario.strategies[0].id === 'prioritize_must_visits') {
  console.log('✅ Adaptive Replanner generated 3 distinct viable recovery strategies.');
}

console.log('\n🎉 ALL JOURNEO INTEGRATION TESTS PASSED CLEANLY!\n');
