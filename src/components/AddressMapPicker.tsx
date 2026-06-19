import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddressMapPickerProps {
  address: string;
  city: string;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

export function AddressMapPicker({
  address,
  city,
  onAddressChange,
  onCityChange,
  onCoordinatesChange,
}: AddressMapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasDeliveryCoverage, setHasDeliveryCoverage] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Define delivery coverage zones in Peru (Lima and main cities)
  const coverageZones = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Lima Metropolitana', coverage: true },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-77.15, -12.25],
            [-76.85, -12.25],
            [-76.85, -11.95],
            [-77.15, -11.95],
            [-77.15, -12.25]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: { name: 'Callao', coverage: true },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-77.20, -12.10],
            [-76.95, -12.10],
            [-76.95, -11.90],
            [-77.20, -11.90],
            [-77.20, -12.10]
          ]]
        }
      }
    ]
  };

  // Check if point is within coverage zones
  const checkCoverage = (lng: number, lat: number): boolean => {
    for (const feature of coverageZones.features) {
      if (feature.properties.coverage) {
        const polygon = feature.geometry.coordinates[0];
        if (isPointInPolygon([lng, lat], polygon)) {
          return true;
        }
      }
    }
    return false;
  };

  // Simple point-in-polygon algorithm
  const isPointInPolygon = (point: number[], polygon: number[][]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.error('VITE_MAPBOX_ACCESS_TOKEN is not configured');
      return;
    }
    mapboxgl.accessToken = mapboxToken;

    // Initialize map centered on Peru
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-77.0428, -12.0464], // Lima, Peru
      zoom: 12,
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }),
      'bottom-left'
    );

    // Add coverage zones to map
    map.current.on('load', () => {
      if (!map.current) return;

      // Add coverage zones as fill layers
      map.current.addSource('coverage-zones', {
        type: 'geojson',
        data: coverageZones as any
      });

      // Green zones (with coverage)
      map.current.addLayer({
        id: 'coverage-fill',
        type: 'fill',
        source: 'coverage-zones',
        paint: {
          'fill-color': 'hsl(142, 71%, 45%)',
          'fill-opacity': 0.2
        },
        filter: ['==', ['get', 'coverage'], true]
      });

      // Coverage zone borders
      map.current.addLayer({
        id: 'coverage-outline',
        type: 'line',
        source: 'coverage-zones',
        paint: {
          'line-color': 'hsl(142, 71%, 45%)',
          'line-width': 2
        },
        filter: ['==', ['get', 'coverage'], true]
      });
    });

    // Add draggable marker with primary brand color
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: 'hsl(221, 83%, 53%)', // Primary brand color
    })
      .setLngLat([-77.0428, -12.0464])
      .addTo(map.current);

    // Handle marker drag end
    marker.current.on('dragend', async () => {
      if (!marker.current) return;
      const lngLat = marker.current.getLngLat();
      
      // Check coverage
      const hasCoverage = checkCoverage(lngLat.lng, lngLat.lat);
      setHasDeliveryCoverage(hasCoverage);
      
      if (!hasCoverage) {
        toast({
          title: 'Zona sin cobertura',
          description: 'Esta ubicación está fuera de nuestra zona de entrega. Intenta con otra dirección.',
          variant: 'destructive',
        });
      }
      
      await reverseGeocode(lngLat.lng, lngLat.lat);
    });

    // Cleanup
    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, []);

  // Geocode address when user searches
  const geocodeAddress = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query + ', Peru'
        )}.json?access_token=${mapboxToken}&country=PE&language=es&limit=1`
      );

      if (!response.ok) throw new Error('Error al buscar la dirección');

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;

        // Update map and marker
        if (map.current && marker.current) {
          map.current.flyTo({
            center: [lng, lat],
            zoom: 16,
            duration: 1500,
          });
          marker.current.setLngLat([lng, lat]);
          
          // Check coverage for searched location
          const hasCoverage = checkCoverage(lng, lat);
          setHasDeliveryCoverage(hasCoverage);
        }

        // Extract address components
        const placeName = feature.place_name;
        const cityFeature = feature.context?.find((c: any) => 
          c.id.includes('place')
        );
        
        onAddressChange(feature.text || placeName);
        if (cityFeature) {
          onCityChange(cityFeature.text);
        }
        
        if (onCoordinatesChange) {
          onCoordinatesChange(lat, lng);
        }

        toast({
          title: 'Ubicación encontrada',
          description: 'Puedes ajustar el pin arrastrándolo',
        });
      } else {
        toast({
          title: 'No se encontró la dirección',
          description: 'Intenta con una dirección más específica',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Error al buscar dirección',
        description: 'Por favor intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (lng: number, lat: number) => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&country=PE&language=es&types=address,poi,place`
      );

      if (!response.ok) throw new Error('Error al obtener la dirección');

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const cityFeature = feature.context?.find((c: any) => 
          c.id.includes('place')
        );

        onAddressChange(feature.place_name);
        if (cityFeature) {
          onCityChange(cityFeature.text);
        }
        
        if (onCoordinatesChange) {
          onCoordinatesChange(lat, lng);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Handle search on enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    geocodeAddress(searchQuery);
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocalización no disponible',
        description: 'Tu navegador no soporta geolocalización',
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        if (map.current && marker.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 16,
            duration: 1500,
          });
          marker.current.setLngLat([longitude, latitude]);
          
          // Check coverage for current location
          const hasCoverage = checkCoverage(longitude, latitude);
          setHasDeliveryCoverage(hasCoverage);
          
          await reverseGeocode(longitude, latitude);
        }

        toast({
          title: 'Ubicación detectada',
          description: 'Pin actualizado a tu ubicación actual',
        });
      },
      (error) => {
        toast({
          title: 'Error al obtener ubicación',
          description: 'No se pudo acceder a tu ubicación',
          variant: 'destructive',
        });
      }
    );
  };

  return (
    <Card className="overflow-hidden shadow-lg border-border/50">
      <div className="p-4 md:p-6 bg-gradient-to-b from-muted/30 to-background border-b">
        <Label className="text-sm font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Confirma tu ubicación de entrega
        </Label>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar dirección: Av. Larco 1301, Miraflores, Lima"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 text-sm bg-background border-border/60 focus:border-primary"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
            size="default"
            className="h-11 px-4 bg-primary hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleGetCurrentLocation}
            className="h-11 px-4 border-border/60 hover:bg-accent"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground flex items-start gap-2 bg-accent/30 p-3 rounded-md">
            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
            <span>Arrastra el pin en el mapa para ajustar tu ubicación exacta de entrega</span>
          </p>

          {hasDeliveryCoverage === true && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-700 dark:text-green-400">
                ¡Excelente! Esta zona tiene cobertura de entrega.
              </AlertDescription>
            </Alert>
          )}

          {hasDeliveryCoverage === false && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Esta ubicación está fuera de nuestra zona de entrega. Por favor selecciona otra dirección dentro de las zonas verdes.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div
        ref={mapContainer}
        className="w-full h-[450px] md:h-[550px] bg-muted relative"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="absolute top-4 left-4 bg-background/98 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-xl border border-border/50 z-10">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {city || 'Detectando ubicación...'}
          </p>
          {hasDeliveryCoverage !== null && (
            <p className={`text-xs mt-1 flex items-center gap-1.5 ${hasDeliveryCoverage ? 'text-green-600' : 'text-destructive'}`}>
              {hasDeliveryCoverage ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Con cobertura
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Sin cobertura
                </>
              )}
            </p>
          )}
        </div>

        <div className="absolute bottom-4 left-4 bg-background/98 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-border/50 z-10">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500/40 border-2 border-green-500"></div>
              <span className="text-muted-foreground">Zona con entrega</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
