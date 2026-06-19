import { useState } from 'react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { 
  Package, 
  ShoppingBag, 
  Plane, 
  Building2, 
  CreditCard, 
  Shield, 
  MapPin, 
  User,
  Search
} from 'lucide-react';

const PreguntasFrecuentes = () => {
  const heroAnimation = useScrollAnimation({ threshold: 0.1 });
  const contentAnimation = useScrollAnimation({ threshold: 0.2 });
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      title: 'Casillero',
      icon: Package,
      color: 'text-blue-600',
      questions: [
        {
          q: '¿Cómo obtengo mi casillero en Miami?',
          a: 'Al registrarte en Boxifly, automáticamente recibes una dirección exclusiva en Miami (tu casillero virtual). Usa esta dirección al hacer compras online en cualquier tienda de USA.'
        },
        {
          q: '¿Puedo consolidar varios paquetes?',
          a: 'Sí, la consolidación es gratuita. Recibimos todos tus paquetes en nuestro warehouse de Miami, los consolidamos en uno solo y te enviamos a Perú, ahorrándote en costos de envío.'
        },
        {
          q: '¿Cuánto tiempo demora el envío desde Miami?',
          a: 'El tiempo estimado de entrega es de 7 a 10 días hábiles desde que tu paquete llega a nuestro warehouse en Miami y es procesado para envío internacional.'
        },
        {
          q: '¿Cómo calculo el costo de envío?',
          a: 'Usa nuestro cotizador online ingresando el peso y valor declarado de tu paquete. El costo se basa en peso real o volumétrico (el mayor), más impuestos aduaneros si aplican.'
        }
      ]
    },
    {
      title: 'Personal Shopper',
      icon: ShoppingBag,
      color: 'text-purple-600',
      questions: [
        {
          q: '¿Qué es el servicio de Personal Shopper?',
          a: 'Nuestros Personal Shoppers compran por ti en tiendas de USA cuando no puedes hacerlo directamente (por tarjeta rechazada, dirección restringida, etc.). Tú indicas qué quieres, nosotros lo compramos y enviamos.'
        },
        {
          q: '¿Cuánto cobran por el servicio?',
          a: 'La comisión del Personal Shopper varía según el tipo de producto y complejidad. Te enviamos un presupuesto antes de confirmar la compra, sin sorpresas.'
        },
        {
          q: '¿Cómo solicito una compra?',
          a: 'Inicia sesión, ve a "Personal Shopper" en tu dashboard, crea una solicitud con detalles del producto (nombre, URL, cantidad, precio aproximado). Un shopper verificado te responderá pronto.'
        },
        {
          q: '¿Puedo comunicarme con mi shopper?',
          a: 'Sí, tenemos chat en tiempo real dentro de la plataforma para coordinar detalles, cambios o dudas sobre tu compra.'
        }
      ]
    },
    {
      title: 'Viajero',
      icon: Plane,
      color: 'text-sky-600',
      questions: [
        {
          q: '¿Cómo funciona el programa de Viajeros?',
          a: 'Si viajas a USA y tienes espacio en tu maleta, puedes traer paquetes de clientes Boxifly de forma segura y legal. Ganas una comisión por cada paquete entregado exitosamente.'
        },
        {
          q: '¿Necesito verificarme como viajero?',
          a: 'Sí, por seguridad y cumplimiento legal, debes completar un proceso de verificación KYC (documentos de identidad) y firmar una declaración jurada antes de recibir paquetes.'
        },
        {
          q: '¿Cuánto puedo ganar?',
          a: 'Las comisiones varían según peso del paquete y destino. La plataforma te muestra paquetes disponibles con su comisión estimada antes de aceptarlos.'
        },
        {
          q: '¿Qué pasa si hay problemas en aduana?',
          a: 'Todos los paquetes están declarados correctamente. Nuestra declaración jurada te protege legalmente. Además, brindamos soporte 24/7 ante cualquier consulta aduanal.'
        }
      ]
    },
    {
      title: 'B2B / Aliado Comercial',
      icon: Building2,
      color: 'text-orange-600',
      questions: [
        {
          q: '¿Qué ventajas tiene el programa B2B?',
          a: 'Tarifas preferenciales corporativas, dashboard exclusivo para gestión de múltiples envíos, reportes detallados, atención prioritaria y gestor de cuenta dedicado.'
        },
        {
          q: '¿Cómo me registro como aliado B2B?',
          a: 'Crea una cuenta seleccionando "Aliado Comercial B2B" como tipo de cuenta. Nuestro equipo revisará tu solicitud y te contactará para configurar tarifas personalizadas.'
        },
        {
          q: '¿Puedo tener múltiples usuarios en mi cuenta B2B?',
          a: 'Sí, puedes crear sub-usuarios con diferentes niveles de permisos para tu equipo, facilitando la gestión colaborativa de envíos corporativos.'
        },
        {
          q: '¿Ofrecen carga masiva de paquetes?',
          a: 'Sí, el panel B2B permite subir archivos CSV/Excel para registrar múltiples paquetes de forma rápida y eficiente.'
        }
      ]
    },
    {
      title: 'Pagos y Facturación',
      icon: CreditCard,
      color: 'text-green-600',
      questions: [
        {
          q: '¿Qué métodos de pago aceptan?',
          a: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express, Diners Club), Yape, Plin, transferencia bancaria y pagos en efectivo en puntos autorizados.'
        },
        {
          q: '¿Cuándo debo pagar?',
          a: 'Para el casillero, pagas cuando tu paquete llega a nuestro warehouse en Miami y te notificamos el costo final. Para Personal Shopper, pagas antes de que realicemos la compra.'
        },
        {
          q: '¿Emiten factura electrónica?',
          a: 'Sí, emitimos comprobantes electrónicos (boleta o factura) por todos los servicios. Los puedes descargar desde tu dashboard en "Mis Pedidos".'
        },
        {
          q: '¿Hay cargos ocultos?',
          a: 'No. Nuestra cotización incluye peso, impuestos aduaneros (si aplican), entrega y seguro básico. Todo transparente antes de confirmar.'
        }
      ]
    },
    {
      title: 'Aduanas e Impuestos',
      icon: Shield,
      color: 'text-red-600',
      questions: [
        {
          q: '¿Cuándo se cobran impuestos aduaneros?',
          a: 'Los impuestos se aplican si el valor CIF (producto + transporte + seguro) supera los $200 USD. En ese caso, se cobra 18% de IGV + arancel según tipo de producto.'
        },
        {
          q: '¿Ustedes gestionan la aduana por mí?',
          a: 'Sí, nosotros nos encargamos de toda la gestión aduanal. Tú solo pagas el costo que te indicamos y nosotros tramitamos todo ante SUNAT.'
        },
        {
          q: '¿Qué documentos necesito para la aduana?',
          a: 'Necesitamos la factura o recibo de compra del producto (con precio, descripción y tienda). Súbelo en tu dashboard cuando hagas la pre-alerta del paquete.'
        },
        {
          q: '¿Qué productos están prohibidos o restringidos?',
          a: 'No permitimos armas, sustancias ilegales, alimentos perecibles, medicamentos sin receta, productos falsificados ni artículos de valor superior a $2000 sin gestión especial.'
        }
      ]
    },
    {
      title: 'Seguimiento y Entrega',
      icon: MapPin,
      color: 'text-indigo-600',
      questions: [
        {
          q: '¿Cómo hago seguimiento de mi paquete?',
          a: 'Ingresa a tu dashboard, ve a "Mis Paquetes" y verás el tracking en tiempo real con cada estado (recibido en Miami, en tránsito, en Lima, en reparto, entregado).'
        },
        {
          q: '¿Puedo cambiar la dirección de entrega?',
          a: 'Sí, mientras el paquete aún esté en Miami o en tránsito internacional. Una vez en Perú y asignado a courier, el cambio tiene costo adicional.'
        },
        {
          q: '¿Qué pasa si no estoy en casa al momento de la entrega?',
          a: 'El courier intentará entrega hasta 3 veces. También puedes coordinar recojo en oficina o cambiar horario de entrega desde tu dashboard o por WhatsApp.'
        },
        {
          q: '¿Ofrecen seguro para los paquetes?',
          a: 'El seguro básico está incluido (cubre pérdida o daño por manejo). Puedes contratar seguro extendido al 3% del valor declarado para cobertura total.'
        }
      ]
    },
    {
      title: 'Cuenta y Perfil',
      icon: User,
      color: 'text-pink-600',
      questions: [
        {
          q: '¿Cómo actualizo mi información personal?',
          a: 'Ve a "Mi Perfil" en tu dashboard. Ahí puedes actualizar nombre, dirección de entrega, teléfono, email y subir foto de perfil.'
        },
        {
          q: '¿Qué es el programa de puntos VIP?',
          a: 'Por cada S/ 33 gastados en la tienda online, ganas 1 punto (equivalente a S/ 1). Acumula puntos para descuentos futuros y accede a niveles VIP (Bronce, Plata, Oro, Platino) con beneficios exclusivos.'
        },
        {
          q: '¿Puedo referir amigos y ganar recompensas?',
          a: 'Sí, tenemos un programa de referidos. Comparte tu código único, y cuando tus referidos hagan su primer envío, ambos reciben beneficios (descuentos o puntos).'
        },
        {
          q: '¿Cómo contacto con soporte si tengo problemas?',
          a: 'Puedes contactarnos por WhatsApp (+51 951 314 150), email (soporte@boxifly.com), chat en vivo en la web, o abriendo un ticket desde tu dashboard.'
        }
      ]
    }
  ];

  const filteredCategories = categories
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q => 
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.questions.length > 0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap(c =>
      c.questions.map((q: { q: string; a: string }) => ({
        "@type": "Question",
        name: q.q,
        acceptedAnswer: { "@type": "Answer", text: q.a }
      }))
    )
  };

  return (
    <>
      <SEO
        title="Preguntas frecuentes | Boxifly"
        description="Resolvemos tus dudas sobre casillero, personal shopper, viajeros, envíos, pagos y aduanas. Respuestas claras del equipo Boxifly."
        path="/preguntas-frecuentes"
        jsonLd={faqJsonLd}
      />
      <ChatWidget />
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
        <MainNavigation />

        {/* Hero Section */}
        <section 
          ref={heroAnimation.ref}
          className={`bg-gradient-to-br from-primary via-secondary to-primary py-20 transition-all duration-700 ${
            heroAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Preguntas Frecuentes
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Encuentra respuestas rápidas a todas tus dudas sobre nuestros servicios
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar pregunta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white text-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section 
          ref={contentAnimation.ref}
          className={`py-16 transition-all duration-700 delay-100 ${
            contentAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="container mx-auto px-4 max-w-5xl">
            {filteredCategories.length > 0 ? (
              <div className="space-y-8">
                {filteredCategories.map((category, index) => (
                  <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className={`p-3 rounded-xl bg-${category.color}/10`}>
                          <category.icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, qIndex) => (
                          <AccordionItem key={qIndex} value={`item-${index}-${qIndex}`}>
                            <AccordionTrigger className="text-left text-base font-medium hover:text-primary">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <p className="text-xl text-muted-foreground mb-4">
                    No se encontraron resultados para "{searchTerm}"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ¿No encuentras lo que buscas?{' '}
                    <a href="/contacto" className="text-primary hover:underline font-medium">
                      Contacta con soporte
                    </a>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Contact Support Section */}
            <Card className="mt-12 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-center text-2xl">¿Aún tienes dudas?</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Nuestro equipo de soporte está listo para ayudarte
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/51951314150"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    WhatsApp: +51 951 314 150
                  </a>
                  <a
                    href="/contacto"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
                  >
                    Formulario de Contacto
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
};

export default PreguntasFrecuentes;
