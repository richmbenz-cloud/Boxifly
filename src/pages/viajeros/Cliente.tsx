import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Package, CheckCircle, DollarSign, Shield, Clock, TrendingDown, 
  AlertTriangle, FileText, Users, Lock, Search, MapPin, Star,
  Truck, Phone, Mail, ChevronRight, Ban, Plane, Box
} from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const ViajeroCliente = () => {
  const navigate = useNavigate();
  const processAnim = useScrollAnimation({ threshold: 0.2 });
  const benefitsAnim = useScrollAnimation({ threshold: 0.2 });
  const tariffsAnim = useScrollAnimation({ threshold: 0.2 });
  const securityAnim = useScrollAnimation({ threshold: 0.2 });
  const faqAnim = useScrollAnimation({ threshold: 0.2 });

  const steps = [
    {
      icon: Search,
      title: 'Cotiza tu envío',
      description: 'Ingresa los detalles de tu producto: peso, dimensiones, valor y tienda donde lo compraste. Compara propuestas de hasta 7 viajeros verificados.'
    },
    {
      icon: Users,
      title: 'Elige tu viajero',
      description: 'Revisa perfiles, reputación, fechas de viaje y tarifas. Selecciona al viajero que mejor se adapte a tus necesidades y presupuesto.'
    },
    {
      icon: Package,
      title: 'Compra y envía',
      description: 'Realiza tu compra en la tienda USA que prefieras (Amazon, Best Buy, etc.). Envía el producto directamente a la dirección del viajero en Estados Unidos.'
    },
    {
      icon: Plane,
      title: 'Seguimiento en tiempo real',
      description: 'El viajero confirma la recepción del paquete. Sigue el estado de tu envío en cada etapa: recepción, viaje, llegada a Lima y preparación para entrega.'
    },
    {
      icon: Shield,
      title: 'Validación y seguro',
      description: 'Tu paquete queda asegurado desde que el viajero lo recibe. Boxifly verifica el estado y documenta todo el proceso con fotos y seguimiento.'
    },
    {
      icon: Box,
      title: 'Viaje seguro',
      description: 'El viajero transporta tu producto cumpliendo todas las normativas de seguridad y aduanas. Viaje documentado y rastreado 24/7.'
    },
    {
      icon: MapPin,
      title: 'Entrega en oficina Lima',
      description: 'El viajero entrega tu paquete en nuestra oficina de Miraflores, donde verificamos estado, peso y contenido antes de notificarte.'
    },
    {
      icon: Truck,
      title: 'Recibe tu producto',
      description: 'Elige retiro en oficina o delivery a domicilio en Lima. Confirma la recepción y califica al viajero para ayudar a futuros compradores.'
    }
  ];

  const benefits = [
    {
      icon: TrendingDown,
      title: 'Ahorra hasta 60%',
      description: 'Las tarifas de viajeros son significativamente más económicas que couriers tradicionales. Sin costos ocultos ni sorpresas.'
    },
    {
      icon: DollarSign,
      title: 'Tarifas negociables',
      description: 'Cotiza con múltiples viajeros y elige la mejor propuesta. Puedes negociar directamente según tu presupuesto.'
    },
    {
      icon: Clock,
      title: 'Entrega rápida',
      description: 'Tus productos llegan en el próximo vuelo disponible del viajero. Entregas entre 3-7 días típicamente.'
    },
    {
      icon: Shield,
      title: '100% protegido',
      description: 'Seguro incluido desde que el viajero recibe tu paquete hasta la entrega final. Cobertura ante daños o pérdida.'
    },
    {
      icon: Users,
      title: 'Viajeros verificados',
      description: 'Todos los viajeros pasan por verificación KYC completa: documentos, biometría facial y antecedentes.'
    },
    {
      icon: Lock,
      title: 'Pagos seguros',
      description: 'Pago protegido: el viajero recibe su comisión solo después de la entrega verificada en nuestra oficina.'
    }
  ];

  const tariffExamples = [
    {
      category: 'Electrónica pequeña',
      product: 'iPhone 15 Pro (0.5 kg)',
      productValue: '$999',
      travelerFee: '$100-$150',
      savings: '60% vs courier'
    },
    {
      category: 'Ropa y accesorios',
      product: 'Zapatillas Nike (1 kg)',
      productValue: '$150',
      travelerFee: '$15-$30',
      savings: '65% vs courier'
    },
    {
      category: 'Tecnología mediana',
      product: 'MacBook Pro (2 kg)',
      productValue: '$2,499',
      travelerFee: '$250-$350',
      savings: '55% vs courier'
    },
    {
      category: 'Múltiples productos',
      product: 'Paquete consolidado (5 kg)',
      productValue: '$800',
      travelerFee: '$80-$160',
      savings: '70% vs courier'
    }
  ];

  const allowedItems = [
    'Ropa, calzado y accesorios personales',
    'Electrónica: celulares, tablets, laptops, cámaras',
    'Artículos de cuidado personal y belleza',
    'Libros, revistas y material educativo',
    'Juguetes y artículos infantiles',
    'Artículos deportivos y fitness',
    'Accesorios para el hogar y decoración',
    'Productos tecnológicos (consolas, auriculares, etc.)'
  ];

  const prohibitedItems = [
    {
      category: 'Sustancias peligrosas',
      items: ['Productos inflamables o explosivos', 'Químicos tóxicos o corrosivos', 'Gases comprimidos', 'Material radiactivo']
    },
    {
      category: 'Alimentos y perecibles',
      items: ['Alimentos frescos o perecederos', 'Plantas o semillas', 'Productos orgánicos sin autorización', 'Bebidas alcohólicas sin documentación']
    },
    {
      category: 'Productos ilegales',
      items: ['Armas de fuego y municiones', 'Drogas y sustancias controladas', 'Productos falsificados o piratas', 'Material pornográfico o prohibido']
    },
    {
      category: 'Envíos no autorizados',
      items: ['Paquetes de familiares/amigos (solo compras directas de tiendas)', 'Productos sin factura o comprobante', 'Artículos de valor no declarado', 'Envíos comerciales sin autorización']
    }
  ];

  const securityFeatures = [
    {
      icon: Users,
      title: 'Verificación completa de viajeros',
      description: 'Proceso KYC riguroso: documentos oficiales, biometría facial, selfie en vivo, antecedentes verificados y declaración jurada firmada.'
    },
    {
      icon: Shield,
      title: 'Seguro integral incluido',
      description: 'Cobertura automática desde que el viajero recibe tu paquete hasta la entrega en Lima. Protección ante daños, pérdida o incidentes.'
    },
    {
      icon: FileText,
      title: 'Seguimiento 24/7',
      description: 'Rastrea tu envío en tiempo real: check-in en recepción, status de viaje, llegada a Lima y disponibilidad para retiro. Notificaciones automáticas.'
    },
    {
      icon: Lock,
      title: 'Documentación fotográfica',
      description: 'Fotos del paquete en cada etapa crítica: recepción por viajero, antes del viaje, al llegar a oficina y durante la entrega final.'
    }
  ];

  const responsibilities = [
    {
      title: 'Compra directa en tiendas',
      description: 'Solo se aceptan productos comprados directamente en tiendas oficiales (Amazon, Best Buy, etc.). No se permiten envíos de familiares o amigos.'
    },
    {
      title: 'Valor declarado correcto',
      description: 'Debes declarar el valor real del producto para cálculo de tarifas y seguro. Valores incorrectos pueden invalidar la cobertura.'
    },
    {
      title: 'Comunicación activa',
      description: 'Mantén comunicación con el viajero y Boxifly. Responde consultas sobre el producto y coordina detalles de entrega.'
    },
    {
      title: 'Empaque adecuado',
      description: 'Asegúrate que la tienda envíe el producto con empaque seguro. Productos frágiles deben indicarse claramente.'
    },
    {
      title: 'Respeto de plazos',
      description: 'Coordina fechas de entrega con el viajero. Entregas urgentes pueden tener tarifa premium.'
    },
    {
      title: 'Retiro oportuno',
      description: 'Una vez en Lima, retira tu paquete en oficina o solicita delivery dentro de los 15 días hábiles.'
    }
  ];

  const faqs = [
    {
      question: '¿Cómo funciona exactamente el servicio de Viajeros?',
      answer: 'Boxifly Viajeros conecta a compradores como tú con viajeros verificados que viajan frecuentemente entre USA y Perú. Tú compras el producto en la tienda que prefieras, lo envías a la dirección del viajero en Estados Unidos, y él lo transporta en su equipaje hasta nuestra oficina en Lima. Es completamente legal, seguro y más económico que couriers tradicionales.'
    },
    {
      question: '¿Es legal que un viajero traiga mis compras?',
      answer: 'Sí, es 100% legal. El viajero actúa como agente de transporte personal bajo un acuerdo documentado con declaración jurada. Todos los productos cumplen con normativas aduaneras y se transportan con documentación completa. Boxifly gestiona todos los aspectos legales del servicio.'
    },
    {
      question: '¿Cuánto puedo ahorrar usando Viajeros vs un courier tradicional?',
      answer: 'En promedio, ahorras entre 50% y 70% comparado con couriers como DHL o FedEx. Por ejemplo, enviar un iPhone que con DHL cuesta $250, con un viajero puede costar entre $100-$150. El ahorro exacto depende del peso, valor y disponibilidad de viajeros.'
    },
    {
      question: '¿Cómo sé que mi producto estará seguro?',
      answer: 'Tu producto está protegido en múltiples niveles: 1) Todos los viajeros están verificados con KYC completo, 2) Seguro automático incluido desde la recepción, 3) Seguimiento fotográfico en cada etapa, 4) Entrega verificada en oficina Boxifly antes del pago al viajero, 5) Sistema de calificaciones y reputación de viajeros.'
    },
    {
      question: '¿Puedo enviar productos muy frágiles o costosos?',
      answer: 'Sí, pero con precauciones especiales. Para productos frágiles: asegúrate que la tienda use empaque robusto, declara claramente que es frágil, y comunica al viajero las precauciones necesarias. Para productos de alto valor (>$2000): pueden requerir seguro adicional y aprobación especial. Contacta a soporte para estos casos.'
    },
    {
      question: '¿Qué pasa si mi producto llega dañado o no llega?',
      answer: 'Tu producto está asegurado desde que el viajero lo recibe. Si llega dañado: 1) El viajero debe reportarlo inmediatamente con fotos, 2) Boxifly investiga y gestiona compensación según la póliza, 3) Tú recibes reembolso o reposición. Si no llega: el seguro cubre el valor completo declarado del producto.'
    },
    {
      question: '¿Cuánto tiempo tarda en llegar mi paquete?',
      answer: 'Depende de la fecha de viaje del viajero seleccionado. Típicamente: 3-7 días desde que el viajero recibe el producto. Puedes ver la fecha exacta de viaje antes de seleccionar al viajero. Para urgencias, puedes filtrar viajeros con fechas inmediatas (puede tener tarifa premium).'
    },
    {
      question: '¿Puedo cotizar con varios viajeros antes de decidir?',
      answer: 'Sí, puedes enviar tu solicitud a hasta 7 viajeros simultáneamente. Cada uno te propondrá su tarifa según su disponibilidad, fecha de viaje y espacio en maleta. Revisa perfiles, reputación y propuestas antes de elegir. No tienes compromiso hasta que aceptes una propuesta específica.'
    },
    {
      question: '¿Cómo se calcula la tarifa del viajero?',
      answer: 'La tarifa se basa en: 1) Peso del producto (más peso = más tarifa), 2) Valor declarado (típicamente 10-20% del valor), 3) Urgencia (viajes inmediatos pueden costar más), 4) Complejidad (productos frágiles o voluminosos). Los viajeros proponen sus tarifas y tú eliges la mejor.'
    },
    {
      question: '¿Tengo que pagar algo antes de que llegue mi producto?',
      answer: 'Sí, pagas la tarifa del viajero + comisión de Boxifly al aceptar la propuesta. Este pago queda en garantía: el viajero lo recibe solo después de entregar tu producto verificado en nuestra oficina. Si algo sale mal, el pago se retiene hasta resolver.'
    },
    {
      question: '¿Puedo comprar en cualquier tienda de USA?',
      answer: 'Sí, puedes comprar en cualquier tienda online o física de Estados Unidos: Amazon, Best Buy, Walmart, Target, tiendas de marca, outlets, etc. El único requisito es que el producto se envíe directamente desde la tienda al viajero (no de personas particulares).'
    },
    {
      question: '¿Qué pasa si el viajero cancela o no puede viajar?',
      answer: 'Si el viajero cancela antes de recibir tu producto: te notificamos inmediatamente y puedes seleccionar otro viajero sin costo adicional. Si cancela después de recibir: Boxifly coordina con otro viajero disponible o gestiona envío alternativo. Tu pago queda protegido hasta la entrega confirmada.'
    },
    {
      question: '¿Puedo enviar varios productos con el mismo viajero?',
      answer: 'Sí, puedes consolidar múltiples productos con el mismo viajero si tiene capacidad suficiente. Esto puede generar descuentos por volumen. Coordina con el viajero el peso total disponible antes de realizar las compras.'
    },
    {
      question: '¿Cómo recibo mi producto en Lima?',
      answer: 'Tienes dos opciones: 1) Retiro en oficina (gratis): visita nuestra oficina en Av. Alfredo Benavides 501, Miraflores, 2) Delivery a domicilio: coordinamos envío seguro dentro de Lima (costo adicional según zona). Te notificamos cuando tu paquete esté listo.'
    },
    {
      question: '¿Puedo rastrear mi paquete en tiempo real?',
      answer: 'Sí, desde tu dashboard de Boxifly puedes ver: 1) Confirmación de recepción por viajero (con foto), 2) Status del viaje (fecha y hora de vuelo), 3) Llegada a oficina Lima, 4) Disponible para retiro/delivery. Recibes notificaciones automáticas en cada etapa.'
    },
    {
      question: '¿Qué documentos necesito para recibir mi paquete?',
      answer: 'Para retiro en oficina: DNI o documento de identidad válido y código de seguimiento de tu pedido. Para delivery: los mismos documentos más confirmación de dirección. Si otra persona retira por ti, necesita autorización escrita + copia de tu DNI.'
    },
    {
      question: '¿Hay límite de peso o tamaño para mis productos?',
      answer: 'Depende de la capacidad del viajero. La mayoría acepta hasta 20kg por viaje. Para productos muy grandes o pesados: consulta disponibilidad específica con viajeros. Típicamente, productos que caben en una maleta de bodega estándar son aceptables.'
    },
    {
      question: '¿Boxifly cobra alguna comisión adicional?',
      answer: 'Boxifly cobra una pequeña comisión de servicio (5-10% sobre la tarifa del viajero) que cubre: verificación de viajeros, seguro, seguimiento 24/7, soporte, gestión de entregas y plataforma tecnológica. El costo total (tarifa viajero + comisión) lo ves antes de confirmar.'
    },
    {
      question: '¿Puedo calificar al viajero después de recibir mi producto?',
      answer: 'Sí, y es muy importante. Después de recibir tu producto, puedes calificar al viajero con estrellas y comentarios. Esto ayuda a futuros compradores a tomar decisiones informadas y mantiene la calidad del servicio. Viajeros con buena reputación reciben más solicitudes.'
    },
    {
      question: '¿Qué hago si tengo un problema o duda durante el proceso?',
      answer: 'Contacta a soporte Boxifly inmediatamente: 1) WhatsApp: +51 951 314 150, 2) Email: hola@boxifly.com, 3) Chat en la plataforma. Soporte disponible 24/7 para resolver cualquier incidencia, duda o emergencia durante todo el proceso.'
    }
  ];

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Viajeros: trae tus compras de EE.UU. a Perú" description="Conecta con viajeros verificados para traer tus compras de Estados Unidos a Perú de forma rápida y segura." path="/viajeros/cliente" noindex />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Para Compradores</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Trae tus compras de USA a Perú
                <span className="block text-white/95 mt-2">Con Viajeros Verificados</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Ahorra hasta 60% en envíos aprovechando el espacio disponible en maletas de viajeros confiables. 
                Más rápido, más económico y 100% seguro.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="bg-white text-blue-500 hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  Solicitar un Viajero Ahora
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="ghost" className="border-2 border-white/50 text-white hover:bg-white/10 text-lg px-10 py-6 h-auto backdrop-blur-sm" onClick={() => navigate('/cotizador')}>
                  Cotizar mi Envío
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">50-70%</div>
                  <div className="text-sm text-white/70">ahorro vs courier</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl font-bold mb-1">3-7</div>
                  <div className="text-sm text-white/70">días entrega</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-white/70">verificado</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section ref={processAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${processAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider mb-3 block">Proceso Simple</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                8 pasos claros desde la cotización hasta recibir tu producto en Lima
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {steps.map((step, index) => (
                <Card key={index} className="p-6 bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-2 hover:border-blue-500/20 transition-all hover:shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-4xl font-bold text-blue-500/10 mb-2">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section ref={benefitsAnim.ref} className={`py-20 bg-muted/30 transition-all duration-1000 ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">¿Por qué usar Boxifly Viajeros?</h2>
              <p className="text-xl text-muted-foreground">Beneficios exclusivos que no encontrarás en couriers tradicionales</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-8 bg-white hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{benefit.title}</h3>
                  <p className="text-muted-foreground text-center leading-relaxed">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tariff Examples */}
        <section ref={tariffsAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${tariffsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Ejemplos de Tarifas y Ahorros</h2>
              <p className="text-xl text-muted-foreground">Comparación real con couriers tradicionales</p>
            </div>

            <div className="max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Categoría</th>
                    <th className="px-6 py-4 text-left font-semibold">Producto Ejemplo</th>
                    <th className="px-6 py-4 text-left font-semibold">Valor Producto</th>
                    <th className="px-6 py-4 text-left font-semibold">Tarifa Viajero</th>
                    <th className="px-6 py-4 text-left font-semibold">Ahorro</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {tariffExamples.map((example, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="px-6 py-4 font-semibold">{example.category}</td>
                      <td className="px-6 py-4">{example.product}</td>
                      <td className="px-6 py-4 text-muted-foreground">{example.productValue}</td>
                      <td className="px-6 py-4 text-blue-600 font-bold">{example.travelerFee}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">{example.savings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6 max-w-3xl mx-auto">
              * Tarifas referenciales. El costo final depende del viajero seleccionado, fecha de viaje, peso exacto y urgencia. 
              Los ahorros se calculan comparando con DHL/FedEx para envíos similares.
            </p>
          </div>
        </section>

        {/* Allowed and Prohibited Items */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Allowed */}
                <Card className="p-8 bg-gradient-to-br from-green-500/5 to-green-600/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold">Productos Permitidos</h3>
                  </div>
                  <ul className="space-y-3">
                    {allowedItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 text-sm text-muted-foreground italic">
                    Todos los productos deben ser comprados directamente en tiendas oficiales y enviados con factura válida.
                  </p>
                </Card>

                {/* Prohibited */}
                <Card className="p-8 bg-gradient-to-br from-red-500/5 to-red-600/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Ban className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold">Productos Prohibidos</h3>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {prohibitedItems.map((category, index) => (
                      <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left font-semibold hover:no-underline">
                          {category.category}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  <p className="mt-6 text-sm text-red-600 font-semibold">
                    ⚠️ Transportar productos prohibidos puede resultar en suspensión permanente y acciones legales.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section ref={securityAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${securityAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-wider mb-3 block">Seguridad Máxima</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Tu tranquilidad es nuestra prioridad</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Múltiples capas de protección en cada etapa del proceso
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="p-8 text-center bg-gradient-to-br from-blue-500/5 to-blue-600/5 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Responsibilities */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Responsabilidades del Cliente</h2>
              <p className="text-xl text-muted-foreground">Qué necesitas hacer para garantizar un envío exitoso</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {responsibilities.map((resp, index) => (
                <Card key={index} className="p-6 bg-white">
                  <h3 className="text-lg font-bold mb-2">{resp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{resp.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section ref={faqAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
              <p className="text-xl text-muted-foreground">Todo lo que necesitas saber sobre el servicio</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6 bg-muted/20">
                    <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">¿Tienes más preguntas?</h3>
              <p className="text-muted-foreground mb-8">
                Nuestro equipo está disponible 24/7 para ayudarte con cualquier duda
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="outline" asChild>
                  <a href="https://wa.me/51951314150" target="_blank" rel="noopener noreferrer">
                    <Phone className="mr-2 w-5 h-5" />
                    WhatsApp: +51 951 314 150
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:hola@boxifly.com">
                    <Mail className="mr-2 w-5 h-5" />
                    hola@boxifly.com
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para traer tus compras?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Solicita tu viajero ahora y ahorra hasta 60% en envíos internacionales
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-500 hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  <Package className="mr-2 w-5 h-5" />
                  Solicitar un Viajero Ahora
                </Button>
                <Button size="lg" variant="ghost" className="border-2 border-white/50 text-white hover:bg-white/10 text-lg px-10 py-6 h-auto backdrop-blur-sm" onClick={() => navigate('/viajeros/legales')}>
                  Ver Términos y Políticas
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ViajeroCliente;
