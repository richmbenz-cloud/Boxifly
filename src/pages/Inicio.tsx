import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plane, Truck, CheckCircle, DollarSign, Clock, Shield, Star, ShoppingBag, Users, Building2, Store, TrendingUp, Globe, Zap, Award, HeadphonesIcon, ArrowRight, ChevronRight, Sparkles, Calculator, CreditCard, Instagram, Facebook, MessageCircle, Youtube, Music } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { calculatePackageTariff, type TariffCalculation } from '@/lib/tariffCalculator';
import logoFull from '@/assets/logo-boxifly-full.png';
import { SEO } from '@/components/SEO';
const Inicio = () => {
  const navigate = useNavigate();
  const [calcWeight, setCalcWeight] = useState('');
  const [calcValue, setCalcValue] = useState('');
  const [calculation, setCalculation] = useState<TariffCalculation | null>(null);

  // Scroll animations
  const heroAnimation = useScrollAnimation({
    threshold: 0.1
  });
  const servicesAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const testimonialsAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const calculatorAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const howItWorksAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const benefitsAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const storeAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const ctaAnimation = useScrollAnimation({
    threshold: 0.2
  });
  const calculateCost = async () => {
    if (!calcWeight || !calcValue) return;
    const weight = parseFloat(calcWeight);
    const value = parseFloat(calcValue);
    const result = await calculatePackageTariff(weight, value, 'pickup', '', true, false);
    if (result) {
      setCalculation(result);
    }
  };

  // Services data
  const services = [{
    icon: Package,
    title: 'Casillero',
    description: 'Tu dirección exclusiva en Miami. Compra en cualquier tienda online de USA y recibe en Perú.',
    gradient: 'from-blue-500/10 to-blue-600/5',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    href: '/casillero',
    benefits: ['Consolidación gratis', 'Tracking 24/7', 'Entrega 7-10 días']
  }, {
    icon: Building2,
    title: 'Aliado Comercial B2B',
    description: 'Soluciones corporativas para empresas que importan. Tarifas preferenciales y atención prioritaria.',
    gradient: 'from-orange-500/10 to-orange-600/5',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    href: '/b2b',
    benefits: ['Tarifas corporativas', 'Dashboard exclusivo', 'Soporte dedicado']
  }];

  // How it works steps
  const steps = [{
    icon: Package,
    number: '01',
    title: 'Regístrate gratis',
    description: 'Obtén tu casillero exclusivo en Miami en segundos'
  }, {
    icon: Globe,
    number: '02',
    title: 'Compra en USA',
    description: 'Usa tu dirección Boxifly en tus tiendas favoritas'
  }, {
    icon: Truck,
    number: '03',
    title: 'Consolidamos',
    description: 'Agrupamos tus paquetes para maximizar el ahorro'
  }, {
    icon: CheckCircle,
    number: '04',
    title: 'Recibe en casa',
    description: 'Entrega segura directo a tu puerta en 7-10 días'
  }];

  // Benefits
  const benefits = [{
    icon: DollarSign,
    title: 'Ahorra hasta 60%',
    description: 'Consolidación inteligente y tarifas transparentes sin cargos ocultos',
    color: 'text-green-600',
    bg: 'bg-green-500/10'
  }, {
    icon: Clock,
    title: 'Entrega 7-10 días',
    description: 'Proceso optimizado y tracking en tiempo real',
    color: 'text-blue-600',
    bg: 'bg-blue-500/10'
  }, {
    icon: Shield,
    title: '100% Seguro',
    description: 'Warehouse certificado con seguro incluido y soporte 24/7',
    color: 'text-orange-600',
    bg: 'bg-orange-500/10'
  }, {
    icon: Zap,
    title: 'Proceso rápido',
    description: 'Gestión aduanal eficiente sin complicaciones',
    color: 'text-purple-600',
    bg: 'bg-purple-500/10'
  }, {
    icon: Award,
    title: 'Programa VIP',
    description: 'Acumula puntos y accede a beneficios exclusivos',
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/10'
  }, {
    icon: HeadphonesIcon,
    title: 'Soporte dedicado',
    description: 'Atención personalizada por WhatsApp, email y teléfono',
    color: 'text-pink-600',
    bg: 'bg-pink-500/10'
  }];

  // Featured products (mock data - replace with real data later)
  const featuredProducts = [{
    id: 1,
    name: 'Nintendo Switch OLED',
    price: 1106.00,
    image: '/images/products/nintendo-switch.jpg'
  }, {
    id: 2,
    name: 'PlayStation 5 Digital',
    price: 1846.00,
    image: '/images/products/playstation-5.jpg'
  }, {
    id: 3,
    name: 'MacBook Pro M3',
    price: 5916.00,
    image: '/images/products/macbook-m3.jpg'
  }, {
    id: 4,
    name: 'iPhone 17 Pro Max',
    price: 4920.00,
    image: '/images/products/iphone-17-pro-max.jpg'
  }];

  // Testimonials by service
  const testimonials = [{
    service: 'Casillero',
    name: 'María González',
    role: 'Cliente frecuente',
    rating: 5,
    comment: 'Excelente servicio de casillero. Mis paquetes llegan en perfecto estado y el seguimiento es en tiempo real. Ya he realizado más de 15 envíos sin problemas.',
    serviceColor: 'bg-blue-500/10',
    serviceBadge: 'bg-blue-500 text-white'
  }, {
    service: 'Personal Shopper',
    name: 'Carlos Ramírez',
    role: 'Empresario',
    rating: 5,
    comment: 'El servicio de Personal Shopper es increíble. Compraron exactamente lo que necesitaba y me asesoraron en todo el proceso. Muy profesionales.',
    serviceColor: 'bg-purple-500/10',
    serviceBadge: 'bg-purple-500 text-white'
  }, {
    service: 'Viajero',
    name: 'Ana Martínez',
    role: 'Viajera frecuente',
    rating: 5,
    comment: 'Como viajera, el programa de Boxifly me permite ganar dinero extra mientras viajo. El proceso es seguro, rápido y la declaración jurada me da tranquilidad.',
    serviceColor: 'bg-sky-500/10',
    serviceBadge: 'bg-sky-500 text-white'
  }, {
    service: 'B2B',
    name: 'Roberto Salazar',
    role: 'Gerente de Importaciones',
    rating: 5,
    comment: 'Las tarifas corporativas son muy competitivas. El dashboard B2B nos permite gestionar todas nuestras importaciones de manera eficiente. Altamente recomendado.',
    serviceColor: 'bg-orange-500/10',
    serviceBadge: 'bg-orange-500 text-white'
  }, {
    service: 'Tienda',
    name: 'Lucía Torres',
    role: 'Clienta online',
    rating: 5,
    comment: 'La tienda online de Boxifly es perfecta. Productos de calidad, buenos precios y la entrega en Perú es rápida y segura. Ya no tengo que preocuparme por el envío internacional.',
    serviceColor: 'bg-green-500/10',
    serviceBadge: 'bg-green-500 text-white'
  }, {
    service: 'Casillero',
    name: 'Pedro Díaz',
    role: 'Cliente VIP',
    rating: 5,
    comment: 'Consolidar mis paquetes me ha ahorrado muchísimo dinero. El programa de puntos VIP es un plus increíble. Definitivamente la mejor opción para importar.',
    serviceColor: 'bg-blue-500/10',
    serviceBadge: 'bg-blue-500 text-white'
  }, {
    service: 'Personal Shopper',
    name: 'Sofía Mendoza',
    role: 'Diseñadora',
    rating: 5,
    comment: 'Necesitaba materiales específicos de USA y el Personal Shopper los encontró todos. La atención es personalizada y muy eficiente. 100% recomendado.',
    serviceColor: 'bg-purple-500/10',
    serviceBadge: 'bg-purple-500 text-white'
  }, {
    service: 'Viajero',
    name: 'Miguel Ángel Castro',
    role: 'Ejecutivo',
    rating: 5,
    comment: 'Viajo frecuentemente por trabajo y traer paquetes con Boxifly es súper fácil. Las comisiones son justas y el soporte es excelente. Gran oportunidad.',
    serviceColor: 'bg-sky-500/10',
    serviceBadge: 'bg-sky-500 text-white'
  }, {
    service: 'B2B',
    name: 'Isabel Rojas',
    role: 'Directora Comercial',
    rating: 5,
    comment: 'Boxifly nos ayudó a optimizar nuestros procesos de importación. El soporte dedicado y las tarifas preferenciales son impresionantes. Verdaderos aliados comerciales.',
    serviceColor: 'bg-orange-500/10',
    serviceBadge: 'bg-orange-500 text-white'
  }, {
    service: 'Tienda',
    name: 'Fernando Vega',
    role: 'Gamer',
    rating: 5,
    comment: 'Compré mi consola y accesorios en la tienda Boxifly. Llegó perfectamente empaquetado y en tiempo récord. Precios competitivos y stock disponible.',
    serviceColor: 'bg-green-500/10',
    serviceBadge: 'bg-green-500 text-white'
  }, {
    service: 'Casillero',
    name: 'Gabriela Paredes',
    role: 'Compradora online',
    rating: 5,
    comment: 'He probado varios casilleros y Boxifly es el mejor. Rápido, confiable y con excelente atención al cliente. Mis compras de Black Friday llegaron perfectas.',
    serviceColor: 'bg-blue-500/10',
    serviceBadge: 'bg-blue-500 text-white'
  }, {
    service: 'Personal Shopper',
    name: 'Diego Vargas',
    role: 'Coleccionista',
    rating: 5,
    comment: 'Colecciono artículos exclusivos y el Personal Shopper me ha conseguido piezas imposibles de encontrar en Perú. Servicio de primera, totalmente confiable.',
    serviceColor: 'bg-purple-500/10',
    serviceBadge: 'bg-purple-500 text-white'
  }];

  // Blog posts (mock data)
  const blogPosts = [{
    title: 'Black Friday & Cyber Monday 2025: Guía Completa',
    excerpt: 'Estrategias probadas, mejores tiendas, cupones exclusivos y fechas clave para ahorrar hasta 70%...',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80',
    category: 'E-commerce'
  }, {
    title: 'Calculadora de Aranceles 2025 con Ejemplos Reales',
    excerpt: 'Entiende exactamente cuánto pagarás en aduanas. Incluye calculadora interactiva y tips...',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    category: 'Guías'
  }, {
    title: 'Las 25 Mejores Tiendas Online USA 2025',
    excerpt: 'Directorio completo de las tiendas más confiables con cupones y tips de compra...',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    category: 'Tips'
  }];
  return <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        {/* Main Navigation */}
        <SEO
          title="Boxifly – Compra en EE.UU. y recibe en Perú"
          description="Tu dirección gratuita en Estados Unidos. El casillero postal definitivo para comprar en cualquier tienda de EE.UU. y recibir en Perú: rápido, seguro y sin complicaciones."
          path="/"
          jsonLd={[
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Boxifly",
              url: "https://boxifly.lovable.app",
              logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/WA0TUcnUbrPRoxk0ZwGxji4BOXB3/uploads/1764505580535-Boxifly.png",
              sameAs: [],
              contactPoint: [{
                "@type": "ContactPoint",
                telephone: "+51 951 314 150",
                contactType: "customer service",
                areaServed: "PE",
                availableLanguage: ["es"]
              }]
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Boxifly",
              url: "https://boxifly.lovable.app"
            }
          ]}
        />
        <MainNavigation />

        {/* Hero Section */}
        <section ref={heroAnimation.ref} className={`relative overflow-hidden bg-gradient-to-br from-primary via-primary to-navy py-20 md:py-32 lg:py-40 transition-all duration-700 ${heroAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,166,35,0.15),transparent_50%)]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center text-white">
              {/* Trust badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Plataforma líder en envíos USA - Perú</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Consigue tu dirección en
                <span className="block text-secondary mt-2">Estados Unidos gratis</span>
              </h1>

              <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
                El casillero postal para comprar en tus tiendas favoritas de EE.UU. y recibir en Perú: rápido, seguro y sin complicaciones.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button size="lg" className="bg-white text-primary hover:bg-white/95 hover:scale-105 transition-all text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/auth')}>
                  Comienza ahora - Es gratis
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="ghost" className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white text-lg px-10 py-6 h-auto backdrop-blur-sm" onClick={() => navigate('/calculator')}>
                  <Calculator className="mr-2 w-5 h-5" />
                  Cotiza tu envío
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">10,000+</div>
                  <div className="text-sm text-white/70">Envíos exitosos</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-4xl font-bold mb-1">7-10</div>
                  <div className="text-sm text-white/70">Días de entrega</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-white/70">Soporte</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nuestros Servicios */}
        <section ref={servicesAnimation.ref} className={`py-20 md:py-24 bg-white transition-all duration-700 delay-100 ${servicesAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 text-xs uppercase tracking-wider">Nuestros servicios</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Tu dirección exclusiva en Miami para recibir tus compras y enviarlas a todo el Perú: rápido, seguro y sin complicaciones.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {services.map((service, index) => <Card key={index} className={`group hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/40 bg-gradient-to-br ${service.gradient} relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/0 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500`} onClick={() => navigate(service.href)}>
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-3 transition-all duration-500 ease-out shadow-sm group-hover:shadow-lg`}>
                      <service.icon className={`w-8 h-8 ${service.iconColor} transition-all duration-500 group-hover:scale-110`} />
                    </div>
                    <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors duration-300">{service.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {service.benefits.map((benefit, idx) => <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" style={{transitionDelay: `${idx * 50}ms`}}>
                          <CheckCircle className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                          {benefit}
                        </li>)}
                    </ul>
                    <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:shadow-lg">
                      Saber más
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Testimonios Carousel */}
        <section ref={testimonialsAnimation.ref} className={`py-20 md:py-24 bg-gradient-to-br from-muted/50 to-muted/30 transition-all duration-700 delay-150 ${testimonialsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 text-xs uppercase tracking-wider">Testimonios reales</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Lo que dicen nuestros clientes
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Miles de clientes satisfechos confían en Boxifly para sus envíos y compras internacionales
              </p>
            </div>

            <div className="max-w-6xl mx-auto px-12">
              <Carousel opts={{
              align: "start",
              loop: true
            }} className="w-full">
                <CarouselContent>
                  {testimonials.map((testimonial, index) => <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <Card className={`h-full ${testimonial.serviceColor} border-2 hover:shadow-xl transition-all duration-300`}>
                        <CardHeader>
                          <div className="flex items-start justify-between mb-4">
                            <Badge variant="default" className={`${testimonial.serviceBadge} font-semibold px-3 py-1`}>
                              {testimonial.service}
                            </Badge>
                            <div className="flex gap-0.5">
                              {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                            </div>
                          </div>
                          <CardDescription className="text-base leading-relaxed text-foreground/80 mb-4">
                            "{testimonial.comment}"
                          </CardDescription>
                          <div className="mt-auto pt-4 border-t">
                            <p className="font-semibold text-foreground">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </CardHeader>
                      </Card>
                    </CarouselItem>)}
                </CarouselContent>
                <CarouselPrevious className="-left-12" />
                <CarouselNext className="-right-12" />
              </Carousel>
            </div>

            <div className="text-center mt-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                <span className="text-lg font-medium">
                  Más de 10,000 clientes satisfechos 
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Mini Calculadora - Solo Casillero */}
        <section ref={calculatorAnimation.ref} className={`py-20 md:py-24 bg-gradient-to-br from-muted/50 to-muted/30 transition-all duration-700 delay-200 ${calculatorAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 text-xs uppercase tracking-wider">Calculadora</Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  ¿Cuánto cuesta enviar tu paquete?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Calcula el costo de tu envío desde Miami a Perú en segundos
                </p>
              </div>

              <Card className="shadow-2xl border-2">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-10 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <h3 className="text-2xl font-bold mb-6">Cotiza tu envío</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="weight" className="text-base font-semibold">Peso aproximado</Label>
                        <div className="relative">
                          <Input id="weight" type="number" placeholder="0.0" className="text-lg h-14 pr-12" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">kg</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="value" className="text-base font-semibold">Valor declarado</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                          <Input id="value" type="number" placeholder="0.00" className="text-lg h-14 pl-8" value={calcValue} onChange={e => setCalcValue(e.target.value)} />
                        </div>
                      </div>
                      <Button className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" onClick={calculateCost}>
                        Calcular ahora
                      </Button>
                    </div>
                  </div>

                  <div className="p-8 md:p-10 bg-white flex flex-col justify-center">
                    {calculation ? <div className="text-center animate-in fade-in zoom-in duration-500">
                        <div className="mb-6">
                          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Costo calculado
                          </Badge>
                        </div>
                        <div className="mb-8">
                          <p className="text-sm text-muted-foreground mb-2">Total estimado</p>
                          <p className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ${calculation.final_cost.toFixed(2)}
                          </p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/calculator')}>
                          Ver desglose completo
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div> : <div className="text-center text-muted-foreground">
                        <Calculator className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Ingresa los datos para ver tu cotización</p>
                      </div>}
                  </div>
                </div>
              </Card>

              {/* <div className="text-center mt-8">
                <p className="text-muted-foreground mb-4">
                  ¿Buscas otros servicios?
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={() => navigate('/personal-shopper')}>
                    Personal Shopper
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/viajero')}>
                    Viajero
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/b2b')}>
                    Soluciones B2B
                  </Button>
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        

        {/* Beneficios */}
        <section ref={benefitsAnimation.ref} className={`py-20 md:py-24 bg-gradient-to-br from-muted/50 to-muted/30 transition-all duration-700 delay-400 ${benefitsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 text-xs uppercase tracking-wider">Ventajas únicas</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                ¿Por qué elegir Boxifly?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                La mejor opción para tus envíos internacionales
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl ${benefit.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                    </div>
                    <CardTitle className="text-xl mb-2">{benefit.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Tienda Destacada - Ocultado Temporalmente para Fase 1 */}
        {/* <section ref={storeAnimation.ref} className={`py-20 md:py-24 bg-white transition-all duration-700 delay-500 ${storeAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 text-xs uppercase tracking-wider">Tienda online</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Productos destacados
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Compra directamente sin preocuparte por el envío internacional
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-10">
              {featuredProducts.map(product => <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/20" onClick={() => navigate('/shop')}>
                  <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted/30 rounded-t-lg overflow-hidden p-4">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-2xl font-bold text-primary">
                        S/ {product.price.toFixed(2)}
                      </span>
                      <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                        Disponible
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>)}
            </div>

            <div className="text-center">
              <Button size="lg" onClick={() => navigate('/shop')} className="shadow-lg hover:shadow-xl transition-all">
                Ver toda la tienda
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section> */}

        {/* Blog / Tips */}
        <section className="py-20 md:py-24 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 text-xs uppercase tracking-wider">Blog y guías</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Tips y recursos útiles
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Aprende a comprar mejor y ahorrar más en tus importaciones
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
              {blogPosts.map((post, index) => <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/20 overflow-hidden" onClick={() => navigate('/blog')}>
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <CardHeader>
                    <Badge className="w-fit mb-2 text-xs">{post.category}</Badge>
                    <CardTitle className="text-lg line-clamp-2 mb-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                    <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-all">
                      Leer más
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardHeader>
                </Card>)}
            </div>

            <div className="text-center space-y-4">
              <Button variant="outline" size="lg" onClick={() => navigate('/blog')}>
                Ver todos los artículos
              </Button>
              {/* <div className="flex flex-wrap justify-center gap-3">
                <Button variant="link" onClick={() => navigate('/guias-de-compras')}>
                  Guías de compras
                </Button>
                <Button variant="link" onClick={() => navigate('/tiendas-en-usa')}>
                  Tiendas en USA
                </Button>
                <Button variant="link" onClick={() => navigate('/tipos-de-entrega')}>
                  Tipos de entrega
                </Button>
              </div> */}
            </div>
          </div>
        </section>

        {/* FAQs Destacadas */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Encuentra respuestas rápidas a las preguntas más comunes
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-medium hover:text-primary">
                    ¿Cómo obtengo mi casillero en Miami?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Al registrarte en Boxifly, automáticamente recibes una dirección exclusiva en Miami (tu casillero virtual). Usa esta dirección al hacer compras online en cualquier tienda de USA.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-medium hover:text-primary">
                    ¿Cuánto tiempo demora el envío desde Miami?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    El tiempo estimado de entrega es de 7 a 10 días hábiles desde que tu paquete llega a nuestro warehouse en Miami y es procesado para envío internacional.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-medium hover:text-primary">
                    ¿Qué métodos de pago aceptan?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express, Diners Club), Yape, Plin, transferencia bancaria y pagos en efectivo en puntos autorizados.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-medium hover:text-primary">
                    ¿Cuándo se cobran impuestos aduaneros?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Los impuestos se aplican si el valor CIF (producto + transporte + seguro) supera los $200 USD. En ese caso, se cobra 18% de IGV + arancel según tipo de producto.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-medium hover:text-primary">
                    ¿Ofrecen seguro para los paquetes?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    El seguro básico está incluido (cubre pérdida o daño por manejo). Puedes contratar seguro extendido al 3% del valor declarado para cobertura total.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="text-center mt-10">
                <Button size="lg" variant="outline" onClick={() => navigate('/preguntas-frecuentes')} className="text-lg px-8 py-6 h-auto">
                  Ver todas las preguntas frecuentes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section ref={ctaAnimation.ref} className={`py-20 md:py-24 bg-gradient-to-br from-primary to-navy relative overflow-hidden transition-all duration-700 ${ctaAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,166,35,0.15),transparent_50%)]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para empezar a importar desde USA?
              </h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
                Únete a miles de clientes satisfechos. Regístrate gratis y obtén 
                tu casillero exclusivo en Miami hoy mismo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/95 hover:scale-105 transition-all text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/auth')}>
                  Crear cuenta gratis
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="ghost" className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white text-lg px-10 py-6 h-auto backdrop-blur-sm" onClick={() => navigate('/contacto')}>
                  Contactar soporte
                </Button>
              </div>

              <div className="mt-12 pt-12 border-t border-white/20">
                <p className="text-sm text-white/70 mb-4">También puedes explorar:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="link" className="text-white hover:text-secondary" onClick={() => navigate('/atencion-por-whatsapp')}>
                    Atención WhatsApp
                  </Button>
                  <Button variant="link" className="text-white hover:text-secondary" onClick={() => navigate('/boxifly-puntos')}>
                    Programa de puntos
                  </Button>
                  <Button variant="link" className="text-white hover:text-secondary" onClick={() => navigate('/afiliados')}>
                    Programa de afiliados
                  </Button>
                  <Button variant="link" className="text-white hover:text-secondary" onClick={() => navigate('/centro-de-ayuda')}>
                    Centro de ayuda
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-navy text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Company info */}
              <div className="md:col-span-1 space-y-4">
                <img src={logoFull} alt="Boxifly" className="h-14 brightness-0 invert" />
                <p className="text-white/70 text-sm leading-relaxed">
                  Tu solución logística para envíos de Estados Unidos a Perú. 
                  Rápido, seguro y sin complicaciones.
                </p>
              </div>

              {/* Services */}
              <div>
                <h3 className="font-semibold mb-4">Servicios</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/casillero" className="text-white/70 hover:text-white transition-colors">Casillero</a></li>
                  <li><a href="/personal-shopper" className="text-white/70 hover:text-white transition-colors">Personal Shopper</a></li>
                  <li><a href="/viajeros" className="text-white/70 hover:text-white transition-colors">Viajero</a></li>
                  <li><a href="/b2b" className="text-white/70 hover:text-white transition-colors">Aliado Comercial B2B</a></li>
                  <li><a href="/shop" className="text-white/70 hover:text-white transition-colors">Tienda</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="font-semibold mb-4">Recursos</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/calculator" className="text-white/70 hover:text-white transition-colors">Cotizador</a></li>
                  <li><a href="/tariffs" className="text-white/70 hover:text-white transition-colors">Tarifas</a></li>
                  <li><a href="/restricted-products" className="text-white/70 hover:text-white transition-colors">Productos restringidos</a></li>
                  <li><a href="/blog" className="text-white/70 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="/centro-de-ayuda" className="text-white/70 hover:text-white transition-colors">Centro de ayuda</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="/terminos-y-condiciones" className="text-white/70 hover:text-white transition-colors">Términos y condiciones</a></li>
                  <li><a href="/politica-privacidad" className="text-white/70 hover:text-white transition-colors">Política de privacidad</a></li>
                  <li><a href="/politica-cambios-devoluciones" className="text-white/70 hover:text-white transition-colors">Cambios y devoluciones</a></li>
                  <li className="md:hidden"><a href="/libro-de-reclamaciones" className="text-white/70 hover:text-white transition-colors">Libro de Reclamaciones</a></li>
                </ul>
                <a href="/libro-de-reclamaciones" className="hidden md:inline-block hover:opacity-90 transition-opacity mt-4">
                  <img alt="Libro de Reclamaciones" src="/lovable-uploads/d323548f-c093-4d62-82b4-e971b100271e.png" className="h-12 w-auto object-contain" />
                </a>
              </div>
            </div>

            {/* Contact info */}
            <div className="border-t border-white/20 pt-8 mb-8">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/70 mb-2">
                    <strong className="text-white">Email:</strong> contacto@boxifly.com
                  </p>
                  <p className="text-white/70">
                    <strong className="text-white">WhatsApp:</strong>{' '}
                    <a href="https://wa.me/51951314150" className="hover:text-secondary transition-colors">
                      +51 951 314 150
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-white/70 mb-2">
                    <strong className="text-white">Oficina Lima:</strong> Av. Alfredo Benavides 501. Miraflores, 15047
                  </p>
                  <p className="text-white/70">
                    <strong className="text-white">Warehouse Miami:</strong> 7800 NW 46th St, Doral, FL 33166
                  </p>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="border-t border-white/20 pt-8 mb-8">
              <h3 className="font-semibold mb-4 text-center">Medios de pago aceptados</h3>
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group" title="Visa">
                  <CreditCard className="w-8 h-8 md:w-10 md:h-10" />
                  <span className="text-sm md:text-base font-medium">Visa</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group" title="Mastercard">
                  <CreditCard className="w-8 h-8 md:w-10 md:h-10" />
                  <span className="text-sm md:text-base font-medium">Mastercard</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group" title="American Express">
                  <CreditCard className="w-8 h-8 md:w-10 md:h-10" />
                  <span className="text-sm md:text-base font-medium">Amex</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group" title="Diners Club">
                  <CreditCard className="w-8 h-8 md:w-10 md:h-10" />
                  <span className="text-sm md:text-base font-medium">Diners</span>
                </div>
                <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group" title="PayPal">
                  <CreditCard className="w-8 h-8 md:w-10 md:h-10" />
                  <span className="text-sm md:text-base font-medium">PayPal</span>
                </div>
              </div>
            </div>

            {/* Social media */}
            <div className="border-t border-white/20 pt-8 mb-8">
              <h3 className="font-semibold mb-4 text-center">Síguenos</h3>
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                <a 
                  href="https://www.instagram.com/boxifly" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white hover:scale-110 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-7 h-7 md:w-8 md:h-8" />
                </a>
                <a 
                  href="https://www.facebook.com/boxifly" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white hover:scale-110 transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-7 h-7 md:w-8 md:h-8" />
                </a>
                <a 
                  href="https://wa.me/51951314150" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white hover:scale-110 transition-all"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-7 h-7 md:w-8 md:h-8" />
                </a>
                <a 
                  href="https://www.youtube.com/@boxifly" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white hover:scale-110 transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="w-7 h-7 md:w-8 md:h-8" />
                </a>
                <a 
                  href="https://www.tiktok.com/@boxifly" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white hover:scale-110 transition-all"
                  aria-label="TikTok"
                >
                  <Music className="w-7 h-7 md:w-8 md:h-8" />
                </a>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/70 text-sm text-center md:text-left">
                © 2025 Boxifly. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>;
};
export default Inicio;
