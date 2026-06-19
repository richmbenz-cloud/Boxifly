import { Trophy, Calendar, Gift, Users } from "lucide-react";
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const GanadoresConcursos = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  const winners = [
    {
      date: "Diciembre 2024",
      title: "Sorteo Navideño - iPhone 15 Pro",
      winner: "María G. - Lima",
      prize: "iPhone 15 Pro Max 256GB"
    },
    {
      date: "Noviembre 2024",
      title: "Black Friday Mega Sorteo",
      winner: "Carlos R. - Arequipa",
      prize: "Vale de Compra $500 USD"
    },
    {
      date: "Octubre 2024",
      title: "Concurso Halloween",
      winner: "Ana M. - Cusco",
      prize: "AirPods Pro 2da Gen"
    },
    {
      date: "Septiembre 2024",
      title: "Sorteo Mensual",
      winner: "Luis P. - Trujillo",
      prize: "6 meses de envíos gratis"
    },
  ];

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
          <Trophy className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Ganadores de Concursos
          </h1>
          <p className="text-xl text-muted-foreground">
            Conoce a los afortunados ganadores de nuestros sorteos y promociones
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section
        ref={contentRef}
        className={`py-16 px-4 sm:px-6 lg:px-8 transition-all duration-1000 delay-200 ${
          contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto max-w-5xl">
          {/* Ganadores Recientes */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <Users className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Últimos Ganadores</h2>
            </div>
            
            <div className="space-y-6">
              {winners.map((item, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/20 p-3 rounded-full">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-2">
                        <strong>Ganador:</strong> {item.winner}
                      </p>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        <span className="text-primary font-semibold">{item.prize}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos Concursos */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Gift className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Próximos Concursos</h2>
            </div>
            
            <div className="bg-gradient-to-r from-primary to-primary/60 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">🎉 Gran Sorteo Año Nuevo 2025</h3>
              <p className="mb-4 text-white/90">
                Participa automáticamente con cada envío que realices durante Enero 2025
              </p>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <h4 className="font-semibold mb-2">Premios:</h4>
                <ul className="space-y-2 text-white/90">
                  <li>🥇 1er Premio: MacBook Air M3</li>
                  <li>🥈 2do Premio: iPad Pro 11"</li>
                  <li>🥉 3er Premio: Apple Watch Series 9</li>
                  <li>🎁 10 Premios Adicionales: $100 USD en créditos</li>
                </ul>
              </div>
              <p className="text-sm text-white/80">
                Sorteo: 31 de Enero 2025 | Anuncio de ganadores: 5 de Febrero 2025
              </p>
            </div>
          </div>

          {/* Cómo Participar */}
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">¿Cómo Participar?</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Realiza Envíos</h3>
                  <p className="text-muted-foreground">
                    Cada envío que hagas te da una participación automática en nuestros sorteos mensuales
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sigue Nuestras Redes</h3>
                  <p className="text-muted-foreground">
                    Mantente al tanto de concursos especiales en Instagram, Facebook y TikTok
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Refiere Amigos</h3>
                  <p className="text-muted-foreground">
                    Gana participaciones extra por cada amigo que se registre con tu código de referido
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Suscríbete al Newsletter</h3>
                  <p className="text-muted-foreground">
                    Recibe notificaciones de nuevos concursos y promociones exclusivas por email
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-accent/10 rounded-lg p-6">
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Los sorteos se realizan de manera transparente con la participación de un notario público. Los ganadores son contactados por email y teléfono. Todos los premios están sujetos a términos y condiciones disponibles en nuestra página legal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default GanadoresConcursos;
