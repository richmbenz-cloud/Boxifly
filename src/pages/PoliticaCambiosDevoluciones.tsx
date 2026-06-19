import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ShieldCheck, RefreshCw, Clock, AlertCircle } from "lucide-react";

const PoliticaCambiosDevoluciones = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <MainNavigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div
            ref={heroRef}
            className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <RefreshCw className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Política de Cambios y Devoluciones
            </h1>
            <p className="text-xl text-muted-foreground">
              En Boxifly nos comprometemos con tu satisfacción. Conoce nuestras políticas para cambios y devoluciones.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div
            ref={contentRef}
            className={`max-w-4xl mx-auto space-y-8 transition-all duration-1000 delay-200 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Important Notice */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <CardTitle>Información Importante</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Esta política aplica únicamente para productos adquiridos en nuestra <strong>Tienda Online</strong>. 
                  Para paquetes del servicio de courier internacional (casillero), viajero o personal shopper, 
                  consulta las condiciones específicas de cada servicio.
                </p>
              </CardContent>
            </Card>

            {/* Devoluciones */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-6 w-6 text-primary" />
                  <CardTitle>Devoluciones</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Plazo de Devolución</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Aceptamos devoluciones dentro de los <strong>7 días calendario</strong> posteriores a la recepción del producto.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Condiciones para Devoluciones</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>El producto debe estar en su empaque original, sin usar y en perfectas condiciones</li>
                    <li>Debe incluir todos los accesorios, etiquetas y documentación original</li>
                    <li>No debe presentar señales de uso, daño o alteración</li>
                    <li>Se requiere comprobante de compra (factura o boleta)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Productos No Retornables</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Productos de higiene personal (por razones sanitarias)</li>
                    <li>Productos electrónicos con sellos de garantía rotos</li>
                    <li>Productos en oferta o liquidación (salvo defecto de fábrica)</li>
                    <li>Productos personalizados o hechos a medida</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Proceso de Devolución</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Contacta a nuestro equipo de soporte a través de nuestro chat o email</li>
                    <li>Proporciona tu número de orden y motivo de devolución</li>
                    <li>Recibirás instrucciones para el envío del producto</li>
                    <li>Una vez recibido y verificado, procesaremos tu reembolso en 5-7 días hábiles</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Cambios */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <CardTitle>Cambios</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Plazo para Cambios</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Aceptamos solicitudes de cambio dentro de los <strong>7 días calendario</strong> posteriores a la recepción del producto.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Motivos para Cambios</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Talla o color incorrecto</li>
                    <li>Producto defectuoso o con fallas de fábrica</li>
                    <li>Producto diferente al solicitado</li>
                    <li>Producto dañado durante el transporte</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Proceso de Cambio</h3>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Contacta a nuestro equipo con tu número de orden</li>
                    <li>Describe el producto que deseas recibir como cambio</li>
                    <li>Verificaremos disponibilidad del producto solicitado</li>
                    <li>Si hay diferencia de precio, deberás pagar o te reembolsaremos la diferencia</li>
                    <li>El nuevo producto será enviado una vez recibamos el original</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Reembolsos */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <CardTitle>Reembolsos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Una vez recibido y aprobado tu producto devuelto, procesaremos el reembolso a través del 
                  mismo método de pago utilizado en la compra original.
                </p>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Tiempos de Reembolso</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Tarjetas de crédito/débito: 5-10 días hábiles</li>
                    <li>Yape/Plin: 2-3 días hábiles</li>
                    <li>Transferencia bancaria: 3-5 días hábiles</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  Nota: Los costos de envío de devolución corren por cuenta del cliente, 
                  excepto cuando el producto presenta defectos de fábrica o errores en el envío.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="py-8 text-center">
                <h3 className="text-xl font-semibold mb-3">¿Necesitas ayuda?</h3>
                <p className="text-muted-foreground mb-6">
                  Nuestro equipo está disponible para ayudarte con cualquier consulta sobre cambios o devoluciones.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contacto" className="btn-primary">
                    Contactar Soporte
                  </a>
                  <a href="/preguntas-frecuentes" className="btn-secondary">
                    Ver Preguntas Frecuentes
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default PoliticaCambiosDevoluciones;
