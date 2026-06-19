import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, Package, Smartphone, Building2, Copy, Clock, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePaymentGateway, PaymentMethod } from '@/hooks/usePaymentGateway';
import { useAuth } from '@/lib/auth';

interface PackageData {
  id: string;
  tracking_number: string;
  store_name: string;
  current_status: string;
  estimated_value: number;
  actual_weight: number | null;
  volumetric_weight: number | null;
  final_cost: number | null;
  weight_cost: number | null;
  customs_cost: number | null;
  delivery_cost: number | null;
  delivery_type: string | null;
  user_id: string;
}

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { loading: paymentLoading, paymentData, initiatePayment, checkPaymentStatus } = usePaymentGateway();
  
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yape');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  // Poll payment status when payment dialog is open
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (showPaymentDialog && paymentId) {
      interval = setInterval(async () => {
        setCheckingStatus(true);
        const result = await checkPaymentStatus(paymentId);
        setCheckingStatus(false);
        
        if (result.success && result.data?.payment_status === 'paid') {
          clearInterval(interval);
          setShowPaymentDialog(false);
          setShowConfirmation(true);
          
          toast({
            title: "¡Pago Confirmado!",
            description: "Tu pago ha sido procesado exitosamente",
          });
        }
      }, 2000); // Check every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPaymentDialog, paymentId]);

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

    if (!data.final_cost || data.current_status !== 'ready_delivery') {
      toast({
        title: "Pago no disponible",
        description: "Este paquete no está listo para pago",
        variant: "destructive"
      });
      navigate(`/package/${id}`);
      return;
    }

    setPackageData(data);
    setLoading(false);
  };

  const handlePaymentMethod = async () => {
    if (!packageData) return;

    try {
      // Crear registro de pago pendiente
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          package_id: packageData.id,
          user_id: packageData.user_id,
          amount: packageData.final_cost!,
          payment_method: paymentMethod,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      setPaymentId(payment.id);

      // Iniciar proceso de pago con edge function
      const result = await initiatePayment(payment.id, paymentMethod, packageData.final_cost!);
      
      if (result.success) {
        setShowPaymentDialog(true);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading || !packageData) {
    return (
      <DashboardLayout title="Procesando Pago">
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
    <DashboardLayout title="Procesar Pago">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/package/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Paquete
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detalles del Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking</p>
                    <p className="font-semibold">{packageData.tracking_number}</p>
                  </div>
                  <Badge className="bg-success text-white">Listo para Entrega</Badge>
                </div>
                
                <Separator />

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Desglose de Costos</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Peso Facturado</span>
                        <span className="text-xs text-muted-foreground">
                          {packageData.actual_weight && packageData.volumetric_weight
                            ? `Mayor entre Real (${packageData.actual_weight}kg) y Volumétrico (${packageData.volumetric_weight}kg)`
                            : `${packageData.actual_weight}kg`}
                        </span>
                      </div>
                      <span className="font-medium">${packageData.weight_cost?.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Aduanas e Impuestos</span>
                        <span className="text-xs text-muted-foreground">
                          18% sobre valor declarado (${packageData.estimated_value})
                        </span>
                      </div>
                      <span className="font-medium">${packageData.customs_cost?.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Costo de Delivery</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          Tipo: {packageData.delivery_type || 'pickup'}
                        </span>
                      </div>
                      <span className="font-medium">${packageData.delivery_cost?.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Total a Pagar</span>
                    <span className="text-3xl font-bold text-primary">
                      ${packageData.final_cost?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(v: string) => setPaymentMethod(v as PaymentMethod)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="yape" id="yape" />
                      <Label htmlFor="yape" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Yape</p>
                            <p className="text-xs text-muted-foreground">Pago instantáneo con QR</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="plin" id="plin" />
                      <Label htmlFor="plin" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Plin</p>
                            <p className="text-xs text-muted-foreground">Pago instantáneo con QR</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Transferencia Bancaria</p>
                            <p className="text-xs text-muted-foreground">BCP, Interbank, BBVA</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(packageData.weight_cost! + packageData.customs_cost!).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>${packageData.delivery_cost?.toFixed(2)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${packageData.final_cost?.toFixed(2)}
                  </span>
                </div>

                <Button 
                  className="w-full bg-action-primary hover:bg-primary text-lg py-6"
                  size="lg"
                  onClick={handlePaymentMethod}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-5 w-5" />
                      Continuar al Pago
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  🔒 Pago seguro y encriptado
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog - Yape/Plin/Bank */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {paymentMethod === 'yape' && <Smartphone className="h-5 w-5 text-primary" />}
              {paymentMethod === 'plin' && <Smartphone className="h-5 w-5 text-primary" />}
              {paymentMethod === 'bank_transfer' && <Building2 className="h-5 w-5 text-primary" />}
              Pago con {paymentMethod === 'yape' ? 'Yape' : paymentMethod === 'plin' ? 'Plin' : 'Transferencia Bancaria'}
            </DialogTitle>
            <DialogDescription>
              {checkingStatus ? 'Verificando pago...' : 'Sigue las instrucciones para completar tu pago'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Yape/Plin - QR Code */}
            {(paymentMethod === 'yape' || paymentMethod === 'plin') && paymentData && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border-2 border-primary">
                    {paymentData.qrCode ? (
                      <img src={paymentData.qrCode} alt="QR Code" className="w-64 h-64" />
                    ) : (
                      <div className="w-64 h-64 bg-muted flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-2">📱</div>
                          <p className="text-sm text-muted-foreground">Escanea con {paymentMethod === 'yape' ? 'Yape' : 'Plin'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                  <p className="font-semibold text-center text-2xl text-primary">
                    ${packageData?.final_cost?.toFixed(2)}
                  </p>
                  <p className="text-sm text-center text-muted-foreground">
                    Referencia: {paymentData.reference}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium">📲 Instrucciones:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Abre tu app de {paymentMethod === 'yape' ? 'Yape' : 'Plin'}</li>
                    <li>Escanea el código QR</li>
                    <li>Confirma el monto de ${packageData?.final_cost?.toFixed(2)}</li>
                    <li>Completa el pago</li>
                  </ol>
                </div>

                {checkingStatus && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 animate-spin" />
                    Esperando confirmación...
                  </div>
                )}
              </div>
            )}

            {/* Bank Transfer */}
            {paymentMethod === 'bank_transfer' && paymentData?.bankDetails && (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Banco</Label>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{paymentData.bankDetails.bankName}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentData.bankDetails!.bankName);
                          toast({ title: "Copiado" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs text-muted-foreground">Número de Cuenta</Label>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-semibold">{paymentData.bankDetails.accountNumber}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentData.bankDetails!.accountNumber);
                          toast({ title: "Copiado" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">CCI</Label>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-semibold">{paymentData.bankDetails.cci}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(paymentData.bankDetails!.cci);
                          toast({ title: "Copiado" });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Titular</Label>
                      <p className="font-semibold">{paymentData.bankDetails.holderName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">RUC</Label>
                      <p className="font-mono font-semibold">{paymentData.bankDetails.ruc}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo de Cuenta</Label>
                    <p className="font-semibold capitalize">{paymentData.bankDetails.accountType}</p>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Monto a Transferir:</p>
                  <p className="text-3xl font-bold text-primary text-center">
                    ${packageData?.final_cost?.toFixed(2)}
                  </p>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Referencia: {paymentData.reference}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium">📋 Instrucciones:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Realiza la transferencia desde tu banco</li>
                    <li>Usa los datos bancarios mostrados arriba</li>
                    <li>Incluye la referencia en el concepto</li>
                    <li>Guarda el comprobante de pago</li>
                  </ol>
                </div>

                {checkingStatus && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 animate-spin" />
                    Verificando transferencia...
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentDialog(false);
                setPaymentId(null);
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showConfirmation} onOpenChange={(open) => {
        if (!open) {
          navigate('/');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <DialogTitle className="text-center text-2xl">¡Pago Exitoso!</DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p>Tu pago de <span className="font-bold">${packageData?.final_cost?.toFixed(2)}</span> ha sido procesado</p>
              <p className="text-sm">Tracking: <span className="font-semibold">{packageData?.tracking_number}</span></p>
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">📦 Próximos Pasos:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Tu paquete está listo para entrega</li>
              <li>Recibirás un correo de confirmación</li>
              <li>Coordinaremos la entrega en 24-48 horas</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(`/package/${id}`)}
            >
              Ver Detalles
            </Button>
            <Button 
              className="flex-1 bg-action-primary hover:bg-primary"
              onClick={() => navigate('/')}
            >
              Ir al Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Payment;
