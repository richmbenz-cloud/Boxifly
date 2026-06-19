import { useState } from "react";
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { 
  Search, HelpCircle, ShoppingBag, Plane, Package, 
  Building2, CreditCard, Shield, FileText, MapPin 
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Ayuda = () => {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    {
      title: "Personal Shopper",
      icon: ShoppingBag,
      color: "text-purple-600",
      questions: [
        {
          q: "¿Cómo funciona el servicio de Personal Shopper?",
          a: "El Personal Shopper es un servicio donde un comprador verificado adquiere productos en tu nombre en Estados Unidos. Tú envías la solicitud con el enlace del producto, el shopper lo compra, verifica la calidad y lo envía a nuestro almacén para ser consolidado con tus otros paquetes."
        },
        {
          q: "¿Cuánto cobra el Personal Shopper?",
          a: "El Personal Shopper cobra una comisión del 10% sobre el valor del producto, más los costos de envío desde la tienda hasta nuestro almacén. El precio final lo verás en la cotización antes de aceptar."
        },
        {
          q: "¿Qué pasa si el producto llega dañado?",
          a: "Si el producto llega dañado a la dirección del shopper, él lo reportará inmediatamente. Dependiendo del caso, se puede solicitar un cambio a la tienda o se procederá con el reembolso. Nuestros shoppers verifican la calidad antes de enviarlo al almacén."
        },
        {
          q: "¿Puedo rastrear mi compra del Personal Shopper?",
          a: "Sí, una vez que el shopper realiza la compra, te proporcionará el número de tracking. Puedes seguir el estado de tu pedido desde tu dashboard de cliente."
        }
      ]
    },
    {
      title: "Servicio de Viajero",
      icon: Plane,
      color: "text-sky-600",
      questions: [
        {
          q: "¿Cómo funciona el servicio de Viajero?",
          a: "Conectamos a clientes con viajeros verificados que viajan de Estados Unidos a Perú. Los viajeros transportan paquetes pequeños en su equipaje, ofreciendo una alternativa más económica y rápida para ciertos productos."
        },
        {
          q: "¿Qué garantías tengo con el servicio de Viajero?",
          a: "Todos nuestros viajeros están verificados con KYC (verificación de identidad) y firma de declaración jurada. Además, ofrecemos un programa de protección que cubre pérdida o daño del paquete durante el viaje."
        },
        {
          q: "¿Qué productos puedo enviar con un Viajero?",
          a: "Productos pequeños y ligeros como ropa, accesorios, electrónicos pequeños, suplementos, cosméticos. No se permiten líquidos en gran cantidad, productos perecederos, ni artículos prohibidos por las aerolíneas."
        },
        {
          q: "¿Cuánto tiempo demora la entrega con Viajero?",
          a: "Depende de la fecha de viaje del viajero. Generalmente, entre 3-7 días desde que el viajero recibe el paquete hasta la entrega en Perú, mucho más rápido que el courier tradicional."
        }
      ]
    },
    {
      title: "Casillero y Courier",
      icon: Package,
      color: "text-orange-600",
      questions: [
        {
          q: "¿Cómo obtengo mi casillero en Miami?",
          a: "Al registrarte en Boxifly, automáticamente se te asigna un casillero único en Miami con tu código personalizado. Usa esta dirección para tus compras online en tiendas de Estados Unidos."
        },
        {
          q: "¿Cómo funciona la consolidación de paquetes?",
          a: "Cuando múltiples paquetes tuyos llegan a nuestro almacén, podemos consolidarlos en un solo envío. Esto reduce significativamente los costos de envío internacional y aduanas."
        },
        {
          q: "¿Cuánto tiempo tardan en llegar mis paquetes?",
          a: "Una vez que tus paquetes llegan a nuestro almacén en Miami, el envío a Perú tarda aproximadamente 7-15 días hábiles dependiendo del tipo de envío (aéreo estándar o express)."
        },
        {
          q: "¿Cómo se calculan los costos de envío?",
          a: "Los costos se calculan según el peso volumétrico del paquete (el mayor entre peso real y peso volumétrico), más gastos de aduana, impuestos si aplican, y costo de entrega en Perú. Usa nuestra calculadora de tarifas para estimar costos."
        },
        {
          q: "¿Qué pasa si no pre-alerto mi paquete?",
          a: "La pre-alerta es muy importante. Si no alertas tu paquete, puede tomar más tiempo procesarlo en el almacén. Siempre pre-alerta tus envíos con el tracking number para agilizar el proceso."
        }
      ]
    },
    {
      title: "Aliado Comercial B2B",
      icon: Building2,
      color: "text-blue-600",
      questions: [
        {
          q: "¿Qué beneficios tiene ser Aliado Comercial?",
          a: "Como Aliado Comercial B2B obtienes tarifas preferenciales por volumen, dashboard exclusivo para gestionar múltiples envíos, reporte de métricas y ahorros, soporte prioritario, y la posibilidad de agregar sub-usuarios para tu equipo."
        },
        {
          q: "¿Cuál es el volumen mínimo para ser B2B?",
          a: "No hay un volumen mínimo estricto, pero el programa está diseñado para empresas que realizan al menos 10 envíos mensuales o tienen un gasto mensual mínimo de $500 USD en servicios de courier."
        },
        {
          q: "¿Puedo subir múltiples paquetes de una vez?",
          a: "Sí, el dashboard B2B incluye funcionalidad de carga masiva mediante archivos CSV o Excel, permitiéndote registrar decenas de paquetes en segundos."
        },
        {
          q: "¿Cómo funcionan las tarifas preferenciales?",
          a: "Las tarifas B2B se aplican por rangos de peso y pueden ser hasta un 30% menores que las tarifas retail. Contacta a nuestro equipo comercial para una cotización personalizada según tu volumen."
        }
      ]
    },
    {
      title: "Pagos y Facturación",
      icon: CreditCard,
      color: "text-green-600",
      questions: [
        {
          q: "¿Qué métodos de pago aceptan?",
          a: "Aceptamos tarjetas de crédito/débito (Visa, Mastercard, Amex), Yape, Plin, transferencias bancarias, y PayPal. Todos los pagos se procesan de forma segura a través de nuestro proveedor certificado PCI-DSS."
        },
        {
          q: "¿Cuándo debo pagar mi envío?",
          a: "El pago se realiza una vez que tu paquete llega a nuestro almacén en Miami y se calcula el costo final (peso real, aduana, impuestos). Recibirás una notificación con el monto a pagar antes de que enviemos tu paquete a Perú."
        },
        {
          q: "¿Emiten factura electrónica?",
          a: "Sí, emitimos comprobantes de pago electrónicos (boletas o facturas) para todos los servicios. Puedes descargarlos desde tu dashboard de cliente o te los enviamos por email."
        },
        {
          q: "¿Puedo usar cupones de descuento?",
          a: "Sí, aceptamos cupones promocionales y códigos de descuento. Ingrésalos en el campo de cupón durante el proceso de pago antes de finalizar la transacción."
        }
      ]
    },
    {
      title: "Aduanas e Impuestos",
      icon: Shield,
      color: "text-red-600",
      questions: [
        {
          q: "¿Cuándo debo pagar impuestos?",
          a: "Según la ley peruana, los paquetes con valor CIF (producto + flete + seguro) mayor a $200 USD están sujetos al pago de impuestos de importación (IGV 18% + Ad Valorem si aplica). Por debajo de $200 están exentos."
        },
        {
          q: "¿Qué documentos necesito para aduanas?",
          a: "Necesitas la factura comercial o comprobante de compra del producto, que debe incluir descripción, cantidad, valor unitario y total. Nosotros gestionamos todos los trámites aduaneros por ti."
        },
        {
          q: "¿Qué productos están prohibidos?",
          a: "Están prohibidos: armas, explosivos, drogas, dinero en efectivo, productos falsificados, animales vivos, y ciertos alimentos perecederos. Revisa nuestra página de productos restringidos para la lista completa."
        },
        {
          q: "¿Qué pasa si mi paquete es retenido en aduanas?",
          a: "Si aduanas requiere documentación adicional o inspección, te notificaremos inmediatamente. Nuestro equipo te guiará en el proceso de liberación. En casos normales, la liberación toma 1-3 días adicionales."
        }
      ]
    },
    {
      title: "Seguimiento y Entregas",
      icon: MapPin,
      color: "text-indigo-600",
      questions: [
        {
          q: "¿Cómo rastrea mi paquete?",
          a: "Puedes rastrear tu paquete en tiempo real desde tu dashboard de cliente usando el número de tracking. También recibirás notificaciones automáticas por email y WhatsApp en cada cambio de estado."
        },
        {
          q: "¿Qué zonas cubren para entrega en Perú?",
          a: "Entregamos en todo Lima Metropolitana (Ruta 30) y principales ciudades de provincias (Ruta 40: Arequipa, Cusco, Trujillo, Chiclayo, Piura, etc.). Consulta nuestra cobertura completa en la página de tarifas."
        },
        {
          q: "¿Puedo recoger mi paquete en oficina?",
          a: "Sí, ofrecemos la opción de retiro en nuestra oficina en Lima sin costo adicional. También puedes optar por entrega a domicilio con tarifas según tu zona."
        },
        {
          q: "¿Qué hago si mi paquete llega dañado?",
          a: "Si tu paquete llega dañado, repórtalo inmediatamente (dentro de 24 horas) con fotos del daño. Iniciaremos un proceso de investigación y, si aplica, activaremos el seguro de cobertura del paquete."
        }
      ]
    },
    {
      title: "Cuenta y Seguridad",
      icon: FileText,
      color: "text-gray-600",
      questions: [
        {
          q: "¿Cómo creo una cuenta en Boxifly?",
          a: "Haz clic en 'Iniciar Sesión' y luego en 'Crear cuenta'. Completa el formulario con tus datos personales, selecciona tu tipo de cuenta (Cliente, B2B, Shopper, Viajero), verifica tu email, y listo."
        },
        {
          q: "¿Mis datos están seguros?",
          a: "Sí, implementamos los más altos estándares de seguridad: cifrado SSL, autenticación de dos factores, almacenamiento seguro de datos, y cumplimiento con normativas de protección de datos. Lee nuestra política de privacidad para más detalles."
        },
        {
          q: "¿Puedo actualizar mi dirección de entrega?",
          a: "Sí, puedes actualizar tu dirección de entrega desde tu perfil de usuario en cualquier momento. Asegúrate de mantenerla actualizada antes de solicitar el envío de tus paquetes."
        },
        {
          q: "¿Cómo funciona el programa de puntos VIP?",
          a: "Por cada compra en nuestra tienda online, ganas puntos (1 punto por cada S/33 gastados). Acumula puntos para subir de nivel VIP (Bronce, Plata, Oro, Platino) y recibe cupones de regalo al alcanzar cada nivel."
        }
      ]
    }
  ];

  const filteredCategories = searchTerm
    ? categories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          q =>
            q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.a.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter(cat => cat.questions.length > 0)
    : categories;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
                <HelpCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Centro de Ayuda
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              ¿Cómo podemos ayudarte hoy? Encuentra respuestas rápidas a tus preguntas frecuentes.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Busca tu pregunta aquí..."
                className="pl-12 h-14 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div
            ref={contentRef}
            className={`max-w-5xl mx-auto space-y-12 transition-all duration-1000 delay-200 ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            {filteredCategories.map((category, idx) => (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <div className="flex items-center gap-3">
                    <category.icon className={`h-8 w-8 ${category.color}`} />
                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, qIdx) => (
                      <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                        <AccordionTrigger className="text-left hover:text-primary">
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

            {filteredCategories.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
                  <p className="text-muted-foreground mb-6">
                    No pudimos encontrar respuestas que coincidan con tu búsqueda.
                  </p>
                  <a href="/contacto" className="btn-primary">
                    Contactar Soporte
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Contact Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-8 text-center">
                <h3 className="text-2xl font-semibold mb-3">¿No encontraste lo que buscabas?</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  Nuestro equipo de soporte está listo para ayudarte con cualquier consulta adicional.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="/contacto" className="btn-primary">
                    Contactar Soporte
                  </a>
                  <a href="mailto:soporte@boxifly.com.pe" className="btn-secondary">
                    soporte@boxifly.com.pe
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

export default Ayuda;
