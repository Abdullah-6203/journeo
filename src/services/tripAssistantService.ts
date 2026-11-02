import { IndiaDestination, INDIA_DESTINATIONS } from '../data/indiaDestinations';
import {
  OptimizedItineraryResponse,
  ItineraryDayOutput,
  ItineraryStopOutput,
  TripOptimizationRequest,
  generateOptimizedItinerary,
  optimizeRouteWith2Opt,
  scheduleDayStops,
  validateGeneratedItinerary
} from '../features/itinerary/services/itineraryOptimizer';
import { calculateTripBudgetBreakdown } from './expenseService';

export type TripAssistantActionType =
  | 'remove_place'
  | 'add_place'
  | 'replace_place'
  | 'move_place_to_day'
  | 'change_day_pace'
  | 'change_preferences'
  | 'reoptimize_itinerary'
  | 'shorten_day'
  | 'answer_question'
  | 'clarify_request'
  | 'unsupported_place';

export interface TripAssistantAction {
  type: TripAssistantActionType;
  dayNumber?: number;
  targetDayNumber?: number;
  placeId?: string;
  replacementPlaceId?: string;
  pace?: 'relaxed' | 'balanced' | 'packed';
  maxStops?: number;
  preferences?: {
    addInterests?: string[];
    removeInterests?: string[];
    excludedCategories?: string[];
    crowdPreference?: 'popular' | 'balanced' | 'avoid_crowded';
    discoveryPreference?: 'popular' | 'balanced' | 'hidden_gems';
    foodStyle?: string;
    freeTextAppend?: string;
  };
  summary: string;
}

export interface AssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionApplied?: TripAssistantAction;
  modifiedTrip?: boolean;
  referencedDayNumber?: number;
  referencedPlaceId?: string;
  suggestions?: string[];
}

export interface AssistantConversationContext {
  lastReferencedDayNumber?: number;
  lastReferencedPlaceId?: string;
  lastActionType?: TripAssistantActionType;
}

export interface AssistantResponsePayload {
  reply: string;
  action: TripAssistantAction;
  modified: boolean;
  updatedItinerary?: OptimizedItineraryResponse;
  updatedContext: AssistantConversationContext;
  suggestions: string[];
}

/**
 * Extracts day number from natural language ("day 2", "day two", "second day", "that day", "it")
 */
function resolveDayNumberFromPrompt(
  text: string,
  totalDays: number,
  context: AssistantConversationContext
): number | undefined {
  const lower = text.toLowerCase();

  const digitMatch = lower.match(/\bday\s*(\d+)\b/);
  if (digitMatch) {
    const d = parseInt(digitMatch[1], 10);
    if (d >= 1 && d <= totalDays) return d;
  }

  const wordMap: Record<string, number> = {
    'day one': 1,
    'first day': 1,
    'day two': 2,
    'second day': 2,
    'day three': 3,
    'third day': 3,
    'day four': 4,
    'fourth day': 4,
    'day five': 5,
    'fifth day': 5,
    'final day': totalDays,
    'last day': totalDays
  };

  for (const [phrase, num] of Object.entries(wordMap)) {
    if (lower.includes(phrase) && num <= totalDays) {
      return num;
    }
  }

  // Multi-turn pronoun resolution ("make that day more relaxed", "make it more relaxed now", "add a cafe there")
  if (
    context.lastReferencedDayNumber &&
    (lower.includes('that day') ||
      lower.includes('this day') ||
      lower.includes('same day') ||
      /\bmake\s+it\b/.test(lower) ||
      /\bshorten\s+it\b/.test(lower) ||
      /\bon\s+it\b/.test(lower))
  ) {
    return context.lastReferencedDayNumber;
  }

  return undefined;
}

/**
 * Finds a scheduled stop inside the current itinerary matching user text (by name, subcategory, or category keyword like "museum", "fort", "market")
 */
