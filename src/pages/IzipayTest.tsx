import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useIzipay } from "@/hooks/useIzipay";
import { MainNavigation } from "@/components/MainNavigation";
import { useAuth } from "@/lib/auth";
import { CheckCircle, CreditCard, AlertCircle, Loader2, Package, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function IzipayTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { initiatePayment, renderPaymentForm, loading, error } = useIzipay();
  
  // Form state
  const [amount, setAmount] = useState("150.50");
  const [email, setEmail] = useState(user?.email || "cliente@example.com");
  const [firstName, setFirstName] = useState("Juan");
  const [lastName, setLastName] = useState("Pérez");
  const [description, setDescription] = useState("Compra de productos Boxifly");
  
  // Payment state
  const [formToken, setFormToken] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initiated" | "processing" | "success" | "failed">("idle");

  // Mock cart items for visualization
  const mockCartItems = [
    { name: "iPhone 17 Pro Max", price: 4500, quantity: 1, image: "/images/products/iphone-17-pro-max.jpg" },
    { name: "AirPods Pro", price: 250, quantity: 2, image: "/images/products/iphone-lifestyle-1.jpg" },
  ];

  const handleInitiatePayment = async () => {
    setPaymentStatus("processing");
    setFormToken(null);
    setTransactionId(null);

    const orderId = `ORDER-TEST-${Date.now()}`;
    
    const result = await initiatePayment({
      amount: parseFloat(amount),
      orderId,
      email,
      firstName,
      lastName,
      description,
      currency: "PEN",
    });

    if (result?.success && result.formToken) {
      setFormToken(result.formToken);
      setTransactionId(result.transactionId || null);
      setPaymentStatus("initiated");
      
      toast({
        title: "Formulario de pago listo",
        description: "Ahora puedes completar tu pago en el formulario de abajo.",
      });

      // Wait for DOM to be ready and render form
      setTimeout(async () => {
        try {
          await renderPaymentForm(result.formToken!, "izipay-payment-form");
        } catch (err) {
          console.error("Error rendering form:", err);
          setPaymentStatus("failed");
        }
      }, 100);
    } else {
      setPaymentStatus("failed");
      toast({
        title: "Error al iniciar el pago",
        description: result?.error || "No se pudo iniciar el proceso de pago.",
        variant: "destructive",
      });
    }
  };

  const resetTest = () => {
    setPaymentStatus("idle");
    setFormToken(null);
    setTransactionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Prueba de Integración Izipay</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Valida el flujo completo de pago con la pasarela de pagos Izipay
          </p>
          <Badge variant="outline" className="mt-2">
            Ambiente de Test
          </Badge>
        </div>

        {/* Important Notice */}
        <Alert className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <AlertDescription className="text-sm">
            <strong className="text-orange-700 dark:text-orange-400">⚠️ Configuración Requerida:</strong>
            <p className="mt-2 text-orange-900 dark:text-orange-200">
              Para que esta prueba funcione, necesitas actualizar el secreto <code className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">IZIPAY_TEST_API_KEY</code> con tu <strong>clave PRIVADA de test</strong> de Izipay (no la clave pública).
            </p>
            <div className="mt-3 space-y-1 text-sm text-orange-800 dark:text-orange-300">
              <p>📋 <strong>Pasos:</strong></p>
              <p>1. Ve a <a href="https://secure.micuentaweb.pe/" target="_blank" rel="noopener noreferrer" className="underline">Izipay Dashboard Test</a></p>
              <p>2. Busca tu <strong>Clave Privada de Test</strong> en Settings → API Keys</p>
              <p>3. Actualiza el secreto en Settings → Integrations → Cloud → Secrets</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Payment Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Resumen del Pedido
                </CardTitle>
                <CardDescription>
                  Productos simulados para la prueba
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-primary/60" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">S/ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">S/ {amount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos del Cliente</CardTitle>
                <CardDescription>
                  Información para procesar el pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto (S/)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={paymentStatus === "initiated"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={paymentStatus === "initiated"}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={paymentStatus === "initiated"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={paymentStatus === "initiated"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={paymentStatus === "initiated"}
                  />
                </div>

                {paymentStatus === "idle" && (
                  <Button 
                    onClick={handleInitiatePayment} 
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando pago...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Iniciar Pago con Izipay
                      </>
                    )}
                  </Button>
                )}

                {paymentStatus === "initiated" && (
                  <Button 
                    onClick={resetTest} 
                    variant="outline"
                    className="w-full"
                  >
                    Reiniciar Prueba
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Status alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {transactionId && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>ID de Transacción:</strong> {transactionId}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Right Column - Payment Form */}
          <div className="space-y-6">
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle>Formulario de Pago</CardTitle>
                <CardDescription>
                  {paymentStatus === "idle" && "Haz clic en 'Iniciar Pago' para cargar el formulario"}
                  {paymentStatus === "processing" && "Preparando formulario de pago..."}
                  {paymentStatus === "initiated" && "Completa los datos de tu tarjeta para finalizar el pago"}
                  {paymentStatus === "success" && "¡Pago completado exitosamente!"}
                  {paymentStatus === "failed" && "El pago no pudo completarse"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentStatus === "idle" && (
                  <div className="text-center py-16 text-muted-foreground">
                    <CreditCard className="w-20 h-20 mx-auto mb-4 opacity-20" />
                    <p>El formulario de pago se mostrará aquí</p>
                  </div>
                )}

                {paymentStatus === "processing" && (
                  <div className="text-center py-16">
                    <Loader2 className="w-20 h-20 mx-auto mb-4 text-primary animate-spin" />
                    <p className="text-muted-foreground">Cargando formulario seguro...</p>
                  </div>
                )}

                {paymentStatus === "initiated" && (
                  <div className="space-y-4">
                    {/* Izipay form will be injected here */}
                    <div 
                      id="izipay-payment-form" 
                      className="min-h-[400px] bg-gradient-to-br from-muted/30 to-background rounded-lg p-4"
                    />
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Tarjetas de Test:</strong><br/>
                        • Visa: 4970 1000 0000 0003 | CVV: 123 | Exp: 12/25<br/>
                        • Mastercard: 5555 5555 5555 4444 | CVV: 123 | Exp: 12/25
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {paymentStatus === "success" && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h3>
                    <p className="text-muted-foreground mb-6">
                      Tu transacción ha sido procesada correctamente
                    </p>
                    <Button onClick={resetTest}>
                      Realizar otra prueba
                    </Button>
                  </div>
                )}

                {paymentStatus === "failed" && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pago Rechazado</h3>
                    <p className="text-muted-foreground mb-6">
                      El pago no pudo ser procesado. Intenta nuevamente.
                    </p>
                    <Button onClick={resetTest}>
                      Intentar nuevamente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de la Prueba</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Ambiente de test configurado</p>
                <p>✓ No se realizarán cargos reales</p>
                <p>✓ Usa tarjetas de test proporcionadas</p>
                <p>✓ Los webhooks registrarán eventos en la base de datos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
