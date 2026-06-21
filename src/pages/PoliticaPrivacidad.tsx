import { MainNavigation } from "@/components/MainNavigation";
import { SEO } from '@/components/SEO';
import { ChatWidget } from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Shield, Lock, Eye, UserCheck, Database, FileText } from "lucide-react";

const PoliticaPrivacidad = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <SEO title="Política de privacidad" description="Conoce cómo Boxifly protege, usa y trata tus datos personales." path="/politica-privacidad" />
      <MainNavigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div
            ref={heroRef}
            className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Política de Privacidad
            </h1>
            <p className="text-xl text-muted-foreground">
              En Boxifly valoramos y protegemos tu privacidad. Conoce cómo recopilamos, usamos y protegemos tu información personal.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div
            ref={contentRef}
            className={`max-w-4xl mx-auto space-y-8 transition-all duration-1000 delay-200 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introducción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Boxifly (en adelante, "nosotros", "nuestro" o "la empresa") se compromete a proteger 
                  la privacidad de sus usuarios. Esta Política de Privacidad describe cómo recopilamos, 
                  usamos, compartimos y protegemos la información personal que nos proporcionas al utilizar 
                  nuestros servicios de logística internacional.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Última actualización: {new Date().toLocaleDateString('es-PE')}
                </p>
              </CardContent>
            </Card>

            {/* Información Recopilada */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-primary" />
                  <CardTitle>Información que Recopilamos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Información Personal Directa</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Nombre completo y apellidos</li>
                    <li>Documento de identidad (DNI, pasaporte)</li>
                    <li>Correo electrónico y número de teléfono</li>
                    <li>Dirección de entrega en Perú</li>
                    <li>Dirección de casillero asignado en Estados Unidos</li>
                    <li>Información de pago (procesada de forma segura por proveedores certificados)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Información de Envíos</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Detalles de los paquetes (descripción, valor declarado, peso, dimensiones)</li>
                    <li>Números de tracking de transportistas</li>
                    <li>Documentos aduaneros y facturas comerciales</li>
                    <li>Fotografías de paquetes y evidencias de entrega</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Información Técnica</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Dirección IP y ubicación geográfica</li>
                    <li>Tipo de navegador y dispositivo</li>
                    <li>Páginas visitadas y tiempo de navegación</li>
                    <li>Cookies y tecnologías similares</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Uso de la Información */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  <CardTitle>Cómo Usamos tu Información</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos la información recopilada para los siguientes propósitos:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Procesar y gestionar tus envíos internacionales</li>
                  <li>Verificar tu identidad y prevenir fraudes</li>
                  <li>Realizar trámites aduaneros y de importación</li>
                  <li>Enviarte notificaciones sobre el estado de tus paquetes</li>
                  <li>Procesar pagos y emitir comprobantes</li>
                  <li>Proporcionar soporte y atención al cliente</li>
                  <li>Mejorar nuestros servicios y experiencia de usuario</li>
                  <li>Cumplir con obligaciones legales y regulatorias</li>
                  <li>Enviar comunicaciones de marketing (con tu consentimiento previo)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Compartir Información */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <CardTitle>Compartir tu Información</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Podemos compartir tu información personal con terceros en las siguientes circunstancias:
                </p>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Proveedores de Servicios</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Empresas de transporte y logística (DHL, FedEx, USPS, etc.)</li>
                    <li>Procesadores de pagos (Izipay, PayPal, etc.)</li>
                    <li>Servicios de almacenamiento en la nube</li>
                    <li>Proveedores de servicios de tecnología y soporte</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Autoridades y Cumplimiento Legal</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Aduanas de Perú y Estados Unidos</li>
                    <li>Autoridades gubernamentales cuando lo requiera la ley</li>
                    <li>Tribunales y organismos reguladores</li>
                  </ul>
                </div>

                <p className="text-sm text-muted-foreground italic">
                  Nota: Nunca vendemos ni alquilamos tu información personal a terceros con fines comerciales.
                </p>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  <CardTitle>Seguridad de la Información</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger 
                  tu información personal contra acceso no autorizado, pérdida, alteración o divulgación:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Cifrado SSL/TLS para todas las transmisiones de datos</li>
                  <li>Almacenamiento seguro de información con acceso restringido</li>
                  <li>Autenticación de dos factores para cuentas de usuario</li>
                  <li>Monitoreo continuo de seguridad y auditorías regulares</li>
                  <li>Capacitación del personal en prácticas de privacidad y seguridad</li>
                </ul>
              </CardContent>
            </Card>

            {/* Derechos del Usuario */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle>Tus Derechos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Como usuario, tienes los siguientes derechos sobre tu información personal:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Acceso:</strong> Solicitar una copia de la información que tenemos sobre ti</li>
                  <li><strong>Rectificación:</strong> Corregir información inexacta o incompleta</li>
                  <li><strong>Eliminación:</strong> Solicitar la eliminación de tu información personal</li>
                  <li><strong>Portabilidad:</strong> Recibir tu información en formato estructurado y transferible</li>
                  <li><strong>Oposición:</strong> Oponerte al procesamiento de tu información para ciertos fines</li>
                  <li><strong>Limitación:</strong> Solicitar la limitación del procesamiento de tu información</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Para ejercer estos derechos, contáctanos a través de nuestros canales de soporte.
                </p>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Uso de Cookies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                  <li><strong>Cookies de rendimiento:</strong> Nos ayudan a mejorar el sitio web</li>
                  <li><strong>Cookies de funcionalidad:</strong> Recuerdan tus preferencias</li>
                  <li><strong>Cookies de marketing:</strong> Personalizan anuncios y ofertas (con tu consentimiento)</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed">
                  Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar 
                  la funcionalidad del sitio.
                </p>
              </CardContent>
            </Card>

            {/* Retención de Datos */}
            <Card>
              <CardHeader>
                <CardTitle>Retención de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Retenemos tu información personal durante el tiempo necesario para cumplir con los 
                  propósitos descritos en esta política, a menos que la ley requiera un período de 
                  retención más largo.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Los datos de envíos y transacciones se mantienen durante al menos 5 años para 
                  cumplir con requisitos legales y contables.
                </p>
              </CardContent>
            </Card>

            {/* Cambios a la Política */}
            <Card>
              <CardHeader>
                <CardTitle>Cambios a esta Política</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos de 
                  cambios significativos por correo electrónico o mediante un aviso destacado en nuestro sitio web. 
                  Te recomendamos revisar esta política regularmente.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardContent className="py-8 text-center">
                <h3 className="text-xl font-semibold mb-3">¿Tienes preguntas sobre tu privacidad?</h3>
                <p className="text-muted-foreground mb-6">
                  Si tienes dudas o consultas sobre nuestra política de privacidad, no dudes en contactarnos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contacto" className="btn-primary">
                    Contactar
                  </a>
                  <a href="mailto:privacidad@boxifly.com.pe" className="btn-secondary">
                    privacidad@boxifly.com.pe
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default PoliticaPrivacidad;
