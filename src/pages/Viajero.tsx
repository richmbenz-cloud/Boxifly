import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plane, DollarSign, Shield, Clock, CheckCircle, MapPin, Briefcase, TrendingUp, FileText, Camera } from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
const Viajero = () => {
  const navigate = useNavigate();
  const processAnim = useScrollAnimation({
    threshold: 0.2
  });
  const benefitsAnim = useScrollAnimation({
    threshold: 0.2
  });
  const steps = [{
    icon: FileText,
    title: 'Regístrate y Verifica',
    description: 'Crea tu cuenta, completa KYC con documentos y biometría facial para seguridad.',
    color: 'from-primary/10 to-primary/5'
  }, {
    icon: Plane,
    title: 'Publica tu Viaje',
    description: 'Ingresa origen, destino, fecha de viaje y peso disponible en tu maleta.',
    color: 'from-sky-500/10 to-sky-500/5'
  }, {
    icon: Briefcase,
    title: 'Acepta Paquetes',
    description: 'Elige qué paquetes llevar. Nosotros gestionamos todo el proceso legal.',
    color: 'from-success/10 to-success/5'
  }, {
    icon: DollarSign,
    title: 'Recibe tu Comisión',
    description: 'Entrega el paquete y recibe tu pago inmediato. Transparencia total.',
    color: 'from-secondary/10 to-secondary/5'
  }];
  const earnings = [{
    weight: '5 kg',
    commission: '$50 - $75',
    trips: '2 viajes/mes',
    monthly: '$100 - $150'
  }, {
    weight: '10 kg',
    commission: '$100 - $150',
    trips: '2 viajes/mes',
    monthly: '$200 - $300'
  }, {
    weight: '15 kg',
    commission: '$150 - $225',
    trips: '2 viajes/mes',
    monthly: '$300 - $450'
  }, {
    weight: '20 kg',
    commission: '$200 - $300',
    trips: '2 viajes/mes',
    monthly: '$400 - $600'
  }];
  const requirements = [{
    icon: FileText,
    title: 'Documentación',
    items: ['Pasaporte vigente', 'DNI peruano', 'Comprobante de domicilio']
  }, {
    icon: Camera,
    title: 'Verificación',
    items: ['Biometría facial', 'Foto con DNI', 'Selfie en vivo']
  }, {
    icon: Shield,
    title: 'Compromiso',
    items: ['Declaración jurada', 'Términos de servicio', 'Código de ética']
  }];
  const advantages = [{
    icon: DollarSign,
    title: 'Gana Extra',
    description: 'Monetiza el espacio vacío en tu maleta. Hasta $300 por viaje.'
  }, {
    icon: Shield,
    title: 'Total Seguridad',
    description: 'Todos los paquetes verificados. Seguro incluido. Soporte legal.'
  }, {
    icon: Clock,
    title: 'Flexible',
    description: 'Tú decides qué paquetes llevar y cuándo viajar.'
  }, {
    icon: TrendingUp,
    title: 'Ingresos Recurrentes',
    description: 'Viajeros activos ganan hasta $600/mes en promedio.'
  }];
  return <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Plane className="w-4 h-4" />
                <span className="text-sm font-medium">Gana dinero viajando</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Viajero Boxifly
                <span className="block text-white/95 mt-2">Monetiza tu Espacio de Maleta</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                ¿Viajas frecuentemente entre USA y Perú? Gana dinero extra llevando paquetes 
                seguros y verificados. Hasta $300 por viaje sin esfuerzo adicional.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-sky-500 hover:bg-white/95 hover-scale-sm text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  Registrarme como Viajero
                </Button>
                
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">$50-$300</div>
                  <div className="text-sm text-white/70">por viaje</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-white/70">seguro y legal</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-white/70">soporte dedicado</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section ref={processAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${processAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sky-500 font-semibold text-sm uppercase tracking-wider mb-3 block">Proceso Simple</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                4 pasos para empezar a ganar viajando
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {steps.map((step, index) => <div key={index} className="relative">
                  <Card className={`p-8 h-full bg-gradient-to-br ${step.color} border-2 border-transparent hover:border-sky-500/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}>
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6">
                      <step.icon className="w-8 h-8 text-sky-500" />
                    </div>
                    <div className="text-6xl font-bold text-sky-500/10 mb-3">0{index + 1}</div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </Card>
                  {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-sky-500/30 to-transparent" />}
                </div>)}
            </div>
          </div>
        </section>

        {/* Earnings Table */}
        <section className="py-20 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">¿Cuánto puedo ganar?</h2>
              <p className="text-xl text-muted-foreground">Ejemplos de comisiones según peso transportado</p>
            </div>

            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Peso</th>
                      <th className="px-6 py-4 text-left font-semibold">Comisión por Viaje</th>
                      <th className="px-6 py-4 text-left font-semibold">Viajes/Mes</th>
                      <th className="px-6 py-4 text-left font-semibold">Ingreso Mensual</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {earnings.map((row, index) => <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-semibold">{row.weight}</td>
                        <td className="px-6 py-4 text-success font-semibold">{row.commission}</td>
                        <td className="px-6 py-4">{row.trips}</td>
                        <td className="px-6 py-4 text-sky-500 font-bold text-lg">{row.monthly}</td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6 max-w-2xl mx-auto">
              * Comisiones aproximadas. El monto final depende del peso, ruta y demanda. Pago inmediato tras entrega confirmada.
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section ref={benefitsAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Requisitos para ser Viajero</h2>
              <p className="text-xl text-muted-foreground">Proceso de verificación simple y seguro</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {requirements.map((req, index) => <Card key={index} className="p-8 bg-gradient-to-br from-sky-500/5 to-blue-600/5">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mb-6">
                    <req.icon className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{req.title}</h3>
                  <ul className="space-y-2">
                    {req.items.map((item, i) => <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        {item}
                      </li>)}
                  </ul>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-20 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {advantages.map((adv, index) => <Card key={index} className="p-8 text-center bg-white hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-500/10 flex items-center justify-center mx-auto mb-4">
                    <adv.icon className="w-8 h-8 text-sky-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{adv.title}</h3>
                  <p className="text-sm text-muted-foreground">{adv.description}</p>
                </Card>)}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-sky-500 to-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para ganar viajando?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Regístrate ahora y empieza a monetizar tus viajes hoy mismo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-sky-500 hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  <Plane className="w-5 h-5 mr-2" />
                  Registrarme Ahora
                </Button>
                
              </div>
            </div>
          </div>
        </section>
      </div>
    </>;
};
export default Viajero;