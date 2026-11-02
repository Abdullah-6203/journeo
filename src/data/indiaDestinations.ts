export interface IndiaDestination {
  id: string;
  name: string;
  city: string;
  state: string;
  category: 'Heritage' | 'Nature' | 'Spiritual' | 'Culture' | 'Food' | 'Shopping' | 'Adventure';
  description: string;
  historicalSignificance?: string;
  interestTags: string[];
  latitude: number;
  longitude: number;
  averageVisitDuration: number; // in minutes
  imageUrl: string;
  officialSource?: string;
  openingHours: string;
  entryFeeINR: number;
  highlights: string[];
  isMustVisit: boolean;
}

export const INDIA_DESTINATIONS: IndiaDestination[] = [
  // --- DELHI ---
  {
    id: 'delhi_red_fort',
    name: 'Red Fort (Lal Qila)',
    city: 'Delhi',
    state: 'Delhi',
    category: 'Heritage',
    description: 'Iconic Mughal fortress constructed under Emperor Shah Jahan in 1648, featuring massive red sandstone walls, ornamental pavilions, and the legendary Diwan-i-Khas.',
    historicalSignificance: 'Main imperial residence of the Mughal dynasty for two centuries.',
    interestTags: ['Historical Monuments', 'Ancient Architecture', 'Photography'],
    latitude: 28.6562,
    longitude: 77.2410,
    averageVisitDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=800&q=80',
    officialSource: 'Archaeological Survey of India (ASI) & UNESCO World Heritage (2007)',
    openingHours: '09:30 - 17:30 (Closed Mon)',
    entryFeeINR: 50,
    highlights: ['Lahori Gate', 'Diwan-i-Khas', 'Rang Mahal', 'Stream of Paradise'],
    isMustVisit: true
  },
  {
    id: 'delhi_humayun_tomb',
    name: "Humayun's Tomb",
    city: 'Delhi',
    state: 'Delhi',
    category: 'Heritage',
    description: 'Magnificent garden mausoleum of Emperor Humayun, demonstrating symmetrical Charbagh water canals and double Persian domes.',
    historicalSignificance: 'First grand garden tomb in India; architectural precursor to the Taj Mahal.',
    interestTags: ['Historical Monuments', 'Ancient Architecture', 'Nature and Landscapes'],
    latitude: 28.5933,
    longitude: 77.2507,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    officialSource: 'UNESCO World Heritage Centre (1993) & ASI',
    openingHours: '06:00 - 18:00 (Open Daily)',
    entryFeeINR: 40,
    highlights: ['Persian Double Dome', 'Charbagh Waterways', 'Isa Khan Enclosure'],
    isMustVisit: true
  },
  {
    id: 'delhi_qutub_minar',
    name: 'Qutub Minar & Archaeological Complex',
    city: 'Delhi',
    state: 'Delhi',
    category: 'Heritage',
    description: 'A soaring 72.5-meter fluted minaret beside the mysterious 1,600-year-old rust-resistant Gupta Iron Pillar and Quwwat-ul-Islam mosque.',
    historicalSignificance: 'Erected in 1199 CE; earliest surviving Indo-Islamic monument complex in Delhi.',
    interestTags: ['Historical Monuments', 'Ancient Architecture', 'Hidden Gems'],
    latitude: 28.5245,
    longitude: 77.1855,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    officialSource: 'UNESCO World Heritage Centre (1993) & ASI',
    openingHours: '07:00 - 17:00 (Open Daily)',
    entryFeeINR: 40,
    highlights: ['72.5m Tower', 'Rustless Iron Pillar', 'Alai Darwaza'],
    isMustVisit: true
  },
  {
    id: 'delhi_chandni_chowk',
    name: 'Chandni Chowk Culinary & Spice Bazaars',
    city: 'Delhi',
    state: 'Delhi',
    category: 'Food',
    description: 'Historic 17th-century marketplace bustling with famed street food alleys like Paranthe Wali Gali, sweet shops, and Asia’s largest spice market at Khari Baoli.',
    interestTags: ['Food and Local Culture', 'Local Experiences', 'Shopping'],
    latitude: 28.6506,
    longitude: 77.2303,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
    openingHours: '10:00 - 20:00 (Closed Sun)',
    entryFeeINR: 0,
    highlights: ['Paranthe Wali Gali', 'Khari Baoli Spice Market', 'Jalebi Wala', 'Old Havelis'],
    isMustVisit: false
  },

  // --- JAIPUR ---
  {
    id: 'jaipur_amber_fort',
    name: 'Amber Palace & Jaigarh Fort',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    description: 'A hillside fort-palace constructed of pale yellow and pink sandstone, celebrated for the glittering Sheesh Mahal (Mirror Palace) and panoramic Maota Lake.',
    historicalSignificance: 'Principal seat of the Kachhwaha Rajputs before founding Jaipur.',
    interestTags: ['Historical Monuments', 'Ancient Architecture', 'Photography'],
    latitude: 26.9855,
    longitude: 75.8513,
    averageVisitDuration: 150,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    officialSource: 'UNESCO World Heritage (Hill Forts of Rajasthan) & ASI',
    openingHours: '08:00 - 17:30, 18:30 - 21:15',
    entryFeeINR: 100,
    highlights: ['Sheesh Mahal', 'Ganesh Pol', 'Sila Devi Temple', 'Maota Lake View'],
    isMustVisit: true
  },
  {
    id: 'jaipur_hawa_mahal',
    name: 'Hawa Mahal (Palace of Winds)',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    description: 'Iconic five-story pink sandstone honeycomb facade with 953 intricate jharokha windows built to allow royal women to observe street processions unseen.',
    interestTags: ['Historical Monuments', 'Ancient Architecture', 'Photography'],
    latitude: 26.9239,
    longitude: 75.8267,
    averageVisitDuration: 60,
    imageUrl: 'https://images.unsplash.com/photo-1609137144822-4467c6999244?auto=format&fit=crop&w=800&q=80',
    officialSource: 'Archaeological Survey of Rajasthan',
    openingHours: '09:00 - 17:00 (Open Daily)',
    entryFeeINR: 50,
    highlights: ['953 Jharokhas', 'Wind Chamber', 'Rooftop City Panorama'],
    isMustVisit: true
  },
  {
    id: 'jaipur_bapu_bazar',
    name: 'Bapu & Johari Bazaars',
    city: 'Jaipur',
    state: 'Rajasthan',
    category: 'Shopping',
    description: 'Traditional pink-painted market arcade famous for hand-crafted juttis, bandhani textiles, block-printed linens, and gemstones.',
    interestTags: ['Shopping', 'Local Experiences', 'Food and Local Culture'],
    latitude: 26.9189,
    longitude: 75.8242,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    openingHours: '10:30 - 20:30',
    entryFeeINR: 0,
    highlights: ['Bandhani Dupattas', 'Handmade Mojaris', 'Kundan Jewelry'],
    isMustVisit: false
  },

  // --- AGRA ---
  {
    id: 'agra_taj_mahal',
    name: 'Taj Mahal',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Heritage',
    description: 'The world-renowned white marble mausoleum commissioned in 1631 by Mughal Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal.',
    historicalSignificance: 'Crown jewel of Indo-Islamic architecture and UNESCO World Heritage icon.',
    interestTags: ['Historical Monuments', 'Ancient Architecture', 'Photography'],
    latitude: 27.1751,
    longitude: 78.0421,
    averageVisitDuration: 150,
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    officialSource: 'UNESCO World Heritage Centre & ASI',
    openingHours: 'Sunrise to Sunset (Closed Fridays)',
    entryFeeINR: 50,
    highlights: ['Marble Inlay (Pietra Dura)', 'Yamuna Riverbank', 'Mehtab Bagh Axis'],
    isMustVisit: true
  },
  {
    id: 'agra_fort',
    name: 'Agra Fort',
    city: 'Agra',
    state: 'Uttar Pradesh',
    category: 'Heritage',
    description: 'Massive crescent-shaped red sandstone imperial fortress housing marble palaces, the Jahangiri Mahal, and the Musamman Burj where Shah Jahan was imprisoned.',
    interestTags: ['Historical Monuments', 'Ancient Architecture'],
    latitude: 27.1795,
    longitude: 78.0211,
    averageVisitDuration: 100,
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=800&q=80',
    officialSource: 'UNESCO World Heritage (1983) & ASI',
    openingHours: '06:00 - 18:00 (Open Daily)',
    entryFeeINR: 50,
    highlights: ['Sheesh Mahal', 'Khas Mahal', 'Musamman Burj'],
    isMustVisit: true
  },

  // --- UDAIPUR ---
  {
    id: 'udaipur_city_palace',
    name: 'Udaipur City Palace & Lake Pichola',
    city: 'Udaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    description: 'Sprawling palace complex built over 400 years on the eastern banks of Lake Pichola, fusing Rajasthani and Mughal architectural splendors with vibrant mirror mosaics.',
    interestTags: ['Historical Monuments', 'Nature and Landscapes', 'Photography'],
    latitude: 24.5764,
    longitude: 73.6835,
    averageVisitDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80',
    officialSource: 'City Palace Museum Trust',
    openingHours: '09:30 - 17:30',
    entryFeeINR: 300,
    highlights: ['Mor Chowk Peacocks', 'Sheesh Mahal', 'Lake Pichola Boat Cruise'],
    isMustVisit: true
  },

  // --- VARANASI ---
  {
    id: 'varanasi_dashashwamedh',
    name: 'Dashashwamedh Ghat & Evening Ganga Aarti',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Spiritual',
    description: 'The vibrant spiritual heart of Kashi along the sacred river Ganges, famous for the daily dusk Ganga Aarti featuring synchronized fire lamps, chants, and incense.',
    interestTags: ['Religious Heritage', 'Local Experiences', 'Photography'],
    latitude: 25.3076,
    longitude: 83.0107,
    averageVisitDuration: 90,
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    openingHours: 'Open 24 Hours (Aarti starts 18:30)',
    entryFeeINR: 0,
    highlights: ['Grand Ganga Aarti', 'Sunrise Boat Ride', 'Ancient River Ghats'],
    isMustVisit: true
  },

  // --- MUMBAI ---
  {
    id: 'mumbai_gateway',
    name: 'Gateway of India & Colaba Causeway',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'Heritage',
    description: 'Historic basalt triumphal arch built in 1924 overlooking the Arabian Sea, flanked by the historic Taj Mahal Palace hotel and the bohemian Colaba shopping strip.',
    interestTags: ['Historical Monuments', 'Food and Local Culture', 'Shopping'],
    latitude: 18.9220,
    longitude: 72.8347,
    averageVisitDuration: 75,
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    officialSource: 'Archaeological Survey of India',
    openingHours: 'Open 24 Hours',
    entryFeeINR: 0,
    highlights: ['Harbour Promenade', 'Elephanta Ferry', 'Taj Mahal Palace View', 'Street Cafes'],
    isMustVisit: true
  },

  // --- GOA ---
  {
    id: 'goa_palolem',
    name: 'Palolem Beach & Agonda Coastal Escapes',
    city: 'Goa',
    state: 'Goa',
    category: 'Nature',
    description: 'Crescent-shaped golden sand beach framed by coconut groves, known for dolphin boat trips, calm swimming waters, and cliffside seafood shacks.',
    interestTags: ['Nature and Landscapes', 'Food and Local Culture', 'Adventure'],
    latitude: 15.0100,
    longitude: 74.0232,
    averageVisitDuration: 180,
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    openingHours: 'Open 24 Hours',
    entryFeeINR: 0,
    highlights: ['Kayaking in Backwaters', 'Sunset Shacks', 'Dolphin Watching'],
    isMustVisit: true
  },

  // --- AMRITSAR ---
  {
    id: 'amritsar_golden_temple',
    name: 'Harmandir Sahib (The Golden Temple)',
    city: 'Amritsar',
    state: 'Punjab',
    category: 'Spiritual',
    description: 'The holiest shrine of Sikhism, bathed in real gold leaf and surrounded by the sacred Amrit Sarovar lake. Renowned for serving over 100,000 free meals daily at its community kitchen (Langar).',
    interestTags: ['Religious Heritage', 'Local Experiences', 'Food and Local Culture'],
    latitude: 31.6200,
    longitude: 74.8765,
    averageVisitDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=800&q=80',
    officialSource: 'Shiromani Gurdwara Parbandhak Committee (SGPC)',
    openingHours: 'Open 24 Hours',
    entryFeeINR: 0,
    highlights: ['Golden Sanctum', 'Amrit Sarovar Walk', 'Mega Langar Kitchen', 'Night Palki Sahib'],
    isMustVisit: true
  },

  // --- RISHIKESH ---
  {
    id: 'rishikesh_triveni',
    name: 'Triveni Ghat & White-Water Rafting Point',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    category: 'Adventure',
    description: 'The world capital of Yoga perched where the emerald Ganga emerges from Himalayan foothills; offers thrilling river rafting, cliff jumping, and spiritual evening maha aartis.',
    interestTags: ['Adventure', 'Nature and Landscapes', 'Religious Heritage'],
    latitude: 30.1065,
    longitude: 78.2936,
    averageVisitDuration: 150,
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f443b794?auto=format&fit=crop&w=800&q=80',
    openingHours: 'Open 24 Hours (Rafting 08:00 - 16:00)',
    entryFeeINR: 0,
    highlights: ['Ganga River Rafting', 'Lakshman Jhula Vistas', 'Evening Fire Aarti'],
    isMustVisit: true
  },

  // --- KOCHI ---
  {
    id: 'kochi_fort',
    name: 'Fort Kochi & Chinese Fishing Nets',
    city: 'Kochi',
    state: 'Kerala',
    category: 'Culture',
    description: 'Historic colonial seaside quarter blending Portuguese, Dutch, and British merchant houses with giant cantilevered Chinese fishing nets and spice warehouses.',
    interestTags: ['Culture', 'Historical Monuments', 'Food and Local Culture'],
    latitude: 9.9656,
    longitude: 76.2421,
    averageVisitDuration: 120,
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    openingHours: 'Open 24 Hours',
    entryFeeINR: 0,
    highlights: ['Cheena Vala Fishing Nets', 'St. Francis Church', 'Jew Town & Mattancherry'],
    isMustVisit: true
  }
];

export const AVAILABLE_CITIES = [
  'Delhi',
  'Jaipur',
  'Agra',
  'Udaipur',
  'Varanasi',
  'Mumbai',
  'Goa',
  'Amritsar',
  'Rishikesh',
  'Kochi'
];

