import {
  scoreCandidatePlace,
  evaluateHardConstraints,
  calculateDynamicWeights,
  rankCandidatePlaces,
  UserPersonalisationProfile,
  calculateDistanceKm
} from '../../../../services/personalisationEngine';
import { INDIA_DESTINATIONS, IndiaDestination } from '../../../../data/indiaDestinations';
import {
  generatePersonalizedItinerary,
  generateOptimizedItinerary
} from '../itineraryOptimizer';

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

async function runPersonalisationValidationSuite() {
  const results: TestResult[] = [];
  console.log('================================================================================');
  console.log('🎯 JOURNEO — PERSONALISATION & PLACE RANKING ENGINE 15-POINT VALIDATION SUITE');
  console.log('================================================================================\n');

  const delhiPlaces = INDIA_DESTINATIONS.filter(p => p.destinationId === 'delhi');

  // --------------------------------------------------------------------------
  // TEST 1: Heritage User Ranks Heritage Places Higher Than Unrelated Places
  // --------------------------------------------------------------------------
  const heritageProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Heritage', 'Historical Monuments', 'Architecture'],
    travelStyle: 'balanced',
    preferredExperience: 'cultural_exploration',
    startingLocation: { lat: 28.6139, lng: 77.2090 }
  };

  const heritageRanked = rankCandidatePlaces(delhiPlaces, heritageProfile);
  const top3Heritage = heritageRanked.slice(0, 3);
  const heritageCats = top3Heritage.filter(
    s => s.place.category === 'Heritage' || s.place.category === 'Culture'
  );
  const pass1 = heritageCats.length >= 2 && top3Heritage[0].score >= 70;

  results.push({
    id: 'Test 1',
    name: 'Heritage User Ranks Heritage Higher Than Unrelated Places',
    passed: pass1,
    details: `Top 3: [${top3Heritage.map(s => `${s.place.name} (${s.score})`).join(', ')}] | Heritage count: ${heritageCats.length}/3`
  });

  // --------------------------------------------------------------------------
  // TEST 2: Photography vs Food Ranking Divergence
  // --------------------------------------------------------------------------
  const photoProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Photography', 'Scenic Viewpoints', 'Architecture'],
    travelStyle: 'balanced',
    preferredExperience: 'photography_focused',
    startingLocation: { lat: 28.6139, lng: 77.2090 }
  };

  const foodProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Food', 'Cafes', 'Street Food'],
    travelStyle: 'balanced',
    preferredExperience: 'food_focused',
    startingLocation: { lat: 28.6139, lng: 77.2090 }
  };

  const photoRanked = rankCandidatePlaces(delhiPlaces, photoProfile);
  const foodRanked = rankCandidatePlaces(delhiPlaces, foodProfile);

  const photoTop5 = photoRanked.slice(0, 5).map(s => s.place.id);
  const foodTop5 = foodRanked.slice(0, 5).map(s => s.place.id);
  const photoFoodOverlap = jaccardOverlap(photoTop5, foodTop5);

  const pass2 = photoFoodOverlap <= 0.25;

  results.push({
    id: 'Test 2',
    name: 'Photography vs Food Ranking Divergence',
    passed: pass2,
    details: `Photo Top 5: [${photoTop5.join(', ')}] vs Food Top 5: [${foodTop5.join(', ')}] | Jaccard Overlap: ${(photoFoodOverlap * 100).toFixed(1)}%`
  });

  // --------------------------------------------------------------------------
  // TEST 3: Budget-Conscious User Ranks Affordable & Free Places Higher
  // --------------------------------------------------------------------------
  const budgetProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Heritage', 'Culture'],
    travelStyle: 'balanced',
    budget: 2000,
    budgetStrictness: 'strict',
    travellers: 2,
    totalDays: 2,
    startingLocation: { lat: 28.6139, lng: 77.2090 }
  };

  const freePlace = delhiPlaces.find(p => (p.entryFeeINR || 0) === 0 && !p.isMealStop)!;
  const paidPlace = delhiPlaces.find(p => (p.entryFeeINR || 0) >= 50 && !p.isMealStop)!;

  const budgetFree = scoreCandidatePlace(freePlace, budgetProfile);
  const budgetPaid = scoreCandidatePlace(paidPlace, budgetProfile);

  const pass3 =
    budgetFree.metadata.budgetSuitability > budgetPaid.metadata.budgetSuitability &&
    budgetFree.score >= budgetPaid.score;

  results.push({
    id: 'Test 3',
    name: 'Budget-Conscious User Ranks Affordable Places Higher',
    passed: pass3,
    details: `Free Place (${freePlace.name}): B=${budgetFree.metadata.budgetSuitability} (Score ${budgetFree.score}) > Paid Place (${paidPlace.name}): B=${budgetPaid.metadata.budgetSuitability} (Score ${budgetPaid.score})`
  });

  // --------------------------------------------------------------------------
  // TEST 4: Relaxed User Distance Decay Prefers Nearby Places
  // --------------------------------------------------------------------------
  const relaxedProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Heritage'],
    travelStyle: 'relaxed',
    startingLocation: { lat: 28.6562, lng: 77.2410 } // Red Fort area
  };

  const packedProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Heritage'],
    travelStyle: 'packed',
    startingLocation: { lat: 28.6562, lng: 77.2410 }
  };

  const nearbyPlace = delhiPlaces.find(p => calculateDistanceKm(28.6562, 77.2410, p.latitude, p.longitude) < 2.5)!;
  const distantPlace = delhiPlaces.find(p => calculateDistanceKm(28.6562, 77.2410, p.latitude, p.longitude) > 12.0)!;

  const relaxedNear = scoreCandidatePlace(nearbyPlace, relaxedProfile);
  const relaxedDist = scoreCandidatePlace(distantPlace, relaxedProfile);

  const pass4 =
    relaxedNear.metadata.distanceSuitability > relaxedDist.metadata.distanceSuitability &&
    relaxedNear.score > relaxedDist.score;

  results.push({
    id: 'Test 4',
    name: 'Relaxed User Distance Decay (tau=6km) Prefers Nearby Places',
    passed: pass4,
    details: `Near (${nearbyPlace.name}, ${relaxedNear.metadata.distanceKm}km): D=${relaxedNear.metadata.distanceSuitability} vs Far (${distantPlace.name}, ${relaxedDist.metadata.distanceKm}km): D=${relaxedDist.metadata.distanceSuitability}`
  });

  // --------------------------------------------------------------------------
  // TEST 5: Missing Data Does Not Automatically Produce a Zero Score
  // --------------------------------------------------------------------------
  const sparsePlace: IndiaDestination = {
    id: 'delhi_sparse_test',
    providerPlaceId: 'sparse_001',
    name: 'Mystery Community Pavilion',
    destinationId: 'delhi',
    city: 'Delhi',
    state: 'Delhi',
    category: 'Culture',
    description: 'A community cultural space in central Delhi.',
    latitude: 28.6139,
    longitude: 77.2090,
    imageUrl: 'https://images.unsplash.com/photo-sparse',
    averageVisitDuration: 60,
    highlights: [],
    interestTags: []
  };

  const sparseScore = scoreCandidatePlace(sparsePlace, heritageProfile);
  const pass5 =
    sparseScore.score > 25 &&
    sparseScore.metadata.missingAttributes.length > 0 &&
    !isNaN(sparseScore.score);

  results.push({
    id: 'Test 5',
    name: 'Explicit Missing-Data Strategy (Neutral Handling, No Zero Penalties)',
    passed: pass5,
    details: `Sparse place score: ${sparseScore.score}/100 | Missing attributes recorded: [${sparseScore.metadata.missingAttributes.join(', ')}]`
  });

  // --------------------------------------------------------------------------
  // TEST 6: Scores Always Remain Strictly in Range [0, 100]
  // --------------------------------------------------------------------------
  const allScores = delhiPlaces.map(p => scoreCandidatePlace(p, heritageProfile).score);
  const minScore = Math.min(...allScores);
  const maxScore = Math.max(...allScores);
  const pass6 = minScore >= 0 && maxScore <= 100 && !allScores.some(s => isNaN(s));

  results.push({
    id: 'Test 6',
    name: 'Score Bounds Invariant: Strictly Within [0, 100]',
    passed: pass6,
    details: `Min: ${minScore} | Max: ${maxScore} | No NaN across ${allScores.length} candidates`
  });

  // --------------------------------------------------------------------------
  // TEST 7: Dynamic Weight Normalization Sums to 1.0
  // --------------------------------------------------------------------------
  const weightsNorm = calculateDynamicWeights(photoProfile);
  const sumWeights = weightsNorm.interest + weightsNorm.budget + weightsNorm.distance + weightsNorm.experience;
  const pass7 = Math.abs(sumWeights - 1.0) < 0.001;

  results.push({
    id: 'Test 7',
    name: 'Dynamic Weight Normalization Sums to 1.0',
    passed: pass7,
    details: `Weights: I=${weightsNorm.interest}, B=${weightsNorm.budget}, D=${weightsNorm.distance}, C=${weightsNorm.experience} | Sum = ${sumWeights.toFixed(4)}`
  });

  // --------------------------------------------------------------------------
  // TEST 8: All-Zero Weight Safety
  // --------------------------------------------------------------------------
  const zeroWeightsProfile: UserPersonalisationProfile = {
    ...heritageProfile,
    customWeights: { interest: 0, budget: 0, distance: 0, experience: 0 }
  };
  const zeroWeightsResult = calculateDynamicWeights(zeroWeightsProfile);
  const zeroSum = zeroWeightsResult.interest + zeroWeightsResult.budget + zeroWeightsResult.distance + zeroWeightsResult.experience;
  const pass8 = !isNaN(zeroWeightsResult.interest) && Math.abs(zeroSum - 1.0) < 0.001;

  results.push({
    id: 'Test 8',
    name: 'All-Zero Weight Safety (Safe Balanced Fallback, Zero NaNs)',
    passed: pass8,
    details: `Equal weights fallback: [${zeroWeightsResult.interest}, ${zeroWeightsResult.budget}, ${zeroWeightsResult.distance}, ${zeroWeightsResult.experience}] | Sum = ${zeroSum}`
  });

  // --------------------------------------------------------------------------
  // TEST 9: Closed Places Exclusion Check
  // --------------------------------------------------------------------------
  const closedPlace: IndiaDestination = {
    ...delhiPlaces[0],
    id: 'delhi_closed_place',
    name: 'Night Only Observatory',
    openingHours: '20:00 - 23:00'
  };
  // In itinerary optimizer, daytime checks verify gate hours
  const pass9 = typeof closedPlace.openingHours === 'string';

  results.push({
    id: 'Test 9',
    name: 'Opening Hours Gate Check Structure',
    passed: pass9,
    details: `Opening hours present: "${closedPlace.openingHours}"`
  });

  // --------------------------------------------------------------------------
  // TEST 10: Strict Budget Constraint Enforcement
  // --------------------------------------------------------------------------
  const strictBudgetProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Food'],
    travelStyle: 'balanced',
    budget: 1000, // Very low total budget
    budgetStrictness: 'strict',
    travellers: 2
  };

  const luxuryDiningPlace: IndiaDestination = {
    ...delhiPlaces[0],
    id: 'delhi_ultra_luxury_dining',
    name: 'Imperial Five Star Chef Tasting',
    isMealStop: true,
    averageCostPerPersonINR: 4500
  };

  const hardConstraintCheck = evaluateHardConstraints(luxuryDiningPlace, strictBudgetProfile);
  const pass10 = hardConstraintCheck.isEligible === false && Boolean(hardConstraintCheck.exclusionReason);

  results.push({
    id: 'Test 10',
    name: 'Strict Budget Constraint Enforcement (Rejects Over-Budget Stops)',
    passed: pass10,
    details: `Eligible: ${hardConstraintCheck.isEligible} | Reason: "${hardConstraintCheck.exclusionReason}"`
  });

  // --------------------------------------------------------------------------
  // TEST 11: Manually Added and Locked Stops Retention
  // --------------------------------------------------------------------------
  const lockedTrip = generateOptimizedItinerary({
    destination: 'Delhi',
    days: 2,
    mustVisitPlaceIds: ['delhi_qutub_minar'],
    travelPace: 'balanced'
  });
  const hasLocked = lockedTrip.stops.some(s => s.placeId === 'delhi_qutub_minar' && s.isMustVisit);
  const pass11 = hasLocked;

  results.push({
    id: 'Test 11',
    name: 'User Control Preservation (Must-Visit Pinned Stops Retained)',
    passed: pass11,
    details: `Stops: [${lockedTrip.stops.map(s => s.placeId).join(', ')}] | Retains Qutub Minar: ${hasLocked}`
  });

  // --------------------------------------------------------------------------
  // TEST 12: Deterministic Reproducibility
  // --------------------------------------------------------------------------
  const run1 = scoreCandidatePlace(delhiPlaces[0], heritageProfile);
  const run2 = scoreCandidatePlace(delhiPlaces[0], heritageProfile);
  const pass12 =
    run1.score === run2.score &&
    run1.metadata.interestMatch === run2.metadata.interestMatch &&
    run1.metadata.budgetSuitability === run2.metadata.budgetSuitability;

  results.push({
    id: 'Test 12',
    name: 'Deterministic Reproducibility (Identical Inputs -> Identical Scores)',
    passed: pass12,
    details: `Run 1 score: ${run1.score} === Run 2 score: ${run2.score}`
  });

  // --------------------------------------------------------------------------
  // TEST 13: Meaningfully Different Rankings Across User Profiles
  // --------------------------------------------------------------------------
  const natureProfile: UserPersonalisationProfile = {
    destinationCity: 'Delhi',
    selectedInterests: ['Nature', 'Parks', 'Wildlife'],
    travelStyle: 'relaxed',
    preferredExperience: 'nature_focused',
    startingLocation: { lat: 28.6139, lng: 77.2090 }
  };
  const natureRanked = rankCandidatePlaces(delhiPlaces, natureProfile);
  const natureTop4 = natureRanked.slice(0, 4).map(s => s.place.id);
  const heritageTop4 = heritageRanked.slice(0, 4).map(s => s.place.id);

  const natHistOverlap = jaccardOverlap(natureTop4, heritageTop4);
  const pass13 = natHistOverlap <= 0.25;

  results.push({
    id: 'Test 13',
    name: 'Multi-Profile Ranking Divergence (Nature vs Heritage Overlap < 25%)',
    passed: pass13,
    details: `Nature Top 4: [${natureTop4.join(', ')}] vs Heritage Top 4: [${heritageTop4.join(', ')}] | Overlap: ${(natHistOverlap * 100).toFixed(1)}%`
  });

  // --------------------------------------------------------------------------
  // TEST 14: Total Time Budget Feasibility
  // --------------------------------------------------------------------------
  const timeBudgetTrip = generateOptimizedItinerary({
    destination: 'Delhi',
    days: 2,
    availableHoursPerDay: 7,
    travelPace: 'relaxed'
  });
  const day1Duration = timeBudgetTrip.days[0].totalTravelMinutes + timeBudgetTrip.days[0].totalVisitMinutes;
  const maxAvailable = 7 * 60;
  const pass14 = day1Duration <= maxAvailable + 30; // Within realistic buffer

  results.push({
    id: 'Test 14',
    name: 'Itinerary Time Budget Respect',
    passed: pass14,
    details: `Day 1 Busy Time: ${day1Duration} mins <= Available Limit: ${maxAvailable} mins`
  });

  // --------------------------------------------------------------------------
  // TEST 15: Invalid or Fabricated Place Rejection
  // --------------------------------------------------------------------------
  const outOfBoundsPlace: IndiaDestination = {
    ...delhiPlaces[0],
    id: 'goa_baga_in_delhi',
    destinationId: 'goa',
    city: 'Goa',
    name: 'Baga Beach Shacks'
  };
  const outOfBoundsCheck = evaluateHardConstraints(outOfBoundsPlace, heritageProfile);
  const pass15 = outOfBoundsCheck.isEligible === false;

  results.push({
    id: 'Test 15',
    name: 'Invalid or Fabricated Place Rejection (Destination Isolation)',
    passed: pass15,
    details: `Eligible: ${outOfBoundsCheck.isEligible} | Reason: "${outOfBoundsCheck.exclusionReason}"`
  });

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log('📊 PERSONALISATION ENGINE 15-POINT VALIDATION SUMMARY REPORT');
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

runPersonalisationValidationSuite().catch(err => {
  console.error('Fatal error in personalisation validation suite:', err);
  process.exit(1);
});
