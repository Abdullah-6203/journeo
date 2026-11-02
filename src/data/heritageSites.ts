export interface HeritageSite {
  id: string;
  name: string;
  city: string;
  location: {
    lat: number;
    lng: number;
  };
  verification: {
    verifiedBy: string;
    status: 'VERIFIED' | 'PENDING' | 'ASI_RECOGNIZED';
    citationNumber?: string;
  };
  timeRecommendedMinutes: number;
  period: string;
  architecturalStyle: string;
  description: string;
  image: string;
  mustVisit?: boolean;
  openingHours: string;
  ticketPriceINR: number;
  highlights: string[];
}

export const HERITAGE_SITES: HeritageSite[] = [
  {
    id: 'red_fort',
    name: 'Red Fort (Lal Qila)',
    city: 'Old Delhi',
    location: {
      lat: 28.6562,
      lng: 77.2410
    },
    verification: {
      verifiedBy: 'Archaeological Survey of India (ASI) & UNESCO World Heritage (2007)',
      status: 'VERIFIED',
      citationNumber: 'ASI-DL-ND-001 / UNESCO-WHS-231'
    },
    timeRecommendedMinutes: 120,
    period: 'Mughal Empire (1648 CE by Emperor Shah Jahan)',
    architecturalStyle: 'Indo-Islamic Red Sandstone Fortification',
    description: 'The crowning citadel of Shahjahanabad, housing the Diwan-i-Aam, Diwan-i-Khas, and the legendary peacock throne platform.',
    image: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=800&q=80',
    mustVisit: true,
    openingHours: '09:30 - 17:30 (Closed Mondays)',
    ticketPriceINR: 50,
    highlights: ['Lahori Gate', 'Diwan-i-Khas', 'Rang Mahal', 'Stream of Paradise (Nahr-i-Bihisht)']
  },
  {
    id: 'humayuns_tomb',
    name: "Humayun's Tomb (Maqbara-e-Humayun)",
    city: 'New Delhi',
    location: {
      lat: 28.5933,
      lng: 77.2507
    },
    verification: {
      verifiedBy: 'UNESCO World Heritage Centre (1993) & ASI',
      status: 'VERIFIED',
      citationNumber: 'UNESCO-479 / ASI-DL-SZ-012'
    },
    timeRecommendedMinutes: 90,
    period: 'Mughal Dynasty (1570 CE commissioned by Empress Bega Begum)',
    architecturalStyle: 'Geometric Charbagh Garden Tomb & Double Dome',
    description: 'The monumental precursor to the Taj Mahal, demonstrating high-Mughal symmetric garden aesthetics and red sandstone marble inlay.',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    mustVisit: true,
    openingHours: '06:00 - 18:00 (Open Daily)',
    ticketPriceINR: 40,
    highlights: ['Persian Double Dome', 'Charbagh Water Channels', "Barber's Tomb", 'Isa Khan Enclosure']
  },
  {
    id: 'qutub_minar',
    name: 'Qutub Minar & Monument Complex',
    city: 'South Delhi',
    location: {
      lat: 28.5245,
      lng: 77.1855
    },
    verification: {
      verifiedBy: 'UNESCO World Heritage (1993) & ASI',
      status: 'VERIFIED',
      citationNumber: 'UNESCO-WHS-664'
    },
    timeRecommendedMinutes: 80,
    period: 'Delhi Sultanate (1199 CE by Qutb-ud-din Aibak & Iltutmish)',
    architecturalStyle: 'Afghan-Early Indo-Islamic Fluted Masonry',
    description: "Towering 72.5-meter fluted minaret alongside the mysterious 1,600-year-old rust-resistant Gupta Iron Pillar.",
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    mustVisit: true,
    openingHours: '07:00 - 17:00 (Open Daily)',
    ticketPriceINR: 40,
    highlights: ['72.5m Tower', 'Iron Pillar of Delhi', 'Alai Darwaza', 'Quwwat-ul-Islam Mosque']
  },
  {
    id: 'jama_masjid',
    name: 'Jama Masjid (Masjid-i-Jahan-Numa)',
    city: 'Old Delhi',
    location: {
      lat: 28.6507,
      lng: 77.2334
    },
    verification: {
      verifiedBy: 'Archaeological Survey of India (ASI)',
      status: 'VERIFIED',
      citationNumber: 'ASI-DEL-CENTRAL-08'
    },
    timeRecommendedMinutes: 60,
    period: 'Mughal Empire (1656 CE by Shah Jahan)',
    architecturalStyle: 'Mughal White Marble & Red Sandstone Courtyard',
    description: 'One of the grandest mosques in the subcontinent, accommodating up to 25,000 worshippers across its elevated sandstone plinth.',
    image: 'https://images.unsplash.com/photo-1608958435020-e8a7109ba809?auto=format&fit=crop&w=800&q=80',
    mustVisit: false,
    openingHours: '07:00 - 12:00, 13:30 - 18:30',
    ticketPriceINR: 0,
    highlights: ['Eastern Imperial Gate', 'Twin 40m Minarets', 'Marble Striped Domes']
  },
  {
    id: 'safdarjung_tomb',
    name: 'Safdarjung Tomb',
    city: 'New Delhi',
    location: {
      lat: 28.5893,
      lng: 77.2106
    },
    verification: {
      verifiedBy: 'Archaeological Survey of India (ASI)',
      status: 'VERIFIED',
      citationNumber: 'ASI-DL-SW-044'
    },
    timeRecommendedMinutes: 60,
    period: 'Late Mughal (1754 CE for Nawab Safdarjung)',
    architecturalStyle: 'Late Mughal Enclosed Garden Mausoleum',
    description: 'The final garden tomb built in the twilight of the Mughal Empire, featuring high ornamental plaster arches and marble pavilions.',
    image: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=800&q=80',
    mustVisit: false,
    openingHours: '07:00 - 17:00 (Open Daily)',
    ticketPriceINR: 25,
    highlights: ['Charbagh Layout', 'Jangli Mahal', 'High Plinth Terrace', 'Cenotaph Chamber']
  },
  {
    id: 'india_gate',
    name: 'India Gate & Kartavya Path',
    city: 'Central New Delhi',
    location: {
      lat: 28.6129,
      lng: 77.2295
    },
    verification: {
      verifiedBy: 'Heritage Conservation Committee & ASI',
      status: 'VERIFIED',
      citationNumber: 'NDMC-HERITAGE-GRADE-1'
    },
    timeRecommendedMinutes: 45,
    period: 'Colonial Era (1931 CE by Sir Edwin Lutyens)',
    architecturalStyle: 'Triumphal Arch Sandstone Architecture',
    description: 'A 42-meter triumphal sandstone archway on the Rajpath axis honoring soldiers of World War I, framed by illuminated gardens.',
    image: 'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&w=800&q=80',
    mustVisit: false,
    openingHours: 'Open 24 Hours',
    ticketPriceINR: 0,
    highlights: ['Amar Jawan Jyoti', 'Canopy Memorial', 'Kartavya Path Boulevard']
  }
];
