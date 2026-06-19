import { useState } from "react";
import { Copy, Check, Info, ShoppingBag, MapPin, Phone, User, Building, MessageCircle, HelpCircle, Package, Warehouse, Send, Home, ShoppingCart, Truck, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { SEO } from '@/components/SEO';

// Dirección Doral - Compras estándar
const doralAddress = {
  id: 1,
  label: "Dirección Doral (EE.UU.)",
  name: "BXF-209422 + Tu nombre",
  street: "9950 NW 17th St #102",
  city: "Doral",
  state: "FL",
  stateFull: "Florida",
  zip: "33172",
  phone: "(786) 322-3333",
  country: "Estados Unidos"
};

// Dirección Miami - Compras especiales
const miamiAddress = {
  id: 2,
  label: "Dirección Miami (EE.UU.)",
  name: "BXF-209422 + Tu nombre",
  street: "8614 NW 66th St",
  city: "Miami",
  state: "FL",
  stateFull: "Florida",
  zip: "33166",
  phone: "(786) 322-3333",
  country: "Estados Unidos"
};
const ComoComprarUSA = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedModel, setCopiedModel] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const copyAddress = (address: typeof doralAddress, id: string) => {
    const fullAddress = `${address.name}
${address.street}
${address.city}, ${address.state} ${address.zip}
${address.phone}`;
    navigator.clipboard.writeText(fullAddress);
    setCopiedId(id);
    toast.success("Dirección copiada al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };
  const copyModel1 = () => {
    const model1Text = `País: Estados Unidos
Nombre completo: BXF-209422 Juan Pérez
Teléfono: (786) 322-3333
Dirección: 9950 NW 17th St #102
Ciudad: Doral
Estado: Florida
Código postal: 33172`;
    navigator.clipboard.writeText(model1Text);
    setCopiedModel(1);
    toast.success("Modelo 1 copiado al portapapeles");
    setTimeout(() => setCopiedModel(null), 2000);
  };
  const copyModel2 = () => {
    const model2Text = `Country: United States
First name: Juan
Last name: Pérez BXF-209422
Street address: 9950 NW 17th St
Street address 2: #102
City: Doral
State: Florida
ZIP code: 33172
Phone: (786) 322-3333`;
    navigator.clipboard.writeText(model2Text);
    setCopiedModel(2);
    toast.success("Modelo 2 copiado al portapapeles");
    setTimeout(() => setCopiedModel(null), 2000);
  };
  const copyField = (value: string, fieldName: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${fieldName} copiado`);
  };
  const steps = [{
    number: 1,
    icon: ShoppingCart,
    title: "Elige tu producto",
    description: "Compra en Amazon, Shein, eBay u otras tiendas de EE.UU."
  }, {
    number: 2,
    icon: MapPin,
    title: "Usa tu dirección Boxifly",
    description: "Coloca tu dirección Boxifly al momento de pagar en la tienda online."
  }, {
    number: 3,
    icon: Warehouse,
    title: "Recibimos tu paquete en EE.UU.",
    description: "Tu compra llega a nuestro almacén y es registrada correctamente."
  }, {
    number: 4,
    icon: Send,
    title: "Envío a Perú",
    description: "Procesamos y enviamos tu compra de forma segura."
  }, {
    number: 5,
    icon: Home,
    title: "Entrega final",
    description: "Recibe tu compra en Perú sin complicaciones."
  }];
  return <div className="min-h-screen bg-background">
      <SEO title="Cómo comprar en EE.UU. paso a paso | Boxifly" description="Guía completa para comprar en tiendas de EE.UU. usando tu casillero Boxifly en Miami. Direcciones, códigos y prealertas." path="/como-comprar-en-usa" />
      <MainNavigation />
      
      {/* ═══════════════════════════════════════════════════════════════════════
          BLOQUE 1 — PASO A PASO INTERACTIVO
       ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary via-primary/95 to-navy overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.2),transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <Badge className="bg-white/10 text-white border-white/20 mb-4">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Guía de compra
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              ¿Cómo comprar en USA con Boxifly?
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Compra como siempre. Nosotros nos encargamos del resto.
            </p>
          </div>

          {/* Interactive Steps - Desktop */}
          <div className="hidden lg:block max-w-5xl mx-auto">
            <div className="relative">
              {/* Progress Line - Behind icons with lower z-index and reduced opacity */}
              <div className="absolute top-[3.5rem] left-[10%] right-[10%] h-0.5 bg-white/10 rounded-full z-0" />
              <div 
                className="absolute top-[3.5rem] left-[10%] h-0.5 bg-secondary/60 rounded-full transition-all duration-500 z-0" 
                style={{ width: `${(activeStep - 1) / 4 * 80}%` }} 
              />
              
              {/* Steps */}
              <div className="grid grid-cols-5 gap-4 relative z-10">
                {steps.map(step => (
                  <div 
                    key={step.number} 
                    className="relative cursor-pointer group flex flex-col items-center" 
                    onClick={() => setActiveStep(step.number)}
                  >
                    {/* Icon Container with integrated number */}
                    <div className="relative mb-6">
                      <div className={`
                        w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${activeStep >= step.number ? 'bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30' : 'bg-white/10 text-white/60 hover:bg-white/20'}
                      `}>
                        <step.icon className="w-10 h-10" />
                      </div>
                      {/* Number badge positioned below the icon */}
                      <div className={`
                        absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md
                        ${activeStep >= step.number ? 'bg-white text-primary' : 'bg-white/20 text-white/60'}
                      `}>
                        {step.number}
                      </div>
                    </div>
                    
                    {/* Text content with clear separation */}
                    <div className="text-center px-2">
                      <h3 className={`font-semibold text-sm mb-2 transition-colors ${activeStep === step.number ? 'text-white' : 'text-white/70'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-xs leading-relaxed transition-colors ${activeStep === step.number ? 'text-white/80' : 'text-white/50'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Steps - Mobile/Tablet */}
          <div className="lg:hidden max-w-md mx-auto space-y-3">
            {steps.map((step, index) => <div key={step.number} className={`
                  p-4 rounded-xl transition-all duration-300 cursor-pointer
                  ${activeStep === step.number ? 'bg-white/15 backdrop-blur-sm border border-white/30' : 'bg-white/5 hover:bg-white/10'}
                `} onClick={() => setActiveStep(step.number)}>
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all
                    ${activeStep === step.number ? 'bg-secondary text-secondary-foreground' : 'bg-white/10 text-white/60'}
                  `}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        text-xs font-bold px-2 py-0.5 rounded-full
                        ${activeStep === step.number ? 'bg-secondary text-secondary-foreground' : 'bg-white/20 text-white/70'}
                      `}>
                        Paso {step.number}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && activeStep === step.number && <ChevronRight className="w-5 h-5 text-secondary animate-pulse shrink-0" />}
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BLOQUE 2 — DIRECCIONES BOXIFLY (DORAL Y MIAMI)
       ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-secondary font-semibold text-xs uppercase tracking-wider mb-2 block">
                Tu casillero en USA
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                Direcciones Boxifly
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Usa la dirección correcta según el tipo de compra que realices
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Dirección Doral - Compras estándar */}
              <Card className="relative overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-all group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          {doralAddress.label}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Compras estándar</p>
                      </div>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">
                      Recomendada
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Usa esta dirección para la mayoría de compras habituales en EE.UU.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Ropa y accesorios</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Electrónicos de uso personal</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Compras de bajo a mediano valor</span>
                      </li>
                    </ul>
                    <div className="pt-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs text-primary font-medium">
                        👉 Es la opción recomendada para empezar.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-muted/50 rounded-lg p-4 mt-4">
                    <AddressField icon={<User className="w-4 h-4" />} label="Nombre completo" value={doralAddress.name} onCopy={() => copyField(doralAddress.name, "Nombre")} highlight />
                    <AddressField icon={<Building className="w-4 h-4" />} label="Dirección" value={doralAddress.street} onCopy={() => copyField(doralAddress.street, "Dirección")} />
                    <div className="grid grid-cols-3 gap-2">
                      <AddressField label="Ciudad" value={doralAddress.city} onCopy={() => copyField(doralAddress.city, "Ciudad")} compact />
                      <AddressField label="Estado" value={doralAddress.state} onCopy={() => copyField(doralAddress.state, "Estado")} compact />
                      <AddressField label="ZIP" value={doralAddress.zip} onCopy={() => copyField(doralAddress.zip, "Código postal")} compact />
                    </div>
                    <AddressField icon={<Phone className="w-4 h-4" />} label="Teléfono" value={doralAddress.phone} onCopy={() => copyField(doralAddress.phone, "Teléfono")} />
                  </div>

                  <Button onClick={() => copyAddress(doralAddress, 'doral')} className="w-full gap-2" size="lg">
                    {copiedId === 'doral' ? <>
                        <Check className="w-5 h-5" />
                        ¡Copiado!
                      </> : <>
                        <Copy className="w-5 h-5" />
                        Copiar dirección Doral
                      </>}
                  </Button>
                </CardContent>
              </Card>

              {/* Dirección Miami - Compras especiales */}
              <Card className="relative overflow-hidden border-2 border-secondary/30 hover:border-secondary/60 transition-all group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Truck className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          {miamiAddress.label}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Compras especiales</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Especial
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Usa esta dirección para artículos de mayor valor o productos sensibles, por ejemplo:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span>Artículos de mayor valor</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span>Productos sensibles o con restricciones</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span>Vitaminas y suplementos</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span>Celulares, tablets, laptops, cámaras, drones</span>
                      </li>
                    </ul>
                    <div className="pt-2 px-3 py-2 bg-secondary/5 rounded-lg border border-secondary/20">
                      <p className="text-xs text-secondary font-medium">
                        ⚠️ Si tu artículo cuesta más de USD 200 o tienes dudas, contáctanos antes de comprar.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-muted/50 rounded-lg p-4 mt-4">
                    <AddressField icon={<User className="w-4 h-4" />} label="Nombre completo" value={miamiAddress.name} onCopy={() => copyField(miamiAddress.name, "Nombre")} highlight />
                    <AddressField icon={<Building className="w-4 h-4" />} label="Dirección" value={miamiAddress.street} onCopy={() => copyField(miamiAddress.street, "Dirección")} />
                    <div className="grid grid-cols-3 gap-2">
                      <AddressField label="Ciudad" value={miamiAddress.city} onCopy={() => copyField(miamiAddress.city, "Ciudad")} compact />
                      <AddressField label="Estado" value={miamiAddress.state} onCopy={() => copyField(miamiAddress.state, "Estado")} compact />
                      <AddressField label="ZIP" value={miamiAddress.zip} onCopy={() => copyField(miamiAddress.zip, "Código postal")} compact />
                    </div>
                    <AddressField icon={<Phone className="w-4 h-4" />} label="Teléfono" value={miamiAddress.phone} onCopy={() => copyField(miamiAddress.phone, "Teléfono")} />
                  </div>

                  <Button onClick={() => copyAddress(miamiAddress, 'miami')} variant="secondary" className="w-full gap-2" size="lg">
                    {copiedId === 'miami' ? <>
                        <Check className="w-5 h-5" />
                        ¡Copiado!
                      </> : <>
                        <Copy className="w-5 h-5" />
                        Copiar dirección Miami
                      </>}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Código obligatorio */}
            <div className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-start gap-3 max-w-2xl mx-auto">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  El código <span className="font-mono bg-primary/20 px-2 py-0.5 rounded text-primary font-bold">BXF-209422</span> identifica tu casillero
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este código es obligatorio y garantiza que tu paquete sea procesado correctamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BLOQUE 3 — MODELOS 1 Y 2 (EXACTAMENTE COMO ESTABAN)
       ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <span className="text-secondary font-semibold text-xs uppercase tracking-wider mb-2 block">
                Ejemplos de ingreso
              </span>
              <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
                ¿Cómo ingreso la dirección?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dependiendo del formulario de la tienda, elige el modelo que mejor se adapte
              </p>
            </div>
            
            {/* Clarification Banner */}
            <div className="max-w-3xl mx-auto mb-10 p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <p className="text-center text-sm text-foreground">
                <strong>📌 Importante:</strong> Los Modelos 1 y 2 son únicamente <strong>ejemplos de cómo ingresar correctamente tu dirección</strong> al momento de comprar. No representan una decisión logística.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Model 1 - EXACTAMENTE COMO ESTABA */}
              <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">Forma estándar</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Cuando permiten números en el nombre
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      ✓ Usa este modelo en Amazon, Zappos y tiendas similares
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border space-y-3">
                    <FormFieldDisplay label="País o región" value="Estados Unidos" />
                    <FormFieldDisplay label="Nombre completo" value="BXF-209422 Juan Pérez" highlight annotation="← Código + nombre" />
                    <FormFieldDisplay label="Teléfono" value="(786) 322-3333" />
                    <FormFieldDisplay label="Dirección" value="9950 NW 17th St #102" />
                    <div className="grid grid-cols-3 gap-2">
                      <FormFieldDisplay label="Ciudad" value="Doral" compact />
                      <FormFieldDisplay label="Estado" value="Florida" compact />
                      <FormFieldDisplay label="ZIP" value="33172" compact />
                    </div>
                  </div>

                  <Button onClick={copyModel1} variant="outline" className="w-full gap-2 mt-4">
                    {copiedModel === 1 ? <>
                        <Check className="w-4 h-4" />
                        ¡Copiado!
                      </> : <>
                        <Copy className="w-4 h-4" />
                        Copiar Modelo 1
                      </>}
                  </Button>
                </CardContent>
              </Card>

              {/* Model 2 - EXACTAMENTE COMO ESTABA */}
              <Card className="overflow-hidden border-2 hover:border-secondary/50 transition-all">
                <CardHeader className="bg-secondary/5 border-b">
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-secondary-foreground font-bold">
                      2
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">Forma alternativa</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Si no permiten números en el nombre
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      ✓ Usa este modelo en eBay y tiendas con campos separados
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border space-y-3">
                    <FormFieldDisplay label="Country or region" value="United States" />
                    <div className="grid grid-cols-2 gap-2">
                      <FormFieldDisplay label="First name" value="Juan" />
                      <FormFieldDisplay label="Last name" value="Pérez BXF-209422" highlight annotation="← Código al final" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <FormFieldDisplay label="Street address" value="9950 NW 17th St" />
                      <FormFieldDisplay label="Apt / Suite" value="#102" highlight annotation="← Suite aquí" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <FormFieldDisplay label="City" value="Doral" compact />
                      <FormFieldDisplay label="State" value="Florida" compact />
                      <FormFieldDisplay label="ZIP" value="33172" compact />
                    </div>
                    <FormFieldDisplay label="Phone number" value="(786) 322-3333" />
                  </div>

                  <Button onClick={copyModel2} variant="outline" className="w-full gap-2 mt-4">
                    {copiedModel === 2 ? <>
                        <Check className="w-4 h-4" />
                        ¡Copiado!
                      </> : <>
                        <Copy className="w-4 h-4" />
                        Copiar Modelo 2
                      </>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          BLOQUE 4 — NOTAS IMPORTANTES (COPY PROFESIONAL)
       ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Nota informativa */}
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardContent className="p-6 flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Nota informativa</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Existen tiendas donde no permiten ingresar números en el campo "Nombre". 
                    En ese caso, utiliza el formato del <strong>Modelo 2</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Texto legal suave */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground leading-relaxed">
                    El correcto ingreso de la dirección garantiza una gestión rápida y sin contratiempos.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Microtexto educativo con CTA */}
            <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10">
              <CardContent className="p-6 text-center">
                <HelpCircle className="w-10 h-10 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  ¿Tienes dudas antes de comprar?
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Contáctanos y te guiamos paso a paso.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <a href="https://wa.me/51951314150" target="_blank" rel="noopener noreferrer" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              ¿Listo para comprar?
            </h2>
            <p className="text-muted-foreground mb-8">
              Ya conoces cómo ingresar tu dirección. Ahora explora las tiendas de USA 
              y comienza a disfrutar de tus productos favoritos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2">
                <a href="/tiendas-en-usa">
                  <ShoppingBag className="w-5 h-5" />
                  Ver tiendas populares
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <a href="/calculator">
                  Calcular envío
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>;
};

