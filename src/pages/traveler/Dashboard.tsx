import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { KYCUpload } from '@/components/KYCUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Plane, 
  DollarSign, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const TravelerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [affidavitSigned, setAffidavitSigned] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    availableTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    pendingPayment: 0
  });
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check verification status
      const { data: profile } = await supabase
        .from('profiles')
        .select('traveler_verified, affidavit_signed')
        .eq('id', user.id)
        .single();

      setIsVerified(profile?.traveler_verified || false);
      setAffidavitSigned(profile?.affidavit_signed || false);

      if (!profile?.traveler_verified) {
        setLoading(false);
        return;
      }

      // If verified but affidavit not signed, stop here
      if (!profile?.affidavit_signed) {
        setLoading(false);
        return;
      }

      // Get traveler's trips stats
      const { data: trips } = await supabase
        .from('traveler_trips')
        .select('*')
        .eq('traveler_id', user.id);

      // Get available packages count
      const { count: availableCount } = await supabase
        .from('packages')
        .select('*', { count: 'exact', head: true })
        .eq('current_status', 'ready_international');

      // Calculate stats
      const activeTrips = trips?.filter(t => t.status === 'accepted' || t.status === 'in_transit').length || 0;
      const completedTrips = trips?.filter(t => t.status === 'completed').length || 0;
      const totalEarnings = trips?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.commission), 0) || 0;
      const pendingPayment = trips?.filter(t => t.status === 'accepted')
        .reduce((sum, t) => sum + Number(t.commission), 0) || 0;

      setStats({
        availableTrips: availableCount || 0,
        activeTrips,
        completedTrips,
        totalEarnings,
        pendingPayment
      });

      // Get recent trips with package data
      const { data: recent } = await supabase
        .from('traveler_trips')
        .select(`
          *,
          packages (
            tracking_number,
            store_name,
            actual_weight
          )
        `)
        .eq('traveler_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentTrips(recent || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <DashboardLayout title="Dashboard - Viajero">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard - Viajero">
      <div className="space-y-8">
        {/* Verification Alert */}
        {isVerified === false && (
          <Alert className="bg-warning/10 border-warning">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning">
              Debes completar tu verificación KYC para comenzar a aceptar viajes.
            </AlertDescription>
          </Alert>
        )}

        {/* Affidavit Required Alert */}
        {isVerified === true && affidavitSigned === false && (
          <Alert className="bg-primary/10 border-primary">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <div className="flex items-center justify-between">
                <span>Has completado tu verificación KYC. Ahora debes firmar la declaración jurada para comenzar a recibir cotizaciones.</span>
                <Button onClick={() => navigate('/traveler/affidavit')} size="sm" className="ml-4">
                  Firmar Ahora
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* KYC Upload Section for Unverified Users */}
        {isVerified === false && (
          <KYCUpload userRole="traveler" />
        )}

        {/* Welcome Header - Only show if verified and affidavit signed */}
        {isVerified && affidavitSigned && (
          <>
            <div className="bg-gradient-to-r from-primary to-navy rounded-lg p-8 text-white">
              <h1 className="text-3xl font-bold mb-2">Bienvenido, Viajero</h1>
              <p className="text-white/90">
                Gana dinero extra transportando paquetes de manera segura
              </p>
            </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/traveler/available')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Paquetes Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.availableTrips}</p>
              <p className="text-xs text-muted-foreground mt-1">Listos para transportar</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Plane className="w-4 h-4" />
                Viajes Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{stats.activeTrips}</p>
              <p className="text-xs text-muted-foreground mt-1">En curso</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Viajes Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">{stats.completedTrips}</p>
              <p className="text-xs text-muted-foreground mt-1">Total histórico</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Ganancias Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Acumulado</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pago Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">${stats.pendingPayment.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">En viajes activos</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Paquetes Disponibles
              </CardTitle>
              <CardDescription>
                Encuentra paquetes listos para transportar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/traveler/available')}
                className="w-full"
              >
                Ver Paquetes Disponibles
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Historial de Viajes
              </CardTitle>
              <CardDescription>
                Revisa tus viajes y ganancias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/traveler/history')}
                variant="secondary"
                className="w-full"
              >
                Ver Historial
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Viajes Recientes
            </CardTitle>
            <CardDescription>Tus últimos 5 viajes</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTrips.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Aún no tienes viajes registrados</p>
                <Button 
                  onClick={() => navigate('/traveler/available')}
                  variant="outline"
                  className="mt-4"
                >
                  Ver Paquetes Disponibles
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {trip.packages?.tracking_number || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trip.origin} → {trip.destination}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trip.weight ? `${trip.weight} kg` : 'Peso no especificado'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(trip.status)}>
                        {getStatusLabel(trip.status)}
                      </Badge>
                      <p className="font-semibold text-success">
                        ${Number(trip.commission).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TravelerDashboard;
