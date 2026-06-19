import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, DollarSign, Calendar, MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TripHistory = () => {
  const { toast } = useToast();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadTripHistory();
  }, []);

  const loadTripHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('traveler_trips')
        .select(`
          *,
          packages (
            tracking_number,
            store_name,
            actual_weight,
            current_status
          )
        `)
        .eq('traveler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de viajes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('traveler_trips')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', tripId);

      if (error) throw error;

      toast({
        title: "Viaje completado",
        description: "El viaje ha sido marcado como completado"
      });

      loadTripHistory();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-status-warning',
      accepted: 'bg-status-processing',
      in_transit: 'bg-status-transit',
      completed: 'bg-status-delivered',
      cancelled: 'bg-status-error'
    };
    return colors[status] || 'bg-muted';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      accepted: 'Aceptado',
      in_transit: 'En Tránsito',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      pending: Clock,
      accepted: CheckCircle,
      in_transit: Package,
      completed: CheckCircle,
      cancelled: XCircle
    };
    const Icon = icons[status] || Package;
    return <Icon className="w-5 h-5" />;
  };

  const filterTrips = (trips: any[], filter: string) => {
    switch (filter) {
      case 'active':
        return trips.filter(t => ['accepted', 'in_transit'].includes(t.status));
      case 'completed':
        return trips.filter(t => t.status === 'completed');
      case 'cancelled':
        return trips.filter(t => t.status === 'cancelled');
      default:
        return trips;
    }
  };

  const calculateStats = () => {
    const completed = trips.filter(t => t.status === 'completed');
    const totalEarnings = completed.reduce((sum, t) => sum + Number(t.commission), 0);
    const avgCommission = completed.length > 0 ? totalEarnings / completed.length : 0;
    const pending = trips.filter(t => ['accepted', 'in_transit'].includes(t.status))
      .reduce((sum, t) => sum + Number(t.commission), 0);

    return { totalEarnings, avgCommission, pending, completedCount: completed.length };
  };

  const stats = calculateStats();
  const filteredTrips = filterTrips(trips, activeTab);

  if (loading) {
    return (
      <DashboardLayout title="Historial de Viajes">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Historial de Viajes">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-navy">Historial de Viajes</h2>
          <p className="text-muted-foreground">Revisa todos tus viajes y ganancias</p>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ganado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Viajes completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comisión Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">${stats.avgCommission.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Por viaje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pago Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-secondary">${stats.pending.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">En viajes activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Viajes Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-navy">{stats.completedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Trips List with Tabs */}
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="active">Activos</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredTrips.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      No hay viajes {activeTab !== 'all' ? `${activeTab === 'active' ? 'activos' : activeTab === 'completed' ? 'completados' : 'cancelados'}` : 'registrados'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTrips.map((trip) => (
                  <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(trip.status)}`}>
                            {getStatusIcon(trip.status)}
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">
                                  {trip.packages?.tracking_number || 'N/A'}
                                </h3>
                                <Badge className={getStatusColor(trip.status)}>
                                  {getStatusLabel(trip.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {trip.packages?.store_name || 'Tienda no especificada'}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Ruta</p>
                                  <p className="font-medium">{trip.origin} → {trip.destination}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Fecha de viaje</p>
                                  <p className="font-medium">
                                    {trip.travel_date ? format(new Date(trip.travel_date), "d MMM yyyy", { locale: es }) : 'No especificada'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Peso</p>
                                  <p className="font-medium">{trip.weight || 'N/A'} kg</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Comisión</p>
                                  <p className="font-semibold text-success">${Number(trip.commission).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>

                            {trip.notes && (
                              <div className="bg-muted p-3 rounded-lg">
                                <p className="text-sm text-muted-foreground">{trip.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {trip.status === 'accepted' && (
                          <Button
                            onClick={() => handleCompleteTrip(trip.id)}
                            size="sm"
                          >
                            Marcar Completado
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TripHistory;
