import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase, mockPlaygrounds, safeSupabaseQuery } from '../lib/supabase';
import { Database } from '../types/supabase';
import SearchBar from '../components/SearchBar';
import PlaygroundCard from '../components/PlaygroundCard';
import Map from '../components/Map';
import { 
  MapPin, 
  List, 
  Grid, 
  Filter, 
  Clock,
  Check,
  Star
} from 'lucide-react';
import { createExcerpt } from '../utils/formatDescription';

type Playground = Database['public']['Tables']['playgrounds']['Row'];

const isUKPostcode = (postcode: string): boolean => {
  const regex = /^([A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$/;
  return regex.test(postcode.trim());
};

const geocodePostcode = async (postcode: string) => {
  const cleanPostcode = postcode.replace(/\s/g, '');
  const response = await fetch(`https://api.postcodes.io/postcodes/${cleanPostcode}`);
  if (!response.ok) throw new Error('Postcode not found');
  const data = await response.json();
  return {
    latitude: data.result.latitude,
    longitude: data.result.longitude
  };
};

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [playgrounds, setPlaygrounds] = useState<Playground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [useMockData, setUseMockData] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [openToday, setOpenToday] = useState(false);

  const keyword = searchParams.get('keyword') || '';
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';
  const radius = searchParams.get('radius') || '10';

  const getCurrentDay = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  useEffect(() => {
    const fetchPlaygrounds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase.from('playgrounds').select('*');

        if (keyword) {
          query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
        }

        if (location) {
          if (isUKPostcode(location)) {
            try {
              const { latitude, longitude } = await geocodePostcode(location);
              const radiusMeters = parseFloat(radius) * 1609.34;
              
              // Fixed spatial query using proper PostGIS syntax
              query = query
                .select()
                .filter(
                  'ST_DWithin',
                  'st_makepoint(longitude, latitude)::geography',
                  `st_makepoint(${longitude}, ${latitude})::geography`,
                  radiusMeters
                );
            } catch (err) {
              setError('Invalid postcode entered');
              setPlaygrounds(mockPlaygrounds);
              setUseMockData(true);
              return;
            }
          } else {
            query = query.or(`city.ilike.%${location}%,postcode.ilike.%${location}%`);
          }
        }

        if (category) {
          query = query.filter('features', 'cs', `{"${category}"}`);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        let filteredData = data || [];
        if (selectedFeatures.length > 0) {
          filteredData = filteredData.filter(item => 
            selectedFeatures.every(feat => item.features?.includes(feat))
        }
        if (selectedRatings.length > 0) {
          filteredData = filteredData.filter(item =>
            selectedRatings.some(r => Math.floor(item.google_rating || 0) === r)
        }
        if (openToday) {
          const today = getCurrentDay();
          filteredData = filteredData.filter(item => 
            item.opening_hours?.[today] !== 'Closed' && item.opening_hours?.[today])
        }

        if (filteredData.length === 0) {
          setError('No results found - showing sample data');
          setPlaygrounds(mockPlaygrounds);
          setUseMockData(true);
        } else {
          setPlaygrounds(filteredData);
          setUseMockData(false);
        }
      } catch (err) {
        console.error('Error fetching playgrounds:', err);
        setError('Failed to load soft play areas. Using sample data...');
        setPlaygrounds(mockPlaygrounds);
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaygrounds();
  }, [keyword, location, category, radius, selectedFeatures, selectedRatings, openToday]);

  // ... rest of the component remains unchanged ...
};

export default SearchResultsPage;
