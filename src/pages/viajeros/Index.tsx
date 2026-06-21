import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Plane, ArrowRight } from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { SEO } from '@/components/SEO';

const ViajeroIndex = () => {
  const navigate = useNavigate();

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Viajeros: encomiendas EE.UU.–Perú | Boxifly" description="Conectamos clientes con viajeros verificados que traen encomiendas desde EE.UU. a Perú. Más rápido y económico que el envío tradicional." path="/viajeros" noindex />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Boxifly Viajeros
                <span className="block text-white/95 mt-2">La forma inteligente de traer tus compras</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-12 text-white/90 max-w-2xl mx-auto">
                Conectamos compradores con viajeros verificados para traer productos de forma segura, 
                económica y confiable desde Estados Unidos a Perú.
              </p>
            </div>
          </div>
        </section>

        {/* Two Main Cards */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Card for Clients */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-500/20 cursor-pointer bg-gradient-to-br from-blue-500/5 to-blue-600/10" onClick={() => navigate('/viajeros/cliente')}>
                <CardHeader className="text-center pb-8">
                  <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Package className="w-12 h-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-3xl mb-4">Quiero traer mis compras con viajeros</CardTitle>
                  <CardDescription className="text-lg leading-relaxed">
                    Ahorra hasta 60% en envíos aprovechando espacio disponible en maletas de viajeros verificados.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Tarifas competitivas y negociables</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Cotiza con hasta 7 viajeros simultáneamente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Seguimiento completo desde USA hasta Lima</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Seguro incluido y garantía de entrega</span>
                    </li>
                  </ul>
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 group-hover:shadow-lg transition-all">
                    Quiero usar el servicio
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              {/* Card for Travelers */}
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-sky-500/20 cursor-pointer bg-gradient-to-br from-sky-500/5 to-sky-600/10" onClick={() => navigate('/viajeros/viajero')}>
                <CardHeader className="text-center pb-8">
                  <div className="w-24 h-24 rounded-full bg-sky-500/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Plane className="w-12 h-12 text-sky-600" />
                  </div>
                  <CardTitle className="text-3xl mb-4">Quiero ganar dinero viajando</CardTitle>
                  <CardDescription className="text-lg leading-relaxed">
                    Monetiza el espacio vacío en tu maleta. Gana hasta $300 por viaje de forma legal y segura.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <span>Comisiones de $50 a $300 por viaje</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <span>Tú decides qué llevar y cuándo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <span>100% seguro con verificación KYC completa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
                      <span>Soporte legal y declaración jurada incluida</span>
                    </li>
                  </ul>
                  <Button size="lg" className="w-full bg-sky-600 hover:bg-sky-700 text-lg py-6 group-hover:shadow-lg transition-all">
                    Quiero ser viajero
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Trust Section */}
            <div className="mt-16 max-w-4xl mx-auto text-center">
              <p className="text-muted-foreground mb-8">
                Boxifly Viajeros conecta compradores con viajeros verificados bajo un sistema seguro, 
                transparente y legal que garantiza protección para ambas partes.
              </p>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-sky-600 mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Verificado</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-3xl font-bold text-sky-600 mb-1">24/7</div>
                  <div className="text-sm text-muted-foreground">Soporte</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sky-600 mb-1">Legal</div>
                  <div className="text-sm text-muted-foreground">100% Seguro</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Legal */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">
              ¿Quieres conocer las políticas y condiciones del servicio?
            </p>
            <Button variant="outline" size="lg" onClick={() => navigate('/viajeros/legales')}>
              Ver Términos y Políticas
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default ViajeroIndex;
