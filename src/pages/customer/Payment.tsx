import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, Package, CreditCard, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useIzipay } from '@/hooks/useIzipay';
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
  const { user, userRole } = useAuth();
  const { initiatePayment, renderPaymentForm, loading: izipayLoading } = useIzipay();

  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [b2bDiscount, setB2bDiscount] = useState(0);
  const paymentFormRef = useRef<HTMLDivElement>(null);

  // Aplica el descuento B2B preferencial (si corresponde) sobre un monto base.
  // Para clientes B2C el descuento es 0, así que devuelve el costo íntegro.
  const isB2B = userRole === 'b2b';
  const computeAmount = (base: number) =>
    Math.round(base * (1 - (isB2B ? b2bDiscount : 0) / 100) * 100) / 100;

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Poll the payments table while the Izipay dialog is open. The izipay-webhook
  // marks the payment as 'paid' once Izipay confirms it server-to-server (IPN).
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (showPaymentDialog && paymentId) {
      // Stop polling after ~5 minutes (100 attempts x 3s) so the dialog never
      // spins forever if the Izipay IPN webhook is delayed or never arrives.
      const MAX_ATTEMPTS = 100;
      let attempts = 0;

      interval = setInterval(async () => {
        attempts += 1;
        setCheckingStatus(true);
        const { data, error } = await supabase
          .from('payments')
          .select('payment_status')
          .eq('id', paymentId)
          .maybeSingle();
        setCheckingStatus(false);

        if (!error && data?.payment_status === 'paid') {
          clearInterval(interval);
          setShowPaymentDialog(false);
          setShowConfirmation(true);
          toast({
            title: '¡Pago Confirmado!',
            description: 'Tu pago ha sido procesado exitosamente',
          });
          return;
        }

        if (attempts >= MAX_ATTEMPTS) {
          clearInterval(interval);
          setShowPaymentDialog(false);
          toast({
            title: 'Estamos confirmando tu pago',
            description:
              'Si completaste el pago, lo confirmaremos en breve y verás tu paquete actualizado. No vuelvas a pagar.',
          });
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPaymentDialog, paymentId]);

  const fetchPackageDetails = async () => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar los detalles del paquete',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Un paquete es pagable una vez que el almacén lo recibió y calculó su
    // costo (final_cost). No exigimos 'ready_delivery': basta con que el costo
    // esté calculado y el paquete esté en un estado pagable.
    const PAYABLE_STATUSES = ['received_warehouse', 'ready_delivery'];
    if (!data.final_cost || data.final_cost <= 0 || !PAYABLE_STATUSES.includes(data.current_status)) {
      toast({
        title: 'Pago no disponible',
        description: 'Este paquete aún no tiene un costo calculado para pago',
        variant: 'destructive',
      });
      navigate(`/package/${id}`);
      return;
    }

    setPackageData(data);

    // B2B: traer el descuento preferencial del perfil para cobrar el total con descuento
    if (userRole === 'b2b' && user?.id) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('b2b_discount')
        .eq('id', user.id)
        .maybeSingle();
      if (prof?.b2b_discount) setB2bDiscount(Number(prof.b2b_discount) || 0);
    }

    setLoading(false);
  };

  const handlePay = async () => {
    if (!packageData) return;

    try {
      // Monto a cobrar: total con descuento B2B aplicado (B2C = total íntegro)
      const amountToCharge = computeAmount(packageData.final_cost!);

      // 1) Crear registro de pago pendiente (se confirma vía webhook de Izipay)
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          package_id: packageData.id,
          user_id: packageData.user_id,
          amount: amountToCharge,
          payment_method: 'card',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      setPaymentId(payment.id);

      // 2) Iniciar el pago con Izipay → formToken
      const fullName = (user?.user_metadata?.full_name as string | undefined) || '';
      const paymentResponse = await initiatePayment({
        amount: amountToCharge,
        orderId: payment.id, // el webhook actualiza payments por este id
        currency: 'USD',
        email: user?.email || '',
        firstName: fullName.split(' ')[0] || '',
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        description: `Pago de envío · ${packageData.tracking_number}`,
      });

      if (!paymentResponse?.success || !paymentResponse.formToken) {
        throw new Error(paymentResponse?.error || 'No se pudo iniciar el pago con Izipay');
      }

      // 3) Abrir el diálogo y renderizar el formulario embebido de Izipay
      setShowPaymentDialog(true);
      setTimeout(async () => {
        try {
          await renderPaymentForm(paymentResponse.formToken!, 'izipay-payment-form');
        } catch (err) {
          console.error('Error rendering Izipay form:', err);
          toast({
            title: 'Error',
            description: 'No se pudo cargar el formulario de pago. Intenta nuevamente.',
            variant: 'destructive',
          });
          setShowPaymentDialog(false);
        }
      }, 300);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
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
                      <span className="font-medium">US$ {packageData.weight_cost?.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Aduanas e Impuestos</span>
                        <span className="text-xs text-muted-foreground">
                          18% sobre valor declarado (US$ {packageData.estimated_value})
                        </span>
                      </div>
                      <span className="font-medium">US$ {packageData.customs_cost?.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Costo de Delivery</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          Tipo: {packageData.delivery_type || 'pickup'}
                        </span>
                      </div>
                      <span className="font-medium">US$ {packageData.delivery_cost?.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {isB2B && b2bDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Descuento B2B ({b2bDiscount}%)</span>
                      <span className="font-medium text-success">
                        - US$ {(packageData.final_cost! - computeAmount(packageData.final_cost!)).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Total a Pagar</span>
                    <span className="text-3xl font-bold text-primary">
                      US$ {computeAmount(packageData.final_cost!).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method — Izipay (tarjetas; Yape si está activado en la cuenta) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Tarjeta de crédito o débito</p>
                    <p className="text-xs text-muted-foreground">
                      Pago seguro procesado por Izipay. Al continuar se abrirá el
                      formulario de pago para completar la transacción.
                    </p>
                  </div>
                </div>
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
                    ${computeAmount(packageData.final_cost!).toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full bg-action-primary hover:bg-primary text-lg py-6"
                  size="lg"
                  onClick={handlePay}
                  disabled={izipayLoading}
                >
                  {izipayLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Continuar al Pago
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Pago seguro y encriptado con Izipay
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Dialog — Izipay embedded form */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Pagar con tarjeta
            </DialogTitle>
            <DialogDescription>
              {checkingStatus
                ? 'Verificando el estado de tu pago...'
                : 'Completa tus datos de pago de forma segura'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div
              id="izipay-payment-form"
              ref={paymentFormRef}
              className="min-h-[400px]"
            />
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
              <span className="block">Tu pago de <span className="font-bold">US$ {packageData ? computeAmount(packageData.final_cost!).toFixed(2) : '0.00'}</span> ha sido procesado</span>
              <span className="block text-sm">Tracking: <span className="font-semibold">{packageData?.tracking_number}</span></span>
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
