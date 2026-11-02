import { searchPlaces, calculateRoute, isGoogleMapsConfigured } from '../services/googleMapsService.js';

export async function placesSearch(req, res) {
  try {
    const { query, location } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const data = await searchPlaces(query, location);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Places search failed.', isDemoMode: true });
  }
}

export async function routesCompute(req, res) {
  try {
    const { origin, destination, mode = 'DRIVE' } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required.' });
    }

    const data = await calculateRoute(origin, destination, mode);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Routes calculation failed.', isDemoMode: true });
  }
}

export function mapsStatus(req, res) {
  res.json({
    configured: isGoogleMapsConfigured(),
    message: isGoogleMapsConfigured()
      ? 'Google Maps API integration active.'
      : 'Demonstration mode active with verified coordinates.'
  });
}
