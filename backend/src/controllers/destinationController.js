import { prisma } from '../database/prisma.js';

export async function getDestinations(req, res) {
  try {
    const { city, category, search, tag } = req.query;

    const where = {};
    if (city) {
      where.city = { contains: city };
    }
    if (category && category !== 'All') {
      where.category = { contains: category };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } }
      ];
    }
    if (tag) {
      where.interestTags = { contains: tag };
    }

    const destinations = await prisma.destination.findMany({
      where,
      orderBy: [{ isMustVisit: 'desc' }, { name: 'asc' }]
    });

    const parsed = destinations.map(d => ({
      ...d,
      interestTags: JSON.parse(d.interestTags || '[]'),
      highlights: JSON.parse(d.highlights || '[]')
    }));

    res.json({ destinations: parsed, count: parsed.length });
  } catch (err) {
    console.error('getDestinations error:', err);
    res.status(500).json({ error: 'Failed to retrieve destinations.' });
  }
}

export async function getDestinationById(req, res) {
  try {
    const { id } = req.params;
    const dest = await prisma.destination.findUnique({
      where: { id }
    });

    if (!dest) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    // Retrieve similar destinations in same city or category
    const similar = await prisma.destination.findMany({
      where: {
        id: { not: id },
        OR: [
          { city: dest.city },
          { category: dest.category }
        ]
      },
      take: 4
    });

    res.json({
      destination: {
        ...dest,
        interestTags: JSON.parse(dest.interestTags || '[]'),
        highlights: JSON.parse(dest.highlights || '[]')
      },
      similarDestinations: similar.map(s => ({
        ...s,
        interestTags: JSON.parse(s.interestTags || '[]'),
        highlights: JSON.parse(s.highlights || '[]')
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve destination details.' });
  }
}

export async function getRecommendedDestinations(req, res) {
  try {
    const { city = 'Delhi' } = req.query;
    let preferredInterests = ['Historical Monuments', 'Ancient Architecture'];

    if (req.user) {
      const prefs = await prisma.userPreference.findUnique({ where: { userId: req.user.id } });
      if (prefs && prefs.interests) {
        preferredInterests = JSON.parse(prefs.interests);
      }
    }

    const destinations = await prisma.destination.findMany({
      where: { city: { contains: city } }
    });

    // Score based on matching interest tags and must-visit status
    const scored = destinations.map(d => {
      const tags = JSON.parse(d.interestTags || '[]');
      const matchCount = tags.filter(t => preferredInterests.includes(t)).length;
      let score = matchCount * 10;
      if (d.isMustVisit) score += 20;

      return {
        ...d,
        interestTags: tags,
        highlights: JSON.parse(d.highlights || '[]'),
        recommendationScore: score
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.json({ recommendations: scored });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve recommendations.' });
  }
}

export async function toggleSaveDestination(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.savedDestination.findUnique({
      where: {
        userId_destinationId: {
          userId,
          destinationId: id
        }
      }
    });

    if (existing) {
      await prisma.savedDestination.delete({
        where: { id: existing.id }
      });
      return res.json({ saved: false, message: 'Removed from saved destinations' });
    }

    await prisma.savedDestination.create({
      data: {
        userId,
        destinationId: id
      }
    });

    res.json({ saved: true, message: 'Saved to your destinations' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle save destination.' });
  }
}
