import { IndiaDestination } from '../data/indiaDestinations';

export type BudgetStrictness = 'flexible' | 'moderate' | 'strict';

export type PreferredExperience =
  | 'cultural_exploration'
  | 'photography_focused'
  | 'food_focused'
  | 'nature_focused'
  | 'relaxed'
  | 'packed'
  | 'family_friendly'
  | 'luxury'
  | 'budget_travel'
  | 'local_experiences';

export interface UserPersonalisationProfile {
  userId?: string;
  destinationCity: string;
  selectedInterests: string[];
  interestWeights?: Record<string, number>; // optional 0..1 weight per interest
  travelStyle: 'relaxed' | 'balanced' | 'packed';
  preferredExperience?: PreferredExperience | string;
  budget?: number; // total trip budget in INR
  budgetPerPerson?: number;
  travellers?: number;
  totalDays?: number;
  budgetStrictness?: BudgetStrictness;
  startingLocation?: { lat: number; lng: number; address?: string };
  excludedPlaceIds?: string[];
  excludedCategories?: string[];
  mustVisitPlaceIds?: string[];
  customWeights?: {
    interest?: number;
    budget?: number;
    distance?: number;
    experience?: number;
  };
  accessibilityRequirements?: string[];
}

export interface PersonalisationDebugMetadata {
  placeId: string;
  name: string;
  interestMatch: number;      // 0..1
  budgetSuitability: number;  // 0..1
  distanceSuitability: number;// 0..1
  experienceMatch: number;    // 0..1
  weights: {
    interest: number;
    budget: number;
    distance: number;
    experience: number;
  };
  finalScore: number;         // 0..100
  distanceKm: number;
  estimatedCostINR: number;
  missingAttributes: string[];
  reason: string;
}

export interface HardConstraintCheckResult {
  isEligible: boolean;
  exclusionReason?: string;
}

export interface ScoredPlaceCandidate {
  place: IndiaDestination;
  score: number;
  metadata: PersonalisationDebugMetadata;
}

// -----------------------------------------------------------------------------
// 1. TAXONOMY & ALIAS NORMALIZATION
// -----------------------------------------------------------------------------

const INTEREST_ALIAS_MAP: Record<string, string> = {
  // Heritage & Architecture
  heritage: 'heritage',
  history: 'heritage',
  historical: 'heritage',
  monument: 'heritage',
  monuments: 'heritage',
  fort: 'heritage',
  palace: 'heritage',
  ruins: 'heritage',
  ancient: 'heritage',
  unesco: 'heritage',
  architecture: 'architecture',
  architectural: 'architecture',
  design: 'architecture',
  structures: 'architecture',

  // Photography & Art
  photography: 'photography',
  photo: 'photography',
  photos: 'photography',
  scenic: 'photography',
  viewpoint: 'photography',
  aesthetic: 'photography',
  art: 'art',
  gallery: 'art',
  museum: 'museums',
  museums: 'museums',

  // Food & Cafe
  food: 'food',
  dining: 'food',
  culinary: 'food',
  cuisine: 'food',
  gastronomy: 'food',
  street_food: 'food',
  cafe: 'cafes',
  cafes: 'cafes',
  coffee: 'cafes',
  tea: 'cafes',
  bistro: 'cafes',

  // Nature & Outdoors
  nature: 'nature',
  outdoor: 'nature',
  outdoors: 'nature',
  park: 'nature',
  parks: 'nature',
  garden: 'nature',
  gardens: 'nature',
  forest: 'nature',
  lake: 'nature',
  waterfall: 'nature',
  beach: 'nature',
  wildlife: 'nature',

  // Shopping & Bazaars
  shopping: 'shopping',
  market: 'shopping',
  markets: 'shopping',
  bazaar: 'shopping',
  bazaars: 'shopping',
  craft: 'shopping',
  crafts: 'shopping',
  souvenirs: 'shopping',

  // Spiritual & Wellness
  spiritual: 'spiritual',
  temple: 'spiritual',
  temples: 'spiritual',
  ashram: 'spiritual',
  ghat: 'spiritual',
  meditation: 'spiritual',
  yoga: 'spiritual',

  // Local Culture & Adventure
  local_culture: 'local_culture',
  culture: 'local_culture',
  cultural: 'local_culture',
  tradition: 'local_culture',
  adventure: 'adventure',
  trekking: 'adventure',
  hiking: 'adventure',
  safari: 'adventure'
};

/**
 * Normalizes an interest tag or category into canonical taxonomy keywords.
 */