function findScheduledStopInItinerary(
  text: string,
  itinerary: OptimizedItineraryResponse,
  preferredDayNumber?: number
): { dayNumber: number; stop: ItineraryStopOutput } | null {
  const lower = text.toLowerCase();
  const daysToSearch = preferredDayNumber
    ? itinerary.days.filter(d => d.dayNumber === preferredDayNumber)
    : itinerary.days;

  // 1. Exact or substring match on stop name
  for (const day of daysToSearch) {
    for (const stop of day.stops) {
      const cleanName = stop.name.split('(')[0].trim().toLowerCase();
      const significantWords = cleanName.split(/\s+/).filter(w => w.length >= 4 && !['fort', 'temple', 'park', 'lake', 'palace', 'market'].includes(w));
      if (
        lower.includes(cleanName) ||
        lower.includes(stop.placeId.toLowerCase()) ||
        (significantWords.length > 0 && significantWords.some(w => lower.includes(w)))
      ) {
        return { dayNumber: day.dayNumber, stop };
      }
    }
  }

  // 2. Category / Subcategory keyword match (e.g. "remove the museum from day two", "remove the fort", "remove the beach")
  const typeKeywords: { keyword: string; matchFn: (s: ItineraryStopOutput) => boolean }[] = [
    {
      keyword: 'museum',
      matchFn: s =>
        (s.subcategory || '').toLowerCase().includes('museum') ||
        s.name.toLowerCase().includes('museum') ||
        s.destination?.description?.toLowerCase().includes('museum')
    },
    {
      keyword: 'fort',
      matchFn: s =>
        (s.subcategory || '').toLowerCase().includes('fort') ||
        s.name.toLowerCase().includes('fort')
    },
    {
      keyword: 'market',
      matchFn: s =>
        s.category === 'Shopping' ||
        (s.subcategory || '').toLowerCase().includes('market') ||
        (s.subcategory || '').toLowerCase().includes('bazaar') ||
        s.name.toLowerCase().includes('market') ||
        s.name.toLowerCase().includes('bazaar') ||
        s.name.toLowerCase().includes('haat')
    },
    {
      keyword: 'bazaar',
      matchFn: s =>
        s.category === 'Shopping' ||
        s.name.toLowerCase().includes('bazaar') ||
        s.name.toLowerCase().includes('chowk')
    },
    {
      keyword: 'temple',
      matchFn: s =>
        s.category === 'Spiritual' ||
        s.name.toLowerCase().includes('temple') ||
        s.name.toLowerCase().includes('mandir')
    },
    {
      keyword: 'tomb',
      matchFn: s =>
        s.name.toLowerCase().includes('tomb') ||
        (s.subcategory || '').toLowerCase().includes('mausoleum')
    },
    {
      keyword: 'garden',
      matchFn: s =>
        s.category === 'Nature' ||
        s.name.toLowerCase().includes('garden') ||
        s.name.toLowerCase().includes('park') ||
        s.name.toLowerCase().includes('bagh')
    }
  ];

  for (const tk of typeKeywords) {
    if (lower.includes(tk.keyword)) {
      for (const day of daysToSearch) {
        const hit = day.stops.find(tk.matchFn);
        if (hit) return { dayNumber: day.dayNumber, stop: hit };
      }
      // If preferredDayNumber didn't have it, search all days
      for (const day of itinerary.days) {
        const hit = day.stops.find(tk.matchFn);
        if (hit) return { dayNumber: day.dayNumber, stop: hit };
      }
    }
  }

  return null;
}

/**
 * Searches verified catalog places in the active destination that are NOT yet in the itinerary
 */
function findVerifiedCatalogCandidate(
  queryText: string,
  itinerary: OptimizedItineraryResponse,
  filterPred?: (p: IndiaDestination) => boolean
): IndiaDestination | null {
  const lower = queryText.toLowerCase();
  const destId = itinerary.canonicalDestination.destinationId;
  const targetCity = itinerary.destinationCity.toLowerCase();

  const cityCatalog = INDIA_DESTINATIONS.filter(
    p => p.destinationId === destId || p.city.toLowerCase() === targetCity
  );

  const existingIds = new Set(itinerary.stops.map(s => s.placeId));

  // First check if the user named a specific catalog place in this destination
  for (const place of cityCatalog) {
    const cleanName = place.name.split('(')[0].trim().toLowerCase();
    const keywords = cleanName.split(/\s+/).filter(w => w.length >= 4);
    if (
      lower.includes(cleanName) ||
      lower.includes(place.id.toLowerCase()) ||
      (keywords.length > 0 && keywords.some(kw => lower.includes(kw)))
    ) {
      return place;
    }
  }

  // Otherwise pick the best unvisited candidate matching filterPred
  const unvisited = cityCatalog.filter(p => !existingIds.has(p.id));
  const pool = unvisited.length > 0 ? unvisited : cityCatalog;

  if (filterPred) {
    const matched = pool.filter(filterPred);
    if (matched.length > 0) return matched[0];
  }

  return null;
}

/**
 * Re-schedules a specific day's stops cleanly after an assistant addition/removal/replacement/pace change
 * and updates the overall itinerary totals and validation.
 */
