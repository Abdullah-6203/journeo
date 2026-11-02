import { prisma } from '../database/prisma.js';
import { parseNaturalLanguagePreferences } from '../services/aiService.js';

export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        preferences: true,
        trips: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { stops: { include: { destination: true } } }
        },
        savedDestinations: {
          include: { destination: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile data.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      include: { preferences: true }
    });

    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}

export async function updatePreferences(req, res) {
  try {
    const { interests, travelStyle, budgetPreference, transportPreference, idealExperience } = req.body;

    let finalInterests = interests;
    let finalStyle = travelStyle;
    let finalTransport = transportPreference;

    // If natural language input provided, optionally interpret with AI service
    if (idealExperience && (!interests || interests.length === 0)) {
      const parsed = await parseNaturalLanguagePreferences(idealExperience);
      finalInterests = parsed.extractedInterests;
      finalStyle = parsed.travelStyle;
      finalTransport = parsed.transportPreference;
    }

    const interestsJson = typeof finalInterests === 'string' ? finalInterests : JSON.stringify(finalInterests || []);

    const updated = await prisma.userPreference.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        interests: interestsJson,
        travelStyle: finalStyle || 'balanced',
        budgetPreference: budgetPreference || 'medium',
        transportPreference: finalTransport || 'cab',
        idealExperience
      },
      update: {
        interests: interestsJson,
        travelStyle: finalStyle,
        budgetPreference,
        transportPreference: finalTransport,
        idealExperience
      }
    });

    res.json({ message: 'Preferences updated successfully', preferences: updated });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ error: 'Failed to save travel preferences.' });
  }
}
