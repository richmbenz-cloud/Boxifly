import { BookOpen, Package, CreditCard, MapPin, Shield, TrendingUp, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const GuiasCompras = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <MainNavigation />
      
      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Guías de Compras
          </h1>
          <p className="text-xl text-muted-foreground">
            Todo lo que necesitas saber para comprar en USA y recibir en Perú
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section
        ref={contentRef}
        className={`py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 delay-200 ${
          contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          {/* Guía 1: Cómo usar tu Casillero */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <MapPin className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Cómo Usar Tu Casillero en Miami</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Regístrate y Obtén tu Casillero
                </h3>
                <p className="text-muted-foreground ml-10">
                  Al registrarte en Boxifly, recibirás automáticamente tu dirección única en Miami (ejemplo: BXFLY-12345). Esta será tu dirección de envío en Estados Unidos.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Compra en Tiendas Estadounidenses
                </h3>
                <p className="text-muted-foreground ml-10">
                  Usa tu casillero como dirección de envío en Amazon, eBay, Target, Walmart, Best Buy y más de 10,000 tiendas online de USA.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                  Crea una Pre-Alerta
                </h3>
                <p className="text-muted-foreground ml-10">
                  Ingresa a tu dashboard y crea una pre-alerta indicando qué compraste, el tracking number, valor declarado y peso estimado.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                  Nosotros Recibimos tu Paquete
                </h3>
                <p className="text-muted-foreground ml-10">
                  Tu paquete llega a nuestro warehouse en Miami. Lo inspeccionamos, fotografiamos y consolidamos si tienes múltiples compras.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                  Paga tu Envío
                </h3>
                <p className="text-muted-foreground ml-10">
                  Una vez listo para enviar, te enviamos la cotización final. Paga online con tarjeta, Yape o Plin.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">6</span>
                  Recibe en Tu Casa
                </h3>
                <p className="text-muted-foreground ml-10">
                  Tu paquete viaja a Perú y lo recibes en la puerta de tu casa o lo recoges en nuestra oficina en Lima.
                </p>
              </div>
            </div>
          </div>

          {/* Guía 2: Tiendas Recomendadas */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Package className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Tiendas Online Recomendadas</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Electrónica y Tecnología</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Amazon.com - Todo tipo de productos</li>
                  <li>• Best Buy - Electrónica y gadgets</li>
                  <li>• B&H Photo Video - Cámaras y audio</li>
                  <li>• Newegg - Componentes de computadoras</li>
                  <li>• Apple Store - Productos Apple</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Moda y Ropa</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Macy's - Ropa y accesorios</li>
                  <li>• Nordstrom - Moda premium</li>
                  <li>• Nike.com - Ropa deportiva</li>
                  <li>• ASOS - Moda juvenil</li>
                  <li>• Zara USA - Moda europea</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Hogar y Decoración</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Target - Hogar y lifestyle</li>
                  <li>• Walmart - Productos generales</li>
                  <li>• Wayfair - Muebles y decoración</li>
                  <li>• Bed Bath & Beyond - Textiles</li>
                  <li>• HomeGoods - Decoración</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Salud y Belleza</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• iHerb - Suplementos y vitaminas</li>
                  <li>• Sephora - Cosméticos premium</li>
                  <li>• Ulta Beauty - Belleza variada</li>
                  <li>• GNC - Suplementos deportivos</li>
                  <li>• CVS - Farmacia y salud</li>
                </ul>
              </div>
            </div>

            {/* Botón Ver Todas las Tiendas */}
            <div className="mt-8 text-center">
              <Button
                asChild
                size="lg"
                className="group hover:scale-105 transition-transform duration-300"
              >
                <Link to="/tiendas-en-usa" className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Ver Todas las Tiendas
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Explora nuestro catálogo completo con más de 200 tiendas estadounidenses
              </p>
            </div>
          </div>

          {/* Guía 3: Consejos de Compra */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <TrendingUp className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Consejos para Ahorrar</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <CreditCard className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Aprovecha el Black Friday y Cyber Monday</h3>
                  <p className="text-muted-foreground">Las mejores ofertas del año en noviembre. Planifica tus compras con anticipación.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Package className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Consolida tus Envíos</h3>
                  <p className="text-muted-foreground">Espera a tener varios paquetes y envíalos juntos para ahorrar en shipping.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Declara el Valor Real</h3>
                  <p className="text-muted-foreground">Para evitar problemas en aduanas, declara siempre el valor correcto de tus productos.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Usa Cupones y Cashback</h3>
                  <p className="text-muted-foreground">Busca cupones de descuento en RetailMeNot, Honey o Rakuten antes de comprar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Productos Restringidos */}
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Productos Restringidos</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Algunos productos no pueden ser importados o requieren permisos especiales. Revisa nuestra lista completa antes de comprar:
            </p>
            
            <div className="bg-destructive/10 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3 text-destructive">Productos Prohibidos:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Armas, municiones y explosivos</li>
                <li>• Drogas y sustancias controladas</li>
                <li>• Productos perecederos (comida fresca)</li>
                <li>• Dinero en efectivo o metales preciosos</li>
                <li>• Animales vivos o plantas</li>
              </ul>
            </div>

            <div className="bg-accent/10 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Productos que Requieren Permisos:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Medicamentos (requiere permiso DIGEMID)</li>
                <li>• Suplementos alimenticios (DIGESA)</li>
                <li>• Equipos de telecomunicaciones (MTC)</li>
                <li>• Alimentos procesados (SENASA)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default GuiasCompras;
