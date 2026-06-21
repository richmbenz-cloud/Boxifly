import { Card } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { FileText, Shield, AlertCircle } from 'lucide-react';

const TerminosCondiciones = () => {
  const sections = [
    {
      title: '1. Aceptación de Términos',
      content: `Al acceder y utilizar los servicios de Boxifly, usted acepta estar legalmente obligado por estos Términos y Condiciones. 
      Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
      
      Estos términos se aplican a todos los usuarios de la plataforma, incluyendo clientes B2C, clientes B2B, viajeros, 
      personal shoppers y visitantes del sitio web.`
    },
    {
      title: '2. Servicios Ofrecidos',
      content: `Boxifly ofrece los siguientes servicios:
      
      • Casillero Virtual en Miami: Dirección exclusiva en USA para recibir compras online
      • Consolidación de Paquetes: Agrupación de múltiples paquetes en un solo envío
      • Envío Internacional: Transporte aéreo de paquetes desde USA a Perú
      • Personal Shopper: Servicio de compras asistidas en tiendas USA
      • Viajero: Plataforma para que viajeros transporten paquetes
      • Soluciones B2B: Tarifas corporativas y gestión empresarial
      • Tienda Online: Venta directa de productos seleccionados
      
      Nos reservamos el derecho de modificar, suspender o discontinuar cualquier servicio en cualquier momento.`
    },
    {
      title: '3. Registro y Cuenta de Usuario',
      content: `Para utilizar nuestros servicios, debe:
      
      • Crear una cuenta proporcionando información veraz y actualizada
      • Ser mayor de 18 años o contar con autorización de un tutor legal
      • Mantener la confidencialidad de sus credenciales de acceso
      • Notificar inmediatamente cualquier uso no autorizado de su cuenta
      • Aceptar responsabilidad por todas las actividades bajo su cuenta
      
      Boxifly se reserva el derecho de suspender o cancelar cuentas que violen estos términos.`
    },
    {
      title: '4. Tarifas y Pagos',
      content: `Las tarifas incluyen:
      
      • Transporte Internacional: Basado en peso volumétrico o real (el mayor)
      • Manejo Aduanal: Gestión de trámites aduaneros
      • Impuestos: IGV (18%) y ad valorem según valor CIF (si aplica)
      • Entrega Domiciliaria: Según zona de destino (opcional)
      • Servicios Adicionales: Personal Shopper, consolidación premium, etc.
      
      Los pagos se realizan mediante tarjetas de crédito/débito, transferencias bancarias o métodos digitales aprobados.
      Las tarifas están sujetas a cambios con notificación previa de 15 días.`
    },
    {
      title: '5. Productos Prohibidos y Restringidos',
      content: `No aceptamos:
      
      • Productos Prohibidos: Armas, explosivos, drogas, dinero en efectivo, productos perecederos, animales vivos
      • Productos Restringidos: Medicamentos, alimentos, cosméticos (requieren permisos DIGEMID/DIGESA)
      • Productos Peligrosos: Baterías de litio sueltas, aerosoles, líquidos inflamables
      • Productos Ilegales: Falsificaciones, productos pirateados, contenido ilegal
      
      Consulte la página de Productos Restringidos para la lista completa. El incumplimiento puede resultar en 
      confiscación del paquete, multas aduaneras y suspensión de cuenta sin reembolso.`
    },
    {
      title: '6. Responsabilidad y Seguro',
      content: `Boxifly es responsable por:
      
      • Manejo adecuado de paquetes en nuestro warehouse
      • Gestión de trámites aduaneros según normativa vigente
      • Entrega a transportistas certificados
      
      No somos responsables por:
      
      • Daños causados por embalaje inadecuado del vendedor original
      • Demoras por inspecciones aduaneras extensas
      • Productos declarados incorrectamente por el cliente
      • Pérdida o daño de productos no asegurados
      
      Ofrecemos seguro opcional que cubre pérdida total o daño durante transporte internacional. 
      El seguro no cubre demoras, confiscación aduanera o productos prohibidos.`
    },
    {
      title: '7. Proceso de Aduanas',
      content: `El cliente es responsable de:
      
      • Declarar correctamente el valor de sus productos
      • Proporcionar información veraz sobre el contenido
      • Pagar impuestos y aranceles aplicables
      • Cumplir con regulaciones de importación peruanas
      
      Boxifly gestiona el proceso aduanero, pero no puede garantizar:
      
      • Tiempo exacto de liberación aduanera
      • Aprobación de productos restringidos
      • Exoneración de impuestos (solo aplica si CIF ≤ $200 USD)
      
      Las multas o confiscaciones por declaración incorrecta son responsabilidad del cliente.`
    },
    {
      title: '8. Tiempos de Entrega',
      content: `Estimados de entrega:
      
      • Miami → Lima: 7-10 días hábiles (desde liberación aduanera)
      • Lima → Provincias: +2-5 días hábiles adicionales
      
      Factores que pueden afectar tiempos:
      
      • Inspecciones aduaneras extensas
      • Documentación faltante
      • Días festivos y feriados
      • Fuerza mayor (huelgas, clima, pandemias)
      
      No garantizamos fechas de entrega específicas. Las demoras no califican para reembolsos a menos que 
      sean causadas directamente por negligencia comprobada de Boxifly.`
    },
    {
      title: '9. Política de Devoluciones y Reembolsos',
      content: `Devoluciones:
      
      • Productos de Tienda Online: 30 días desde recepción (producto sin usar, empaque original)
      • Servicios de Envío: No reembolsables una vez iniciado el proceso
      • Personal Shopper: Cancelación sin cargo hasta 24h antes de compra
      
      Reembolsos procesados en 7-14 días hábiles al método de pago original.
      
      No aplican devoluciones/reembolsos por:
      
      • Productos prohibidos confiscados
      • Declaración incorrecta del cliente
      • Cambio de opinión después de envío internacional
      • Daños por embalaje inadecuado del vendedor original`
    },
    {
      title: '10. Privacidad y Protección de Datos',
      content: `Boxifly se compromete a proteger su información personal según la Ley N° 29733 de Protección de Datos Personales del Perú.
      
      Recopilamos:
      
      • Datos de contacto (nombre, email, teléfono, dirección)
      • Información de pago (encriptada y procesada por pasarelas certificadas)
      • Historial de compras y preferencias
      • Datos de navegación (cookies, IP, dispositivo)
      
      Usamos su información para:
      
      • Procesar envíos y pagos
      • Mejorar nuestros servicios
      • Comunicaciones de marketing (opcional, puede cancelar en cualquier momento)
      • Cumplimiento legal y prevención de fraude
      
      No vendemos ni compartimos sus datos con terceros no autorizados. 
      Ver nuestra Política de Privacidad completa para más detalles.`
    },
    {
      title: '11. Modificación de Términos',
      content: `Boxifly se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. 
      Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
      
      Notificaremos cambios importantes por email o mediante avisos en la plataforma. 
      El uso continuado de nuestros servicios después de cambios constituye aceptación de los nuevos términos.`
    },
    {
      title: '12. Jurisdicción y Ley Aplicable',
      content: `Estos términos se rigen por las leyes de la República del Perú.
      
      Cualquier disputa será resuelta mediante:
      
      1. Negociación directa entre las partes
      2. Mediación voluntaria
      3. Arbitraje obligatorio según las reglas del Centro de Arbitraje de la Cámara de Comercio de Lima
      
      La jurisdicción exclusiva corresponde a los tribunales de Lima, Perú.`
    }
  ];

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Términos y condiciones de servicio" description="Lee los términos y condiciones de uso de los servicios de Boxifly." path="/terminos-y-condiciones" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-navy py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Términos y Condiciones
              </h1>
              <p className="text-lg text-white/90 mb-6">
                Última actualización: 15 de marzo de 2024
              </p>
              <p className="text-white/80">
                Por favor, lea estos términos cuidadosamente antes de utilizar nuestros servicios
              </p>
            </div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-8 bg-secondary/10 border-y border-secondary/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Aviso Importante</h3>
                <p className="text-muted-foreground">
                  Al utilizar los servicios de Boxifly, usted acepta estar legalmente obligado por estos 
                  Términos y Condiciones. Si no está de acuerdo con alguna parte, por favor no utilice nuestros servicios.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {sections.map((section, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <Card className="overflow-hidden">
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-colors">
                        <span className="text-left font-semibold text-lg">{section.title}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-4 bg-muted/20">
                        <div className="prose prose-sm max-w-none">
                          <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      </AccordionContent>
                    </Card>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">¿Tienes preguntas sobre estos términos?</h3>
                    <p className="text-muted-foreground mb-4">
                      Estamos aquí para ayudarte a entender nuestras políticas y resolver cualquier duda.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Email:</strong> legal@boxifly.com</p>
                  <p><strong>WhatsApp:</strong> +51 951 314 150</p>
                  <p><strong>Dirección:</strong> Av. Alfredo Benavides 501. Miraflores, Lima 15047, Perú</p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TerminosCondiciones;
