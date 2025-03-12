import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Configure with performance optimizations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'playfinder-uk',
    },
  },
  // Disable realtime subscriptions to improve performance
  realtime: {
    params: {
      eventsPerSecond: 0,
    },
  },
});

// Cache for frequently accessed data
const cache = new Map();

// Helper function to get data with caching
export const fetchWithCache = async (key: string, fetcher: () => Promise<any>, ttl = 60000) => {
  const cachedData = cache.get(key);
  
  if (cachedData && cachedData.timestamp > Date.now() - ttl) {
    return cachedData.data;
  }
  
  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.warn(`Cache fetch error for key ${key}:`, error);
    // Return cached data even if expired as fallback
    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
};

// Clear cache function
export const clearCache = (key?: string) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

// Mock data for development when Supabase connection fails
export const mockPlaygrounds: Database['public']['Tables']['playgrounds']['Row'][] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    name: "Funky Monkeys Play Centre",
    description: "Vibrant indoor play centre with multi-level soft play structure.",
    address: "123 Play Street",
    city: "London",
    postcode: "E1 6AN",
    phone: "020 1234 5678",
    email: "info@funkymonkeys.com",
    website: "https://www.example.com",
    google_rating: 4.7,
    google_reviews_count: 342,
    latitude: 51.5173,
    longitude: -0.0755,
    features: ["Soft Play", "Ball Pit", "Café", "Party Rooms"],
    opening_hours: {
      "Monday": "9:00-18:00",
      "Tuesday": "9:00-18:00",
      "Wednesday": "9:00-18:00",
      "Thursday": "9:00-18:00",
      "Friday": "9:00-19:00",
      "Saturday": "9:00-19:00",
      "Sunday": "10:00-18:00"
    },
    image_url: "https://images.unsplash.com/photo-1566454825481-9c31bd88c36f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 2,
    created_at: new Date().toISOString(),
    name: "Adventure World",
    description: "Exciting indoor playground with climbing walls and tube slides.",
    address: "45 Adventure Lane",
    city: "Manchester",
    postcode: "M4 1HQ",
    phone: "0161 987 6543",
    email: "hello@adventureworld.co.uk",
    website: "https://www.example.com",
    google_rating: 4.5,
    google_reviews_count: 287,
    latitude: 53.4808,
    longitude: -2.2426,
    features: ["Climbing Walls", "Slides", "Gaming Zone", "Café"],
    opening_hours: {
      "Monday": "10:00-18:00",
      "Tuesday": "10:00-18:00",
      "Wednesday": "10:00-18:00",
      "Thursday": "10:00-18:00",
      "Friday": "10:00-20:00",
      "Saturday": "9:00-20:00",
      "Sunday": "10:00-18:00"
    },
    image_url: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
  },
  {
    id: 3,
    created_at: new Date().toISOString(),
    name: "Jungle Jims",
    description: "Jungle-themed indoor play centre with slides and rope bridges.",
    address: "78 Jungle Road",
    city: "Birmingham",
    postcode: "B2 5DP",
    phone: "0121 345 6789",
    email: "enquiries@junglejims.com",
    website: "https://www.example.com",
    google_rating: 4.3,
    google_reviews_count: 198,
    latitude: 52.4862,
    longitude: -1.8904,
    features: ["Soft Play", "Ball Cannons", "Rope Bridges", "Café"],
    opening_hours: {
      "Monday": "9:30-17:30",
      "Tuesday": "9:30-17:30",
      "Wednesday": "9:30-17:30",
      "Thursday": "9:30-17:30",
      "Friday": "9:30-18:30",
      "Saturday": "9:00-18:30",
      "Sunday": "10:00-17:30"
    },
    image_url: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60"
  }
];

// Mock location data
export const mockLocationCounts = {
  "London": 12,
  "Manchester": 8,
  "Birmingham": 6,
  "Edinburgh": 4
};

// Improved error handling for Supabase queries
export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T
): Promise<{ data: T | null; error: any; usedFallback: boolean }> => {
  try {
    const result = await queryFn();
    
    // Check if there's an error in the response
    if (result.error) {
      console.warn('Supabase query error:', result.error);
      return { data: fallbackData, error: result.error, usedFallback: true };
    }
    
    return { data: result.data, error: null, usedFallback: false };
  } catch (error) {
    console.warn('Supabase query exception:', error);
    return { data: fallbackData, error, usedFallback: true };
  }
};
