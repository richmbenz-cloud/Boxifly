import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Package, MapPin, Weight, DollarSign, Calendar, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const AvailablePackages = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [proposedCommission, setProposedCommission] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAvailablePackages();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = packages.filter(pkg =>
        pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.store_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(packages);
    }
  }, [searchTerm, packages]);

  const loadAvailablePackages = async () => {
    try {
      // Get packages ready for international shipping
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .in('current_status', ['ready_international', 'consolidated'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
      setFilteredPackages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes disponibles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptPackage = async () => {
    if (!selectedPackage || !proposedCommission || !travelDate) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('traveler_trips')
        .insert({
          traveler_id: user.id,
          package_id: selectedPackage.id,
          status: 'accepted',
          commission: parseFloat(proposedCommission),
          travel_date: travelDate,
          origin: 'Miami, USA',
          destination: 'Lima, Peru',
          weight: selectedPackage.actual_weight || selectedPackage.estimated_weight,
          accepted_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "¡Viaje aceptado!",
        description: "El paquete ha sido asignado a tu lista de viajes"
      });

      setSelectedPackage(null);
      setProposedCommission('');
      setTravelDate('');
      loadAvailablePackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSuggestedCommission = (pkg: any) => {
    const weight = pkg.actual_weight || pkg.estimated_weight || 1;
    return (weight * 5).toFixed(2); // $5 per kg as base commission
  };

  if (loading) {
    return (
      <DashboardLayout title="Paquetes Disponibles">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Paquetes Disponibles">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-navy">Paquetes Disponibles</h2>
            <p className="text-muted-foreground">Selecciona paquetes para transportar y gana comisiones</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Buscar por tracking o tienda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Info Alert */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-navy">¿Cómo funciona?</p>
                <p className="text-sm text-muted-foreground">
                  1. Revisa los paquetes disponibles y sus detalles<br />
                  2. Selecciona los que puedas transportar en tu viaje<br />
                  3. Propón tu comisión y fecha de viaje<br />
                  4. Una vez aceptado, coordina la entrega y recibe tu pago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packages Grid */}
        {filteredPackages.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No se encontraron paquetes con ese criterio' : 'No hay paquetes disponibles en este momento'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        {pkg.tracking_number}
                      </CardTitle>
                      <CardDescription className="mt-1">{pkg.store_name}</CardDescription>
                    </div>
                    <Badge className="bg-status-processing">Disponible</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Miami → Lima</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Weight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {pkg.actual_weight || pkg.estimated_weight || 'N/A'} kg
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {format(new Date(pkg.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Comisión sugerida:</span>
                      <span className="font-bold text-success flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {calculateSuggestedCommission(pkg)}
                      </span>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          Aceptar Viaje
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Aceptar Paquete para Transporte</DialogTitle>
                          <DialogDescription>
                            Completa los detalles del viaje para {pkg.tracking_number}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="commission">Comisión Propuesta (USD)</Label>
                            <Input
                              id="commission"
                              type="number"
                              step="0.01"
                              placeholder={calculateSuggestedCommission(pkg)}
                              value={proposedCommission}
                              onChange={(e) => setProposedCommission(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                              Sugerido: ${calculateSuggestedCommission(pkg)} USD
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="travelDate">Fecha de Viaje</Label>
                            <Input
                              id="travelDate"
                              type="date"
                              value={travelDate}
                              onChange={(e) => setTravelDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                            <p><strong>Origen:</strong> Miami, USA</p>
                            <p><strong>Destino:</strong> Lima, Peru</p>
                            <p><strong>Peso:</strong> {pkg.actual_weight || pkg.estimated_weight || 'N/A'} kg</p>
                          </div>
                          <Button
                            onClick={handleAcceptPackage}
                            disabled={submitting}
                            className="w-full"
                          >
                            {submitting ? 'Procesando...' : 'Confirmar y Aceptar'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AvailablePackages;
