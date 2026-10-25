'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LocationItem {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  address: string;
  phone?: string | null;
  isHomeCollectionAvailable: boolean;
  isCenterVisitAvailable: boolean;
}

interface LocationContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedLocation: LocationItem | null;
  locations: LocationItem[];
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<string>('Delhi NCR');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hp_selected_city');
      if (saved) {
        setSelectedCityState(saved);
      }
    } catch {
      // ignore
    }

    async function loadLocations() {
      try {
        const res = await fetch('/api/locations');
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
        }
      } catch {
        // fallback
      } finally {
        setIsLoading(false);
      }
    }

    loadLocations();
  }, []);

  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    try {
      localStorage.setItem('hp_selected_city', city);
    } catch {
      // ignore
    }
  };

  const selectedLocation =
    locations.find((l) => l.city.toLowerCase() === selectedCity.toLowerCase()) ||
    locations[0] ||
    null;

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        selectedLocation,
        locations,
        isLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
