import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { calculatePackageTariff, TariffCalculation } from "@/lib/tariffCalculator";
import { TARIFF_CONFIG } from "@/lib/tariffConfig";
import { Calculator, Loader2, Mail, AlertCircle, Package2, Truck, Building2 } from "lucide-react";
import { toast } from "sonner";
import { MainNavigation } from "@/components/MainNavigation";
import { SEO } from '@/components/SEO';
export default function ShippingCalculator() {
  const [weight, setWeight] = useState("");
  const [declaredValue, setDeclaredValue] = useState("");
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryCity, setDeliveryCity] = useState("");
  const [includeGuarantee, setIncludeGuarantee] = useState(false);
  const [calculation, setCalculation] = useState<TariffCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showHighValueModal, setShowHighValueModal] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const weightNum = parseFloat(weight);
  const valueNum = parseFloat(declaredValue);
  const isValid = !isNaN(weightNum) && weightNum >= TARIFF_CONFIG.limits.minWeight && !isNaN(valueNum) && valueNum >= 0 && (deliveryType === 'pickup' || deliveryType === 'delivery' && deliveryCity);
  const handleCalculate = async () => {
    if (!isValid) {
      toast.error("Por favor completa todos los campos correctamente");
      return;
    }
    if (valueNum > TARIFF_CONFIG.limits.maxValueAutoCalc) {
      setShowHighValueModal(true);
      return;
    }
    setIsCalculating(true);
    setShowResults(false);
    try {
      const result = await calculatePackageTariff(weightNum, valueNum, deliveryType, deliveryCity, includeGuarantee, false);
      if (result) {
        setCalculation(result);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error calculating tariff:', error);
      toast.error("Error al calcular la cotización");
    } finally {
      setIsCalculating(false);
    }
  };
  const handleSendEmail = async () => {
    if (!calculation || !customerEmail) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      toast.error("Por favor ingresa un email válido");
      return;
    }
    setIsSendingEmail(true);

    // Simular envío de email (integrar con Resend en producción)
    setTimeout(() => {
      setIsSendingEmail(false);
      toast.success(`Cotización enviada a ${customerEmail}`);
      setCustomerEmail("");
    }, 1500);
  };
  return <>
      <SEO title="Calculadora de envío EE.UU.–Perú | Boxifly" description="Estima en segundos el costo de envío de tu paquete desde EE.UU. a Perú. Incluye flete, impuestos y manejo." path="/cotizador" />
      <MainNavigation />
      <Dialog open={showHighValueModal} onOpenChange={setShowHighValueModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cotización Personalizada</DialogTitle>
            <DialogDescription>
              Si el monto es mayor a $2,000, comunícate con nosotros.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={() => window.location.href = 'mailto:cotizaciones@boxifly.com?subject=Cotización Personalizada'} className="w-full">
              Contactar
            </Button>
            <Button variant="outline" onClick={() => setShowHighValueModal(false)} className="w-full">
              Volver
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              Cotiza tu Envío a Perú
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Calcula fácilmente el costo total de tu envío desde Estados Unidos a Perú. Nuestra calculadora te muestra el total con flete, aranceles e impuestos al instante.
            </p>
          </div>

          {/* Calculator Card */}
          <Card className="p-6 md:p-8 shadow-2xl border-primary/20 bg-card">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">
                Calcula el precio de tu envío
              </h2>

              {/* Inputs */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium">
                    Peso (kg)
                  </Label>
                  <Input id="weight" type="number" step="0.1" min="0.1" placeholder="100" value={weight} onChange={e => setWeight(e.target.value)} className="h-12 text-base" />
                </div>

                {/* Declared Value */}
                <div className="space-y-2">
                  <Label htmlFor="declaredValue" className="text-sm font-medium">
                    Valor declarado (USD)
                  </Label>
                  <Input id="declaredValue" type="number" step="0.01" min="0" placeholder="201" value={declaredValue} onChange={e => setDeclaredValue(e.target.value)} className="h-12 text-base" />
                </div>
              </div>

              {/* Delivery Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de entrega</Label>
                <RadioGroup value={deliveryType} onValueChange={(value: 'pickup' | 'delivery') => setDeliveryType(value)} className="space-y-2">
                  <div className="flex items-center space-x-3 border rounded-lg p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1 font-normal">
                      <Building2 className="h-4 w-4 text-primary" />
                      Retiro en oficina
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 border rounded-lg p-3 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                    <RadioGroupItem value="delivery" id="delivery" />
                    <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1 font-normal">
                      <Truck className="h-4 w-4 text-primary" />
                      Envío a domicilio
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* City Selector */}
              {deliveryType === 'delivery' && <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="city" className="text-sm font-medium">Ciudad de destino</Label>
                  <Select value={deliveryCity} onValueChange={setDeliveryCity}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Selecciona ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">RUTA 30 - Lima</div>
                      {TARIFF_CONFIG.cityRoutes.route30.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">RUTA 40 - Nacional</div>
                      {TARIFF_CONFIG.cityRoutes.route40.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>}

              {/* Guarantee Option */}
              <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-shadow duration-200 hover:shadow-md" style={{ backgroundColor: '#E9F2F5' }}>
                <Checkbox id="guarantee" checked={includeGuarantee} onCheckedChange={checked => setIncludeGuarantee(checked as boolean)} />
                <div className="flex-1 text-action-primary">
                  <Label htmlFor="guarantee" className="cursor-pointer font-medium text-sm">
                    Cobertura del Paquete
                  </Label>
                  <p className="text-xs mt-1 text-navy">
                    Protección completa para tu envío
                  </p>
                </div>
              </div>

              {/* Calculate Button */}
              <Button onClick={handleCalculate} disabled={!isValid || isCalculating} className="w-full h-12 text-base font-semibold" size="lg">
                {isCalculating ? <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Calculando...
                  </> : <>
                    <Calculator className="mr-2 h-5 w-5" />
                    CALCULAR
                  </>}
              </Button>

              {/* Results */}
              {showResults && calculation && <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4 border-t">
                  {/* Summary Values */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 bg-primary/10 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground font-medium">Valor Declarado</p>
                      <p className="text-2xl font-bold text-primary">
                        ${calculation.declaredValue.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1 bg-primary/10 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground font-medium">Valor CIF (valor aduanero)</p>
                      <p className="text-2xl font-bold text-primary">
                        ${calculation.cif_value.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown Table */}
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-primary text-primary-foreground">
                          <th className="text-left py-3 px-4 font-semibold">Cargos</th>
                          <th className="text-right py-3 px-4 font-semibold">USD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr className="bg-background">
                          <td className="py-3 px-4">Flete Internacional</td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${calculation.freight_cost.toFixed(2)}
                          </td>
                        </tr>
                        {includeGuarantee && calculation.guarantee_cost > 0 && <tr style={{ backgroundColor: '#E9F2F5' }}>
                            <td className="py-3 px-4">Cobertura del Paquete </td>
                            <td className="py-3 px-4 text-right font-medium">
                              ${calculation.guarantee_cost.toFixed(2)}
                            </td>
                          </tr>}
                        <tr className="bg-background">
                          <td className="py-3 px-4">Manejo Aduanero</td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${calculation.customs_handling_cost.toFixed(2)}
                          </td>
                        </tr>
                        {calculation.applies_taxes && <tr className="bg-accent/30">
                            <td className="py-3 px-4">Impuestos</td>
                            <td className="py-3 px-4 text-right font-medium">
                              ${calculation.total_government_charges.toFixed(2)}
                            </td>
                          </tr>}
                        {calculation.delivery_cost > 0 && <tr className="bg-background">
                            <td className="py-3 px-4">Entrega</td>
                            <td className="py-3 px-4 text-right font-medium">
                              ${calculation.delivery_cost.toFixed(2)}
                            </td>
                          </tr>}
                        <tr className="bg-primary/10">
                          <td className="py-3 px-4 font-semibold">Total Cargos Logísticos</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            ${calculation.total_transport_charges.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-primary/10">
                          <td className="py-3 px-4 font-semibold">Impuestos y Aranceles</td>
                          <td className="py-3 px-4 text-right font-semibold">
                            ${calculation.total_government_charges.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-primary text-primary-foreground">
                          <td className="py-4 px-4 font-bold text-base">Total Cargos</td>
                          <td className="py-4 px-4 text-right font-bold text-lg">
                            ${calculation.final_cost.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Email Section */}
                  <div className="space-y-3 pt-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Enviar cotización por correo
                    </Label>
                    <div className="flex gap-2">
                      <Input id="email" type="email" placeholder="tu@email.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="h-11" />
                      <Button onClick={handleSendEmail} disabled={isSendingEmail || !customerEmail} className="px-6" aria-label="Enviar cotización por correo">
                        {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
                      </Button>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="flex gap-3 p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
                    <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      El precio indicado arriba es solo una estimación de los costos de flete, aduanas e impuestos. 
                      Los costos finales pueden variar según las declaraciones aduaneras reales y otros cargos como 
                      manejo especial o requisitos de importación. Consulta los envíos restringidos para más información.
                    </p>
                  </div>
                </div>}
            </div>
          </Card>
        </div>
      </div>
    </>;
}