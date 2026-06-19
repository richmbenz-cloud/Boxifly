import { useState, useRef, useCallback } from "react";
import { Copy, Check, Info, ShoppingBag, MapPin, Warehouse, Send, Home, ShoppingCart, Truck, CheckCircle2, FileDown, Package, Download } from "lucide-react";
import logoBoxifly from "@/assets/logo-boxifly-full.png";
import cubeBoxifly from "@/assets/logo-boxifly-icon.png";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  name: "SUL160 + Tu nombre",
  street: "8346 NW 68 St",
  city: "Miami",
  state: "FL",
  stateFull: "Florida",
  zip: "33166",
  phone: "(786) 322-3333",
  country: "Estados Unidos"
};

const ComoComprarUSAPDF = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedModel, setCopiedModel] = useState<number | null>(null);

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

  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(async () => {
    if (!contentRef.current) return;
    
    toast.info("Generando PDF, espera un momento...", { duration: 3000 });
    
    try {
      // Hide no-print elements
      const noPrintElements = contentRef.current.querySelectorAll('.no-print');
      noPrintElements.forEach(el => (el as HTMLElement).style.display = 'none');
      
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: contentRef.current.scrollWidth,
        windowWidth: 420,
      });
      
      // Restore no-print elements
      noPrintElements.forEach(el => (el as HTMLElement).style.display = '');
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 16; // 8mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const totalPages = Math.ceil(imgHeight / (pdfHeight - 16));
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        const yOffset = -(i * (pdfHeight - 16)) + 8;
        pdf.addImage(imgData, 'JPEG', 8, yOffset, imgWidth, imgHeight);
      }
      
      pdf.save('Boxifly-Guia-Compra-USA.pdf');
      toast.success("¡PDF descargado correctamente!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Error al generar el PDF. Intenta de nuevo.");
    }
  }, []);

  const steps = [
    { number: 1, icon: ShoppingCart, title: "Elige tu producto", description: "Compra en Amazon, Shein, eBay u otras tiendas de EE.UU." },
    { number: 2, icon: MapPin, title: "Usa tu dirección Boxifly", description: "Coloca la dirección Boxifly al momento de comprar." },
    { number: 3, icon: Warehouse, title: "Recibimos tu paquete", description: "Tu compra llega a nuestro almacén en EE.UU." },
    { number: 4, icon: Send, title: "Envío a Perú", description: "Procesamos y enviamos tu compra de forma segura." },
    { number: 5, icon: Home, title: "Entrega final", description: "Recibe tu compra en Perú sin complicaciones." }
  ];

  return (
    <div className="min-h-screen bg-white print:bg-white" id="pdf-content">
      {/* Print Styles - Optimized for 5 pages PDF without URL/date/page numbers */}
      <style>{`
        /* Print Media - Hide browser headers/footers */
        @media print {
          /* Page setup - no margins for headers/footers */
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          
          /* First page no top margin */
          @page :first {
            margin-top: 10mm;
          }
          
          /* Reset everything */
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
          }
          
          /* Hide non-printable elements */
          .no-print, 
          header.no-print { 
            display: none !important; 
            visibility: hidden !important;
          }
          
          /* Container for PDF */
          .pdf-wrapper {
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
          
          /* Prevent page breaks inside elements */
          .pdf-keep-together {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Force page break before */
          .pdf-page-break {
            page-break-before: always !important;
            break-before: page !important;
            padding-top: 0 !important;
          }
          
          /* Remove link underlines and colors */
          a {
            text-decoration: none !important;
            color: inherit !important;
          }
          
          /* Hide any URL text that might appear */
          a[href]:after {
            content: none !important;
          }
        }
        
        /* Screen styles - mobile first */
        @media screen {
          .pdf-wrapper {
            max-width: 100%;
            margin: 0 auto;
            padding: 16px 12px;
          }
          
          @media (min-width: 480px) {
            .pdf-wrapper {
              max-width: 420px;
              padding: 20px 16px;
            }
          }
        }
      `}</style>

      {/* Header with Download Button - Only shows in browser */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground p-3 no-print">
        <div className="container mx-auto flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold text-sm">Boxifly</span>
          </div>
          <Button onClick={handleDownloadPDF} variant="secondary" size="sm" className="gap-1.5 text-xs h-8 px-3">
            <Download className="w-3.5 h-3.5" />
            Descargar PDF
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pdf-wrapper" ref={contentRef}>
        
        {/* ═══════════════════════════════════════════════════════════════════════
            PÁGINA 1 — GUÍA DE COMPRA (PASO A PASO)
         ═══════════════════════════════════════════════════════════════════════ */}
        <section className="pdf-page">
          {/* Header */}
          <div className="text-center mb-4">
            <img src={logoBoxifly} alt="Boxifly" className="h-10 mx-auto mb-2" />
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              Guía de compra
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground mb-1">
              ¿Cómo comprar en USA con Boxifly?
            </h1>
            <p className="text-muted-foreground text-xs">
              Compra como siempre. Nosotros nos encargamos del resto.
            </p>
          </div>

          {/* Steps - Clean vertical layout */}
          <div className="space-y-2.5">
            {steps.map((step) => (
              <div 
                key={step.number} 
                className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/50 pdf-keep-together"
              >
                {/* Step number */}
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Cube footer */}
          <div className="flex justify-end mt-6">
            <img src={cubeBoxifly} alt="" className="w-8 h-8 opacity-40" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            PÁGINA 2 — DIRECCIÓN DORAL
         ═══════════════════════════════════════════════════════════════════════ */}
        <section className="pdf-page pdf-page-break">
          <div className="text-center mb-4">
            <span className="text-secondary font-semibold text-[10px] uppercase tracking-wider block mb-0.5">
              Tu casillero en USA
            </span>
            <h2 className="text-lg font-bold text-foreground">
              Direcciones Boxifly
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Usa la dirección correcta según el tipo de compra
            </p>
          </div>

          {/* Dirección Doral Card */}
          <div className="border-2 border-primary/30 rounded-xl overflow-hidden pdf-keep-together">
            {/* Card Header */}
            <div className="bg-primary/5 px-3 py-2.5 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{doralAddress.label}</h3>
                    <p className="text-[10px] text-muted-foreground">Compras estándar</p>
                  </div>
                </div>
                <span className="bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Recomendada
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                Usa esta dirección para la mayoría de compras habituales en EE.UU.
              </p>

              {/* Use cases */}
              <div className="space-y-1.5">
                {["Ropa y accesorios", "Electrónicos de uso personal", "Compras de bajo a mediano valor"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-[10px] text-primary font-medium text-center">
                  👉 Es la opción recomendada para empezar
                </p>
              </div>

              {/* Address Details */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <AddressField label="Nombre" value={doralAddress.name} highlight />
                <AddressField label="Dirección" value={doralAddress.street} />
                <div className="grid grid-cols-3 gap-2">
                  <AddressField label="Ciudad" value={doralAddress.city} compact />
                  <AddressField label="Estado" value={doralAddress.state} compact />
                  <AddressField label="ZIP" value={doralAddress.zip} compact />
                </div>
                <AddressField label="Teléfono" value={doralAddress.phone} />
              </div>

              <Button 
                onClick={() => copyAddress(doralAddress, 'doral')} 
                className="w-full gap-2 h-9 text-sm no-print"
              >
                {copiedId === 'doral' ? <><Check className="w-4 h-4" /> ¡Copiado!</> : <><Copy className="w-4 h-4" /> Copiar dirección Doral</>}
              </Button>
            </div>
          </div>
          {/* Cube footer */}
          <div className="flex justify-end mt-6">
            <img src={cubeBoxifly} alt="" className="w-8 h-8 opacity-40" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            PÁGINA 3 — DIRECCIÓN MIAMI
         ═══════════════════════════════════════════════════════════════════════ */}
        <section className="pdf-page pdf-page-break">
          {/* Dirección Miami Card */}
          <div className="border-2 border-secondary/30 rounded-xl overflow-hidden pdf-keep-together">
            {/* Card Header */}
            <div className="bg-secondary/5 px-3 py-2.5 border-b border-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/15 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{miamiAddress.label}</h3>
                    <p className="text-[10px] text-muted-foreground">Compras especiales</p>
                  </div>
                </div>
                <span className="bg-secondary text-secondary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Especial
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                Usa esta dirección para artículos de valor mayor a $200 o productos sensibles:
              </p>

              {/* Use cases */}
              <div className="space-y-1.5">
                {[
                  "Artículos de mayor valor",
                  "Productos sensibles o con restricciones",
                  "Vitaminas y suplementos",
                  "Celulares, tablets, laptops, cámaras, drones"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-secondary/5 rounded-lg border border-secondary/20">
                <p className="text-[10px] text-secondary font-medium text-center">
                  ⚠️ Si tu artículo cuesta más de USD 200, contáctanos antes
                </p>
              </div>

              {/* Address Details */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <AddressField label="Nombre" value={miamiAddress.name} highlight />
                <AddressField label="Dirección" value={miamiAddress.street} />
                <div className="grid grid-cols-3 gap-2">
                  <AddressField label="Ciudad" value={miamiAddress.city} compact />
                  <AddressField label="Estado" value={miamiAddress.state} compact />
                  <AddressField label="ZIP" value={miamiAddress.zip} compact />
                </div>
                <AddressField label="Teléfono" value={miamiAddress.phone} />
              </div>

              <Button 
                onClick={() => copyAddress(miamiAddress, 'miami')} 
                variant="secondary"
                className="w-full gap-2 h-9 text-sm no-print"
              >
                {copiedId === 'miami' ? <><Check className="w-4 h-4" /> ¡Copiado!</> : <><Copy className="w-4 h-4" /> Copiar dirección Miami</>}
              </Button>
            </div>
          </div>

          {/* Código obligatorio */}
          <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl pdf-keep-together">
            <div className="flex items-center gap-2 mb-1.5">
              <Info className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="font-medium text-foreground text-xs leading-snug">
                El código <span className="font-mono bg-primary/20 px-1 py-0.5 rounded text-primary font-bold text-[11px]">BXF-209422</span> o <span className="font-mono bg-primary/20 px-1 py-0.5 rounded text-primary font-bold text-[11px]">SUL160</span> identifica tu casillero
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground ml-6">
              Es obligatorio para procesar tu paquete correctamente.
            </p>
          </div>
          {/* Cube footer */}
          <div className="flex justify-end mt-6">
            <img src={cubeBoxifly} alt="" className="w-8 h-8 opacity-40" />
          </div>
        </section>
        {/* ═══════════════════════════════════════════════════════════════════════
            PÁGINA 4 — MODELO 1 (FORMA ESTÁNDAR)
         ═══════════════════════════════════════════════════════════════════════ */}
        <section className="pdf-page pdf-page-break">
          <div className="text-center mb-4">
            <span className="text-secondary font-semibold text-[10px] uppercase tracking-wider block mb-0.5">
              Ejemplos de ingreso
            </span>
            <h2 className="text-lg font-bold text-foreground mb-1">
              ¿Cómo ingreso la dirección?
            </h2>
            <p className="text-xs text-muted-foreground">
              Usa el modelo que corresponda según la tienda
            </p>
          </div>

          {/* Model 1 Card */}
          <div className="border-2 border-border rounded-xl overflow-hidden pdf-keep-together">
            {/* Card Header */}
            <div className="bg-primary/5 px-3 py-2.5 border-b flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                1
              </span>
              <div>
                <h3 className="font-bold text-foreground text-sm">Forma estándar</h3>
                <p className="text-[10px] text-muted-foreground">Cuando permiten números en el nombre</p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-3 space-y-3">
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-[10px] text-green-700 text-center font-medium">
                  ✓ Usa este modelo en Amazon, Zappos y tiendas similares
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border space-y-2">
                <FormField label="País o región" value="Estados Unidos" />
                <FormField label="Nombre completo" value="BXF-209422 Juan Pérez" highlight />
                <FormField label="Teléfono" value="(786) 322-3333" />
                <FormField label="Dirección" value="9950 NW 17th St #102" />
                <div className="grid grid-cols-3 gap-1.5">
                  <FormField label="Ciudad" value="Doral" compact />
                  <FormField label="Estado" value="Florida" compact />
                  <FormField label="ZIP" value="33172" compact />
                </div>
              </div>

              <Button 
                onClick={copyModel1} 
                variant="outline" 
                className="w-full gap-2 h-9 text-sm no-print"
              >
                {copiedModel === 1 ? <><Check className="w-4 h-4" /> ¡Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Modelo 1</>}
              </Button>
            </div>
          </div>
          {/* Cube footer */}
          <div className="flex justify-end mt-6">
            <img src={cubeBoxifly} alt="" className="w-8 h-8 opacity-40" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════════
            PÁGINA 5 — MODELO 2 + NOTAS INFORMATIVAS
         ═══════════════════════════════════════════════════════════════════════ */}
        <section className="pdf-page pdf-page-break">
          {/* Model 2 Card */}
          <div className="border-2 border-border rounded-xl overflow-hidden pdf-keep-together">
            {/* Card Header */}
            <div className="bg-secondary/5 px-3 py-2.5 border-b flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground font-bold text-sm flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="font-bold text-foreground text-sm">Forma alternativa</h3>
                <p className="text-[10px] text-muted-foreground">Si no permiten números en el nombre</p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-3 space-y-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-[10px] text-amber-700 text-center font-medium">
                  ✓ Usa este modelo en eBay y tiendas con campos separados
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border space-y-2">
                <FormField label="Country or region" value="United States" />
                <div className="grid grid-cols-2 gap-1.5">
                  <FormField label="First name" value="Juan" compact />
                  <FormField label="Last name" value="Pérez BXF-209422" highlight compact />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <FormField label="Street address" value="9950 NW 17th St" compact />
                  <FormField label="Apt / Suite" value="#102" highlight compact />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <FormField label="City" value="Doral" compact />
                  <FormField label="State" value="Florida" compact />
                  <FormField label="ZIP" value="33172" compact />
                </div>
                <FormField label="Phone number" value="(786) 322-3333" />
              </div>

              <Button 
                onClick={copyModel2} 
                variant="outline" 
                className="w-full gap-2 h-9 text-sm no-print"
              >
                {copiedModel === 2 ? <><Check className="w-4 h-4" /> ¡Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Modelo 2</>}
              </Button>
            </div>
          </div>

          {/* Notas informativas - compactas para caber en página 5 */}
          <div className="mt-3 space-y-2 pdf-keep-together">
            {/* Nota informativa */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/50">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-muted-foreground">ℹ</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-xs mb-0.5">
                    Nota informativa
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Existen tiendas donde no permiten ingresar números en el campo "Nombre". En ese caso, utiliza el formato del <span className="font-medium text-foreground">Modelo 2</span>.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mensaje de garantía */}
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <p className="text-[11px] text-foreground leading-snug">
                  El correcto ingreso de la dirección garantiza una <span className="font-semibold text-primary">gestión rápida</span> y <span className="font-semibold text-primary">sin contratiempos</span>.
                </p>
              </div>
            </div>
          </div>
          {/* Cube footer */}
          <div className="flex justify-end mt-6">
            <img src={cubeBoxifly} alt="" className="w-8 h-8 opacity-40" />
          </div>
        </section>

      </main>
    </div>
  );
};

// Helper Components - Compact for PDF

interface AddressFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
}

const AddressField = ({ label, value, highlight, compact }: AddressFieldProps) => (
  <div>
    <span className={`text-muted-foreground block ${compact ? 'text-[9px]' : 'text-[10px]'} mb-0.5`}>
      {label}
    </span>
    <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'} ${highlight ? 'text-primary' : 'text-foreground'}`}>
      {value}
    </span>
  </div>
);

interface FormFieldProps {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
}

const FormField = ({ label, value, highlight, compact }: FormFieldProps) => (
  <div>
    <label className={`block text-muted-foreground mb-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
      {label}
    </label>
    <div className={`
      px-2 rounded-md border bg-white
      ${compact ? 'py-1 text-[10px]' : 'py-1.5 text-xs'}
      ${highlight ? 'border-primary bg-primary/5 font-semibold text-primary' : 'border-input text-foreground'}
    `}>
      {value}
    </div>
  </div>
);

export default ComoComprarUSAPDF;
