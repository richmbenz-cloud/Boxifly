import { Scale, FileText, Shield } from "lucide-react";
import { SEO } from '@/components/SEO';
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Link } from "react-router-dom";

const Legales = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      <SEO title="Información legal de Boxifly" description="Información legal, términos y políticas de Boxifly." path="/legales" />
      <MainNavigation />
      
      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <Scale className="w-16 h-16 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Información Legal
          </h1>
          <p className="text-xl text-muted-foreground">
            Documentos legales y políticas de Boxifly
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
        <div className="container mx-auto max-w-4xl">
          <div className="grid gap-6">
            {/* Términos y Condiciones */}
            <Link to="/terminos-y-condiciones">
              <div className="bg-card rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <FileText className="w-10 h-10 text-primary" />
                  <h2 className="text-2xl font-bold">Términos y Condiciones</h2>
                </div>
                <p className="text-muted-foreground">
                  Lee nuestros términos y condiciones de servicio que rigen el uso de la plataforma Boxifly y todos los servicios que ofrecemos.
                </p>
              </div>
            </Link>

            {/* Política de Privacidad */}
            <Link to="/politica-privacidad">
              <div className="bg-card rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="w-10 h-10 text-primary" />
                  <h2 className="text-2xl font-bold">Política de Privacidad</h2>
                </div>
                <p className="text-muted-foreground">
                  Conoce cómo recopilamos, usamos y protegemos tu información personal de acuerdo con la legislación peruana vigente.
                </p>
              </div>
            </Link>

            {/* Política de Cambios y Devoluciones */}
            <Link to="/politica-cambios-devoluciones">
              <div className="bg-card rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <FileText className="w-10 h-10 text-primary" />
                  <h2 className="text-2xl font-bold">Política de Cambios y Devoluciones</h2>
                </div>
                <p className="text-muted-foreground">
                  Información sobre nuestras políticas de cambio y devolución para productos adquiridos en nuestra tienda online.
                </p>
              </div>
            </Link>

            {/* Libro de Reclamaciones */}
            <Link to="/libro-de-reclamaciones">
              <div className="bg-card rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-4">
                  <FileText className="w-10 h-10 text-primary" />
                  <h2 className="text-2xl font-bold">Libro de Reclamaciones</h2>
                </div>
                <p className="text-muted-foreground">
                  Accede a nuestro Libro de Reclamaciones electrónico para presentar quejas o reclamos de acuerdo con la normativa peruana.
                </p>
              </div>
            </Link>
          </div>

          {/* Información Adicional */}
          <div className="mt-12 bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Información de la Empresa</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong>Razón Social:</strong> Boxifly S.A.C.</p>
              <p><strong>RUC:</strong> 20123456789</p>
              <p><strong>Dirección:</strong> Av. Principal 123, San Isidro, Lima, Perú</p>
              <p><strong>Email:</strong> legal@boxifly.com</p>
              <p><strong>Teléfono:</strong> +51 1 234 5678</p>
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default Legales;
