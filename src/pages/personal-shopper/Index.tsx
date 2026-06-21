import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Video, ArrowRight, CheckCircle, Clock, Shield, DollarSign } from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { SEO } from '@/components/SEO';

const PersonalShopperIndex = () => {
  const navigate = useNavigate();

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Personal Shopper en EE.UU. | Boxifly" description="Compramos por ti en tiendas de EE.UU. Modo asistido o en vivo, con cotización clara y entrega a Perú. Seguro y profesional." path="/personal-shopper" noindex />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-orange-600 py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Personal Shopper
                <span className="block text-white/95 mt-2">Compras USA sin Complicaciones</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-12 text-white/90 max-w-2xl mx-auto">
                ¿No tienes tarjeta USA? ¿El producto no acepta tu dirección? 
                Nuestros shoppers expertos compran por ti de forma segura y al mejor precio.
              </p>
            </div>
          </div>
        </section>

        {/* Two Main Cards */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              
              {/* Card for Asistido */}
              <Card 
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-secondary/20 cursor-pointer bg-gradient-to-br from-secondary/5 to-orange-600/10" 
                onClick={() => navigate('/personal-shopper/solicitud')}
              >
                <CardHeader className="text-center pb-8">
                  <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="w-12 h-12 text-secondary" />
                  </div>
                  <CardTitle className="text-3xl mb-4">Personal Shopper Asistido</CardTitle>
                  <CardDescription className="text-lg leading-relaxed">
                    Envía tu solicitud, cotizamos opciones, apruebas y compramos por ti.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Describe el producto que necesitas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Recibe cotizaciones detalladas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Aprueba y nosotros compramos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Seguimiento completo hasta la entrega</span>
                    </li>
                  </ul>
                  <Button 
                    size="lg" 
                    className="w-full bg-secondary hover:bg-secondary/90 text-lg py-6 group-hover:shadow-lg transition-all"
                  >
                    Solicitar Ahora
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              {/* Card for Live (Coming Soon) */}
              <Card className="group border-2 border-dashed border-muted-foreground/30 bg-muted/20 opacity-75">
                <CardHeader className="text-center pb-8">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-3xl mb-4 text-muted-foreground">Personal Shopper Live</CardTitle>
                  <CardDescription className="text-lg leading-relaxed">
                    Compra en vivo mientras un shopper recorre tiendas en USA.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>Sesiones en vivo desde tiendas USA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>Ve productos en tiempo real</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>Compra mientras miras</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span>Interacción directa con el shopper</span>
                    </li>
                  </ul>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full text-lg py-6"
                    disabled
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Próximamente
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Trust Section */}
            <div className="mt-16 max-w-4xl mx-auto text-center">
              <p className="text-muted-foreground mb-8">
                El servicio Personal Shopper de Boxifly conecta a compradores con shoppers expertos 
                bajo un sistema seguro donde todos los pagos pasan por la plataforma.
              </p>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">100%</div>
                  <div className="text-sm text-muted-foreground">Seguro</div>
                </div>
                <div className="text-center border-x border-border">
                  <div className="text-3xl font-bold text-secondary mb-1">24h</div>
                  <div className="text-sm text-muted-foreground">Respuesta</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">Sin</div>
                  <div className="text-sm text-muted-foreground">Tarjeta USA</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 text-center bg-white">
                <CheckCircle className="w-10 h-10 mx-auto mb-4 text-green-600" />
                <h4 className="font-semibold mb-2">Sin Tarjeta USA</h4>
                <p className="text-sm text-muted-foreground">
                  Compramos con nuestras tarjetas verificadas
                </p>
              </Card>
              <Card className="p-6 text-center bg-white">
                <Shield className="w-10 h-10 mx-auto mb-4 text-blue-600" />
                <h4 className="font-semibold mb-2">Compra Protegida</h4>
                <p className="text-sm text-muted-foreground">
                  Tu dinero seguro hasta la entrega
                </p>
              </Card>
              <Card className="p-6 text-center bg-white">
                <DollarSign className="w-10 h-10 mx-auto mb-4 text-secondary" />
                <h4 className="font-semibold mb-2">Mejores Precios</h4>
                <p className="text-sm text-muted-foreground">
                  Buscamos ofertas y descuentos
                </p>
              </Card>
              <Card className="p-6 text-center bg-white">
                <Clock className="w-10 h-10 mx-auto mb-4 text-purple-600" />
                <h4 className="font-semibold mb-2">Respuesta Rápida</h4>
                <p className="text-sm text-muted-foreground">
                  Cotización en 24-72 horas
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Legal */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">
              ¿Quieres conocer las políticas y condiciones del servicio?
            </p>
            <Button variant="outline" size="lg" onClick={() => navigate('/terminos-y-condiciones')}>
              Ver Términos y Políticas
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default PersonalShopperIndex;