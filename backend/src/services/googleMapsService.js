import { haversineDistanceKm, calculateTransitDuration } from '../algorithms/itineraryOptimizer.js';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export const isGoogleMapsConfigured = () => {
  return Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 10);
};

export async function searchPlaces(query, location = null) {
  if (!isGoogleMapsConfigured()) {
    // Return demonstration / simulated places response based on local dataset
    return {
      isDemoMode: true,
      query,
      results: [
        {
          placeId: 'demo_red_fort',
          name: 'Red Fort',
          formattedAddress: 'Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006',
          location: { lat: 28.6562, lng: 77.2410 },
          rating: 4.5,
          userRatingsTotal: 182400
        },
        {
          placeId: 'demo_humayun',
          name: "Humayun's Tomb",
          formattedAddress: 'Mathura Road, Nizamuddin East, New Delhi, Delhi 110013',
          location: { lat: 28.5933, lng: 77.2507 },
          rating: 4.6,
          userRatingsTotal: 94100
        },
        {
          placeId: 'demo_qutub',
          name: 'Qutub Minar',
          formattedAddress: 'Seth Sarai, Mehrauli, New Delhi, Delhi 110030',
          location: { lat: 28.5245, lng: 77.1855 },
          rating: 4.5,
          userRatingsTotal: 135800
        }
      ]
    };
  }

  // Real Google Places Text Search API
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    return {
      isDemoMode: false,
      results: (data.results || []).map(r => ({
        placeId: r.place_id,
        name: r.name,
        formattedAddress: r.formatted_address,
        location: r.geometry ? r.geometry.location : null,
        rating: r.rating,
        userRatingsTotal: r.user_ratings_total
      }))
    };
  } catch (err) {
    console.error('Google Places API error:', err);
    return { isDemoMode: true, error: err.message, results: [] };
  }
}

export async function calculateRoute(origin, destination, mode = 'DRIVE') {
  if (!isGoogleMapsConfigured()) {
    const dist = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
    const duration = calculateTransitDuration(dist, mode.toLowerCase());
    return {
      isDemoMode: true,
      distanceKm: dist,
      durationMinutes: duration,
      transportMode: mode,
      polyline: null,
      summary: `Simulated ${mode} route: ${dist} km, approx ${duration} mins`
    };
  }

  // Real Google Routes API v2
  try {
    const body = {
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode: mode
    };

    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    const route = data.routes?.[0];
    if (route) {
      const distKm = Math.round((route.distanceMeters / 1000) * 10) / 10;
      const durationSeconds = parseInt(route.duration.replace('s', ''), 10);
      return {
        isDemoMode: false,
        distanceKm: distKm,
        durationMinutes: Math.round(durationSeconds / 60),
        transportMode: mode,
        encodedPolyline: route.polyline?.encodedPolyline
      };
    }
  } catch (err) {
    console.error('Google Routes API error:', err);
  }

  // Fallback if API fails
  const dist = haversineDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
  return {
    isDemoMode: true,
    distanceKm: dist,
    durationMinutes: calculateTransitDuration(dist, 'cab'),
    transportMode: mode
  };
}
