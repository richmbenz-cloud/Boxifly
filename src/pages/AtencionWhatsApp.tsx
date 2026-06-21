import { MessageCircle, Clock, CheckCircle, Smartphone } from "lucide-react";
import { SEO } from '@/components/SEO';
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Button } from "@/components/ui/button";

const AtencionWhatsApp = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/51951314150", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <SEO title="Atención al cliente por WhatsApp" description="Resuelve tus dudas y gestiona tus envíos por WhatsApp con el equipo de soporte de Boxifly." path="/atencion-por-whatsapp" />
      <MainNavigation />
      
      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6 text-[#25D366]" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Atención por WhatsApp
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comunicación directa, rápida y personalizada con nuestro equipo
          </p>
          <Button 
            size="lg" 
            onClick={handleWhatsAppClick}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chatea con Nosotros
          </Button>
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
          {/* Beneficios */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">¿Por qué usar WhatsApp?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <Smartphone className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Comunicación Instantánea</h3>
                  <p className="text-muted-foreground">
                    Respuestas rápidas a tus consultas en tiempo real desde tu celular
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Seguimiento Personalizado</h3>
                  <p className="text-muted-foreground">
                    Actualizaciones sobre el estado de tu paquete directamente en tu chat
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <MessageCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Atención Humana</h3>
                  <p className="text-muted-foreground">
                    Habla directamente con nuestros asesores especializados
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Clock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Horario Extendido</h3>
                  <p className="text-muted-foreground">
                    Disponible de Lunes a Sábado de 8:00 AM a 8:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios Disponibles */}
          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">Servicios Disponibles por WhatsApp</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">•</span>
                <span className="text-muted-foreground">Consultas sobre el estado de tus paquetes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">•</span>
                <span className="text-muted-foreground">Cotizaciones personalizadas de envío</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">•</span>
                <span className="text-muted-foreground">Asesoría en Personal Shopper</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">•</span>
                <span className="text-muted-foreground">Información sobre servicios B2B y Viajero</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">•</span>
                <span className="text-muted-foreground">Soporte técnico y resolución de problemas</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-xl">•</span>
                <span className="text-muted-foreground">Dudas sobre facturación y pagos</span>
              </li>
            </ul>
          </div>

          {/* Horarios de Atención */}
          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">Horarios de Atención</h2>
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Horario Regular</h3>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>Lunes a Viernes: 8:00 AM - 8:00 PM</li>
                <li>Sábados: 9:00 AM - 5:00 PM</li>
                <li>Domingos y Feriados: Cerrado</li>
              </ul>
            </div>

            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm">
                <strong>Nota:</strong> Fuera de horario, puedes dejarnos tu consulta y te responderemos en el siguiente horario de atención. También puedes usar nuestro Centro de Ayuda para respuestas inmediatas.
              </p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-12 text-center">
            <Button 
              size="lg" 
              onClick={handleWhatsAppClick}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Iniciar Chat en WhatsApp
            </Button>
            <p className="text-muted-foreground mt-4">
              Número: <a href="tel:+51987654321" className="text-primary hover:underline">+51 987 654 321</a>
            </p>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default AtencionWhatsApp;
