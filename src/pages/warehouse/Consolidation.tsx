import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Boxes, Upload, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface PackageData {
  id: string;
  tracking_number: string;
  store_name: string;
  user_id: string;
  estimated_weight: number | null;
}

const Consolidation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [consolidationData, setConsolidationData] = useState({
    actualWeight: '',
    dimensions: '',
    notes: ''
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchReadyPackages();
  }, []);

  const fetchReadyPackages = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('id, tracking_number, store_name, user_id, estimated_weight')
      .eq('current_status', 'ready_consolidation')
      .order('user_id');

    if (!error && data) {
      setPackages(data);
    }
  };

  const groupedPackages = packages.reduce((acc, pkg) => {
    if (!acc[pkg.user_id]) {
      acc[pkg.user_id] = [];
    }
    acc[pkg.user_id].push(pkg);
    return acc;
  }, {} as Record<string, PackageData[]>);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleConsolidate = async () => {
    if (selectedPackages.length < 2) {
      toast({
        title: "Selección inválida",
        description: "Debes seleccionar al menos 2 paquetes para consolidar",
        variant: "destructive"
      });
      return;
    }

    if (!consolidationData.actualWeight) {
      toast({
        title: "Peso requerido",
        description: "Debes ingresar el peso consolidado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const consolidationGroup = `CONS-${Date.now()}`;
      
      // Get the user_id from the first selected package
      const firstPackage = packages.find(p => p.id === selectedPackages[0]);
      if (!firstPackage) throw new Error("Package not found");

      // Create consolidated mother package
      const { data: motherPackage, error: motherError } = await supabase
        .from('packages')
        .insert({
          user_id: firstPackage.user_id,
          store_name: 'Consolidación',
          tracking_number: consolidationGroup,
          actual_weight: parseFloat(consolidationData.actualWeight),
          dimensions: consolidationData.dimensions || null,
          notes: `Consolidación de ${selectedPackages.length} paquetes. ${consolidationData.notes}`,
          current_status: 'consolidated',
          is_consolidated: true,
          consolidation_group: consolidationGroup
        })
        .select()
        .single();

      if (motherError) throw motherError;

      // Calcular costos del paquete consolidado
      const { updatePackageCosts } = await import('@/lib/tariffCalculator');
      
      // Obtener el valor total estimado sumando los paquetes hijos
      const childPackagesData = await supabase
        .from('packages')
        .select('estimated_value')
        .in('id', selectedPackages);
      
      const totalEstimatedValue = childPackagesData.data?.reduce(
        (sum, pkg) => sum + (pkg.estimated_value || 0), 
        0
      ) || 0;

      const costResult = await updatePackageCosts(
        motherPackage.id,
        parseFloat(consolidationData.actualWeight),
        consolidationData.dimensions || null,
        totalEstimatedValue,
        'pickup'
      );

      if (!costResult.success) {
        console.warn('No se pudo calcular costos automáticamente:', costResult.error);
      }

      // Update child packages
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          current_status: 'consolidated',
          consolidation_group: consolidationGroup
        })
        .in('id', selectedPackages);

      if (updateError) throw updateError;

      // Upload photos
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${motherPackage.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('package-photos')
          .upload(fileName, photo);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('package-photos')
            .getPublicUrl(fileName);

          await supabase
            .from('package_files')
            .insert({
              package_id: motherPackage.id,
              file_type: 'photo',
              file_url: publicUrl,
              description: 'Foto de consolidación',
              uploaded_by: user!.id
            });
        }
      }

      // Log warehouse action
      await supabase
        .from('warehouse_logs')
        .insert({
          package_id: motherPackage.id,
          action: 'consolidation',
          logged_by: user!.id,
          details: {
            child_packages: selectedPackages,
            weight: consolidationData.actualWeight
          }
        });

      toast({
        title: "¡Consolidación exitosa!",
        description: `Se consolidaron ${selectedPackages.length} paquetes`
      });

      // Reset form
      setSelectedPackages([]);
      setConsolidationData({ actualWeight: '', dimensions: '', notes: '' });
      setPhotos([]);
      setPhotoPreviews([]);
      fetchReadyPackages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePackage = (packageId: string) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  return (
    <DashboardLayout title="Consolidación de Paquetes">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Packages List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paquetes Listos para Consolidar</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedPackages).map(([userId, userPackages]) => (
                <div key={userId} className="mb-6 last:mb-0">
                  <Badge className="mb-3">Cliente: {userId.substring(0, 8)}...</Badge>
                  <div className="space-y-2">
                    {userPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => togglePackage(pkg.id)}
                      >
                        <Checkbox
                          checked={selectedPackages.includes(pkg.id)}
                          onCheckedChange={() => togglePackage(pkg.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{pkg.tracking_number}</p>
                          <p className="text-sm text-muted-foreground">{pkg.store_name}</p>
                        </div>
                        {pkg.estimated_weight && (
                          <Badge variant="outline">{pkg.estimated_weight} kg</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {packages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay paquetes listos para consolidar
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Consolidation Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5" />
                Consolidar ({selectedPackages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Peso Consolidado (kg) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5.5"
                  value={consolidationData.actualWeight}
                  onChange={(e) => setConsolidationData({ ...consolidationData, actualWeight: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Dimensiones (LxWxH cm)</Label>
                <Input
                  placeholder="50x40x30"
                  value={consolidationData.dimensions}
                  onChange={(e) => setConsolidationData({ ...consolidationData, dimensions: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea
                  placeholder="Información adicional..."
                  value={consolidationData.notes}
                  onChange={(e) => setConsolidationData({ ...consolidationData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Fotos</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="consolidation-photos"
                  />
                  <label htmlFor="consolidation-photos" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Subir fotos</p>
                  </label>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-action-primary hover:bg-primary"
                onClick={handleConsolidate}
                disabled={loading || selectedPackages.length < 2}
              >
                {loading ? 'Consolidando...' : 'Consolidar Paquetes'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Consolidation;
