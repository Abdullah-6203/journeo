import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DELHI_DESTINATIONS = [
  {
    name: 'Red Fort (Lal Qila)',
    city: 'Delhi',
    description: 'Iconic Mughal fortress constructed under Emperor Shah Jahan in 1648, featuring massive red sandstone walls, ornamental pavilions, and the legendary Diwan-i-Khas.',
    historicalSignificance: 'Served as the main imperial residence of the Mughal dynasty for nearly 200 years. Site where India\'s Prime Minister hoists the national flag on Independence Day.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Photography']),
    latitude: 28.6562,
    longitude: 77.2410,
    averageVisitDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Archaeological Survey of India (ASI) & UNESCO World Heritage (2007)',
    googlePlaceId: 'ChIJz2xIeQ_6DDkRz_43E4Z1bQ0',
    openingHours: '09:30 - 17:30 (Closed Mondays)',
    entryFeeINR: 50,
    highlights: JSON.stringify(['Lahori Gate', 'Diwan-i-Aam', 'Diwan-i-Khas', 'Stream of Paradise (Nahr-i-Bihisht)', 'Rang Mahal']),
    isMustVisit: true
  },
  {
    name: "Humayun's Tomb (Maqbara-e-Humayun)",
    city: 'Delhi',
    description: 'Magnificent garden mausoleum of the second Mughal Emperor Humayun, commissioned by Empress Bega Begum in 1570. Pioneered the Charbagh geometric garden tomb style.',
    historicalSignificance: 'The first grand garden tomb on the Indian subcontinent, it directly inspired the architectural blueprint of the Taj Mahal nearly a century later.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Photography', 'Nature and Landscapes']),
    latitude: 28.5933,
    longitude: 77.2507,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'UNESCO World Heritage Centre (1993) & ASI',
    googlePlaceId: 'ChIJF03U94bhDDkROq7d3iEHz3k',
    openingHours: '06:00 - 18:00 (Open Daily)',
    entryFeeINR: 40,
    highlights: JSON.stringify(['Persian Double Dome', 'Charbagh Waterways', "Barber's Tomb", 'Isa Khan Niazi Mausoleum']),
    isMustVisit: true
  },
  {
    name: 'Qutub Minar & Archaeological Complex',
    city: 'Delhi',
    description: 'A soaring 72.5-meter tapering victory tower adorned with intricate Quranic inscriptions, surrounded by the 4th-century rust-resistant Gupta Iron Pillar and Quwwat-ul-Islam mosque.',
    historicalSignificance: 'Commenced in 1199 by Qutb-ud-din Aibak to mark Delhi Sultanate dominance. Represents the earliest surviving Indo-Islamic architectural ensemble.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Hidden Gems']),
    latitude: 28.5245,
    longitude: 77.1855,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'UNESCO World Heritage Centre (1993) & ASI',
    googlePlaceId: 'ChIJZ3U2VfzhDDkRVlZ4gJ8d76s',
    openingHours: '07:00 - 17:00 (Open Daily)',
    entryFeeINR: 40,
    highlights: JSON.stringify(['72.5m Fluted Minaret', 'Rustless Gupta Iron Pillar', 'Alai Darwaza', 'Tomb of Iltutmish']),
    isMustVisit: true
  },
  {
    name: 'Jama Masjid (Masjid-i-Jahan-Numa)',
    city: 'Delhi',
    description: 'One of India\'s largest and most magnificent mosques, constructed by Shah Jahan in 1656 with red sandstone, pure white marble stripes, and a vast 25,000-capacity courtyard.',
    historicalSignificance: 'Principal Friday mosque of the Mughal emperors, positioned atop a natural elevation overlooking Old Delhi\'s bustling bazaars.',
    category: 'Religious Heritage',
    interestTags: JSON.stringify(['Religious Heritage', 'Historical Monuments', 'Food and Local Culture']),
    latitude: 28.6507,
    longitude: 77.2334,
    averageVisitDuration: 60,
    imageUrl: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Archaeological Survey of India (ASI)',
    googlePlaceId: 'ChIJP-oA-mrhDDkRQx66-qP9dE4',
    openingHours: '07:00 - 12:00, 13:30 - 18:30 (Daily)',
    entryFeeINR: 0,
    highlights: JSON.stringify(['Imperial Eastern Gate', 'Twin 40m Minarets', 'Marble Striped Domes', 'Chandni Chowk Vista']),
    isMustVisit: false
  },
  {
    name: 'Purana Qila (Old Fort) & Lake',
    city: 'Delhi',
    description: 'Ancient citadel on the legendary site of Indraprastha, displaying rugged 16th-century ramparts raised by Sher Shah Suri and Mughal Emperor Humayun.',
    historicalSignificance: 'Archaeological excavations have uncovered PGW pottery dating back to the Mahabharata era (1000 BCE). Site of the Qila-i-Kuhna Mosque and Sher Mandal observatory.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Nature and Landscapes']),
    latitude: 28.6096,
    longitude: 77.2436,
    averageVisitDuration: 75,
    imageUrl: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Archaeological Survey of India (ASI)',
    googlePlaceId: 'ChIJ57e2O5fhDDkRIv1oR27o1w0',
    openingHours: '07:00 - 17:00 (Open Daily)',
    entryFeeINR: 25,
    highlights: JSON.stringify(['Qila-i-Kuhna Mosque', 'Sher Mandal Observatory', 'Bada Darwaza', 'Moat Lake']),
    isMustVisit: false
  },
  {
    name: 'Safdarjung Tomb',
    city: 'Delhi',
    description: 'The last enclosed garden tomb of the Mughal Empire, built in 1754 for Nawab Safdarjung. Features an ornate red sandstone and buff marble mausoleum framed by water channels.',
    historicalSignificance: 'Marks the architectural finale of the classical Mughal garden tomb tradition, transitioning into late Awadh baroque influences.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Photography', 'Nature and Landscapes']),
    latitude: 28.5893,
    longitude: 77.2106,
    averageVisitDuration: 60,
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Archaeological Survey of India (ASI)',
    googlePlaceId: 'ChIJa241gCzhDDkRJ4E9bH1L9w4',
    openingHours: '07:00 - 17:00 (Open Daily)',
    entryFeeINR: 25,
    highlights: JSON.stringify(['Jangli Mahal', 'Ornate Central Dome', 'Charbagh Waterways', 'Plinth Arches']),
    isMustVisit: false
  },
  {
    name: 'India Gate & Kartavya Path',
    city: 'Delhi',
    description: 'Imposing 42-meter triumphal sandstone arch designed by Sir Edwin Lutyens, commemorating 84,000 soldiers. Anchors the majestic ceremonial boulevard of New Delhi.',
    historicalSignificance: 'Dedicated in 1931, housing the eternal flame (Amar Jawan Jyoti) and the National War Memorial complex in its surrounding parklands.',
    category: 'Monument',
    interestTags: JSON.stringify(['Historical Monuments', 'Photography', 'Food and Local Culture']),
    latitude: 28.6129,
    longitude: 77.2295,
    averageVisitDuration: 45,
    imageUrl: 'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Central Vista & Heritage Conservation Committee',
    googlePlaceId: 'ChIJh2W53D7hDDkRD27i4P8b0iM',
    openingHours: 'Open 24 Hours (Best in evening)',
    entryFeeINR: 0,
    highlights: JSON.stringify(['Ceremonial Arch', 'Canopy Pavilion', 'Kartavya Path Walkways', 'National War Memorial']),
    isMustVisit: false
  },
  {
    name: 'National Museum, New Delhi',
    city: 'Delhi',
    description: 'Premier cultural repository of India preserving over 200,000 works of art spanning 5,000 years, including the Indus Valley Dancing Girl, sacred Buddhist relics, and Mughal miniature paintings.',
    historicalSignificance: 'Established in 1949, houses pivotal archaeological masterworks from Harappa, Mohenjo-daro, Maurya, Gupta, and Chola civilizations.',
    category: 'Museums',
    interestTags: JSON.stringify(['Museums', 'Ancient Architecture', 'Local Experiences']),
    latitude: 28.6119,
    longitude: 77.2193,
    averageVisitDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Ministry of Culture, Government of India',
    googlePlaceId: 'ChIJO5m9qSvhDDkRL4jD4b1k5xE',
    openingHours: '10:00 - 18:00 (Closed Mondays)',
    entryFeeINR: 20,
    highlights: JSON.stringify(['Indus Valley Harappan Gallery', 'Relics of Lord Buddha', 'Tanjore Art', 'Mughal Armor & Miniatures']),
    isMustVisit: false
  },
  {
    name: 'Agrasen ki Baoli',
    city: 'Delhi',
    description: 'Enigmatic 60-meter long by 15-meter wide historic stepwell with 108 stone steps plunging into the earth, nestled surprisingly amidst the high-rises of Connaught Place.',
    historicalSignificance: 'Believed to have been originally established by Maharaja Agrasen in the Mahabharata era and rebuilt in the 14th century Delhi Sultanate period.',
    category: 'Hidden Gems',
    interestTags: JSON.stringify(['Hidden Gems', 'Ancient Architecture', 'Photography']),
    latitude: 28.6258,
    longitude: 77.2250,
    averageVisitDuration: 45,
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Archaeological Survey of India (ASI)',
    googlePlaceId: 'ChIJw-t02kDhDDkRPtM_8rE3bQ4',
    openingHours: '09:00 - 17:30 (Open Daily)',
    entryFeeINR: 0,
    highlights: JSON.stringify(['108 Stone Steps', 'Triple-Tiered Archways', 'Stepwell Reservoir Shaft', 'Gothic Acoustics']),
    isMustVisit: false
  },
  {
    name: 'Lodhi Garden (Bagh-e-Judi)',
    city: 'Delhi',
    description: 'Serene 90-acre lush botanical heritage park containing the 15th-century mausoleums of Mohammed Shah and Sikandar Lodi, Shisha Gumbad, and Bara Gumbad.',
    historicalSignificance: 'Preserves the rare octagonal architectural style of the Sayyid and Lodi dynasties, serving as a sanctuary for heritage walks and native birdlife.',
    category: 'Nature',
    interestTags: JSON.stringify(['Nature and Landscapes', 'Historical Monuments', 'Photography', 'Local Experiences']),
    latitude: 28.5931,
    longitude: 77.2197,
    averageVisitDuration: 75,
    imageUrl: 'https://images.unsplash.com/photo-1598324789694-87431e78c558?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Archaeological Survey of India (ASI) & NDMC',
    googlePlaceId: 'ChIJW3P28wjhDDkRXn6Y5j0X-3Q',
    openingHours: '06:00 - 20:00 (Open Daily)',
    entryFeeINR: 0,
    highlights: JSON.stringify(['Bara Gumbad', 'Shisha Gumbad (Glazed Dome)', 'Athpula Eight-Pier Bridge', 'National Bonsai Park']),
    isMustVisit: false
  }
];

