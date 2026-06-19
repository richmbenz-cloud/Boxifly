import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Plane, DollarSign, Shield, Truck, MapPin, Warehouse, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { MainNavigation } from "@/components/MainNavigation";
import { SEO } from '@/components/SEO';

export default function Tariffs() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Aranceles e impuestos de importación | Boxifly" description="Conoce los aranceles y tributos para importar a Perú: umbrales, fórmulas y ejemplos. Calcula antes de comprar." path="/tariffs" />
      <MainNavigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
              Tarifas de Envío
            </h1>
            <p className="text-lg text-muted-foreground">
              Conoce nuestras tarifas competitivas y transparentes para envíos desde Estados Unidos a Perú
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12">
        
        {/* Envío Internacional por Peso */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Plane className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Envío Internacional</CardTitle>
                <CardDescription>Tarifas por peso del paquete</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peso</TableHead>
                    <TableHead className="text-right">Tarifa (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Hasta 500g</TableCell>
                    <TableCell className="text-right">$7.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hasta 1 kg</TableCell>
                    <TableCell className="text-right">$15.25</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hasta 1.5 kg</TableCell>
                    <TableCell className="text-right">$19.75</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hasta 2 kg</TableCell>
                    <TableCell className="text-right">$24.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hasta 2.5 kg</TableCell>
                    <TableCell className="text-right">$30.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Hasta 3 kg</TableCell>
                    <TableCell className="text-right">$36.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cada 0.5 kg adicional (hasta 10 kg)</TableCell>
                    <TableCell className="text-right">$5.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cada 0.5 kg adicional (más de 10 kg)</TableCell>
                    <TableCell className="text-right">$5.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cada 0.5 kg adicional (más de 20 kg)</TableCell>
                    <TableCell className="text-right">$2.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Manejo Aduanal */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Manejo Aduanal</CardTitle>
                <CardDescription>Según valor declarado del paquete</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor Declarado</TableHead>
                    <TableHead className="text-right">Tarifa (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Hasta $100</TableCell>
                    <TableCell className="text-right">$3.75</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">$101 - $200</TableCell>
                    <TableCell className="text-right">$5.95</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">$201 - $1,000</TableCell>
                    <TableCell className="text-right">$9.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">$1,001 - $2,000</TableCell>
                    <TableCell className="text-right">$14.50</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Más de $2,001</TableCell>
                    <TableCell className="text-right">$165.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Garantía y Devoluciones */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Garantía y Devoluciones</CardTitle>
                <CardDescription>Protección para tu envío</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Valor Declarado</TableHead>
                    <TableHead className="text-right">Tarifa (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Hasta $100</TableCell>
                    <TableCell className="text-right">$2.15</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">$100.01 - $1,500</TableCell>
                    <TableCell className="text-right">$1.50 por cada $100</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Más de $1,500</TableCell>
                    <TableCell className="text-right">2.5% del valor declarado</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                La garantía cubre pérdidas o daños durante el tránsito internacional.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cargos Adicionales */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Cargos Adicionales</CardTitle>
                <CardDescription>Servicios especiales</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium">Carga consolidada (por pieza)</span>
                <Badge variant="secondary">$2.00 USD</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <span className="font-medium">Envíos restringidos</span>
                <Link to="/restricted-products">
                  <Button variant="outline" size="sm">
                    Consultar
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entrega Nacional - Grid de 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* Ruta 30 - Lima Metropolitana */}
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Ruta 30</CardTitle>
                  <CardDescription>Lima Metropolitana / GAM</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peso</TableHead>
                      <TableHead className="text-right">Tarifa (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Hasta 500g</TableCell>
                      <TableCell className="text-right">$3.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">1 kg</TableCell>
                      <TableCell className="text-right">$3.50</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2 kg</TableCell>
                      <TableCell className="text-right">$4.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3 kg</TableCell>
                      <TableCell className="text-right">$4.50</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Kg adicional</TableCell>
                      <TableCell className="text-right">$1.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Ruta 40 - Capitales */}
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Ruta 40</CardTitle>
                  <CardDescription>Capitales de Departamento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peso</TableHead>
                      <TableHead className="text-right">Tarifa (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Hasta 500g</TableCell>
                      <TableCell className="text-right">$4.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">1 kg</TableCell>
                      <TableCell className="text-right">$4.75</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2 kg</TableCell>
                      <TableCell className="text-right">$6.75</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3 kg</TableCell>
                      <TableCell className="text-right">$8.75</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Kg adicional</TableCell>
                      <TableCell className="text-right">$2.50</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cobertura y Zonas */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Cobertura y Zonas</CardTitle>
                <CardDescription>Distritos y áreas de entrega</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ruta-30">
                <AccordionTrigger className="text-lg font-semibold">
                  Ruta 30 - Lima Metropolitana / GAM
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-64 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        "Miraflores", "San Isidro", "San Borja", "Surco", "La Molina",
                        "Barranco", "Chorrillos", "San Miguel", "Jesús María", "Lince",
                        "Magdalena", "Pueblo Libre", "Breña", "Lima Cercado", "Rímac",
                        "San Martín de Porres", "Los Olivos", "Independencia", "Comas",
                        "Ate", "Santa Anita", "El Agustino", "San Juan de Lurigancho",
                        "Villa El Salvador", "Villa María del Triunfo", "San Juan de Miraflores"
                      ].map((district) => (
                        <div key={district} className="flex items-center gap-2 p-2 rounded border bg-background">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm">{district}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ruta-40">
                <AccordionTrigger className="text-lg font-semibold">
                  Ruta 40 - Capitales de Departamento
                </AccordionTrigger>
                <AccordionContent>
                  <div className="max-h-64 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos",
                        "Cusco", "Huancayo", "Tacna", "Pucallpa", "Ica",
                        "Juliaca", "Cajamarca", "Ayacucho", "Huaraz", "Tarapoto",
                        "Puno", "Tumbes", "Chimbote", "Sullana", "Huánuco"
                      ].map((city) => (
                        <div key={city} className="flex items-center gap-2 p-2 rounded border bg-background">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm">{city}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Recojo en Almacén Miami */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Warehouse className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Recojo en Almacén (Miami)</CardTitle>
                <CardDescription>Opciones de recojo personal</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Peso</TableHead>
                    <TableHead className="text-right">Tarifa (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">1 kg</TableCell>
                    <TableCell className="text-right">$10.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Kg adicional</TableCell>
                    <TableCell className="text-right">$0.05</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">150 kg o más</TableCell>
                    <TableCell className="text-right">$100.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Notas y Condiciones */}
        <Card className="animate-fade-in border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Notas y Condiciones</CardTitle>
                <CardDescription>Información importante</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Conversión de Moneda
              </h4>
              <p className="text-sm text-muted-foreground">
                Todas las tarifas están expresadas en dólares estadounidenses (USD). La conversión a soles peruanos (PEN) se realizará según el tipo de cambio del día de pago.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Impuestos y Aranceles
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Para envíos con valor declarado superior a $200 USD, se aplican los siguientes impuestos aduaneros:
              </p>
              <TooltipProvider>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="cursor-help">
                          Ad Valorem (4%)
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Impuesto sobre el valor CIF de la mercancía</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="cursor-help">
                          IGV Aduanero (16%)
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Impuesto General a las Ventas aplicado en aduana</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="cursor-help">
                          IPM (2%)
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Impuesto de Promoción Municipal</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </TooltipProvider>
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Límites de Importación
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Personas naturales: máximo 3 envíos anuales de hasta $1,000 USD cada uno</li>
                <li>O 1 envío anual de hasta $3,000 USD</li>
                <li>Envíos superiores a $2,000 USD requieren asesor aduanero especializado</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-primary" />
                Almacenaje
              </h4>
              <p className="text-sm text-muted-foreground">
                Los paquetes tienen un periodo de almacenaje gratuito de 5 días hábiles en nuestras instalaciones. Después de este periodo, se aplicará un cargo de <strong>$10 USD por día</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Aviso Importante
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Las tarifas están basadas en estimaciones. Los costos finales pueden variar según el procesamiento aduanero, el valor declarado real y las políticas de importación vigentes en Perú.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center py-8 animate-fade-in">
          <h3 className="text-2xl font-bold mb-4">¿Tienes dudas sobre nuestras tarifas?</h3>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo está listo para ayudarte con cualquier consulta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/calculator"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Calcular mi envío
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Contáctanos
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
