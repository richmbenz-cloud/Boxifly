import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plane, Truck, CheckCircle, DollarSign, Clock, Shield, Star, Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import logoFull from '@/assets/logo-boxifly-full.png';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { GuaranteeSection } from '@/components/GuaranteeSection';
import { ChatWidget } from '@/components/ChatWidget';
import { MainNavigation } from '@/components/MainNavigation';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useAuth } from '@/lib/auth';
import { calculatePackageTariff, type TariffCalculation } from '@/lib/tariffCalculator';
const Landing = () => {
  const navigate = useNavigate();
  const {
    user,
    userRole,
    loading
  } = useAuth();
  const [trackingCode, setTrackingCode] = useState('');
  const [calcWeight, setCalcWeight] = useState('');
  const [calcValue, setCalcValue] = useState('');
  const [calculation, setCalculation] = useState<TariffCalculation | null>(null);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && user && userRole) {
      navigate('/dashboard');
    }
  }, [user, userRole, loading, navigate]);

  // Scroll animations
  const howItWorks = useScrollAnimation({
    threshold: 0.2
  });
  const calculator = useScrollAnimation({
    threshold: 0.2
  });
  const benefits = useScrollAnimation({
    threshold: 0.2
  });
  const faq = useScrollAnimation({
    threshold: 0.2
  });
  const cta = useScrollAnimation({
    threshold: 0.3
  });

  // Force mobile cache refresh
  useEffect(() => {
    sessionStorage.setItem('landing-cache-v3', Date.now().toString());
  }, []);
  const calculateCost = async () => {
    if (!calcWeight || !calcValue) return;
    const weight = parseFloat(calcWeight);
    const value = parseFloat(calcValue);

    // Usar las tarifas Boxifly
    const result = await calculatePackageTariff(weight, value, 'pickup', '', true, false);
    if (result) {
      setCalculation(result);
    }
  };
  const handleTrackPackage = () => {
    if (trackingCode.trim()) {
      navigate(`/tracking/${trackingCode}`);
    }
  };
  return <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <MainNavigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-navy py-16 sm:py-24 md:py-32 lg:py-40 animate-fade-in">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.2),transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm font-medium">Más de 10,000 envíos exitosos</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight tracking-tight">
              Tu casillero en Miami
              <span className="block text-secondary mt-2">directo a Perú</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Compra lo que quieras en USA. Nosotros consolidamos, gestionamos aduanas y entregamos en tu puerta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
              <Button size="lg" className="bg-white text-primary hover:bg-white/95 hover-scale-sm hover:shadow-2xl transition-all text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 h-auto shadow-2xl font-semibold w-full sm:w-auto" onClick={() => navigate('/iniciar-sesion')}>
                Empezar ahora - Es gratis
              </Button>
              <Button size="lg" variant="ghost" className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white hover-scale-sm text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 h-auto backdrop-blur-sm w-full sm:w-auto transition-all" onClick={() => navigate('/tariffs')}>
                Ver tarifas
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-2xl mx-auto px-4 sm:px-0">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1">7-10</div>
                <div className="text-xs sm:text-sm text-white/70">días de entrega</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">60%</div>
                <div className="text-xs sm:text-sm text-white/70">de ahorro promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-white/70">atención al cliente</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-16 sm:py-20 md:py-24 bg-white animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">Proceso simple</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Cómo funciona</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Solo 4 pasos para recibir tus compras de USA en tu casa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 sm:px-0">
            {[{
              icon: Package,
              step: '01',
              title: 'Regístrate',
              description: 'Crea tu cuenta gratis y obtén tu casillero exclusivo en Miami'
            }, {
              icon: Plane,
              step: '02',
              title: 'Compra',
              description: 'Usa tu dirección Boxifly en cualquier tienda online de USA'
            }, {
              icon: Truck,
              step: '03',
              title: 'Consolidamos',
              description: 'Agrupamos tus paquetes para maximizar el ahorro'
            }, {
              icon: CheckCircle,
              step: '04',
              title: 'Recibe',
              description: 'Entrega rápida y segura directo a tu puerta'
            }].map((item, index) => <div key={index} className="relative group">
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 sm:p-8 h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover-glow">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 sm:mb-6 shadow-lg hover-scale-md">
                    <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-5xl sm:text-6xl font-bold text-secondary/10 mb-2 sm:mb-3">{item.step}</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {index < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />}
              </div>)}
          </div>
        </div>
      </section>

      {/* Tariff Calculator */}
      <section id="calculadora" className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-muted/50 to-muted/30 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">Sin sorpresas</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Calcula tu envío</h2>
              <p className="text-lg sm:text-xl text-muted-foreground px-4 sm:px-0">
                Transparencia total desde el inicio
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden hover-lift">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-6 sm:p-8 md:p-10 lg:p-12 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Cotiza ahora</h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="weight" className="text-sm sm:text-base font-semibold">Peso aproximado</Label>
                      <div className="relative">
                        <Input id="weight" type="number" placeholder="0.0" className="text-base sm:text-lg h-12 sm:h-14 pr-12" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} />
                        <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm sm:text-base">kg</span>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="value" className="text-sm sm:text-base font-semibold">Valor declarado</Label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm sm:text-base">$</span>
                        <Input id="value" type="number" placeholder="0.00" className="text-base sm:text-lg h-12 sm:h-14 pl-8" value={calcValue} onChange={e => setCalcValue(e.target.value)} />
                      </div>
                    </div>
                    <Button className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all" size="lg" onClick={calculateCost}>
                      Calcular ahora
                    </Button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 md:p-10 lg:p-12 bg-white flex flex-col justify-center">
                  {calculation !== null ? <div className="text-center animate-in fade-in zoom-in duration-500">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-2 mb-4">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Costo calculado</span>
                        </div>
                      </div>
                      <div className="mb-8">
                        <p className="text-sm text-muted-foreground mb-2">Total estimado</p>
                        <p className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          ${calculation.final_cost.toFixed(2)}
                        </p>
                      </div>
                      <div className="space-y-3 text-left bg-muted/30 rounded-xl p-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor Declarado</span>
                          <span className="font-semibold">${calculation.declaredValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Transporte</span>
                          <span className="font-semibold">${calculation.freight_cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Manejo Aduanal</span>
                          <span className="font-semibold">${calculation.customs_handling_cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Programa de Garantía</span>
                          <span className="font-semibold">${calculation.guarantee_cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-3 bg-muted/50 -mx-6 px-6">
                          <span className="font-medium">Valor CIF</span>
                          <span className="font-semibold">${calculation.cif_value.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Impuestos Totales
                            {calculation.total_government_charges === 0 && <span className="text-xs ml-1">- Exonerado</span>}
                          </span>
                          <span className="font-semibold">${calculation.total_government_charges.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        Tarifas basadas en el modelo Aeropost
                      </p>
                    </div> : <div className="text-center text-muted-foreground">
                      <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Ingresa los datos de tu paquete para obtener una cotización instantánea</p>
                    </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-16 sm:py-20 md:py-24 bg-white animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-secondary font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">Ventajas únicas</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">¿Por qué Boxifly?</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              La mejor opción para tus envíos internacionales
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
            {[{
              icon: DollarSign,
              title: 'Ahorra hasta 60%',
              description: 'Consolidación inteligente de paquetes. Transparencia total en costos, sin cargos ocultos.',
              gradient: 'from-success/10 to-success/5',
              iconBg: 'bg-success/10',
              iconColor: 'text-success'
            }, {
              icon: Clock,
              title: 'Entrega en 7-10 días',
              description: 'Proceso optimizado y tracking en tiempo real. Sabrás dónde está tu paquete en todo momento.',
              gradient: 'from-primary/10 to-primary/5',
              iconBg: 'bg-primary/10',
              iconColor: 'text-primary'
            }, {
              icon: Shield,
              title: '100% Seguro',
              description: 'Warehouse certificado, seguro incluido y soporte 24/7. Tu tranquilidad es nuestra prioridad.',
              gradient: 'from-secondary/10 to-secondary/5',
              iconBg: 'bg-secondary/10',
              iconColor: 'text-secondary'
            }].map((benefit, index) => <div key={index} className="group">
                <div className={`bg-gradient-to-br ${benefit.gradient} rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover-lift hover-glow`}>
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl ${benefit.iconBg} flex items-center justify-center mb-4 sm:mb-6 hover-scale-md`}>
                    <benefit.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${benefit.iconColor}`} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">{benefit.description}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Testimonials - Using DB data */}
      <TestimonialsSection />
      
      {/* Guarantee Section */}
      <GuaranteeSection />

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 bg-muted/30 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">Preguntas frecuentes</h2>
              <p className="text-base sm:text-lg text-muted-foreground px-4 sm:px-0">Todo lo que necesitas saber sobre Boxifly</p>
            </div>

            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4 px-4 sm:px-0">
              <AccordionItem value="item-1" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  ¿Cómo funciona el casillero en Miami?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Al registrarte, te asignamos una dirección única en Miami. Usa esta dirección al comprar en cualquier tienda online de USA. Nosotros recibimos, almacenamos y consolidamos tus paquetes antes de enviarlos a Perú.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  ¿Cuánto tiempo tarda el envío?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  El proceso completo toma entre 7-10 días desde que consolidamos tu paquete hasta la entrega en tu domicilio en Perú. Puedes hacer seguimiento en tiempo real desde tu dashboard.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  ¿Qué es la consolidación de paquetes?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Es cuando agrupamos varios de tus paquetes en uno solo antes del envío internacional. Esto reduce significativamente los costos de envío y aduanas, pudiendo ahorrarte hasta 60%.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  ¿Hay productos prohibidos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sí. No podemos enviar productos peligrosos, armas, líquidos inflamables, medicamentos controlados ni productos perecederos. Consulta nuestra lista completa de productos prohibidos en la sección de términos y condiciones.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white border-2 rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  ¿Cómo funcionan los pagos?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Aceptamos transferencias bancarias, Yape, Plin y tarjetas de crédito/débito. Solo pagas cuando tu paquete está listo para ser enviado a Perú. Sin cargos anticipados ni sorpresas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90 animate-fade-in">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(245,166,35,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
            Empieza a ahorrar hoy
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Únete a más de 10,000 peruanos que ya están comprando en USA con Boxifly
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
            <Button size="lg" className="bg-white text-primary hover:bg-white/95 hover-scale-sm hover:shadow-2xl transition-all text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 h-auto shadow-2xl font-semibold w-full sm:w-auto" onClick={() => navigate('/iniciar-sesion')}>
              Crear mi cuenta gratis
            </Button>
            <p className="text-xs sm:text-sm text-white/70">No requiere tarjeta de crédito</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <img src={logoFull} alt="Boxifly" className="h-14 brightness-0 invert" />
              <p className="text-sm text-white/80 leading-relaxed max-w-xs">
                Tu solución logística para envíos de Estados Unidos a Perú. Rápido, seguro y sin complicaciones.
              </p>
              <a href="/libro-de-reclamaciones" className="hidden md:inline-block hover:opacity-90 transition-opacity">
                <img alt="Libro de Reclamaciones" src="/lovable-uploads/d323548f-c093-4d62-82b4-e971b100271e.png" className="h-12 w-auto object-contain" />
              </a>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/personas" className="hover:text-white transition-colors">Personas</Link></li>
                <li><Link to="/cotizador" className="hover:text-white transition-colors">Cotizador</Link></li>
                <li><Link to="/empresas" className="hover:text-white transition-colors">Empresas</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
                
                <li><Link to="/afiliados" className="hover:text-white transition-colors">Afiliados</Link></li>
                <li><Link to="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos y condiciones</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>hola@boxifly.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+51 951 314 150</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Lima, Perú</span>
                </li>
              </ul>
              <div className="flex gap-3 mt-4">
                <a href="https://facebook.com/boxifly.pe" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/boxifly" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/@Boxifly-pe" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
            <p>&copy; {new Date().getFullYear()} Boxifly. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
    </>;
};
export default Landing;