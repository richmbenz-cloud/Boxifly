import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, X, CheckCircle2, AlertTriangle, Info, HelpCircle, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { detectTracking, TRACKING_HELP, type TrackingDetection } from '@/lib/trackingValidation';

const NewPrealert = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showTrackingHelp, setShowTrackingHelp] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    trackingNumber: '',
    estimatedValue: '',
    estimatedWeight: '',
    dimensions: '',
    deliveryType: 'standard',
    notes: ''
  });

  const [tracking, setTracking] = useState<TrackingDetection>({
    carrier: null,
    isLikelyOrderNumber: false,
    isValidCarrierFormat: false,
    level: 'none',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const handleTrackingChange = (value: string) => {
    setFormData({ ...formData, trackingNumber: value });
    setTracking(detectTracking(value));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      toast({
        title: "Límite excedido",
        description: "Máximo 5 fotos permitidas",
        variant: "destructive"
      });
      return;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.storeName || !formData.trackingNumber || !formData.estimatedValue) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Bloqueo inteligente: no permitir números de orden como tracking.
    if (tracking.isLikelyOrderNumber) {
      toast({
        title: "Eso parece un número de orden",
        description:
          "Ingresa el código de seguimiento de la transportadora (UPS, FedEx, USPS, DHL...), no el número de pedido de la tienda.",
        variant: "destructive"
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        title: "Foto requerida",
        description: "Debes subir al menos una foto del paquete",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Check if tracking number already exists
      const { data: existing } = await supabase
        .from('packages')
        .select('tracking_number')
        .eq('tracking_number', formData.trackingNumber)
        .single();

      if (existing) {
        toast({
          title: "Tracking duplicado",
          description: "Este número de tracking ya existe",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create package
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .insert({
          user_id: user!.id,
          store_name: formData.storeName,
          tracking_number: formData.trackingNumber,
          estimated_value: parseFloat(formData.estimatedValue),
          estimated_weight: formData.estimatedWeight ? parseFloat(formData.estimatedWeight) : null,
          dimensions: formData.dimensions || null,
          delivery_type: formData.deliveryType,
          notes: formData.notes || null,
          current_status: 'prealerted'
        })
        .select()
        .single();

      if (packageError) throw packageError;

      // Upload photos
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${packageData.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('package-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('package-photos')
          .getPublicUrl(fileName);

        await supabase
          .from('package_files')
          .insert({
            package_id: packageData.id,
            file_type: 'photo',
            file_url: publicUrl,
            description: 'Foto del paquete',
            uploaded_by: user!.id
          });
      }

      toast({
        title: "¡Prealerta creada!",
        description: "Tu paquete ha sido registrado exitosamente"
      });

      navigate('/');
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

  return (
    <DashboardLayout title="Nueva Prealerta">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Crear Nueva Prealerta</CardTitle>
            <CardDescription>
              Registra tu paquete para iniciar el proceso de envío
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Tienda *</Label>
                  <Input
                    id="storeName"
                    placeholder="Amazon, eBay, etc."
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trackingNumber">Tracking *</Label>
                    <button
                      type="button"
                      onClick={() => setShowTrackingHelp((v) => !v)}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      ¿Dónde lo encuentro?
                    </button>
                  </div>
                  <Input
                    id="trackingNumber"
                    placeholder="1Z999AA10123456784"
                    value={formData.trackingNumber}
                    onChange={(e) => handleTrackingChange(e.target.value)}
                    aria-invalid={tracking.isLikelyOrderNumber}
                    className={
                      tracking.level === 'success'
                        ? 'border-green-500 focus-visible:ring-green-500'
                        : tracking.level === 'warning'
                        ? 'border-amber-500 focus-visible:ring-amber-500'
                        : ''
                    }
                    required
                  />

                  {/* Feedback en tiempo real de detección de tracking */}
                  {tracking.level === 'success' && (
                    <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Detectado: <strong>{tracking.carrier}</strong></span>
                    </p>
                  )}
                  {tracking.level === 'warning' && (
                    <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{tracking.message}</span>
                    </p>
                  )}
                  {tracking.level === 'info' && (
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{tracking.message}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Panel de ayuda desplegable */}
              {showTrackingHelp && (
                <div className="rounded-lg border border-border bg-muted/40 p-4">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    ¿Dónde encuentro mi código de rastreo?
                    <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
                  </div>
                  <ul className="space-y-3">
                    {TRACKING_HELP.map((item) => (
                      <li key={item.store} className="text-sm">
                        <span className="font-semibold text-foreground">{item.store}:</span>{' '}
                        <span className="text-muted-foreground">{item.steps}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    💡 El código de rastreo es de la <strong>transportadora</strong> (UPS, FedEx, USPS, DHL),
                    no el número de pedido de la tienda. El número de orden de Amazon
                    (formato <code>112-3456789-1234567</code>) <strong>no</strong> sirve para rastrear.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Valor Declarado (USD) *</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedWeight">Peso Estimado (kg)</Label>
                  <Input
                    id="estimatedWeight"
                    type="number"
                    step="0.01"
                    placeholder="2.5"
                    value={formData.estimatedWeight}
                    onChange={(e) => setFormData({ ...formData, estimatedWeight: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensiones (LxWxH cm)</Label>
                  <Input
                    id="dimensions"
                    placeholder="30x20x15"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryType">Tipo de Entrega</Label>
                  <Select
                    value={formData.deliveryType}
                    onValueChange={(value) => setFormData({ ...formData, deliveryType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Entrega Estándar</SelectItem>
                      <SelectItem value="express">Entrega Express</SelectItem>
                      <SelectItem value="pickup">Recoger en Oficina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional sobre el paquete..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Fotos del Paquete *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click para subir fotos (máx. 5)
                    </p>
                  </label>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-action-primary hover:bg-primary"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Prealerta'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewPrealert;
