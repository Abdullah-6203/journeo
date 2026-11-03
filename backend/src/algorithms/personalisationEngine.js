// -----------------------------------------------------------------------------
// JOURNEO PERSONALISATION & PLACE RANKING ENGINE (BACKEND ES MODULE)
// Implements deterministic multi-factor formula:
// Score(p, u) = ((w_i * I + w_b * B + w_d * D + w_c * C) / sum(w)) * 100
// -----------------------------------------------------------------------------

const INTEREST_ALIAS_MAP = {
  heritage: 'heritage',
  history: 'heritage',
  historical: 'heritage',
  monument: 'heritage',
  monuments: 'heritage',
  fort: 'heritage',
  palace: 'heritage',
  ruins: 'heritage',
  unesco: 'heritage',
  architecture: 'architecture',
  architectural: 'architecture',
  photography: 'photography',
  photo: 'photography',
  scenic: 'photography',
  art: 'art',
  museum: 'museums',
  museums: 'museums',
  food: 'food',
  dining: 'food',
  culinary: 'food',
  cafe: 'cafes',
  cafes: 'cafes',
  coffee: 'cafes',
  nature: 'nature',
  outdoor: 'nature',
  park: 'nature',
  garden: 'nature',
  shopping: 'shopping',
  market: 'shopping',
  bazaar: 'shopping',
  spiritual: 'spiritual',
  temple: 'spiritual',
  culture: 'local_culture',
  local_culture: 'local_culture'
};