function rebuildItineraryWithUpdatedDays(
  itinerary: OptimizedItineraryResponse,
  dayPlacesMap: Map<number, IndiaDestination[]>,
  dayPacesMap: Map<number, 'relaxed' | 'balanced' | 'packed'>,
  updatedRequestConfig?: Partial<TripOptimizationRequest>
): OptimizedItineraryResponse {
  const canonical = itinerary.canonicalDestination;
  const targetCity = itinerary.destinationCity;
  const mergedConfig: TripOptimizationRequest = {
    ...(itinerary.tripConfig || {}),
    ...(updatedRequestConfig || {}),
    destination: targetCity,
    canonicalDestination: canonical
  };

  const cityCatalog = INDIA_DESTINATIONS.filter(
    d => d.destinationId === canonical.destinationId || d.city.toLowerCase() === targetCity.toLowerCase()
  );
  const foodSpots = cityCatalog.filter(d => d.isMealStop || d.category === 'Food');

  const startLat = mergedConfig.startingLocation?.lat || canonical.suggestedStartingPoint.lat;
  const startLng = mergedConfig.startingLocation?.lng || canonical.suggestedStartingPoint.lng;
  const startAddress =
    typeof mergedConfig.startingLocation === 'object'
      ? mergedConfig.startingLocation.address || canonical.suggestedStartingPoint.name
      : canonical.suggestedStartingPoint.name;

  const updatedDays: ItineraryDayOutput[] = [];
  const allStops: ItineraryStopOutput[] = [];
  let grandTotalDistanceKm = 0;
  let grandTotalDurationMin = 0;

  for (const existingDay of itinerary.days) {
    const dNum = existingDay.dayNumber;
    const rawPlaces =
      dayPlacesMap.get(dNum) ||
      existingDay.stops.filter(s => !s.isMealStop).map(s => s.destination);
    const dayPace = dayPacesMap.get(dNum) || existingDay.dayPace || mergedConfig.travelPace || 'balanced';

    const route = optimizeRouteWith2Opt(rawPlaces, startLat, startLng);

    const dayStartTimeOverride =
      dNum === 1 && itinerary.intercitySummary
        ? itinerary.intercitySummary.recommendedSightseeingStartDay1
        : undefined;
    const dayEndCutoffOverride =
      dNum === itinerary.days.length && itinerary.days.length > 1 && mergedConfig.intercityTransport?.tripType === 'round_trip'
        ? itinerary.intercitySummary?.recommendedFinalDayCutoff
        : undefined;

    const { stops, dayMetrics } = scheduleDayStops(
      route,
      dNum,
      mergedConfig,
      startLat,
      startLng,
      dNum === 1 ? startAddress : `${targetCity} Day ${dNum} Hub`,
      foodSpots,
      dayStartTimeOverride,
      dayEndCutoffOverride,
      new Map(),
      dayPace
    );

    const primaryArea = route[0]?.area || existingDay.area || `${targetCity} Circuit`;
    const availableTimeMin = (mergedConfig.availableHoursPerDay || 8) * 60;
    const busyMin = dayMetrics.travelMin + dayMetrics.visitMin;
    const freeTimeMin = Math.max(0, availableTimeMin - busyMin);

    updatedDays.push({
      ...existingDay,
      title: `${targetCity} • Day ${dNum}: ${primaryArea}`,
      area: primaryArea,
      stops,
      totalTravelMinutes: dayMetrics.travelMin,
      totalVisitMinutes: dayMetrics.visitMin,
      freeTimeMinutes: freeTimeMin,
      dayDistanceKm: dayMetrics.distanceKm,
      dayPace
    });

    stops.forEach(s => allStops.push(s));
    grandTotalDistanceKm += dayMetrics.distanceKm;
    grandTotalDurationMin += busyMin;
  }

  const budgetBreakdown = calculateTripBudgetBreakdown({
    budgetConfig: mergedConfig.budgetConfig || {},
    intercityEstimate: itinerary.intercitySummary,
    days: updatedDays.length,
    travellers: mergedConfig.travellers || 2,
    localTransportMode: mergedConfig.transportMode || 'cab',
    scheduledStops: allStops
  });

  const rebuilt: OptimizedItineraryResponse = {
    ...itinerary,
    tripConfig: mergedConfig,
    budgetBreakdown,
    days: updatedDays,
    stops: allStops,
    plan: {
      ...itinerary.plan,
      totalDistanceKm: Math.round(grandTotalDistanceKm * 10) / 10,
      totalDurationMin: grandTotalDurationMin,
      scheduledStops: allStops,
      days: updatedDays
    }
  };

  rebuilt.validation = validateGeneratedItinerary(rebuilt, mergedConfig);
  return rebuilt;
}

/**
 * Core Conversational AI Trip Assistant Processor.
 * Understands the active trip, resolves multi-turn context, validates place existence against
 * the verified catalog, executes structured itinerary modifications, and answers grounded trip questions.
 */
