import { AlertTriangle, Shield, FileWarning, Package, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MainNavigation } from "@/components/MainNavigation";
import SEO from "@/components/SEO";

const RestrictedProducts = () => {
  return (
    <>
      <SEO
        title="Productos Prohibidos y Restringidos en Aduanas de Perú | Boxifly"
        description="Consulta la lista completa de artículos prohibidos y restringidos para importar a Perú desde USA. Evita retenciones en aduanas y conoce qué requiere permisos."
        path="/restricted-products"
      />
      <div className="min-h-screen bg-background">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Productos Prohibidos y Restringidos
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Información importante sobre productos que no pueden ser enviados o que requieren permisos especiales para su importación a Perú.
          </p>
        </div>

        {/* Navigation Index - Desktop */}
        <div className="hidden lg:block fixed left-8 top-1/3 w-64 space-y-2">
          <nav className="space-y-1">
            <a href="#prohibidos" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
              Productos Prohibidos
            </a>
            <a href="#manejo-especial" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
              Manejo Especial
            </a>
            <a href="#restringidos" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
              Productos Restringidos
            </a>
            <a href="#uso-personal" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
              Uso Personal
            </a>
            <a href="#informacion" className="block px-4 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
              Información Importante
            </a>
          </nav>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Productos Prohibidos */}
          <Card id="prohibidos" className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Productos Prohibidos</CardTitle>
              </div>
              <CardDescription className="text-base">
                No envíes estos artículos a tu dirección de Miami. No pueden ingresar al país bajo ninguna circunstancia.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  En caso de llegar, deberás asumir el costo de destrucción o devolución al remitente.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground mb-4">
                Incluyen cualquier producto cuyo <strong>primer ingrediente sea alcohol</strong>, así como materiales <strong>inflamables, explosivos o corrosivos</strong>.
              </p>

              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Repuestos o accesorios para vehículos",
                  "Ropa o calzado usado",
                  "Productos explosivos",
                  "Efectivo, monedas, valores o cheques",
                  "Joyas o metales preciosos",
                  "Animales vivos",
                  "Pieles o cueros naturales",
                  "Bebidas denominadas 'pisco' de origen extranjero",
                  "Artículos regulados bajo DOT-SP 20936",
                  "Objetos considerados patrimonio cultural",
                  "Drogas, sustancias ilícitas o estupefacientes"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-destructive/5 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Productos con Manejo Especial */}
          <Card id="manejo-especial" className="border-orange-500/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Package className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-2xl">Productos con Manejo Especial</CardTitle>
              </div>
              <CardDescription className="text-base">
                Artículos considerados mercancías peligrosas que requieren un proceso adicional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-orange-500/50 bg-orange-500/5">
                <AlertDescription>
                  Estos envíos se consolidan mensualmente con una declaración formal. Pueden ser inflamables, tóxicos o reaccionar químicamente.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Ejemplos frecuentes:</h4>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    "Perfumes y colonias",
                    "Esmaltes de uñas",
                    "Amortiguadores nuevos para vehículos"
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Para confirmar si tu producto entra en esta categoría, contáctanos por WhatsApp o email.
              </p>
            </CardContent>
          </Card>

          {/* Productos Restringidos por Aduana */}
          <Card id="restringidos" className="border-yellow-500/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <FileWarning className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl">Productos Restringidos por Aduana</CardTitle>
              </div>
              <CardDescription className="text-base">
                Requieren permisos o autorizaciones específicas según el tipo de mercancía y la entidad reguladora.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {/* DIGEMID */}
                <AccordionItem value="digemid" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permisos DIGEMID</h4>
                        <p className="text-sm text-muted-foreground">Salud, uso médico o consumo humano</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        "Instrumentos dentales y ortodóncicos",
                        "Dispositivos médicos (glucómetros, tensiómetros, medidores corporales)",
                        "Equipos médicos en general",
                        "Vitaminas, productos farmacéuticos",
                        "Suplementos y proteínas",
                        "Extractores de leche, biberones, chupetes, mordedores",
                        "Termómetros, tiritas",
                        "Lociones y champús medicinales",
                        "Masajeadores eléctricos",
                        "Lentes de contacto",
                        "Botox instantáneo y productos de rejuvenecimiento medicados"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* DIGESA */}
                <AccordionItem value="digesa" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permisos DIGESA</h4>
                        <p className="text-sm text-muted-foreground">Alimentos, higiene y productos para niños</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        "Juguetes en cantidades comerciales",
                        "Útiles escolares en volúmenes comerciales",
                        "Alimentos y bebidas envasados",
                        "Ambientadores",
                        "Pegatinas infantiles",
                        "Accesorios para consumo seguro de medicamentos"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* SUCAMEC */}
                <AccordionItem value="sucamec" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-red-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permisos SUCAMEC</h4>
                        <p className="text-sm text-muted-foreground">Seguridad y armas</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        "Pistolas eléctricas y de electrochoque",
                        "Pistolas de CO₂",
                        "Armas de paintball",
                        "Airsoft, aire comprimido",
                        "Armas de fuego y cualquier artículo relacionado",
                        "Repuestos y accesorios para armas",
                        "Munición de todo tipo",
                        "Pistolas de bengala, señales de humo"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* MINCETUR */}
                <AccordionItem value="mincetur" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permiso MINCETUR</h4>
                        <p className="text-sm text-muted-foreground">Comercio y turismo</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                      <span>Repuestos o accesorios para máquinas tragamonedas</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* MINRE */}
                <AccordionItem value="minre" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-indigo-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permiso MINRE</h4>
                        <p className="text-sm text-muted-foreground">Relaciones Exteriores</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <p className="text-sm mb-3">
                      Material que represente o haga referencia a <strong>límites, fronteras o mapas del Perú</strong>:
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        "Libros, revistas",
                        "Mapas, cuadernos",
                        "CDs, videos, planos"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* SENASA */}
                <AccordionItem value="senasa" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permisos SENASA</h4>
                        <p className="text-sm text-muted-foreground">Productos vegetales, animales y derivados</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid md:grid-cols-2 gap-2">
                      {[
                        "Semillas, plantas",
                        "Alimentos para animales",
                        "Medicamentos veterinarios",
                        "Fertilizantes, pesticidas",
                        "Comida para peces",
                        "Atún en ciertas presentaciones"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* MTC */}
                <AccordionItem value="mtc" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-cyan-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permisos MTC</h4>
                        <p className="text-sm text-muted-foreground">Telecomunicaciones</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-2">
                      {[
                        "Equipos radioeléctricos",
                        "Productos que requieren certificado de homologación",
                        "Equipos con transmisión inalámbrica"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* OTO */}
                <AccordionItem value="oto" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-sky-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permisos OTO</h4>
                        <p className="text-sm text-muted-foreground">Refrigeración</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 flex-shrink-0" />
                      <span>Equipos de refrigeración o congelación</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* IPEN */}
                <AccordionItem value="ipen" className="border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-amber-500" />
                      <div className="text-left">
                        <h4 className="font-semibold">Permisos IPEN</h4>
                        <p className="text-sm text-muted-foreground">Radiación</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="space-y-2">
                      {[
                        "Máquinas de rayos X",
                        "Equipos con elementos radiactivos"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Productos Restringidos con Excepción para Uso Personal */}
          <Card id="uso-personal" className="border-primary/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Productos Restringidos con Excepción para Uso Personal</CardTitle>
              </div>
              <CardDescription className="text-base">
                Se pueden importar en cantidades limitadas, únicamente para uso propio, firmando una declaración jurada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4 border-primary/50 bg-primary/5">
                <AlertDescription>
                  <strong>Cantidad máxima:</strong> 3 unidades por tipo, máximo 10 productos por compra.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Cepillos de dientes",
                  "Jabones, detergentes",
                  "Toallitas húmedas",
                  "Maquillaje",
                  "Esmaltes",
                  "Perfumes",
                  "Champús, acondicionadores, tintes",
                  "Cremas OTC",
                  "Snacks o bebidas envasadas",
                  "Juguetes para niños*",
                  "Material escolar*"
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Información Importante */}
          <Card id="informacion" className="border-muted">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-muted rounded-lg">
                  <Info className="h-6 w-6 text-foreground" />
                </div>
                <CardTitle className="text-2xl">Información Importante para el Importador</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Facturas en USD",
                    content: "Todas las facturas deben estar en USD. Aduanas usará el tipo de cambio SUNAT si la factura está en otra moneda."
                  },
                  {
                    title: "Consolidación",
                    content: "La consolidación solo aplica si todas las piezas pertenecen a una misma compra o factura."
                  },
                  {
                    title: "Envíos a nombre de terceros",
                    content: "Para consignar un envío a nombre de un autorizado, la factura y compra deben coincidir con dicho nombre."
                  },
                  {
                    title: "Límite de importaciones",
                    content: "Si realizas más de 3 importaciones menores a $1,000 con DNI dentro de un año, necesitarás un RUC activo para continuar importando."
                  },
                  {
                    title: "Responsabilidad del consignatario",
                    content: "El consignatario es responsable de cumplir permisos, requisitos y documentación."
                  },
                  {
                    title: "Costos adicionales",
                    content: "Costos generados por permisos, documentos o procesos adicionales son responsabilidad del importador."
                  }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default RestrictedProducts;