export function normalizeTag(tag: string): string {
  const clean = String(tag || '').toLowerCase().trim().replace(/[-\s]+/g, '_');
  return INTEREST_ALIAS_MAP[clean] || clean;
}

/**
 * Normalizes an array of tags.
 */
export function normalizeInterestTags(tags: string[] = []): string[] {
  const set = new Set<string>();
  tags.forEach(t => {
    const norm = normalizeTag(t);
    if (norm) set.add(norm);
  });
  return Array.from(set);
}

// -----------------------------------------------------------------------------
// 2. HAVERSINE DISTANCE HELPER
// -----------------------------------------------------------------------------

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth radius in km
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

// -----------------------------------------------------------------------------
// 3. COMPONENT 1: INTEREST MATCH I(p, u)
// -----------------------------------------------------------------------------

/**
 * Calculates interest match I(p, u) in [0, 1].
 * Uses normalized category & tag overlap, weighted by user interest priorities.
 */
export function calculateInterestMatch(
  place: IndiaDestination,
  profile: UserPersonalisationProfile
): { score: number; matchedInterests: string[]; isMissing: boolean } {
  const userInterests = profile.selectedInterests || [];
  if (userInterests.length === 0) {
    // Neutral score when user has no explicit interest selections
    return { score: 0.5, matchedInterests: [], isMissing: false };
  }

  const normalizedUserInterests = userInterests.map(i => ({
    raw: i,
    canonical: normalizeTag(i),
    weight: Math.max(0.1, Math.min(1.0, profile.interestWeights?.[i] ?? 1.0))
  }));

  const hasStructuredTags =
    (place.interestTags && place.interestTags.length > 0) ||
    Boolean(place.enrichment?.experienceTypes && place.enrichment.experienceTypes.length > 0) ||
    Boolean(place.subcategory);

  const placeTags = new Set<string>([
    normalizeTag(place.category),
    ...(place.subcategory ? [normalizeTag(place.subcategory)] : []),
    ...(place.interestTags || []).map(t => normalizeTag(t)),
    ...((place.enrichment?.experienceTypes || []).map(t => normalizeTag(t)))
  ]);

  const placeText = `${place.name} ${place.description} ${(place.highlights || []).join(' ')}`.toLowerCase();

  let totalWeight = 0;
  let earnedScore = 0;
  const matchedInterests: string[] = [];

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

  // Explicit missing-data strategy: if place has no structured tags, return neutral score 0.5 and mark missing
  const isMissing = !hasStructuredTags && matchedInterests.length === 0;
  const rawScore = totalWeight > 0 ? earnedScore / totalWeight : 0.5;
  const score = isMissing ? 0.5 : rawScore;

  return {
    score: Number(Math.max(0, Math.min(1, score)).toFixed(4)),
    matchedInterests,
    isMissing
  };
}

// -----------------------------------------------------------------------------
// 4. COMPONENT 2: BUDGET SUITABILITY B(p, u)
// -----------------------------------------------------------------------------

/**
 * Calculates budget suitability B(p, u) in [0, 1].
 * Free places score 1.0. Places within target cost per stop score close to 1.
 * Places exceeding target budget decline smoothly or steeply depending on strictness.
 */
export function calculateBudgetSuitability(
  place: IndiaDestination,
  profile: UserPersonalisationProfile
): { score: number; estimatedCostINR: number; isMissing: boolean } {
  const entryFee = place.entryFeeINR ?? 0;
  const mealCost = place.isMealStop ? (place.averageCostPerPersonINR ?? 300) : 0;
  const estimatedCost = entryFee + mealCost;

  // Total budget and target budget per stop estimation
  const totalBudget = profile.budget || 0;
  const travellers = Math.max(1, profile.travellers || 1);
  const totalDays = Math.max(1, profile.totalDays || 1);
  const expectedStopsTotal = totalDays * 3.5; // ~3-4 stops/day

  // If no budget was entered or user has flexible/unlimited budget
  if (totalBudget <= 0) {
    // Neutral high suitability: affordable places score higher, but no penalty
    const baseline = estimatedCost === 0 ? 1.0 : Math.max(0.6, 1.0 - estimatedCost / 2000);
    return {
      score: Number(Math.max(0, Math.min(1, baseline)).toFixed(4)),
      estimatedCostINR: estimatedCost,
      isMissing: place.entryFeeINR === undefined && place.averageCostPerPersonINR === undefined
    };
  }

  // Target budget allocated for sightseeing/activities per person per stop
  const targetPerPersonPerStop = Math.max(150, (totalBudget / travellers) / expectedStopsTotal);
  const strictness = profile.budgetStrictness || 'moderate';

  // Free attractions are a perfect match for budget
  if (estimatedCost === 0) {
    return { score: 1.0, estimatedCostINR: 0, isMissing: false };
  }

  const ratio = estimatedCost / targetPerPersonPerStop;

  let score = 1.0;
  if (ratio <= 1.0) {
    // Within budget: score ranges from 0.85 to 1.0
    score = 1.0 - ratio * 0.15;
  } else if (strictness === 'flexible') {
    // Soft decay: e^(-0.5 * (ratio - 1))
    score = Math.exp(-0.5 * (ratio - 1.0));
  } else if (strictness === 'moderate') {
    // Moderate decay: e^(-1.0 * (ratio - 1))
    score = Math.exp(-1.0 * (ratio - 1.0));
  } else {
    // Strict decay: very steep drop-off
    score = Math.exp(-2.5 * (ratio - 1.0));
  }

  return {
    score: Number(Math.max(0.01, Math.min(1.0, score)).toFixed(4)),
    estimatedCostINR: estimatedCost,
    isMissing: false
  };
}