export function normalizeTag(tag) {
  const clean = String(tag || '').toLowerCase().trim().replace(/[-\s]+/g, '_');
  return INTEREST_ALIAS_MAP[clean] || clean;
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function calculateInterestMatch(place, profile) {
  const userInterests = profile.selectedInterests || profile.interests || [];
  if (userInterests.length === 0) {
    return { score: 0.5, matchedInterests: [], isMissing: false };
  }

  const normalizedUserInterests = userInterests.map(i => ({
    raw: i,
    canonical: normalizeTag(i),
    weight: profile.interestWeights?.[i] ?? 1.0
  }));

  let interestTagsArr = [];
  try {
    interestTagsArr = typeof place.interestTags === 'string'
      ? JSON.parse(place.interestTags)
      : (place.interestTags || []);
  } catch {
    interestTagsArr = [];
  }

  let highlightsArr = [];
  try {
    highlightsArr = typeof place.highlights === 'string'
      ? JSON.parse(place.highlights)
      : (place.highlights || []);
  } catch {
    highlightsArr = [];
  }

  const placeTags = new Set([
    normalizeTag(place.category),
    ...(place.subcategory ? [normalizeTag(place.subcategory)] : []),
    ...interestTagsArr.map(t => normalizeTag(t))
  ]);

  const placeText = `${place.name} ${place.description || ''} ${highlightsArr.join(' ')}`.toLowerCase();

  let totalWeight = 0;
  let earnedScore = 0;
  const matchedInterests = [];

  for (const item of normalizedUserInterests) {
    totalWeight += item.weight;
    let matchQuality = 0;

    if (placeTags.has(item.canonical)) {
      matchQuality = 1.0;
    } else if (placeText.includes(item.canonical) || placeText.includes(item.raw.toLowerCase())) {
      matchQuality = 0.65;
    }

    if (matchQuality > 0) {
      earnedScore += matchQuality * item.weight;
      matchedInterests.push(item.raw);
    }
  }

  const score = totalWeight > 0 ? earnedScore / totalWeight : 0.5;
  return {
    score: Number(Math.max(0, Math.min(1, score)).toFixed(4)),
    matchedInterests,
    isMissing: false
  };
}

export function calculateBudgetSuitability(place, profile) {
  const entryFee = place.entryFeeINR ?? 0;
  const mealCost = place.isMealStop ? (place.averageCostPerPersonINR ?? 300) : 0;
  const estimatedCost = entryFee + mealCost;

  const totalBudget = profile.budget || 0;
  const travellers = Math.max(1, profile.travellers || 1);
  const totalDays = Math.max(1, profile.totalDays || 1);
  const expectedStopsTotal = totalDays * 3.5;

  if (totalBudget <= 0) {
    const baseline = estimatedCost === 0 ? 1.0 : Math.max(0.6, 1.0 - estimatedCost / 2000);
    return {
      score: Number(Math.max(0, Math.min(1, baseline)).toFixed(4)),
      estimatedCostINR: estimatedCost,
      isMissing: false
    };
  }

  const targetPerPersonPerStop = Math.max(150, (totalBudget / travellers) / expectedStopsTotal);
  const strictness = profile.budgetStrictness || 'moderate';

  if (estimatedCost === 0) {
    return { score: 1.0, estimatedCostINR: 0, isMissing: false };
  }

  const ratio = estimatedCost / targetPerPersonPerStop;
  let score = 1.0;
  if (ratio <= 1.0) {
    score = 1.0 - ratio * 0.15;
  } else if (strictness === 'flexible') {
    score = Math.exp(-0.5 * (ratio - 1.0));
  } else if (strictness === 'moderate') {
    score = Math.exp(-1.0 * (ratio - 1.0));
  } else {
    score = Math.exp(-2.5 * (ratio - 1.0));
  }

  return {
    score: Number(Math.max(0.01, Math.min(1.0, score)).toFixed(4)),
    estimatedCostINR: estimatedCost,
    isMissing: false
  };
}

export function calculateDistanceSuitability(place, origin, travelStyle = 'balanced') {
  const distKm = calculateDistanceKm(origin.lat, origin.lng, place.latitude, place.longitude);

  let tau = 12.0;
  if (travelStyle === 'relaxed') {
    tau = 6.0;
  } else if (travelStyle === 'packed') {
    tau = 24.0;
  }

  const decay = Math.exp(-distKm / tau);
  return {
    score: Number(Math.max(0.01, Math.min(1.0, decay)).toFixed(4)),
    distanceKm: distKm
  };
}

export function calculateExperienceMatch(place, profile) {
  const preferred = (profile.preferredExperience || profile.idealExperience || '').toLowerCase().trim();
  const travelStyle = profile.travelStyle || 'balanced';

  if (!preferred) {
    const paceScore = travelStyle === 'relaxed'
      ? (place.averageVisitDuration >= 60 ? 0.9 : 0.7)
      : (travelStyle === 'packed' ? 0.85 : 0.8);
    return { score: paceScore, matchedAttributes: ['pace_matched'], isMissing: false };
  }

  const categoryLower = (place.category || '').toLowerCase();
  const subcatLower = (place.subcategory || '').toLowerCase();
  const text = `${place.name} ${place.description || ''}`.toLowerCase();

  let score = 0.5;
  const matches = [];

  switch (preferred) {
    case 'cultural_exploration':
      if (categoryLower === 'heritage' || categoryLower === 'culture') {
        score = 0.95;
        matches.push('cultural_heritage');
      } else if (categoryLower === 'spiritual') {
        score = 0.85;
        matches.push('spiritual_culture');
      } else {
        score = 0.4;
      }
      break;

    case 'photography_focused':
      if (text.includes('photography') || text.includes('view') || text.includes('panorama') || categoryLower === 'heritage') {
        score = 0.95;
        matches.push('photography_scenic');
      } else {
        score = 0.45;
      }
      break;

    case 'food_focused':
      if (place.isMealStop || categoryLower === 'food' || subcatLower.includes('bazaar')) {
        score = 1.0;
        matches.push('culinary_focus');
      } else {
        score = 0.35;
      }
      break;

    case 'nature_focused':
      if (categoryLower === 'nature' || text.includes('garden') || text.includes('park')) {
        score = 0.98;
        matches.push('nature_serenity');
      } else {
        score = 0.3;
      }
      break;

    case 'relaxed':
      if (place.averageVisitDuration >= 75) {
        score = 0.92;
        matches.push('unhurried_pace');
      } else {
        score = 0.65;
      }
      break;

    default:
      score = 0.7;
      matches.push('general_travel');
      break;
  }

  return {
    score: Number(Math.max(0, Math.min(1, score)).toFixed(4)),
    matchedAttributes: matches,
    isMissing: false
  };
}

export function calculateDynamicWeights(profile, missingAttributes = []) {
  let wi = 0.40;
  let wb = 0.20;
  let wd = 0.20;
  let wc = 0.20;

  if (profile.preferredExperience === 'photography_focused') {
    wi = 0.45; wb = 0.10; wd = 0.15; wc = 0.30;
  } else if (profile.preferredExperience === 'food_focused') {
    wi = 0.45; wb = 0.20; wd = 0.15; wc = 0.20;
  } else if (profile.budgetStrictness === 'strict' || (profile.budget && profile.budget <= 10000)) {
    wi = 0.30; wb = 0.40; wd = 0.15; wc = 0.15;
  } else if (profile.travelStyle === 'relaxed') {
    wi = 0.35; wb = 0.15; wd = 0.30; wc = 0.20;
  }

  if (profile.customWeights) {
    if (typeof profile.customWeights.interest === 'number') wi = Math.max(0, profile.customWeights.interest);
    if (typeof profile.customWeights.budget === 'number') wb = Math.max(0, profile.customWeights.budget);
    if (typeof profile.customWeights.distance === 'number') wd = Math.max(0, profile.customWeights.distance);
    if (typeof profile.customWeights.experience === 'number') wc = Math.max(0, profile.customWeights.experience);
  }

  if (missingAttributes.includes('interests')) wi = 0;
  if (missingAttributes.includes('budget')) wb = 0;
  if (missingAttributes.includes('distance')) wd = 0;
  if (missingAttributes.includes('experience')) wc = 0;

  const sum = wi + wb + wd + wc;
  if (sum <= 0) {
    return { interest: 0.25, budget: 0.25, distance: 0.25, experience: 0.25 };
  }

  return {
    interest: Number((wi / sum).toFixed(4)),
    budget: Number((wb / sum).toFixed(4)),
    distance: Number((wd / sum).toFixed(4)),
    experience: Number((wc / sum).toFixed(4))
  };
}

export function evaluateHardConstraints(place, profile, visitedOrScheduledIds = new Set()) {
  const normCity = (profile.destinationCity || profile.city || '').toLowerCase().trim();
  const placeCity = (place.city || '').toLowerCase().trim();
  const placeDestKey = (place.destinationKey || '').toLowerCase().trim();

  // 1. Destination isolation
  if (normCity && placeCity && placeDestKey && placeCity !== normCity && placeDestKey !== normCity) {
    return {
      isEligible: false,
      exclusionReason: `Cross-city mismatch: "${place.name}" belongs to ${place.city}, not ${normCity}.`
    };
  }

  // 2. Already visited/scheduled
  if (visitedOrScheduledIds.has(place.id)) {
    return {
      isEligible: false,
      exclusionReason: `Duplicate stop: "${place.name}" already in trip.`
    };
  }

  // 3. Excluded place IDs
  if (profile.excludedPlaceIds && profile.excludedPlaceIds.includes(place.id)) {
    return {
      isEligible: false,
      exclusionReason: `Explicitly excluded by user preference.`
    };
  }

  // 4. Excluded categories
  if (profile.excludedCategories && profile.excludedCategories.length > 0) {
    const placeCat = (place.category || '').toLowerCase();
    const isExcluded = profile.excludedCategories.some(c => c.toLowerCase() === placeCat);
    if (isExcluded) {
      return {
        isEligible: false,
        exclusionReason: `Category "${place.category}" excluded by user.`
      };
    }
  }

  // 5. Strict budget ceiling
  if (profile.budgetStrictness === 'strict' && profile.budget && profile.budget > 0) {
    const totalBudget = profile.budget;
    const travellers = Math.max(1, profile.travellers || 1);
    const maxPermittedPerStop = (totalBudget / travellers) * 0.45;
    const estimatedCost = (place.entryFeeINR || 0) + (place.isMealStop ? (place.averageCostPerPersonINR || 0) : 0);

    if (estimatedCost > maxPermittedPerStop) {
      return {
        isEligible: false,
        exclusionReason: `Cost ₹${estimatedCost} exceeds strict budget allowance ₹${Math.round(maxPermittedPerStop)}.`
      };
    }
  }

  return { isEligible: true };
}

export function scoreCandidatePlace(place, profile, origin = profile.startingLocation || { lat: place.latitude, lng: place.longitude }) {
  const missingAttrs = [];

  const interestRes = calculateInterestMatch(place, profile);
  if (interestRes.isMissing) missingAttrs.push('interests');

  const budgetRes = calculateBudgetSuitability(place, profile);
  if (budgetRes.isMissing) missingAttrs.push('budget');

  const distanceRes = calculateDistanceSuitability(place, origin, profile.travelStyle);

  const expRes = calculateExperienceMatch(place, profile);
  if (expRes.isMissing) missingAttrs.push('experience');

  const weights = calculateDynamicWeights(profile, missingAttrs);

  const rawWeighted =
    weights.interest * interestRes.score +
    weights.budget * budgetRes.score +
    weights.distance * distanceRes.score +
    weights.experience * expRes.score;

  const finalScore = Number(Math.max(0, Math.min(100, rawWeighted * 100)).toFixed(1));

  let reason = '';
  if (interestRes.matchedInterests.length > 0) {
    reason = `Matches your interest in ${interestRes.matchedInterests.slice(0, 2).join(' & ')}.`;
  } else if (expRes.matchedAttributes.length > 0) {
    reason = `Selected for its ${expRes.matchedAttributes[0].replace(/_/g, ' ')} experience.`;
  } else if (distanceRes.score > 0.8) {
    reason = `Conveniently located (${distanceRes.distanceKm} km from starting hub).`;
  } else {
    reason = `Grounded cultural landmark in ${place.city}.`;
  }

  if (budgetRes.estimatedCostINR === 0 && profile.budget && profile.budget > 0) {
    reason += ' Free admission fits budget.';
  }

  const metadata = {
    placeId: place.id,
    name: place.name,
    interestMatch: interestRes.score,
    budgetSuitability: budgetRes.score,
    distanceSuitability: distanceRes.score,
    experienceMatch: expRes.score,
    weights,
    finalScore,
    distanceKm: distanceRes.distanceKm,
    estimatedCostINR: budgetRes.estimatedCostINR,
    missingAttributes: missingAttrs,
    reason
  };

  return {
    place,
    score: finalScore,
    metadata
  };
}
