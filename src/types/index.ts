export type WaterType = 'salt' | 'fresh' | 'brackish';
export type Season = 'forår' | 'sommer' | 'efterår' | 'vinter';
export type FootwearType = 'vaders' | 'gummistøvler' | 'sko';

export interface FishSpecies {
  id: string;
  name: string;
  latinName: string;
  emoji: string;
  waterType: WaterType;
  minSize: number; // cm - mindstemål
  seasons: Season[];
  bestMonths: number[]; // 1-12
  description: string;
  habitat: string;
  recommendedGear: GearRecommendation;
  isFredede?: boolean;
  fredetPeriod?: string;
  color: string; // tailwind color class
}

export interface GearRecommendation {
  rod: string;
  line: string;
  bait: string[];
  lures: string[];
  footwear: FootwearType[];
  tips: string;
}

export interface FishingSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  waterType: WaterType;
  fish: string[]; // fish species ids
  description: string;
  difficulty: 'let' | 'middel' | 'svær';
  amenities: string[];
  rating: number;
  footwear: FootwearType[];
}

export interface ProtectedZone {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number][];
  type: 'fredning' | 'skånezone' | 'fredet periode';
  activeMonths?: number[];
}

export interface CatchLog {
  id: string;
  userId: string;
  fishId: string;
  fishName: string;
  weight?: number; // kg
  length: number; // cm
  date: string;
  spotName: string;
  lat?: number;
  lng?: number;
  photo?: string;
  notes?: string;
  released: boolean;
}

export interface CommunityReport {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  fishId: string;
  fishName: string;
  fishEmoji: string;
  weight?: number;
  length: number;
  location: string;
  date: string;
  notes: string;
  likes: number;
  liked?: boolean;
}

export interface WeatherData {
  location: string;
  temp: number;
  windSpeed: number;
  windDir: string;
  waterTemp?: number;
  waveHeight?: number;
  condition: string;
  icon: string;
  humidity: number;
  pressure: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  catchCount: number;
  favoriteSpots: string[];
  hasFisketegn: boolean;
  fisketegnExpiry?: string;
  joinedDate: string;
}
