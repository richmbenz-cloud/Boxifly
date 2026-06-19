import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  region: string | null;
  loading: boolean;
  error: string | null;
}

interface DeliveryEstimate {
  days: string;
  expressAvailable: boolean;
  pickupAvailable: boolean;
  nearestStore: string | null;
}

// Mock delivery times based on major cities
const DELIVERY_TIMES: Record<string, DeliveryEstimate> = {
  'Lima': { days: '24-48h', expressAvailable: true, pickupAvailable: true, nearestStore: 'Boxifly Lima Centro' },
  'Arequipa': { days: '2-3 días', expressAvailable: false, pickupAvailable: true, nearestStore: 'Boxifly Arequipa' },
  'Trujillo': { days: '2-3 días', expressAvailable: false, pickupAvailable: true, nearestStore: 'Boxifly Trujillo' },
  'Cusco': { days: '2-3 días', expressAvailable: false, pickupAvailable: true, nearestStore: 'Boxifly Cusco' },
  'Chiclayo': { days: '3-4 días', expressAvailable: false, pickupAvailable: false, nearestStore: 'Boxifly Trujillo' },
  'Piura': { days: '3-5 días', expressAvailable: false, pickupAvailable: false, nearestStore: 'Boxifly Trujillo' },
  'default': { days: '3-5 días', expressAvailable: false, pickupAvailable: false, nearestStore: null }
};

export function useGeolocation() {
  const { toast } = useToast();
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    city: null,
    region: null,
    loading: false,
    error: null,
  });

  const getDeliveryEstimate = useCallback((city: string | null): DeliveryEstimate => {
    if (!city) return DELIVERY_TIMES['default'];
    
    // Check for exact match first
    if (DELIVERY_TIMES[city]) {
      return DELIVERY_TIMES[city];
    }
    
    // Check if city name contains any of the major cities
    const majorCity = Object.keys(DELIVERY_TIMES).find(key => 
      key !== 'default' && city.toLowerCase().includes(key.toLowerCase())
    );
    
    return majorCity ? DELIVERY_TIMES[majorCity] : DELIVERY_TIMES['default'];
  }, []);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&language=es&types=place,region`
      );

      if (!response.ok) {
        throw new Error('Error al obtener la ubicación');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        // Get city and region from the response
        const cityFeature = data.features.find((f: any) => f.place_type.includes('place'));
        const regionFeature = data.features.find((f: any) => f.place_type.includes('region'));
        
        return {
          city: cityFeature?.text || null,
          region: regionFeature?.text || 'Perú',
        };
      }
      
      return { city: null, region: null };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalización no disponible",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Perform reverse geocoding
      const { city, region } = await reverseGeocode(latitude, longitude);

      setState({
        latitude,
        longitude,
        city,
        region,
        loading: false,
        error: null,
      });

      if (city) {
        toast({
          title: "Ubicación detectada",
          description: `${city}, ${region}`,
        });
      }

      return { latitude, longitude, city, region };
    } catch (error: any) {
      let errorMessage = 'No se pudo obtener tu ubicación';
      
      if (error.code === 1) {
        errorMessage = 'Permiso de ubicación denegado';
      } else if (error.code === 2) {
        errorMessage = 'Ubicación no disponible';
      } else if (error.code === 3) {
        errorMessage = 'Tiempo de espera agotado';
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast({
        title: "Error de ubicación",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  }, [toast, reverseGeocode]);

  return {
    ...state,
    getCurrentLocation,
    getDeliveryEstimate,
  };
}
