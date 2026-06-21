import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShoppingBag, Search, CreditCard, Package, CheckCircle, Star, Clock, Shield, MessageCircle, Sparkles } from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
const PersonalShopper = () => {
  const navigate = useNavigate();
  const processAnim = useScrollAnimation({
    threshold: 0.2
  });
  const examplesAnim = useScrollAnimation({
    threshold: 0.2
  });
  const steps = [{
    icon: MessageCircle,
    title: 'Cuéntanos qué necesitas',
    description: 'Dinos qué producto quieres, tus preferencias, presupuesto y cualquier detalle especial.',
    color: 'from-primary/10 to-primary/5'
  }, {
    icon: Search,
    title: 'Buscamos por ti',
    description: 'Nuestros shoppers expertos buscan las mejores ofertas, comparan precios y verifican calidad.',
    color: 'from-secondary/10 to-secondary/5'
  }, {
    icon: CreditCard,
    title: 'Compramos y pagamos',
    description: 'Realizamos la compra con nuestras tarjetas USA. Tú solo pagas producto + comisión + envío.',
    color: 'from-success/10 to-success/5'
  }, {
    icon: Package,
    title: 'Recibe en tu casa',
    description: 'Consolidamos con tus otros paquetes y enviamos todo junto directo a tu puerta.',
    color: 'from-primary/10 to-primary/5'
  }];
  const examples = [{
    category: 'Electrónica',
    items: ['iPhone 16 Pro Max', 'MacBook M3', 'AirPods Pro', 'PlayStation 5'],
    icon: '📱',
    savings: 'Hasta $500 de ahorro'
  }, {
    category: 'Moda & Accesorios',
    items: ['Nike Air Jordan', 'Michael Kors', 'Coach Bags', 'Ray-Ban'],
    icon: '👟',
    savings: 'Hasta 70% menos'
  }, {
    category: 'Hogar & Cocina',
    items: ['KitchenAid', 'Dyson Vacío', 'Instant Pot', 'Smart Home'],
    icon: '🏠',
    savings: 'Hasta $300 de ahorro'
  }, {
    category: 'Juguetes & Bebés',
    items: ['LEGO', 'Fisher-Price', 'Pañales Huggies', 'Chicco'],
    icon: '🧸',
    savings: 'Hasta 50% menos'
  }];
  const advantages = [{
    icon: Star,
    title: 'Shoppers Verificados',
    description: 'Equipo experto con años de experiencia en compras USA'
  }, {
    icon: Shield,
    title: '100% Seguro',
    description: 'Protección total en cada compra, garantía de satisfacción'
  }, {
    icon: Clock,
    title: 'Servicio Rápido',
    description: 'Respuesta en 24h, compra inmediata tras aprobación'
  }, {
    icon: Sparkles,
    title: 'Mejores Ofertas',
    description: 'Encontramos descuentos, cupones y ofertas especiales'
  }];
  return <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Personal Shopper: compramos por ti en EE.UU." description="Te compramos en tiendas de Estados Unidos y lo enviamos a Perú. Sin tarjeta internacional ni complicaciones." path="/personal-shopper/landing" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-orange-600 py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-medium">Compramos por ti en USA</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Personal Shopper
                <span className="block text-white/95 mt-2">Compras USA sin Complicaciones</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                ¿No tienes tarjeta USA? ¿El producto no acepta tu dirección? ¿Necesitas ayuda comprando? 
                Nosotros lo hacemos por ti. Solo dinos qué quieres y nos encargamos del resto.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-secondary hover:bg-white/95 hover-scale-sm text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  Solicitar Personal Shopper
                </Button>
                
              </div>

              <div className="mt-12 flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Sin tarjeta USA</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Buscamos ofertas</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Consolidación gratis</span>
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
                4 pasos para que compres sin límites en USA
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {steps.map((step, index) => <div key={index} className="relative">
                  <Card className={`p-8 h-full bg-gradient-to-br ${step.color} border-2 border-transparent hover:border-secondary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}>
                    <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                      <step.icon className="w-8 h-8 text-secondary" />
                    </div>
                    <div className="text-6xl font-bold text-secondary/10 mb-3">0{index + 1}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </Card>
                  {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-secondary/30 to-transparent" />}
                </div>)}
            </div>
          </div>
        </section>

        {/* Examples */}
        <section ref={examplesAnim.ref} className={`py-20 bg-gradient-to-br from-muted/50 to-muted/30 transition-all duration-1000 ${examplesAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3 block">Compramos de Todo</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ejemplos de Compras</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Desde iPhone hasta juguetes, compramos lo que necesites
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {examples.map((example, index) => <Card key={index} className="p-6 hover:shadow-xl transition-all hover:-translate-y-2 bg-white">
                  <div className="text-5xl mb-4">{example.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{example.category}</h3>
                  <ul className="space-y-2 mb-4">
                    {example.items.map((item, i) => <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success" />
                        {item}
                      </li>)}
                  </ul>
                  <div className="text-sm font-semibold text-success">{example.savings}</div>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {advantages.map((adv, index) => <Card key={index} className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <adv.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{adv.title}</h3>
                  <p className="text-sm text-muted-foreground">{adv.description}</p>
                </Card>)}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-secondary to-orange-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para comprar sin límites?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Solicita tu Personal Shopper ahora y recibe tus productos en 7-10 días
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-secondary hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Solicitar Ahora
                </Button>
                
              </div>
            </div>
          </div>
        </section>
      </div>
    </>;
};
export default PersonalShopper;