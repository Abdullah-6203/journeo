export interface UserPreferences {
  travellerName: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  startingPoint: {
    lat: number;
    lng: number;
    address: string;
  };
  mustVisitSiteIds: string[];
  travelPace: 'relaxed' | 'balanced' | 'fast';
  transportMode: 'cab' | 'metro' | 'walking';
  focusInterests: string[];
  maxStops: number;
  accessibilityNeeds?: boolean;
}

export const JUDGES_DEMO_PREFERENCES: UserPreferences = {
  travellerName: 'Distinguished Evaluation Panel',
  startTime: '09:00',
  endTime: '17:30',
  startingPoint: {
    lat: 28.6328,
    lng: 77.2197,
    address: 'Connaught Place (Inner Circle), Central Delhi'
  },
  mustVisitSiteIds: ['red_fort', 'humayuns_tomb'],
  travelPace: 'balanced',
  transportMode: 'cab',
  focusInterests: ['Mughal Architecture', 'UNESCO World Heritage', 'Royal Citadels'],
  maxStops: 4,
  accessibilityNeeds: false
};
