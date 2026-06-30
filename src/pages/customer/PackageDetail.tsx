import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package as PackageIcon, DollarSign } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PackageTimeline from '@/components/PackageTimeline';
import CheckpointFeed from '@/components/CheckpointFeed';
import { useToast } from '@/hooks/use-toast';

interface PackageData {
  id: string;
  tracking_number: string;
  store_name: string;
  current_status: string;
  estimated_value: number;
  estimated_weight: number | null;
  actual_weight: number | null;
  volumetric_weight: number | null;
  dimensions: string | null;
  delivery_type: string | null;
  notes: string | null;
  final_cost: number | null;
  weight_cost: number | null;
  customs_cost: number | null;
  delivery_cost: number | null;
  created_at: string;
}

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
      fetchPhotos();
    }
  }, [id]);

  // Realtime: mantener el estado del paquete (badge de cabecera) en vivo
  // sin recargar cuando el cron/webhook avanza `current_status`.
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`package-detail-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'packages',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setPackageData((prev) =>
            prev ? { ...prev, ...(payload.new as Partial<PackageData>) } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchPackageDetails = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los detalles del paquete",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    setPackageData(data);
    setLoading(false);
  };

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('package_files')
      .select('file_url')
      .eq('package_id', id)
      .eq('file_type', 'photo');

    if (data) {
      setPhotos(data.map(f => f.file_url));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      prealerted: { label: 'Prealertado', className: 'bg-blue-500' },
      received_warehouse: { label: 'Recibido', className: 'bg-purple-500' },
      ready_consolidation: { label: 'Listo para Consolidar', className: 'bg-indigo-500' },
      consolidated: { label: 'Consolidado', className: 'bg-violet-500' },
      ready_international: { label: 'Listo para Envío', className: 'bg-sky-500' },
      in_transit: { label: 'En Tránsito', className: 'bg-cyan-500' },
      arrived_peru: { label: 'Llegó a Perú', className: 'bg-teal-500' },
      ready_delivery: { label: 'Listo para Entrega', className: 'bg-green-500' },
      delivered: { label: 'Entregado', className: 'bg-emerald-500' }
    };

    const config = statusMap[status] || { label: status, className: 'bg-muted' };
    return <Badge className={`${config.className} text-white`}>{config.label}</Badge>;
  };

  if (loading || !packageData) {
    return (
      <DashboardLayout title="Detalles del Paquete">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Detalles del Paquete">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5" />
                    {packageData.tracking_number}
                  </CardTitle>
                  {getStatusBadge(packageData.current_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tienda</p>
                    <p className="font-medium">{packageData.store_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Entrega</p>
                    <p className="font-medium capitalize">{packageData.delivery_type || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Declarado</p>
                    <p className="font-medium">${packageData.estimated_value}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peso Estimado</p>
                    <p className="font-medium">{packageData.estimated_weight || 'N/A'} kg</p>
                  </div>
                  {packageData.actual_weight && (
                    <div>
                      <p className="text-sm text-muted-foreground">Peso Real</p>
                      <p className="font-medium">{packageData.actual_weight} kg</p>
                    </div>
                  )}
                  {packageData.dimensions && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dimensiones</p>
                      <p className="font-medium">{packageData.dimensions} cm</p>
                    </div>
                  )}
                </div>

                {packageData.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{packageData.notes}</p>
                  </div>
                )}

                {photos.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Fotos</p>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Paquete ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <PackageTimeline packageId={packageData.id} />

            <CheckpointFeed packageId={packageData.id} />
          </div>

          {/* Costs Sidebar */}
          <div className="space-y-6">
            {packageData.final_cost ? (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Costo Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground mb-2">Desglose de Costos</div>
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Peso Facturado</span>
                        <span className="text-xs text-muted-foreground">
                          {packageData.actual_weight && packageData.volumetric_weight
                            ? `Real: ${packageData.actual_weight}kg / Vol: ${packageData.volumetric_weight}kg`
                            : packageData.actual_weight
                            ? `${packageData.actual_weight}kg`
                            : 'Pendiente'}
                        </span>
                      </div>
                      <span className="font-medium">${packageData.weight_cost?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Aduanas</span>
                        <span className="text-xs text-muted-foreground">
                          Sobre ${packageData.estimated_value}
                        </span>
                      </div>
                      <span className="font-medium">${packageData.customs_cost?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Delivery</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          Tipo: {packageData.delivery_type || 'pickup'}
                        </span>
                      </div>
                      <span className="font-medium">${packageData.delivery_cost?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        ${packageData.final_cost?.toFixed(2) ?? '0.00'}
                      </span>
                    </div>
                  </div>

                  {(packageData.final_cost ?? 0) > 0 &&
                    ['received_warehouse', 'ready_delivery'].includes(packageData.current_status) && (
                    <Button 
                      className="w-full bg-action-primary hover:bg-primary"
                      onClick={() => navigate(`/payment/${packageData.id}`)}
                    >
                      Proceder al Pago
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p className="text-sm">
                    Los costos estarán disponibles una vez que el paquete sea procesado
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PackageDetail;