// Additional popular destinations for exploration cards
const POPULAR_DESTINATIONS = [
  {
    name: 'Amer Fort & Palace Complex',
    city: 'Jaipur',
    description: 'Majestic hilltop fortress overlooking Maota Lake, showcasing Rajput architecture, Sheesh Mahal (Mirror Palace), and courtyards crafted from pale yellow sandstone and marble.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Photography']),
    latitude: 26.9855,
    longitude: 75.8513,
    averageVisitDuration: 150,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'UNESCO World Heritage (Hill Forts of Rajasthan)',
    openingHours: '08:00 - 17:30',
    entryFeeINR: 100,
    highlights: JSON.stringify(['Sheesh Mahal', 'Ganesh Pol', 'Sukh Niwas', 'Maota Lake Vista']),
    isMustVisit: true
  },
  {
    name: 'Taj Mahal & Mehtab Bagh',
    city: 'Agra',
    description: 'The sublime white marble mausoleum built on the southern bank of the Yamuna River by Shah Jahan for Mumtaz Mahal. The pinnacle of Mughal art and architecture.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Photography']),
    latitude: 27.1751,
    longitude: 78.0421,
    averageVisitDuration: 180,
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'UNESCO World Heritage Centre & ASI',
    openingHours: 'Sunrise to Sunset (Closed Fridays)',
    entryFeeINR: 50,
    highlights: JSON.stringify(['Pietra Dura Inlay', 'Charbagh Reflection Pool', 'Yamuna River Terrace', 'Mehtab Bagh Moonlight']),
    isMustVisit: true
  },
  {
    name: 'Dashashwamedh Ghat & River Ganga',
    city: 'Varanasi',
    description: 'The main and most spectacular river ghat on the sacred Ganges, where spiritual evening Ganga Aarti rituals have unfolded for centuries under brass lamp ceremonies.',
    category: 'Religious Heritage',
    interestTags: JSON.stringify(['Religious Heritage', 'Local Experiences', 'Food and Local Culture']),
    latitude: 25.3076,
    longitude: 83.0107,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'UP Tourism Heritage & Varanasi Nagar Nigam',
    openingHours: 'Open 24 Hours (Aarti at 18:30)',
    entryFeeINR: 0,
    highlights: JSON.stringify(['Grand Evening Ganga Aarti', 'Sunrise Boat Ride', 'Ancient Riverside Palaces', 'Old City Gali Walks']),
    isMustVisit: true
  },
  {
    name: 'City Palace & Lake Pichola',
    city: 'Udaipur',
    description: 'Flamboyant palace complex perched on the banks of Lake Pichola, fusing Rajasthani and Mughal architectural styles across 11 majestic palaces and peacock courtyards.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Photography']),
    latitude: 24.5764,
    longitude: 73.6835,
    averageVisitDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'Maharana of Mewar Charitable Foundation',
    openingHours: '09:30 - 17:30',
    entryFeeINR: 300,
    highlights: JSON.stringify(['Mor Chowk (Peacock Courtyard)', 'Badi Mahal Garden', 'Lake Pichola Boat Cruise', 'Zenana Mahal']),
    isMustVisit: true
  },
  {
    name: 'Virupaksha Temple & Vijayanagara Ruins',
    city: 'Hampi',
    description: 'The ancient capital of the Vijayanagara Empire situated amidst boulder-strewn hills and the Tungabhadra River, renowned for the musical Stone Chariot of Vittala.',
    category: 'Heritage',
    interestTags: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Adventure']),
    latitude: 15.3350,
    longitude: 76.4600,
    averageVisitDuration: 180,
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010e42f9b8b?auto=format&fit=crop&w=1200&q=80',
    officialSource: 'UNESCO World Heritage & ASI',
    openingHours: '06:00 - 18:00',
    entryFeeINR: 40,
    highlights: JSON.stringify(['Vittala Musical Stone Chariot', 'Virupaksha Gopuram', 'Lotus Mahal', 'Hemakuta Hill Sunset']),
    isMustVisit: true
  }
];