export function processTripAssistantMessage(
  userMessage: string,
  activeItinerary: OptimizedItineraryResponse,
  context: AssistantConversationContext = {}
): AssistantResponsePayload {
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();
  const totalDays = activeItinerary.days.length;
  const city = activeItinerary.destinationCity;

  const dayPlacesMap = new Map<number, IndiaDestination[]>();
  const dayPacesMap = new Map<number, 'relaxed' | 'balanced' | 'packed'>();

  activeItinerary.days.forEach(d => {
    // Preserve primary non-auto-meal stops, or if a food stop was explicitly added as a primary stop keep it
    const primaryPlaces = d.stops
      .filter(s => !s.id.includes('-breakfast-') && !s.id.includes('-lunch-'))
      .map(s => s.destination);
    dayPlacesMap.set(d.dayNumber, primaryPlaces);
    dayPacesMap.set(d.dayNumber, d.dayPace || activeItinerary.tripConfig?.travelPace || 'balanced');
  });

  const resolvedDay = resolveDayNumberFromPrompt(trimmed, totalDays, context);

  // ============================================================================
  // CASE 1: AMBIGUOUS / VAGUE REQUESTS ("Make the trip better", "Change something")
  // ============================================================================
  if (
    /^(make\s+(the\s+)?(trip|itinerary)\s+better|improve\s+(my\s+)?trip|change\s+something|fix\s+it|update\s+it)\.?$/i.test(
      trimmed
    )
  ) {
    return {
      reply: `I'd love to refine your ${city} itinerary! How would you like to improve it? For example, I can:\n• **Make the pace more relaxed** with fewer stops and longer cafe breaks\n• **Swap crowded monuments for hidden gems** and quiet scenic spots\n• **Add more local street food, markets, or cafes** to a specific day`,
      action: {
        type: 'clarify_request',
        summary: 'Asked user to clarify how they would like to customize the itinerary'
      },
      modified: false,
      updatedContext: context,
      suggestions: [
        'Make Day 1 more relaxed',
        'Replace crowded places with hidden gems',
        'Add more local street food and cafes'
      ]
    };
  }

  // ============================================================================
  // CASE 2: TRIP QUESTIONS ("Why was this place selected?", "How much does this trip cost?", "What is on Day 2?")
  // ============================================================================
  if (
    lower.startsWith('why ') ||
    lower.startsWith('what ') ||
    lower.startsWith('how much') ||
    lower.startsWith('how many') ||
    lower.includes('why was') ||
    lower.includes('tell me about') ||
    lower.endsWith('?')
  ) {
    // Check if asking about a specific place
    const matchedStopInfo = findScheduledStopInItinerary(trimmed, activeItinerary, resolvedDay);
    if (matchedStopInfo && (lower.includes('why') || lower.includes('selected') || lower.includes('about'))) {
      const { stop, dayNumber } = matchedStopInfo;
      const orig = stop.destination?.originalData;
      return {
        reply: `**${stop.name}** (Day ${dayNumber}, ${stop.startTime}–${stop.endTime}) was included because: *${stop.reasonForSelection}*.\n\n• **Category:** ${stop.subcategory || stop.category}\n• **Entry Fee:** ${stop.destination?.entryFeeINR === 0 ? 'Free Entry' : `₹${stop.destination?.entryFeeINR}`}\n• **Opening Hours:** ${stop.destination?.openingHours || 'Open Daily'}\n• **Verified Source:** ${orig?.source || stop.destination?.officialSource || 'Journeo Verified Catalog'}`,
        action: {
          type: 'answer_question',
          dayNumber,
          placeId: stop.placeId,
          summary: `Explained selection reason and provenance for ${stop.name}`
        },
        modified: false,
        updatedContext: {
          lastReferencedDayNumber: dayNumber,
          lastReferencedPlaceId: stop.placeId,
          lastActionType: 'answer_question'
        },
        suggestions: [
          `Replace ${stop.name.split('(')[0].trim()} with a quiet nature spot`,
          `Make Day ${dayNumber} more relaxed`
        ]
      };
    }

    if (lower.includes('budget') || lower.includes('cost') || lower.includes('how much') || lower.includes('expense')) {
      const b = activeItinerary.budgetBreakdown;
      if (b) {
        return {
          reply: `Your **${city} (${totalDays}-Day)** trip has an estimated total cost of **₹${b.estimatedExpenses.totalEstimated.toLocaleString('en-IN')}** (₹${b.estimatedExpenses.perPersonEstimated.toLocaleString('en-IN')} per person) against your budget of **₹${b.totalBudget.toLocaleString('en-IN')}**.\n\n• **Intercity Transit:** ₹${b.estimatedExpenses.intercityTransport.toLocaleString('en-IN')}\n• **Accommodation:** ₹${b.estimatedExpenses.accommodation.toLocaleString('en-IN')}\n• **Food & Cafes:** ₹${b.estimatedExpenses.food.toLocaleString('en-IN')}\n• **Local Transit & Entry Fees:** ₹${(b.estimatedExpenses.localTransport + b.estimatedExpenses.attractions).toLocaleString('en-IN')}`,
          action: {
            type: 'answer_question',
            summary: 'Answered trip budget and estimated expense breakdown question'
          },
          modified: false,
          updatedContext: context,
          suggestions: ['Switch to free-entry and budget-friendly places', 'Add a street food stop to Day 1']
        };
      }
    }

    const qDay = resolvedDay || 1;
    const dayObj = activeItinerary.days.find(d => d.dayNumber === qDay) || activeItinerary.days[0];
    const stopList = dayObj.stops.map(s => `• **${s.startTime}–${s.endTime}:** ${s.name} (*${s.reasonForSelection}*)`).join('\n');
    return {
      reply: `Here is your **Day ${dayObj.dayNumber} (${dayObj.area})** schedule in ${city}:\n${stopList}\n\nTotal sightseeing & dining time: **${dayObj.totalVisitMinutes} mins**, with **${dayObj.freeTimeMinutes} mins** of unhurried free time.`,
      action: {
        type: 'answer_question',
        dayNumber: dayObj.dayNumber,
        summary: `Summarized Day ${dayObj.dayNumber} schedule and selection reasons`
      },
      modified: false,
      updatedContext: {
        lastReferencedDayNumber: dayObj.dayNumber,
        lastActionType: 'answer_question'
      },
      suggestions: [`Make Day ${dayObj.dayNumber} more relaxed`, `Add a cafe to Day ${dayObj.dayNumber}`]
    };
  }

  // ============================================================================
  // CASE 3: REMOVE A PLACE ("Remove the museum from day two", "Remove Red Fort", "Skip the market")
  // ============================================================================
  if (
    lower.startsWith('remove ') ||
    lower.startsWith('delete ') ||
    lower.startsWith('drop ') ||
    lower.startsWith('skip ') ||
    lower.includes('remove the ') ||
    lower.includes('take out ')
  ) {
    const matched = findScheduledStopInItinerary(trimmed, activeItinerary, resolvedDay);
    if (!matched) {
      return {
        reply: `I couldn't find a matching stop in your current ${city} itinerary to remove. Currently scheduled stops include: ${activeItinerary.stops
          .slice(0, 5)
          .map(s => `**${s.name.split('(')[0].trim()}** (Day ${activeItinerary.days.find(d => d.stops.some(st => st.id === s.id))?.dayNumber || 1})`)
          .join(', ')}. Which one would you like to remove?`,
        action: {
          type: 'clarify_request',
          summary: 'Requested clarification on which stop to remove'
        },
        modified: false,
        updatedContext: context,
        suggestions: activeItinerary.stops
          .filter(s => !s.isMealStop)
          .slice(0, 3)
          .map(s => `Remove ${s.name.split('(')[0].trim()}`)
      };
    }

    const { dayNumber, stop } = matched;
    const currentDayPlaces = dayPlacesMap.get(dayNumber) || [];
    const filteredPlaces = currentDayPlaces.filter(p => p.id !== stop.placeId);

    // Ensure the day still has at least 1 primary stop; if removing leaves 0, pull an unvisited verified place
    if (filteredPlaces.length === 0) {
      const backup = findVerifiedCatalogCandidate('', activeItinerary, p => p.id !== stop.placeId && !p.isMealStop);
      if (backup) filteredPlaces.push(backup);
    }
    dayPlacesMap.set(dayNumber, filteredPlaces);

    const excludedIds = Array.from(new Set([...(activeItinerary.tripConfig?.excludedPlaceIds || []), stop.placeId]));
    const updatedItinerary = rebuildItineraryWithUpdatedDays(activeItinerary, dayPlacesMap, dayPacesMap, {
      excludedPlaceIds: excludedIds
    });

    const action: TripAssistantAction = {
      type: 'remove_place',
      dayNumber,
      placeId: stop.placeId,
      summary: `Removed ${stop.name} from Day ${dayNumber} and recalculated Day ${dayNumber} timings`
    };

    return {
      reply: `Done! I removed **${stop.name}** from **Day ${dayNumber}** and recalculated your route and arrival times for that day.`,
      action,
      modified: true,
      updatedItinerary,
      updatedContext: {
        lastReferencedDayNumber: dayNumber,
        lastReferencedPlaceId: stop.placeId,
        lastActionType: 'remove_place'
      },
      suggestions: [
        `Make that day more relaxed`,
        `Add a local cafe to Day ${dayNumber}`,
        `Add a peaceful nature spot to Day ${dayNumber}`
      ]
    };
  }

  // ============================================================================
  // CASE 4: MOVE A STOP TO ANOTHER DAY ("Move the fort visit to day 2")
  // ============================================================================
  if (lower.startsWith('move ') || lower.includes('move ') && lower.includes(' to day')) {
    const toDayMatch = lower.match(/to\s+day\s*(\d+|one|two|three|four|five)/i);
    let targetDay = totalDays;
    if (toDayMatch) {
      const token = toDayMatch[1].toLowerCase();
      const map: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
      targetDay = map[token] || parseInt(token, 10) || totalDays;
    }
    targetDay = Math.max(1, Math.min(totalDays, targetDay));

    const matched = findScheduledStopInItinerary(trimmed, activeItinerary);
    if (matched) {
      const { dayNumber: sourceDay, stop } = matched;
      if (sourceDay === targetDay) {
        return {
          reply: `**${stop.name}** is already scheduled on **Day ${targetDay}**.`,
          action: { type: 'answer_question', dayNumber: targetDay, placeId: stop.placeId, summary: 'Stop already on target day' },
          modified: false,
          updatedContext: { lastReferencedDayNumber: targetDay, lastReferencedPlaceId: stop.placeId },
          suggestions: [`Make Day ${targetDay} more relaxed`]
        };
      }

      const srcList = (dayPlacesMap.get(sourceDay) || []).filter(p => p.id !== stop.placeId);
      if (srcList.length === 0) {
        const filler = findVerifiedCatalogCandidate('', activeItinerary, p => p.id !== stop.placeId && !p.isMealStop);
        if (filler) srcList.push(filler);
      }
      const dstList = [...(dayPlacesMap.get(targetDay) || []), stop.destination];
      dayPlacesMap.set(sourceDay, srcList);
      dayPlacesMap.set(targetDay, dstList);

      const updatedItinerary = rebuildItineraryWithUpdatedDays(activeItinerary, dayPlacesMap, dayPacesMap);
      return {
        reply: `Moved **${stop.name}** from **Day ${sourceDay}** to **Day ${targetDay}** and re-optimized both days' routes.`,
        action: {
          type: 'move_place_to_day',
          dayNumber: sourceDay,
          targetDayNumber: targetDay,
          placeId: stop.placeId,
          summary: `Moved ${stop.name} from Day ${sourceDay} to Day ${targetDay}`
        },
        modified: true,
        updatedItinerary,
        updatedContext: {
          lastReferencedDayNumber: targetDay,
          lastReferencedPlaceId: stop.placeId,
          lastActionType: 'move_place_to_day'
        },
        suggestions: [`Make Day ${targetDay} more relaxed`, `Shorten Day ${targetDay}`]
      };
    }
  }

  // ============================================================================
  // CASE 5: REPLACE A PLACE ("Replace X with Y", "Swap the fort for a quiet garden/nature spot")
  // ============================================================================
  if (lower.startsWith('replace ') || lower.startsWith('swap ') || lower.includes('instead of ')) {
    const matched = findScheduledStopInItinerary(trimmed, activeItinerary, resolvedDay);
    const targetDay = matched?.dayNumber || resolvedDay || 1;
    const stopToReplace =
      matched?.stop ||
      activeItinerary.days.find(d => d.dayNumber === targetDay)?.stops.find(s => !s.isMealStop) ||
      activeItinerary.stops[0];

    const wantsNature = lower.includes('nature') || lower.includes('garden') || lower.includes('park') || lower.includes('quiet') || lower.includes('peaceful');
    const wantsFood = lower.includes('food') || lower.includes('cafe') || lower.includes('market') || lower.includes('bazaar');
    const wantsHidden = lower.includes('hidden') || lower.includes('offbeat') || lower.includes('uncrowded');

    const replacement = findVerifiedCatalogCandidate(trimmed, activeItinerary, p => {
      if (p.id === stopToReplace?.placeId) return false;
      if (wantsNature) return p.category === 'Nature';
      if (wantsFood) return p.category === 'Food' || p.category === 'Shopping';
      if (wantsHidden) return p.enrichment?.crowdLevel === 'low_offbeat';
      return !p.isMealStop;
    });

    if (!replacement || !stopToReplace) {
      return {
        reply: `I couldn't find a verified replacement in ${city} matching that description. Would you like to re-optimize the itinerary for hidden gems or nature instead?`,
        action: { type: 'clarify_request', summary: 'No matching replacement candidate found' },
        modified: false,
        updatedContext: context,
        suggestions: ['Avoid crowded tourist places', 'Add more local food and markets']
      };
    }

    const currentDayPlaces = dayPlacesMap.get(targetDay) || [];
    const updatedDayPlaces = currentDayPlaces.map(p => (p.id === stopToReplace.placeId ? replacement : p));
    if (!updatedDayPlaces.some(p => p.id === replacement.id)) {
      updatedDayPlaces.push(replacement);
    }
    dayPlacesMap.set(targetDay, updatedDayPlaces);

    const updatedItinerary = rebuildItineraryWithUpdatedDays(activeItinerary, dayPlacesMap, dayPacesMap);

    return {
      reply: `Swapped **${stopToReplace.name}** on **Day ${targetDay}** with **${replacement.name}** (*${replacement.subcategory || replacement.category}*, verified via ${replacement.originalData?.source || replacement.officialSource || 'Journeo Catalog'}) and updated Day ${targetDay}'s schedule.`,
      action: {
        type: 'replace_place',
        dayNumber: targetDay,
        placeId: stopToReplace.placeId,
        replacementPlaceId: replacement.id,
        summary: `Replaced ${stopToReplace.name} with ${replacement.name} on Day ${targetDay}`
      },
      modified: true,
      updatedItinerary,
      updatedContext: {
        lastReferencedDayNumber: targetDay,
        lastReferencedPlaceId: replacement.id,
        lastActionType: 'replace_place'
      },
      suggestions: [`Why was ${replacement.name.split('(')[0].trim()} selected?`, `Make Day ${targetDay} more relaxed`]
    };
  }

  // ============================================================================
  // CASE 6: CHANGE PACE OR SHORTEN A DAY ("Make Day 2 more relaxed", "Make that day more relaxed", "Shorten Day 1")
  // ============================================================================
  if (
    lower.includes('more relaxed') ||
    lower.includes('slower pace') ||
    lower.includes('relax ') ||
    lower.includes('unhurried') ||
    lower.includes('packed pace') ||
    lower.includes('more packed') ||
    lower.includes('fewer stops') ||
    lower.includes('less tiring') ||
    lower.includes('shorten ')
  ) {
    const targetDay = resolvedDay || context.lastReferencedDayNumber || 1;
    const isShortenOrRelax =
      lower.includes('relax') ||
      lower.includes('slow') ||
      lower.includes('unhurried') ||
      lower.includes('fewer') ||
      lower.includes('less tiring') ||
      lower.includes('shorten');

    const newPace: 'relaxed' | 'balanced' | 'packed' = isShortenOrRelax ? 'relaxed' : 'packed';
    dayPacesMap.set(targetDay, newPace);

    const currentPlaces = dayPlacesMap.get(targetDay) || [];
    let trimmedCountNote = '';
    if (isShortenOrRelax && currentPlaces.length > 2) {
      const removed = currentPlaces.slice(2);
      dayPlacesMap.set(targetDay, currentPlaces.slice(0, 2));
      trimmedCountNote = ` and trimmed ${removed.map(r => r.name.split('(')[0].trim()).join(', ')} so you have only 2 unhurried primary stops`;
    }

    const updatedItinerary = rebuildItineraryWithUpdatedDays(activeItinerary, dayPlacesMap, dayPacesMap, {
      travelPace: resolvedDay ? activeItinerary.tripConfig?.travelPace : newPace
    });

    const actionType: TripAssistantActionType = lower.includes('shorten') ? 'shorten_day' : 'change_day_pace';
    return {
      reply: `Updated **Day ${targetDay}** to a **${newPace}** pace${trimmedCountNote}! Visit durations have been extended by 25% with extra breathing room between stops.`,
      action: {
        type: actionType,
        dayNumber: targetDay,
        pace: newPace,
        summary: `Changed Day ${targetDay} pace to ${newPace}${trimmedCountNote}`
      },
      modified: true,
      updatedItinerary,
      updatedContext: {
        lastReferencedDayNumber: targetDay,
        lastActionType: actionType
      },
      suggestions: [
        `Add a local cafe to Day ${targetDay}`,
        `What is on Day ${targetDay} now?`,
        `Avoid crowded tourist places`
      ]
    };
  }

  // ============================================================================
  // CASE 7: ADD A PLACE OR CATEGORY TO A DAY ("Add a cafe near Day 1 evening", "Add a sunset point", "Add Eiffel Tower")
  // ============================================================================
  if (
    lower.startsWith('add ') ||
    lower.includes('include ') ||
    lower.includes('can we visit ') ||
    lower.includes('put ')
  ) {
    const targetDay = resolvedDay || context.lastReferencedDayNumber || 1;

    // Check if the user is asking for a specific named landmark that does NOT exist in this destination's verified catalog
    const foreignOrInvalidLandmarks = [
      { kw: 'eiffel tower', actualCity: 'Paris' },
      { kw: 'statue of liberty', actualCity: 'New York' },
      { kw: 'colosseum', actualCity: 'Rome' },
      { kw: 'burj khalifa', actualCity: 'Dubai' },
      { kw: 'machu picchu', actualCity: 'Peru' },
      { kw: 'disneyland', actualCity: 'outside India' },
      { kw: 'taj mahal', actualCity: 'Agra' },
      { kw: 'red fort', actualCity: 'Delhi' },
      { kw: 'hawa mahal', actualCity: 'Jaipur' },
      { kw: 'baga beach', actualCity: 'Goa' },
      { kw: 'golden temple', actualCity: 'Amritsar' },
      { kw: 'gateway of india', actualCity: 'Mumbai' }
    ];

    for (const item of foreignOrInvalidLandmarks) {
      if (lower.includes(item.kw) && item.actualCity.toLowerCase() !== city.toLowerCase()) {
        return {
          reply: `I cannot add **${item.kw.replace(/\b\w/g, c => c.toUpperCase())}** because it is located in **${item.actualCity}**, outside your active destination (**${city}**). Journeo strictly validates that all stops belong to ${city} and never fabricates unverified places.\n\nWould you like me to add a verified highlight in **${city}** instead?`,
          action: {
            type: 'unsupported_place',
            dayNumber: targetDay,
            summary: `Rejected out-of-bounds/unverified place "${item.kw}" for destination ${city}`
          },
          modified: false,
          updatedContext: context,
          suggestions: [
            `Add a local cafe to Day ${targetDay}`,
            `Add a sunset viewpoint to Day ${targetDay}`,
            `Add a local market to Day ${targetDay}`
          ]
        };
      }
    }

    // Check if user requested an unknown proper noun not in our catalog and not a generic category request
    const isGenericCategoryRequest =
      lower.includes('cafe') ||
      lower.includes('coffee') ||
      lower.includes('food') ||
      lower.includes('street food') ||
      lower.includes('restaurant') ||
      lower.includes('lunch') ||
      lower.includes('dinner') ||
      lower.includes('market') ||
      lower.includes('bazaar') ||
      lower.includes('shopping') ||
      lower.includes('sunset') ||
      lower.includes('nature') ||
      lower.includes('garden') ||
      lower.includes('park') ||
      lower.includes('lake') ||
      lower.includes('beach') ||
      lower.includes('temple') ||
      lower.includes('heritage') ||
      lower.includes('monument') ||
      lower.includes('hidden gem') ||
      lower.includes('quiet') ||
      lower.includes('photo');

    const candidate = findVerifiedCatalogCandidate(trimmed, activeItinerary, p => {
      if (lower.includes('cafe') || lower.includes('coffee') || lower.includes('bakery')) {
        return (
          p.category === 'Food' ||
          Boolean(p.isMealStop) ||
          (p.subcategory || '').toLowerCase().includes('cafe') ||
          p.name.toLowerCase().includes('cafe')
        );
      }
      if (lower.includes('street food') || lower.includes('food') || lower.includes('chaat')) {
        return p.category === 'Food' || Boolean(p.isMealStop);
      }
      if (lower.includes('market') || lower.includes('bazaar') || lower.includes('shopping')) {
        return (
          p.category === 'Shopping' ||
          (p.subcategory || '').toLowerCase().includes('market') ||
          (p.subcategory || '').toLowerCase().includes('bazaar')
        );
      }
      if (lower.includes('sunset') || lower.includes('view')) {
        return p.bestTimeOfDay === 'sunset' || p.category === 'Nature';
      }
      if (lower.includes('nature') || lower.includes('garden') || lower.includes('park') || lower.includes('peaceful') || lower.includes('quiet')) {
        return p.category === 'Nature' || p.enrichment?.crowdLevel === 'low_offbeat';
      }
      if (lower.includes('hidden gem') || lower.includes('offbeat')) {
        return p.enrichment?.crowdLevel === 'low_offbeat';
      }
      return true;
    });

    // If user typed a specific place name (not a generic category) and it didn't match any place in the city catalog, reject safely!
    const specificallyMatchedByName =
      candidate &&
      (lower.includes(candidate.name.split('(')[0].trim().toLowerCase()) ||
        candidate.name
          .split('(')[0]
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .filter(w => w.length >= 4)
          .some(w => lower.includes(w)));

    if (!isGenericCategoryRequest && !specificallyMatchedByName) {
      const cityCatalogNames = INDIA_DESTINATIONS.filter(
        d => d.city.toLowerCase() === city.toLowerCase()
      )
        .slice(0, 4)
        .map(d => d.name.split('(')[0].trim())
        .join(', ');

      return {
        reply: `I couldn't find that specific place in our verified **${city}** database. To keep your itinerary trustworthy, I never fabricate coordinates or unverified venues.\n\nVerified options in ${city} include: **${cityCatalogNames}**. Would you like to add one of these?`,
        action: {
          type: 'unsupported_place',
          dayNumber: targetDay,
          summary: `Declined unverified place request in ${city} and suggested verified alternatives`
        },
        modified: false,
        updatedContext: context,
        suggestions: [
          `Add a local cafe to Day ${targetDay}`,
          `Add a local bazaar to Day ${targetDay}`,
          `Add a hidden gem to Day ${targetDay}`
        ]
      };
    }

    if (candidate) {
      const currentDayPlaces = dayPlacesMap.get(targetDay) || [];
      if (!currentDayPlaces.some(p => p.id === candidate.id)) {
        dayPlacesMap.set(targetDay, [...currentDayPlaces, candidate]);
      }

      const updatedItinerary = rebuildItineraryWithUpdatedDays(activeItinerary, dayPlacesMap, dayPacesMap);
      return {
        reply: `Added **${candidate.name}** (*${candidate.subcategory || candidate.category}*, verified via ${candidate.originalData?.source || candidate.officialSource || 'Journeo Catalog'}) to **Day ${targetDay}** and re-optimized the route and timings!`,
        action: {
          type: 'add_place',
          dayNumber: targetDay,
          placeId: candidate.id,
          summary: `Added ${candidate.name} to Day ${targetDay}`
        },
        modified: true,
        updatedItinerary,
        updatedContext: {
          lastReferencedDayNumber: targetDay,
          lastReferencedPlaceId: candidate.id,
          lastActionType: 'add_place'
        },
        suggestions: [
          `Why was ${candidate.name.split('(')[0].trim()} selected?`,
          `Make Day ${targetDay} more relaxed`
        ]
      };
    }
  }

  // ============================================================================
  // CASE 8: WHOLE-TRIP PREFERENCE / THEME RE-OPTIMIZATION
  // ("Avoid crowded tourist places", "Focus more on street food, markets, and cafes", "No museums")
  // ============================================================================
  const currentConfig: TripOptimizationRequest = {
    ...(activeItinerary.tripConfig || {}),
    destination: city,
    days: totalDays,
    mustVisitPlaceIds: [] // clear forced pins so re-optimization reflects new preferences
  };

  let prefSummaryParts: string[] = [];
  const newInterests = new Set<string>(currentConfig.selectedInterests || []);
  const newExclCats = new Set<string>(currentConfig.excludedCategories || []);

  if (lower.includes('avoid crowd') || lower.includes('no crowd') || lower.includes('hidden gem') || lower.includes('offbeat') || lower.includes('less touristy')) {
    currentConfig.crowdPreference = 'avoid_crowded';
    currentConfig.discoveryPreference = 'hidden_gems';
    newInterests.add('Hidden Gems');
    prefSummaryParts.push('uncrowded hidden gems & offbeat places');
  }

  if (lower.includes('food') || lower.includes('cafe') || lower.includes('street food') || lower.includes('culinary')) {
    newInterests.add('Food and Local Culture');
    currentConfig.foodStyle = lower.includes('cafe') ? 'cafes' : 'street_food';
    prefSummaryParts.push('local street food & artisanal cafes');
  }

  if (lower.includes('market') || lower.includes('bazaar') || lower.includes('shopping')) {
    newInterests.add('Shopping');
    newInterests.add('Local Experiences');
    prefSummaryParts.push('local markets & bazaars');
  }

  if (lower.includes('nature') || lower.includes('peaceful') || lower.includes('garden') || lower.includes('green')) {
    newInterests.add('Nature and Landscapes');
    prefSummaryParts.push('peaceful nature & gardens');
  }

  if (lower.includes('history') || lower.includes('heritage') || lower.includes('architecture') || lower.includes('monument')) {
    newInterests.add('Historical Monuments');
    prefSummaryParts.push('historical monuments & architecture');
  }

  if (lower.includes('no museum') || lower.includes('avoid museum') || lower.includes('without museum') || lower.includes('skip museum')) {
    newExclCats.add('Museum');
    prefSummaryParts.push('excluding museums');
  }

  if (prefSummaryParts.length > 0) {
    currentConfig.selectedInterests = Array.from(newInterests);
    currentConfig.excludedCategories = Array.from(newExclCats);
    currentConfig.freeTextInstructions = `${currentConfig.freeTextInstructions || ''} ${trimmed}`.trim();

    const reoptimized = generateOptimizedItinerary(currentConfig);
    reoptimized.tripId = activeItinerary.tripId; // preserve active trip ID for persistence

    const newStopNames = reoptimized.stops
      .slice(0, 4)
      .map(s => s.name.split('(')[0].trim())
      .join(', ');

    return {
      reply: `Re-optimized your **${city}** itinerary for **${prefSummaryParts.join(', ')}**! Your updated route now features: **${newStopNames}**, with all timings and distances recalculated.`,
      action: {
        type: 'change_preferences',
        preferences: {
          addInterests: Array.from(newInterests),
          excludedCategories: Array.from(newExclCats),
          crowdPreference: currentConfig.crowdPreference,
          discoveryPreference: currentConfig.discoveryPreference,
          foodStyle: currentConfig.foodStyle,
          freeTextAppend: trimmed
        },
        summary: `Re-optimized itinerary for ${prefSummaryParts.join(', ')}`
      },
      modified: true,
      updatedItinerary: reoptimized,
      updatedContext: {
        lastReferencedDayNumber: resolvedDay || 1,
        lastActionType: 'change_preferences'
      },
      suggestions: [
        'Make Day 1 more relaxed',
        'How much does this trip cost now?',
        'What is on Day 1?'
      ]
    };
  }

  // Fallback helpful response if intent was conversational
  return {
    reply: `I can modify your **${city}** itinerary right away! Try asking me to:\n• *"Remove the museum from Day 2"*\n• *"Make that day more relaxed"*\n• *"Add a local cafe or bazaar to Day 1"*\n• *"Avoid crowded tourist places and focus on hidden gems"*\n• *"How much does this trip cost?"*`,
    action: {
      type: 'clarify_request',
      summary: 'Provided actionable itinerary assistant examples'
    },
    modified: false,
    updatedContext: context,
    suggestions: [
      'Avoid crowded tourist places',
      'Focus more on street food and local markets',
      'Make Day 1 more relaxed'
    ]
  };
}