// ═══════════════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════════════

interface AddressFieldProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onCopy: () => void;
  highlight?: boolean;
  compact?: boolean;
}
const AddressField = ({
  icon,
  label,
  value,
  onCopy,
  highlight,
  compact
}: AddressFieldProps) => <TooltipProvider>
    <div className={`${compact ? '' : 'flex items-center gap-3'}`}>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${highlight ? 'text-primary' : 'text-foreground'}`}>
            {value}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onCopy} className="p-1 hover:bg-muted rounded transition-colors shrink-0">
                <Copy className="w-3 h-3 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar {label.toLowerCase()}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  </TooltipProvider>;
interface FormFieldDisplayProps {
  label: string;
  value: string;
  annotation?: string | null;
  highlight?: boolean;
  compact?: boolean;
}
const FormFieldDisplay = ({
  label,
  value,
  annotation,
  highlight,
  compact
}: FormFieldDisplayProps) => <div>
    <label className="block text-xs text-muted-foreground mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <div className={`
        flex-1 px-3 py-2 rounded-md border bg-background text-sm
        ${highlight ? 'border-primary bg-primary/5 font-medium text-primary' : 'border-input'}
        ${compact ? 'text-xs py-1.5' : ''}
      `}>
        {value}
      </div>
      {annotation && <span className="text-xs text-primary whitespace-nowrap font-medium">
          {annotation}
        </span>}
    </div>
  </div>;
export default ComoComprarUSA;