// -----------------------------------------------------------------------------
// 5. COMPONENT 3: DISTANCE SUITABILITY D(p, u)
// -----------------------------------------------------------------------------

/**
 * Calculates distance suitability D(p, u) in [0, 1] using distance decay:
 * D(p, u) = exp(-d / tau)
 * tau depends on travel pace (relaxed: 6km, balanced: 12km, packed: 24km).
 */
export function calculateDistanceSuitability(
  place: IndiaDestination,
  origin: { lat: number; lng: number },
  travelStyle: 'relaxed' | 'balanced' | 'packed' = 'balanced'
): { score: number; distanceKm: number } {
  const distKm = calculateDistanceKm(origin.lat, origin.lng, place.latitude, place.longitude);

  let tau = 12.0; // Balanced default: 12 km tolerance
  if (travelStyle === 'relaxed') {
    tau = 6.0; // Smaller tolerance -> strongly favors nearby places
  } else if (travelStyle === 'packed') {
    tau = 24.0; // Larger tolerance -> comfortable travelling across city
  }

  const decay = Math.exp(-distKm / tau);
  return {
    score: Number(Math.max(0.01, Math.min(1.0, decay)).toFixed(4)),
    distanceKm: distKm
  };
}

// -----------------------------------------------------------------------------
// 6. COMPONENT 4: EXPERIENCE MATCH C(p, u)
// -----------------------------------------------------------------------------

/**
 * Matches preferred experience against structured place attributes.
 */
