import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Package, 
  MapPin, 
  Shield, 
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Home,
  Globe
} from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { SEO } from '@/components/SEO';

const Casillero = () => {
  const navigate = useNavigate();
  const heroAnim = useScrollAnimation({ threshold: 0.2 });
  const processAnim = useScrollAnimation({ threshold: 0.2 });
  const benefitsAnim = useScrollAnimation({ threshold: 0.2 });

  const steps = [
    {
      icon: FileText,
      title: 'Regístrate Gratis',
      description: 'Crea tu cuenta en menos de 2 minutos y obtén tu dirección en Miami al instante.',
      color: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      icon: Globe,
      title: 'Compra en USA',
      description: 'Usa tu dirección Boxifly en Amazon, eBay, Nike, Best Buy y más de 5,000 tiendas online.',
      color: 'from-secondary/10 to-secondary/5',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary'
    },
    {
      icon: Package,
      title: 'Recibimos y Consolidamos',
      description: 'Guardamos tus paquetes hasta 60 días gratis y consolidamos múltiples compras en un solo envío.',
      color: 'from-success/10 to-success/5',
      iconBg: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      icon: Truck,
      title: 'Entregamos en tu Casa',
      description: 'Envío aéreo express de 7-10 días directo a tu puerta en Lima o cualquier ciudad del Perú.',
      color: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Ahorro Garantizado',
      description: 'Hasta 60% menos vs comprar en Perú. Consolida varios paquetes para ahorrar aún más en envío.',
      stat: '60%'
    },
    {
      icon: Clock,
      title: 'Entrega Rápida',
      description: 'Envío aéreo express de 7-10 días. Tracking en tiempo real desde Miami hasta tu puerta.',
      stat: '7-10 días'
    },
    {
      icon: Shield,
      title: 'Totalmente Seguro',
      description: 'Warehouse certificado en Miami. Seguro contra pérdida incluido. Empaque profesional.',
      stat: '100%'
    },
    {
      icon: Home,
      title: 'Sin Complicaciones',
      description: 'Nosotros manejamos aduanas, impuestos y entrega. Tú solo recibes en tu casa.',
      stat: '24/7'
    }
  ];

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Casillero gratis en Miami | Boxifly" description="Obtén tu casillero gratuito en Doral, Miami. Recibe tus compras de EE.UU. y reenvíalas a Perú con tarifas claras y entrega rápida." path="/personas" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-navy py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Tu dirección exclusiva en Miami, FL</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Tu Casillero en Miami
                <span className="block text-secondary mt-2">Compras USA sin Límites</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Obtén tu dirección personal en Miami para comprar en miles de tiendas online de USA. 
                Nosotros consolidamos, gestionamos aduanas y entregamos en tu puerta.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/95 hover-scale-sm text-lg px-10 py-6 h-auto shadow-2xl font-semibold"
                  onClick={() => navigate('/auth')}
                >
                  Obtener mi Casillero Gratis
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white text-lg px-10 py-6 h-auto backdrop-blur-sm"
                  onClick={() => navigate('/cotizador')}
                >
                  Calcular Costo de Envío
                </Button>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">Gratis</div>
                  <div className="text-sm text-white/70">casillero para siempre</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl font-bold mb-1">60 días</div>
                  <div className="text-sm text-white/70">almacenamiento gratis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">5,000+</div>
                  <div className="text-sm text-white/70">tiendas compatibles</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section ref={processAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${processAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3 block">Proceso Simple</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                4 pasos sencillos para recibir tus compras de USA
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <Card className={`p-8 h-full bg-gradient-to-br ${step.color} border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}>
                    <div className={`w-16 h-16 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6`}>
                      <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                    </div>
                    <div className="text-6xl font-bold text-secondary/10 mb-3">0{index + 1}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </Card>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section ref={benefitsAnim.ref} className={`py-20 bg-gradient-to-br from-muted/50 to-muted/30 transition-all duration-1000 ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3 block">Ventajas Únicas</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Por qué elegir Boxifly?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Beneficios exclusivos que hacen la diferencia
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-2 bg-white">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-secondary mb-2">{benefit.stat}</div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-navy">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para empezar a ahorrar?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Obtén tu casillero gratis ahora y comienza a comprar en USA sin límites
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold"
                  onClick={() => navigate('/auth')}
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Crear Cuenta Gratis
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost"
                  className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white text-lg px-10 py-6 h-auto"
                  onClick={() => navigate('/cotizador')}
                >
                  Ver Tarifas
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Casillero;
