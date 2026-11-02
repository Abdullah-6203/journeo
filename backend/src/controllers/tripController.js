import { prisma } from '../database/prisma.js';

export async function createTrip(req, res) {
  try {
    const {
      title,
      destinationCity = 'Delhi',
      startDate,
      endDate,
      startingLocation,
      budget,
      groupSize = 1,
      transportation = 'cab',
      travelStyle = 'balanced',
      status = 'UPCOMING',
      optimizationScore = 95,
      totalDistanceKm = 0,
      totalDurationMin = 0,
      stops = []
    } = req.body;

    const userId = req.user.id;

    const newTrip = await prisma.trip.create({
      data: {
        userId,
        title: title || `${destinationCity} Personalized Journey`,
        destinationCity,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0],
        startingLocation: typeof startingLocation === 'object' ? startingLocation.address : startingLocation,
        budget: budget ? Number(budget) : null,
        groupSize: Number(groupSize) || 1,
        transportation,
        travelStyle,
        status,
        optimizationScore: Number(optimizationScore) || 95,
        totalDistanceKm: Number(totalDistanceKm) || 0,
        totalDurationMin: Number(totalDurationMin) || 0,
        stops: {
          create: stops.map((s, idx) => ({
            destinationId: s.destinationId || s.destination?.id,
            sequenceNumber: idx + 1,
            plannedArrival: s.plannedArrival || '09:30',
            plannedDeparture: s.plannedDeparture || '11:30',
            visitDuration: Number(s.visitDuration) || 90,
            visitStatus: s.visitStatus || 'PENDING',
            isMustVisit: Boolean(s.isMustVisit),
            transitInstruction: s.transitInstruction || '',
            transitMinutes: Number(s.transitMinutes) || 15,
            distanceFromPrevKm: Number(s.distanceFromPrevKm) || 3.0
          }))
        }
      },
      include: {
        stops: {
          include: { destination: true },
          orderBy: { sequenceNumber: 'asc' }
        }
      }
    });

    res.status(201).json({ message: 'Trip saved successfully.', trip: newTrip });
  } catch (err) {
    console.error('createTrip error:', err);
    res.status(500).json({ error: 'Failed to save trip to database.' });
  }
}

export async function getTrips(req, res) {
  try {
    const userId = req.user.id;
    const trips = await prisma.trip.findMany({
      where: { userId },
      include: {
        stops: {
          include: { destination: true },
          orderBy: { sequenceNumber: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const upcoming = trips.filter(t => t.status === 'UPCOMING');
    const ongoing = trips.filter(t => t.status === 'ONGOING');
    const completed = trips.filter(t => t.status === 'COMPLETED');

    res.json({
      all: trips,
      categorized: {
        upcoming,
        ongoing,
        completed
      },
      total: trips.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve trips.' });
  }
}

export async function getTripById(req, res) {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: {
          include: { destination: true },
          orderBy: { sequenceNumber: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json({ trip });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve trip.' });
  }
}

export async function updateTrip(req, res) {
  try {
    const { id } = req.params;
    const { title, status, budget, notes } = req.body;

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(budget !== undefined && { budget: Number(budget) })
      },
      include: {
        stops: {
          include: { destination: true },
          orderBy: { sequenceNumber: 'asc' }
        }
      }
    });

    res.json({ message: 'Trip updated.', trip: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip.' });
  }
}

export async function deleteTrip(req, res) {
  try {
    const { id } = req.params;
    await prisma.trip.delete({ where: { id } });
    res.json({ message: 'Trip deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
}
