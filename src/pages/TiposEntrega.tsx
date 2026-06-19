import { Package, Home, MapPin, Clock } from "lucide-react";
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const TiposEntrega = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

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
          <Package className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Tipos de Entrega
          </h1>
          <p className="text-xl text-muted-foreground">
            Elige la opción de entrega que mejor se adapte a tus necesidades
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
        <div className="container mx-auto max-w-6xl">
          {/* Entrega a Domicilio */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Home className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Entrega a Domicilio</h2>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Recibe tu paquete directamente en la puerta de tu casa u oficina. Nuestro equipo de delivery se encarga de llevar tu pedido de forma segura y rápida.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">Cobertura:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span><strong>Ruta 30 - Lima Metropolitana:</strong> Todos los distritos de Lima y Callao</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span><strong>Ruta 40 - Capitales Regionales:</strong> Arequipa, Trujillo, Chiclayo, Piura, Cusco, Ica, Tacna, y más</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold mb-4">Tiempos de Entrega:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span><strong>Lima Metropolitana:</strong> 2-3 días hábiles después de la llegada al país</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span><strong>Provincias:</strong> 3-5 días hábiles después de la llegada al país</span>
              </li>
            </ul>

            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm">
                <strong>Nota:</strong> Los tiempos de entrega pueden variar según disponibilidad de courier y condiciones climáticas.
              </p>
            </div>
          </div>

          {/* Retiro en Oficina */}
          <div className="bg-card rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-4 mb-6">
              <Package className="w-10 h-10 text-primary" />
              <h2 className="text-3xl font-bold">Retiro en Oficina</h2>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Recoge tu paquete directamente en nuestra oficina principal cuando te resulte más conveniente. Sin costos adicionales de delivery.
            </p>
            
            <h3 className="text-xl font-semibold mb-4">Ubicación:</h3>
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <p className="font-semibold mb-2">Oficina Principal Boxifly</p>
              <p className="text-muted-foreground mb-1">Av. Principal 123, San Isidro</p>
              <p className="text-muted-foreground mb-1">Lima, Perú</p>
              <p className="text-muted-foreground">Lunes a Viernes: 9:00 AM - 6:00 PM</p>
              <p className="text-muted-foreground">Sábados: 9:00 AM - 1:00 PM</p>
            </div>

            <h3 className="text-xl font-semibold mb-4">Requisitos para el Retiro:</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>DNI o documento de identidad válido</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Número de tracking de tu paquete</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span>Confirmación de llegada (enviada por email o WhatsApp)</span>
              </li>
            </ul>

            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-sm">
                <strong>Ventaja:</strong> Sin costo de delivery. Recoge tu paquete cuando más te convenga dentro del horario de atención.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default TiposEntrega;
