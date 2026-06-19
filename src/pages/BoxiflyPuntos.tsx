import { Gift, TrendingUp, Award, Star } from "lucide-react";
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BoxiflyPuntos = () => {
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
          <Gift className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Boxifly Puntos
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gana puntos con cada compra y obtén descuentos exclusivos
          </p>
          <Link to="/iniciar-sesion">
            <Button size="lg" className="gap-2">
              <Star className="w-5 h-5" />
              Únete Ahora
            </Button>
          </Link>
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
          {/* Cómo Funciona */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">¿Cómo Funciona?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Compra</h3>
                <p className="text-muted-foreground">
                  Realiza compras en nuestra tienda online y gana puntos automáticamente
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Acumula</h3>
                <p className="text-muted-foreground">
                  Cada S/ 33 que gastes = 1 punto. Cada punto vale S/ 1 de descuento
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Canjea</h3>
                <p className="text-muted-foreground">
                  Usa tus puntos en tu próxima compra y ahorra en grande
                </p>
              </div>
            </div>
          </div>

          {/* Niveles VIP */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Niveles VIP</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Mientras más compres, más beneficios obtienes. Sube de nivel y recibe cupones exclusivos.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bronce */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <Award className="w-12 h-12 mx-auto mb-2 text-orange-600" />
                  <h3 className="text-xl font-bold text-orange-700 dark:text-orange-400">Bronce</h3>
                  <p className="text-sm text-muted-foreground">0+ puntos</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Acumula puntos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Ofertas especiales</span>
                  </li>
                </ul>
              </div>

              {/* Plata */}
              <div className="bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700/20 dark:to-gray-600/10 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <Award className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Plata</h3>
                  <p className="text-sm text-muted-foreground">300+ puntos</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Todo lo de Bronce</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Cupón S/ 20 al subir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Descuentos exclusivos</span>
                  </li>
                </ul>
              </div>

              {/* Oro */}
              <div className="bg-gradient-to-br from-yellow-200 to-yellow-100 dark:from-yellow-700/20 dark:to-yellow-600/10 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <Award className="w-12 h-12 mx-auto mb-2 text-yellow-600" />
                  <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-400">Oro</h3>
                  <p className="text-sm text-muted-foreground">750+ puntos</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Todo lo de Plata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Cupón S/ 30 al subir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Envío gratis selectivo</span>
                  </li>
                </ul>
              </div>

              {/* Platino */}
              <div className="bg-gradient-to-br from-purple-200 to-purple-100 dark:from-purple-700/20 dark:to-purple-600/10 p-6 rounded-lg">
                <div className="text-center mb-4">
                  <Award className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">Platino</h3>
                  <p className="text-sm text-muted-foreground">1500+ puntos</p>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Todo lo de Oro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Cupón S/ 50 al subir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Atención prioritaria</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Beneficios Adicionales */}
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold">Beneficios Adicionales</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Promociones Exclusivas</h3>
                  <p className="text-muted-foreground">Accede a ofertas especiales solo para miembros</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Notificaciones de Puntos</h3>
                  <p className="text-muted-foreground">Recibe alertas cuando ganes puntos o estén por expirar</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Validez de 1 Año</h3>
                  <p className="text-muted-foreground">Tus puntos son válidos por 12 meses desde su emisión</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Seguimiento en Tiempo Real</h3>
                  <p className="text-muted-foreground">Consulta tu saldo de puntos y nivel VIP en cualquier momento</p>
                </div>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary to-primary/60 rounded-lg p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para empezar a ganar?
            </h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Únete a Boxifly Puntos hoy y empieza a acumular beneficios con cada compra
            </p>
            <Link to="/iniciar-sesion">
              <Button size="lg" variant="secondary" className="gap-2">
                Crear Cuenta Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default BoxiflyPuntos;
