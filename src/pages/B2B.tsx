import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Building2, TrendingDown, Users, FileSpreadsheet, CheckCircle, Clock, Shield, BarChart3, Package, Zap } from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { SEO } from '@/components/SEO';
const B2B = () => {
  const navigate = useNavigate();
  const processAnim = useScrollAnimation({
    threshold: 0.2
  });
  const pricingAnim = useScrollAnimation({
    threshold: 0.2
  });
  const features = [{
    icon: TrendingDown,
    title: 'Tarifas Corporativas',
    description: 'Hasta 40% de descuento vs tarifas regulares. Cuanto más envías, más ahorras.',
    color: 'from-primary/10 to-primary/5'
  }, {
    icon: Users,
    title: 'Gestión Multi-Usuario',
    description: 'Múltiples cuentas de empleados bajo una sola empresa. Control centralizado.',
    color: 'from-secondary/10 to-secondary/5'
  }, {
    icon: FileSpreadsheet,
    title: 'Carga Masiva',
    description: 'Sube cientos de envíos con Excel/CSV. Automatiza tu logística internacional.',
    color: 'from-success/10 to-success/5'
  }, {
    icon: BarChart3,
    title: 'Reportes Avanzados',
    description: 'Dashboard ejecutivo con métricas, costos, consolidaciones y análisis de ahorro.',
    color: 'from-primary/10 to-primary/5'
  }];
  const benefits = [{
    icon: Shield,
    title: 'Cuenta Corporativa',
    description: 'Facturación mensual, crédito empresarial, términos comerciales flexibles'
  }, {
    icon: Clock,
    title: 'Soporte Prioritario',
    description: 'Account Manager dedicado, atención 24/7, resolución en menos de 2 horas'
  }, {
    icon: Package,
    title: 'Consolidación Empresarial',
    description: 'Agrupación masiva de envíos, optimización de rutas, tracking centralizado'
  }, {
    icon: Zap,
    title: 'API & Integraciones',
    description: 'Conecta Boxifly con tu ERP, WMS o sistema interno vía API REST'
  }];
  const pricingTiers = [{
    volume: '0 - 100 kg/mes',
    discount: '15%',
    features: ['Tarifas preferenciales', 'Dashboard básico', 'Soporte email']
  }, {
    volume: '100 - 500 kg/mes',
    discount: '25%',
    features: ['Todo lo anterior', 'Account Manager', 'Reportes mensuales', 'Facturación neta 15'],
    highlight: true
  }, {
    volume: '500+ kg/mes',
    discount: '40%',
    features: ['Todo lo anterior', 'Tarifas personalizadas', 'API dedicada', 'SLA garantizado']
  }];
  const useCases = [{
    title: 'E-commerce',
    description: 'Tiendas online que importan productos USA para reventa en Perú',
    icon: '🛍️'
  }, {
    title: 'Corporaciones',
    description: 'Empresas que necesitan equipos, repuestos o insumos desde USA',
    icon: '🏢'
  }, {
    title: 'Distribuidores',
    description: 'Importadores mayoristas de electrónica, moda o productos especializados',
    icon: '📦'
  }, {
    title: 'Startups',
    description: 'Nuevas empresas que buscan escalar sin invertir en logística propia',
    icon: '🚀'
  }];
  return <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Importaciones para empresas (B2B) | Boxifly" description="Soluciones de importación a Perú para empresas: tarifas preferenciales, consolidaciones y soporte dedicado. Cotiza con Boxifly." path="/b2b" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-navy py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Soluciones Empresariales</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Aliado Comercial B2B
                <span className="block text-secondary mt-2">Logística Internacional para tu Empresa</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Tarifas corporativas exclusivas, gestión multi-usuario, carga masiva y reportes avanzados. 
                La solución completa para empresas que importan de USA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/95 hover-scale-sm text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/auth')}>
                  Solicitar Cuenta Corporativa
                </Button>
                
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">40%</div>
                  <div className="text-sm text-white/70">de descuento</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl font-bold mb-1">1,000+</div>
                  <div className="text-sm text-white/70">kg procesados/mes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-white/70">soporte dedicado</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section ref={processAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${processAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3 block">Solución Completa</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Funcionalidades Empresariales</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Todo lo que tu empresa necesita para importar de USA
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => <Card key={index} className={`p-8 bg-gradient-to-br ${feature.color} border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}>
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section ref={pricingAnim.ref} className={`py-20 bg-gradient-to-br from-muted/50 to-muted/30 transition-all duration-1000 ${pricingAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Tarifas Corporativas</h2>
              <p className="text-xl text-muted-foreground">Descuentos progresivos según volumen mensual</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => <Card key={index} className={`p-8 ${tier.highlight ? 'ring-2 ring-primary shadow-2xl scale-105' : ''} bg-white relative`}>
                  {tier.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Más Popular
                    </div>}
                  <div className="text-center mb-6">
                    <div className="text-sm text-muted-foreground mb-2">{tier.volume}</div>
                    <div className="text-5xl font-bold text-primary mb-2">{tier.discount}</div>
                    <div className="text-sm text-muted-foreground">de descuento</div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>)}
                  </ul>
                  <Button className="w-full" variant={tier.highlight ? 'default' : 'outline'} onClick={() => navigate('/auth')}>
                    Solicitar Ahora
                  </Button>
                </Card>)}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
              * Descuentos aplicables sobre tarifas regulares. Facturación mensual. Requiere verificación corporativa.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">¿Para quién es B2B?</h2>
              <p className="text-xl text-muted-foreground">Casos de uso empresariales</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {useCases.map((useCase, index) => <Card key={index} className="p-6 text-center hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {benefits.map((benefit, index) => <Card key={index} className="p-8 text-center bg-white">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </Card>)}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-navy">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para escalar tu negocio?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Solicita tu cuenta corporativa y obtén tarifas preferenciales hoy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/auth')}>
                  <Building2 className="w-5 h-5 mr-2" />
                  Solicitar Cuenta B2B
                </Button>
                
              </div>
            </div>
          </div>
        </section>
      </div>
    </>;
};
export default B2B;