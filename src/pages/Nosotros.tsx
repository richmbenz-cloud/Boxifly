import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Target,
  Eye,
  Heart,
  Users,
  Award,
  TrendingUp,
  Globe,
  Shield
} from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const Nosotros = () => {
  const navigate = useNavigate();
  const missionAnim = useScrollAnimation({ threshold: 0.2 });
  const valuesAnim = useScrollAnimation({ threshold: 0.2 });
  const statsAnim = useScrollAnimation({ threshold: 0.2 });

  const values = [
    {
      icon: Heart,
      title: 'Pasión por el Servicio',
      description: 'Nos apasiona facilitar las compras internacionales y hacer felices a nuestros clientes.'
    },
    {
      icon: Shield,
      title: 'Confianza y Seguridad',
      description: 'Cada paquete es tratado como si fuera nuestro. Tu tranquilidad es nuestra prioridad.'
    },
    {
      icon: TrendingUp,
      title: 'Innovación Constante',
      description: 'Mejoramos continuamente nuestra tecnología y procesos para ofrecerte el mejor servicio.'
    },
    {
      icon: Users,
      title: 'Orientación al Cliente',
      description: 'Cada decisión la tomamos pensando en ti y en cómo mejorar tu experiencia.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Clientes Satisfechos', icon: Users },
    { value: '50,000+', label: 'Paquetes Entregados', icon: Globe },
    { value: '98%', label: 'Satisfacción', icon: Award },
    { value: '7-10', label: 'Días Promedio', icon: TrendingUp }
  ];

  const team = [
    { role: 'CEO & Fundador', name: 'Juan Pérez', emoji: '👨‍💼' },
    { role: 'COO', name: 'María García', emoji: '👩‍💼' },
    { role: 'Director de Logística', name: 'Carlos Rodríguez', emoji: '🚚' },
    { role: 'Customer Success', name: 'Ana Martínez', emoji: '🎯' }
  ];

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Nosotros: la historia de Boxifly" description="Conoce a Boxifly: misión, equipo y la red EE.UU.–Perú que hace simples tus envíos internacionales." path="/nosotros" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-navy py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Sobre Boxifly
                <span className="block text-secondary mt-2">Conectando USA con Perú</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
                Somos una empresa peruana-estadounidense dedicada a facilitar las compras internacionales 
                desde USA hacia Perú con transparencia, seguridad y eficiencia.
              </p>

              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                <Globe className="w-5 h-5" />
                <span className="font-medium">Fundada en 2020 • Lima, Perú & Miami, USA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-center">Nuestra Historia</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Boxifly nació de una necesidad personal. Nuestro fundador, Juan Pérez, vivía entre 
                  Miami y Lima y constantemente ayudaba a amigos y familiares a traer productos de USA. 
                  Se dio cuenta de que miles de peruanos querían acceder a los mejores productos y precios 
                  de Estados Unidos, pero enfrentaban barreras logísticas, costos elevados y falta de confianza.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  En 2020, en plena pandemia, decidió profesionalizar el servicio y crear Boxifly: 
                  una plataforma tecnológica que democratiza el acceso a compras internacionales con 
                  transparencia total, precios justos y un servicio excepcional.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hoy, con más de 10,000 clientes satisfechos y 50,000 paquetes entregados, Boxifly 
                  se ha convertido en el aliado de confianza para peruanos que quieren acceder al mundo 
                  sin límites. Y apenas estamos comenzando.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section ref={missionAnim.ref} className={`py-20 bg-gradient-to-br from-muted/50 to-muted/30 transition-all duration-1000 ${missionAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <Card className="p-10 bg-white hover:shadow-2xl transition-all">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Misión</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Facilitar y democratizar el acceso a compras internacionales desde USA hacia Perú, 
                  ofreciendo un servicio transparente, seguro y eficiente que ahorre tiempo y dinero 
                  a nuestros clientes.
                </p>
              </Card>

              <Card className="p-10 bg-white hover:shadow-2xl transition-all">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Visión</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Ser la plataforma líder de logística internacional en Latinoamérica, reconocida 
                  por nuestra tecnología, transparencia y servicio excepcional que conecta a millones 
                  de personas con el mundo.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section ref={valuesAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${valuesAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Nuestros Valores</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Los principios que guían cada decisión que tomamos
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {values.map((value, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-2 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section ref={statsAnim.ref} className={`py-20 bg-gradient-to-br from-primary to-navy transition-all duration-1000 ${statsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 text-white">
              <h2 className="text-4xl font-bold mb-4">Boxifly en Números</h2>
              <p className="text-xl text-white/90">Resultados que hablan por sí solos</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-lg text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Nuestro Equipo</h2>
              <p className="text-xl text-muted-foreground">Las personas detrás de Boxifly</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="p-8 text-center hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="text-6xl mb-4">{member.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para empezar?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Únete a miles de clientes que confían en Boxifly para sus compras USA
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-6 h-auto shadow-xl font-semibold"
                  onClick={() => navigate('/auth')}
                >
                  Crear Cuenta Gratis
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => navigate('/contacto')}
                >
                  Contáctanos
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Nosotros;