export function calculateExperienceMatch(
  place: IndiaDestination,
  profile: UserPersonalisationProfile
): { score: number; matchedAttributes: string[]; isMissing: boolean } {
  const preferred = (profile.preferredExperience || '').toLowerCase().trim();
  const travelStyle = profile.travelStyle || 'balanced';

  if (!preferred) {
    // Default to travelStyle-based experience
    const paceScore = travelStyle === 'relaxed'
      ? (place.averageVisitDuration >= 60 ? 0.9 : 0.7)
      : (travelStyle === 'packed' ? 0.85 : 0.8);
    return { score: paceScore, matchedAttributes: ['pace_matched'], isMissing: false };
  }

  const expTypes = (place.enrichment?.experienceTypes || []).map(e => e.toLowerCase());
  const categoryLower = place.category.toLowerCase();
  const subcatLower = (place.subcategory || '').toLowerCase();
  const text = `${place.name} ${place.description} ${place.highlights.join(' ')}`.toLowerCase();

  let score = 0.5;
  const matches: string[] = [];

  switch (preferred) {
    case 'cultural_exploration':
      if (categoryLower === 'heritage' || categoryLower === 'culture' || expTypes.includes('heritage')) {
        score = 0.95;
        matches.push('cultural_heritage');
      } else if (categoryLower === 'spiritual' || expTypes.includes('temple')) {
        score = 0.85;
        matches.push('spiritual_culture');
      } else {
        score = 0.4;
      }
      break;

    case 'photography_focused':
      if (
        expTypes.includes('photography') ||
        text.includes('photography') ||
        text.includes('panorama') ||
        text.includes('sunset') ||
        text.includes('architecture') ||
        categoryLower === 'heritage'
      ) {
        score = 0.95;
        matches.push('photography_scenic');
      } else {
        score = 0.45;
      }
      break;

    case 'food_focused':
      if (place.isMealStop || categoryLower === 'food' || expTypes.includes('street_food')) {
        score = 1.0;
        matches.push('culinary_focus');
      } else if (subcatLower.includes('bazaar') || subcatLower.includes('market')) {
        score = 0.8;
        matches.push('market_food_adjacent');
      } else {
        score = 0.35;
      }
      break;

    case 'nature_focused':
      if (categoryLower === 'nature' || expTypes.includes('nature') || expTypes.includes('parks')) {
        score = 0.98;
        matches.push('nature_serenity');
      } else if (text.includes('garden') || text.includes('lake') || text.includes('beach')) {
        score = 0.85;
        matches.push('outdoor_greenery');
      } else {
        score = 0.3;
      }
      break;

    case 'relaxed':
      // Relaxed travel favors unhurried, comfortable dwell times and serene crowd levels
      if (place.averageVisitDuration >= 75 || place.enrichment?.crowdLevel === 'low_offbeat') {
        score = 0.92;
        matches.push('unhurried_pace');
      } else {
        score = 0.65;
      }
      break;

    case 'family_friendly':
      if ((place.enrichment as any)?.suitableForFamily !== false && (categoryLower === 'heritage' || categoryLower === 'nature' || categoryLower === 'culture')) {
        score = 0.9;
        matches.push('family_accessible');
      } else {
        score = 0.55;
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

// -----------------------------------------------------------------------------
// 7. DYNAMIC WEIGHT ALLOCATION & NORMALIZATION
// -----------------------------------------------------------------------------

export interface ComponentWeights {
  interest: number;
  budget: number;
  distance: number;
  experience: number;
}

/**
 * Calculates dynamic preference weights normalized to sum to 1.0.
 * Allows custom override and adjusts weights based on user profile.
 */
export function calculateDynamicWeights(
  profile: UserPersonalisationProfile,
  missingAttributes: string[] = []
): ComponentWeights {
  let wi = 0.40;
  let wb = 0.20;
  let wd = 0.20;
  let wc = 0.20;

  // Adapt base weights depending on explicit focus
  if (profile.preferredExperience === 'photography_focused') {
    wi = 0.45; wb = 0.10; wd = 0.15; wc = 0.30;
  } else if (profile.preferredExperience === 'food_focused') {
    wi = 0.45; wb = 0.20; wd = 0.15; wc = 0.20;
  } else if (profile.budgetStrictness === 'strict' || (profile.budget && profile.budget <= 10000)) {
    wi = 0.30; wb = 0.40; wd = 0.15; wc = 0.15;
  } else if (profile.travelStyle === 'relaxed') {
    wi = 0.35; wb = 0.15; wd = 0.30; wc = 0.20;
  }

  // User explicit weight overrides if provided
  if (profile.customWeights) {
    if (typeof profile.customWeights.interest === 'number') wi = Math.max(0, profile.customWeights.interest);
    if (typeof profile.customWeights.budget === 'number') wb = Math.max(0, profile.customWeights.budget);
    if (typeof profile.customWeights.distance === 'number') wd = Math.max(0, profile.customWeights.distance);
    if (typeof profile.customWeights.experience === 'number') wc = Math.max(0, profile.customWeights.experience);
  }

  // Renormalize if a component is marked missing
  if (missingAttributes.includes('interests')) wi = 0;
  if (missingAttributes.includes('budget')) wb = 0;
  if (missingAttributes.includes('distance')) wd = 0;
  if (missingAttributes.includes('experience')) wc = 0;

  const sum = wi + wb + wd + wc;
  if (sum <= 0) {
    // All-zero fallback: return equal balanced weights
    return { interest: 0.25, budget: 0.25, distance: 0.25, experience: 0.25 };
  }

  return {
    interest: Number((wi / sum).toFixed(4)),
    budget: Number((wb / sum).toFixed(4)),
    distance: Number((wd / sum).toFixed(4)),
    experience: Number((wc / sum).toFixed(4))
  };
}

// -----------------------------------------------------------------------------
// 8. HARD CONSTRAINT ELIGIBILITY CHECKS
// -----------------------------------------------------------------------------

/**
 * Applies strict eligibility checks before soft ranking.
 * Excludes closed places, cross-city contamination, strict budget limits,
 * excluded categories, and previously visited places.
 */
export function evaluateHardConstraints(
  place: IndiaDestination,
  profile: UserPersonalisationProfile,
  visitedOrScheduledIds: Set<string> = new Set()
): HardConstraintCheckResult {
  const normCity = profile.destinationCity.toLowerCase().trim();
  const placeCity = (place.city || '').toLowerCase().trim();
  const placeDestId = (place.destinationId || '').toLowerCase().trim();

  // 1. Destination isolation check
  if (placeCity && placeDestId && placeCity !== normCity && placeDestId !== normCity) {
    return {
      isEligible: false,
      exclusionReason: `Cross-city mismatch: "${place.name}" belongs to ${place.city}, not ${profile.destinationCity}.`
    };
  }

  // 2. Already visited or scheduled
  if (visitedOrScheduledIds.has(place.id) || (place.providerPlaceId && visitedOrScheduledIds.has(place.providerPlaceId))) {
    return {
      isEligible: false,
      exclusionReason: `Duplicate stop: "${place.name}" is already scheduled in this trip.`
    };
  }

  // 3. Explicitly excluded place IDs
  if (profile.excludedPlaceIds && profile.excludedPlaceIds.includes(place.id)) {
    return {
      isEligible: false,
      exclusionReason: `Explicitly excluded by user preference.`
    };
  }

  // 4. Explicitly excluded categories
  if (profile.excludedCategories && profile.excludedCategories.length > 0) {
    const placeCat = place.category.toLowerCase();
    const placeSub = (place.subcategory || '').toLowerCase();
    const isExcluded = profile.excludedCategories.some(
      c => c.toLowerCase() === placeCat || c.toLowerCase() === placeSub
    );
    if (isExcluded) {
      return {
        isEligible: false,
        exclusionReason: `Category "${place.category}" was excluded by traveler.`
      };
    }
  }

  // 5. Strict budget hard ceiling
  if (profile.budgetStrictness === 'strict' && profile.budget && profile.budget > 0) {
    const totalBudget = profile.budget;
    const travellers = Math.max(1, profile.travellers || 1);
    const maxPermittedPerStop = (totalBudget / travellers) * 0.45; // No single stop can take >45% of budget
    const estimatedCost = (place.entryFeeINR || 0) + (place.isMealStop ? (place.averageCostPerPersonINR || 0) : 0);

    if (estimatedCost > maxPermittedPerStop) {
      return {
        isEligible: false,
        exclusionReason: `Cost ₹${estimatedCost} exceeds strict maximum budget allowance of ₹${Math.round(maxPermittedPerStop)}.`
      };
    }
  }

  return { isEligible: true };
}

// -----------------------------------------------------------------------------
// 9. THE COMPLETE PERSONALISATION SCORING ENGINE
// -----------------------------------------------------------------------------

/**
 * Calculates the final personalized score in [0, 100] for candidate place p and profile u.
 * Formula:
 * Score(p, u) = ((w_i * I + w_b * B + w_d * D + w_c * C) / sum(w)) * 100
 */
export function scoreCandidatePlace(
  place: IndiaDestination,
  profile: UserPersonalisationProfile,
  origin: { lat: number; lng: number } = profile.startingLocation || { lat: place.latitude, lng: place.longitude }
): ScoredPlaceCandidate {
  const missingAttrs: string[] = [];

  // 1. Interest Match I
  const interestRes = calculateInterestMatch(place, profile);
  if (interestRes.isMissing) missingAttrs.push('interests');

  // 2. Budget Suitability B
  const budgetRes = calculateBudgetSuitability(place, profile);
  if (budgetRes.isMissing) missingAttrs.push('budget');

  // 3. Distance Suitability D
  const distanceRes = calculateDistanceSuitability(place, origin, profile.travelStyle);

  // 4. Experience Match C
  const expRes = calculateExperienceMatch(place, profile);
  if (expRes.isMissing) missingAttrs.push('experience');

  // 5. Dynamic Weights
  const weights = calculateDynamicWeights(profile, missingAttrs);

  // 6. Final Score Calculation: Score in [0, 100]
  const rawWeighted =
    weights.interest * interestRes.score +
    weights.budget * budgetRes.score +
    weights.distance * distanceRes.score +
    weights.experience * expRes.score;

  const finalScore = Number(Math.max(0, Math.min(100, rawWeighted * 100)).toFixed(1));

  // 7. Human-readable explanation generator
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

  const metadata: PersonalisationDebugMetadata = {
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

/**
 * Filter and rank all candidate places for a user profile deterministically.
 */
export function rankCandidatePlaces(
  candidates: IndiaDestination[],
  profile: UserPersonalisationProfile,
  visitedIds: Set<string> = new Set()
): ScoredPlaceCandidate[] {
  const eligible = candidates.filter(
    c => evaluateHardConstraints(c, profile, visitedIds).isEligible
  );

  const scored = eligible.map(c => scoreCandidatePlace(c, profile));

  // Deterministic sorting: by score descending, breaking ties by stable ID
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.place.id.localeCompare(b.place.id);
  });

  return scored;
}