async function seed() {
  console.log('🌱 Seeding Journeo Database...');

  // 1. Seed Destinations
  await prisma.itineraryStop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.savedDestination.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();
  await prisma.destination.deleteMany();

  console.log('Cleared existing records.');

  const allDestinations = [...DELHI_DESTINATIONS, ...POPULAR_DESTINATIONS];
  for (const dest of allDestinations) {
    await prisma.destination.create({
      data: dest
    });
  }
  console.log(`✅ Seeded ${allDestinations.length} verified destinations.`);

  // 2. Seed Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      name: 'Aditi Sharma',
      email: 'demo@journeo.com',
      passwordHash,
      preferences: {
        create: {
          interests: JSON.stringify(['Historical Monuments', 'Ancient Architecture', 'Photography']),
          travelStyle: 'balanced',
          budgetPreference: 'medium',
          transportPreference: 'cab',
          idealExperience: 'I love immersive historical landmarks, unhurried cultural walks, and verified heritage stories.'
        }
      }
    }
  });
  console.log(`✅ Seeded Demo User: ${demoUser.email} (Password: Password123!)`);

  // 3. Seed Sample Trip with Stops
  const redFort = await prisma.destination.findFirst({ where: { name: { contains: 'Red Fort' } } });
  const jamaMasjid = await prisma.destination.findFirst({ where: { name: { contains: 'Jama Masjid' } } });
  const humayun = await prisma.destination.findFirst({ where: { name: { contains: 'Humayun' } } });
  const qutub = await prisma.destination.findFirst({ where: { name: { contains: 'Qutub' } } });

  if (redFort && humayun && qutub && jamaMasjid) {
    const sampleTrip = await prisma.trip.create({
      data: {
        userId: demoUser.id,
        title: 'Imperial Delhi Royal Heritage Circuit',
        destinationCity: 'Delhi',
        startDate: '2026-11-10',
        endDate: '2026-11-10',
        startingLocation: 'Connaught Place, Central Delhi',
        budget: 2500,
        groupSize: 2,
        transportation: 'cab',
        travelStyle: 'balanced',
        status: 'UPCOMING',
        optimizationScore: 96,
        totalDistanceKm: 21.4,
        totalDurationMin: 435,
        stops: {
          create: [
            {
              destinationId: redFort.id,
              sequenceNumber: 1,
              plannedArrival: '09:20',
              plannedDeparture: '11:20',
              visitDuration: 120,
              visitStatus: 'PENDING',
              isMustVisit: true,
              transitInstruction: 'Depart Connaught Place • 3.5 km (18 min cab ride)',
              transitMinutes: 18,
              distanceFromPrevKm: 3.5
            },
            {
              destinationId: jamaMasjid.id,
              sequenceNumber: 2,
              plannedArrival: '11:35',
              plannedDeparture: '12:35',
              visitDuration: 60,
              visitStatus: 'PENDING',
              isMustVisit: false,
              transitInstruction: 'Short transit from Red Fort • 1.2 km (12 min walk/rickshaw)',
              transitMinutes: 12,
              distanceFromPrevKm: 1.2
            },
            {
              destinationId: humayun.id,
              sequenceNumber: 3,
              plannedArrival: '13:00',
              plannedDeparture: '14:30',
              visitDuration: 90,
              visitStatus: 'PENDING',
              isMustVisit: true,
              transitInstruction: 'Drive via Mathura Road • 6.8 km (25 min cab ride)',
              transitMinutes: 25,
              distanceFromPrevKm: 6.8
            },
            {
              destinationId: qutub.id,
              sequenceNumber: 4,
              plannedArrival: '15:05',
              plannedDeparture: '16:35',
              visitDuration: 90,
              visitStatus: 'PENDING',
              isMustVisit: true,
              transitInstruction: 'Express transit via Aurobindo Marg • 9.9 km (35 min drive)',
              transitMinutes: 35,
              distanceFromPrevKm: 9.9
            }
          ]
        }
      }
    });

    console.log(`✅ Seeded Sample Trip ID: ${sampleTrip.id}`);
  }

  console.log('🎉 Database seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
