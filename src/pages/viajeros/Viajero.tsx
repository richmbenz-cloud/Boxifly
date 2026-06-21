import { useNavigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plane, DollarSign, Shield, Clock, FileText, Camera, CheckCircle, 
  TrendingUp, Star, AlertTriangle, Package, Ban, Users, Lock,
  Phone, Mail, ChevronRight, Award, Briefcase, MapPin
} from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const Viajero = () => {
  const navigate = useNavigate();
  const processAnim = useScrollAnimation({ threshold: 0.2 });
  const benefitsAnim = useScrollAnimation({ threshold: 0.2 });
  const earningsAnim = useScrollAnimation({ threshold: 0.2 });
  const requirementsAnim = useScrollAnimation({ threshold: 0.2 });
  const faqAnim = useScrollAnimation({ threshold: 0.2 });

  const steps = [
    {
      icon: FileText,
      title: 'Regístrate y Verifica',
      description: 'Completa tu registro con datos personales, documentos oficiales (DNI/pasaporte), comprobante de domicilio y foto de perfil. Proceso KYC completo con verificación de identidad.'
    },
    {
      icon: Camera,
      title: 'Verificación Biométrica',
      description: 'Valida tu identidad con biometría facial y selfie en vivo. Firma la declaración jurada digital. Todo el proceso es 100% online y toma menos de 10 minutos.'
    },
    {
      icon: Plane,
      title: 'Publica tu Viaje',
      description: 'Ingresa los detalles de tu próximo viaje: origen (ciudad USA), destino (Lima), fecha de viaje, peso disponible en maleta y tarifa por kg que deseas cobrar.'
    },
    {
      icon: Package,
      title: 'Revisa Solicitudes',
      description: 'Recibe notificaciones de clientes interesados. Revisa: producto, peso, valor, fecha límite. Puedes aceptar, rechazar o negociar la tarifa según tu disponibilidad.'
    },
    {
      icon: Users,
      title: 'Acepta Paquetes',
      description: 'Selecciona qué productos transportar según tu capacidad. El cliente envía el producto directamente a tu alojamiento en USA. Confirma recepción con fotos.'
    },
    {
      icon: Shield,
      title: 'Transporte Seguro',
      description: 'Transporta los paquetes en tu equipaje cumpliendo normativas aeroportuarias y aduaneras. Mantén productos protegidos durante el viaje. Registro y seguimiento 24/7.'
    },
    {
      icon: MapPin,
      title: 'Entrega en Oficina',
      description: 'Al llegar a Lima, entrega todos los paquetes en nuestra oficina de Miraflores. Verificamos estado, peso y contenido. Todo queda documentado con fotos y códigos.'
    },
    {
      icon: DollarSign,
      title: 'Recibe tu Pago',
      description: 'Una vez verificada la entrega, liberamos tu pago inmediato por transferencia bancaria. Transparencia total y comprobantes digitales de cada transacción realizada.'
    }
  ];

  const requirements = [
    {
      icon: FileText,
      title: 'Documentación Obligatoria',
      items: [
        'DNI peruano vigente (o pasaporte)',
        'Comprobante de domicilio en Lima (recibo de luz, agua o teléfono)',
        'Pasaporte vigente con visa USA (o ESTA)',
        'Foto reciente para perfil',
        'Cuenta bancaria activa para recibir pagos'
      ]
    },
    {
      icon: Camera,
      title: 'Verificación Biométrica',
      items: [
        'Biometría facial (reconocimiento automático)',
        'Foto con DNI en mano (selfie verificación)',
        'Selfie en vivo durante registro',
        'Validación de documentos escaneados',
        'Firma digital de declaración jurada'
      ]
    },
    {
      icon: Plane,
      title: 'Requisitos de Viaje',
      items: [
        'Viajes frecuentes USA-Perú (mínimo 1 al mes recomendado)',
        'Itinerario confirmado con fechas específicas',
        'Capacidad mínima de 3kg disponible por viaje',
        'Cumplimiento de normativas aeroportuarias',
        'Mayor de edad (18+ años)'
      ]
    },
    {
      icon: Shield,
      title: 'Compromiso y Ética',
      items: [
        'Aceptación de términos y condiciones',
        'Firma de código de conducta del viajero',
        'Compromiso de entrega puntual',
        'Mantener comunicación activa con clientes',
        'Respeto absoluto a políticas de seguridad'
      ]
    }
  ];

  const earnings = [
    {
      weight: '3-5 kg',
      commission: '$50 - $100',
      trips: '2 viajes/mes',
      monthly: '$100 - $200',
      description: 'Ideal para viajeros ocasionales con poco espacio disponible'
    },
    {
      weight: '6-10 kg',
      commission: '$100 - $180',
      trips: '2 viajes/mes',
      monthly: '$200 - $360',
      description: 'Viajeros regulares con capacidad moderada en maleta'
    },
    {
      weight: '11-15 kg',
      commission: '$180 - $270',
      trips: '2 viajes/mes',
      monthly: '$360 - $540',
      description: 'Viajeros frecuentes con buena capacidad de carga'
    },
    {
      weight: '16-20 kg',
      commission: '$270 - $350',
      trips: '2 viajes/mes',
      monthly: '$540 - $700',
      description: 'Viajeros profesionales que maximizan su espacio disponible'
    },
    {
      weight: '20+ kg',
      commission: '$350+',
      trips: '3+ viajes/mes',
      monthly: '$1,000+',
      description: 'Top earners: viajeros de negocios con alta frecuencia'
    }
  ];

  const advantages = [
    {
      icon: DollarSign,
      title: 'Ingresos Extra Garantizados',
      description: 'Monetiza el espacio vacío en tu maleta. Gana entre $50 y $350 por viaje según capacidad. Pagos inmediatos tras entrega verificada.',
      stats: 'Hasta $1,000/mes para viajeros frecuentes'
    },
    {
      icon: Clock,
      title: 'Flexibilidad Total',
      description: 'Tú decides qué paquetes aceptar, cuándo viajar y qué tarifa cobrar. Sin compromisos fijos ni horarios obligatorios. 100% a tu ritmo.',
      stats: 'Acepta o rechaza solicitudes libremente'
    },
    {
      icon: Shield,
      title: 'Seguridad Máxima',
      description: 'Todos los paquetes son verificados, asegurados y rastreados. Productos solo de tiendas oficiales. Cobertura legal y soporte 24/7 incluido.',
      stats: 'Seguro incluido en cada envío'
    },
    {
      icon: Users,
      title: 'Clientes Pre-Verificados',
      description: 'Solo trabajas con compradores registrados y verificados. Sistema de calificaciones mutuas. Transparencia total en cada transacción.',
      stats: 'Plataforma segura y confiable'
    },
    {
      icon: TrendingUp,
      title: 'Ingresos Recurrentes',
      description: 'Viajeros activos con buena reputación reciben solicitudes constantes. Construye tu historial y accede a mejores tarifas premium.',
      stats: 'Promedio $600/mes viajeros regulares'
    },
    {
      icon: Award,
      title: 'Sin Inversión Inicial',
      description: 'Cero costos de inicio. No necesitas comprar nada. Solo aprovecha tus viajes habituales y gana dinero extra sin esfuerzo adicional.',
      stats: 'Registro 100% gratuito'
    }
  ];

  const allowedItems = [
    {
      category: 'Electrónica y tecnología',
      items: ['Smartphones, tablets, laptops', 'Cámaras fotográficas y accesorios', 'Consolas de videojuegos', 'Auriculares, smartwatches, gadgets', 'Drones pequeños (con autorización)']
    },
    {
      category: 'Ropa y accesorios',
      items: ['Ropa de marca (nueva)', 'Zapatillas deportivas', 'Carteras, bolsos, mochilas', 'Gafas de sol y accesorios', 'Joyería y relojes (declarados)']
    },
    {
      category: 'Cuidado personal y belleza',
      items: ['Cosméticos y maquillaje (empacado)', 'Productos para el cabello', 'Perfumes (en envase original sellado)', 'Suplementos deportivos', 'Artículos de higiene personal']
    },
    {
      category: 'Hogar y otros',
      items: ['Libros y material educativo', 'Juguetes infantiles', 'Artículos deportivos pequeños', 'Decoración del hogar', 'Herramientas pequeñas (no eléctricas pesadas)']
    }
  ];

  const prohibitedItems = [
    {
      category: '🚫 Sustancias Peligrosas',
      items: ['Inflamables, explosivos o corrosivos', 'Gases comprimidos o aerosoles', 'Baterías de litio sueltas (>100Wh)', 'Químicos tóxicos o venenos', 'Material radiactivo']
    },
    {
      category: '🚫 Alimentos y Perecibles',
      items: ['Alimentos frescos o perecederos', 'Carnes, lácteos sin pasteurizar', 'Plantas, semillas o tierra', 'Frutas y vegetales frescos', 'Productos orgánicos sin certificación']
    },
    {
      category: '🚫 Productos Ilegales',
      items: ['Armas de fuego y municiones', 'Drogas y sustancias controladas', 'Medicamentos sin receta válida', 'Productos falsificados o piratas', 'Material pornográfico o prohibido']
    },
    {
      category: '🚫 Envíos No Autorizados',
      items: ['Paquetes de familiares/amigos del cliente', 'Productos sin factura o comprobante', 'Artículos de valor no declarado correctamente', 'Envíos comerciales sin autorización', 'Documentos legales o dinero en efectivo']
    },
    {
      category: '🚫 Restricciones Especiales',
      items: ['Productos muy frágiles sin empaque adecuado', 'Líquidos >100ml sin documentar', 'Artículos que excedan límites de peso permitido', 'Productos que violen normativas aduaneras', 'Cualquier artículo prohibido por TSA o aduanas']
    }
  ];

  const securityFeatures = [
    {
      icon: Users,
      title: 'Compradores Verificados',
      description: 'Solo recibes paquetes de clientes registrados y verificados en Boxifly. Cada comprador tiene perfil, historial y calificaciones visibles.'
    },
    {
      icon: Package,
      title: 'Productos Solo de Tiendas',
      description: 'Todos los productos son enviados directamente desde tiendas oficiales (Amazon, Best Buy, etc.). Nunca de particulares desconocidos.'
    },
    {
      icon: Shield,
      title: 'Seguro Integral Incluido',
      description: 'Cobertura automática para ti y los productos desde la recepción hasta la entrega. Protección legal y asistencia jurídica preventiva.'
    },
    {
      icon: FileText,
      title: 'Declaración Jurada Digital',
      description: 'Documento legal que respalda tu actividad como viajero transportista. Firmado digitalmente y válido ante autoridades.'
    },
    {
      icon: Lock,
      title: 'Apertura y Verificación',
      description: 'Derecho a abrir y verificar cualquier paquete antes de aceptarlo. Si algo no coincide, puedes rechazarlo sin penalización.'
    },
    {
      icon: Camera,
      title: 'Documentación Fotográfica',
      description: 'Toma fotos del paquete en cada etapa: recepción, antes del viaje, al entregar. Evidencia completa que te protege ante cualquier reclamo.'
    }
  ];

  const ethicsCode = [
    {
      title: 'Transparencia absoluta',
      description: 'Proporciona información real sobre tu disponibilidad, fechas de viaje y capacidad de carga. No aceptes más paquetes de los que puedas transportar seguramente.'
    },
    {
      title: 'Comunicación activa',
      description: 'Mantén al cliente informado en cada etapa. Responde mensajes en máximo 24 horas. Notifica inmediatamente cualquier cambio o retraso en tu viaje.'
    },
    {
      title: 'Cuidado de productos',
      description: 'Transporta los paquetes como si fueran tuyos. Protégelos de golpes, humedad y temperatura extrema. Nunca abras ni manipules el contenido sin autorización.'
    },
    {
      title: 'Puntualidad',
      description: 'Cumple las fechas de entrega acordadas. Si hay cambios en tu itinerario, avisa con mínimo 48 horas de anticipación. La puntualidad construye tu reputación.'
    },
    {
      title: 'Honestidad',
      description: 'Reporta inmediatamente cualquier daño, pérdida o incidente. No ocultes información. La honestidad es la base de la confianza en la plataforma.'
    },
    {
      title: 'Respeto de políticas',
      description: 'No transportes productos prohibidos bajo ninguna circunstancia. Cumple todas las normativas aduaneras y aeroportuarias. Tu seguridad y la nuestra dependen de ello.'
    },
    {
      title: 'Confidencialidad',
      description: 'No divulgues información personal de clientes ni detalles de los productos transportados. Toda la información es confidencial y protegida.'
    },
    {
      title: 'Profesionalismo',
      description: 'Mantén actitud cortés y profesional con clientes y personal de Boxifly. Evita conflictos. Tu comportamiento afecta tu reputación y futuras oportunidades.'
    }
  ];

  const faqs = [
    {
      question: '¿Cuánto puedo ganar realmente como viajero Boxifly?',
      answer: 'Tus ganancias dependen de tres factores: 1) Peso transportado (cada kg vale $10-$20 típicamente), 2) Frecuencia de viajes (2-3 viajes mensuales son ideales), 3) Tu reputación (buenos ratings = más solicitudes). Ejemplos reales: viajeros ocasionales (1-2 viajes/mes, 5-10kg) ganan $100-$200/mes. Viajeros regulares (2-3 viajes/mes, 10-15kg) ganan $400-$600/mes. Top earners (3+ viajes/mes, 15-20kg) superan $1,000/mes. Sin inversión inicial y aprovechando tus viajes habituales.'
    },
    {
      question: '¿Es legal que yo transporte productos de terceros?',
      answer: 'Sí, es 100% legal. Actúas como agente de transporte personal bajo un contrato documentado. Firmas una declaración jurada digital que respalda tu actividad legalmente. Todos los productos son comprados por clientes verificados en tiendas oficiales con facturas válidas. Cumples las mismas normativas que cualquier viajero con equipaje personal. Boxifly proporciona asesoría legal preventiva y soporte jurídico si lo necesitas. Miles de viajeros operan sin problemas legales.'
    },
    {
      question: '¿Qué pasa si mi vuelo se cancela o se retrasa?',
      answer: 'Tienes que notificar inmediatamente a Boxifly y al cliente vía plataforma. Tres escenarios: 1) Cancelación antes de recibir paquetes: sin penalización, puedes declinar solicitudes, 2) Retraso menor (<24h): generalmente no hay problema, solo informa al cliente, 3) Retraso mayor o cancelación después de recibir: Boxifly coordina con otro viajero disponible o ajusta fechas. Tu pago se mantiene protegido. Lo importante es comunicación temprana y honesta.'
    },
    {
      question: '¿Tengo que comprar algo o invertir dinero para empezar?',
      answer: 'No, absolutamente nada. Registro gratuito, sin costos de membresía ni cuotas mensuales. No necesitas comprar productos, pagar adelantos ni invertir en nada. Solo necesitas tus viajes habituales USA-Perú y espacio disponible en tu maleta. Ganas desde el primer paquete que transportes. Cero riesgo financiero.'
    },
    {
      question: '¿Cómo funciona la verificación KYC? ¿Es segura mi información?',
      answer: 'El proceso KYC (Know Your Customer) es estándar bancario para seguridad. Pasos: 1) Subes foto de DNI/pasaporte, 2) Selfie con documento en mano, 3) Biometría facial automática, 4) Validación de domicilio, 5) Firma digital de declaración jurada. Todo 100% online en 10 minutos. Tu información está encriptada y protegida según GDPR. Solo personal autorizado de Boxifly accede a datos. Jamás compartimos información con terceros. La verificación nos permite garantizar seguridad para clientes y viajeros.'
    },
    {
      question: '¿Puedo rechazar paquetes que no me den confianza?',
      answer: 'Sí, tienes control total. Puedes: 1) Rechazar cualquier solicitud antes de aceptarla, 2) Verificar contenido del paquete al recibirlo (derecho de apertura), 3) Declinar si algo no coincide con lo declarado, 4) Negarte a transportar sin penalización si hay dudas razonables. Tu seguridad es primero. Nunca estás obligado a aceptar algo que te genere desconfianza. Boxifly respalda tus decisiones de seguridad.'
    },
    {
      question: '¿Qué sucede si un paquete se daña durante el viaje?',
      answer: 'Protocolo claro: 1) Reporta el daño inmediatamente con fotos, 2) Documenta cómo/cuándo ocurrió el daño, 3) Boxifly investiga el incidente, 4) El seguro cubre daños que no sean por negligencia tuya. Si seguiste las normas de transporte (empaque adecuado, cuidado razonable), el seguro cubre. Si hubo negligencia grave de tu parte, podrías tener retención parcial de pago. Casos de daño accidental sin culpa: sin penalización para ti. Honestidad y reporte temprano son clave.'
    },
    {
      question: '¿Cuándo recibo mi pago exactamente?',
      answer: 'Proceso de pago: 1) Entregas paquetes en oficina Boxifly Lima, 2) Personal verifica estado y coincidencia con registro, 3) Una vez aprobado (mismo día típicamente), se libera tu pago, 4) Transferencia bancaria procesa en 24-48 horas hábiles. Recibes comprobante digital de cada transacción. El pago está garantizado si la entrega es correcta. Clientes pagan a Boxifly antes de que tú recibas los paquetes, por lo que tu pago está asegurado desde el inicio.'
    },
    {
      question: '¿Puedo transportar paquetes en vuelos internos dentro de USA?',
      answer: 'No, el servicio es exclusivo para vuelos USA → Perú (Lima). No cubrimos: vuelos domésticos USA, vuelos USA → otros países, ni vuelos Perú → USA. Tu itinerario debe terminar en Lima obligatoriamente. Paquetes deben recogerse en nuestras oficinas de Miraflores.'
    },
    {
      question: '¿Qué pasa si Aduanas detiene un paquete que transporto?',
      answer: 'Primero: todos los productos vienen de tiendas con factura válida, por lo que problemas aduaneros son raros. Si ocurre: 1) Mantén calma y coopera con autoridades, 2) Contacta inmediatamente a Boxifly (soporte 24/7), 3) Proporcionamos asesoría legal y documentación de respaldo, 4) Si el paquete cumplía normativas pero fue detenido: no hay penalización para ti, el seguro aplica. Si transportaste algo prohibido: suspensión permanente. Por eso, verifica siempre el contenido antes de aceptar.'
    },
    {
      question: '¿Puedo cambiar las fechas de mi viaje después de aceptar paquetes?',
      answer: 'Sí, pero con reglas: 1) Cambios >48 horas antes del vuelo: notifica inmediatamente, generalmente sin problema, 2) Cambios <48 horas: puede haber penalización o necesitar reasignar a otro viajero, 3) Cancelaciones de último minuto: posible retención de comisión según caso. Lo importante: comunicación temprana con cliente y Boxifly. Cambios justificados (emergencias, problemas de salud) son comprensibles. Cambios frecuentes sin razón afectan tu reputación y ratings.'
    },
    {
      question: '¿Necesito declarar estos ingresos ante SUNAT?',
      answer: 'Consulta con un contador, pero en general: si tus ingresos anuales superan ciertos umbrales establecidos por SUNAT, probablemente debas declararlos como servicios de transporte o ingresos independientes. Boxifly proporciona comprobantes de pago digitales que puedes usar para tu declaración. No somos asesores tributarios, pero te sugerimos mantener registros de tus ganancias. Para ingresos ocasionales menores puede no ser necesario, pero es mejor estar informado.'
    },
    {
      question: '¿Puedo trabajar con otros servicios de viajeros además de Boxifly?',
      answer: 'Sí, no hay exclusividad. Eres libre de trabajar con otras plataformas o transportar productos por tu cuenta. Solo te pedimos: 1) Cumple tus compromisos con Boxifly primero, 2) No uses nuestra plataforma para contactar clientes y luego operar fuera (violación de términos), 3) Mantén profesionalismo en todos tus servicios. Tu reputación en Boxifly es individual.'
    },
    {
      question: '¿Cómo mejoro mi reputación para recibir más solicitudes?',
      answer: 'Estrategias probadas: 1) Entregas puntuales siempre (factor #1), 2) Comunicación rápida (responde mensajes en <24h), 3) Cuidado excelente de paquetes (ratings altos), 4) Fotos claras de cada etapa (transparencia), 5) Sé proactivo notificando cambios, 6) Ofrece tarifas competitivas al inicio para construir historial, 7) Viaja frecuentemente y mantén perfil actualizado. Viajeros con 5 estrellas y +10 entregas exitosas reciben 3x más solicitudes.'
    },
    {
      question: '¿Qué hago si un cliente me pide transportar algo que no está permitido?',
      answer: 'Rechaza inmediatamente y reporta a Boxifly. No negocies ni aceptes "por esta vez". Clientes que piden transportar prohibidos pueden ser suspendidos. Tu seguridad legal está en juego. Si ya recibiste algo sospechoso: no lo transportes, contacta a Boxifly urgente, documenta con fotos. Tendrás soporte completo. Rechazar productos prohibidos nunca afecta tu reputación negativamente, todo lo contrario.'
    },
    {
      question: '¿Hay algún límite de peso total que puedo transportar por viaje?',
      answer: 'Límites: 1) Aerolínea: según tu boleto (equipaje de mano + bodega), 2) Boxifly: máximo 25kg recomendado de paquetes de clientes para mantener espacio para tus cosas personales, 3) Aduanas: sin límite específico si son productos legales con factura. Recomendación: deja siempre espacio para tu equipaje personal. No te sobrecargues. Mejor hacer varios viajes pequeños que uno muy pesado que genere sospecha o problemas.'
    },
    {
      question: '¿Puedo transportar medicamentos para clientes?',
      answer: 'Medicamentos de venta libre (over-the-counter) en empaque original sellado: generalmente sí. Medicamentos con receta: requieren receta médica válida y documentación especial, consulta caso por caso. Medicamentos controlados (opioides, etc.): absolutamente prohibidos sin autorización especial. Suplementos deportivos/vitaminas: permitidos en empaque original. Ante duda: pregunta a Boxifly ANTES de aceptar. Tu seguridad legal es prioridad.'
    },
    {
      question: '¿Cómo funciona el sistema de calificaciones entre viajeros y clientes?',
      answer: 'Sistema bilateral: 1) Cliente califica al viajero: puntualidad, cuidado del paquete, comunicación (1-5 estrellas + comentario opcional), 2) Viajero califica al cliente: claridad de información, facilidad de coordinación, respeto de acuerdos, 3) Ambas calificaciones son públicas en los perfiles, 4) Promedio de rating afecta: prioridad en solicitudes futuras, acceso a tarifas premium, visibilidad en la plataforma. Ratings honestos benefician a toda la comunidad. Ratings falsos o vengativo son investigados.'
    },
    {
      question: '¿Boxifly ofrece capacitación o ayuda para nuevos viajeros?',
      answer: 'Sí, tenemos: 1) Video tutorial completo paso a paso, 2) Manual digital descargable con mejores prácticas, 3) Soporte en vivo 24/7 vía WhatsApp/email, 4) FAQ extendida con casos reales, 5) Comunidad de viajeros (grupo privado) para compartir experiencias, 6) Actualizaciones sobre cambios en normativas aduaneras. Tu primer viaje es el más importante, por eso te acompañamos de cerca. No estás solo.'
    },
    {
      question: '¿Qué pasa si pierdo un paquete durante el viaje?',
      answer: 'Escenario serio pero poco frecuente. Protocolo: 1) Reporta pérdida inmediatamente con detalles de cuándo/dónde, 2) Boxifly investiga: revisa documentación fotográfica, historial de viaje, 3) Si pérdida fue por negligencia grave tuya: posible compensación al cliente + suspensión temporal, 4) Si fue robo/pérdida sin culpa: seguro cubre al cliente, sin penalización para ti si reportaste a tiempo. Prevención: nunca dejes paquetes desatendidos, toma fotos en cada etapa, transporta en equipaje de mano cuando sea posible.'
    }
  ];

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Sé viajero Boxifly y gana dinero extra" description="Aprovecha tu equipaje disponible: transporta paquetes a Perú y genera ingresos extra con Boxifly." path="/viajeros/viajero" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600 py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Plane className="w-4 h-4" />
                <span className="text-sm font-medium">Para Viajeros</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Monetiza tu espacio de maleta
                <span className="block text-white/95 mt-2">Gana hasta $1,000 mensuales viajando</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                ¿Viajas frecuentemente entre USA y Perú? Convierte tu espacio vacío en ingresos extra. 
                100% legal, seguro y sin inversión inicial.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button size="lg" className="bg-white text-sky-500 hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  Registrarme como Viajero
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="ghost" className="border-2 border-white/50 text-white hover:bg-white/10 text-lg px-10 py-6 h-auto backdrop-blur-sm">
                  Ver Video Tutorial
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">$50-$350</div>
                  <div className="text-sm text-white/70">por viaje</div>
                </div>
                <div className="text-center border-x border-white/20">
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-white/70">inversión inicial</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-white/70">soporte legal</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section ref={processAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${processAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sky-500 font-semibold text-sm uppercase tracking-wider mb-3 block">Proceso Simple</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                8 pasos para empezar a ganar dinero en tus viajes habituales
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {steps.map((step, index) => (
                <Card key={index} className="p-6 bg-gradient-to-br from-sky-500/5 to-blue-600/5 border-2 hover:border-sky-500/20 transition-all hover:shadow-xl">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-sky-600" />
                  </div>
                  <div className="text-4xl font-bold text-sky-500/10 mb-2">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings Table */}
        <section ref={earningsAnim.ref} className={`py-20 bg-muted/30 transition-all duration-1000 ${earningsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">¿Cuánto puedo ganar?</h2>
              <p className="text-xl text-muted-foreground">Ejemplos reales de ingresos según peso y frecuencia</p>
            </div>

            <div className="max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Peso por Viaje</th>
                    <th className="px-6 py-4 text-left font-semibold">Comisión/Viaje</th>
                    <th className="px-6 py-4 text-left font-semibold">Frecuencia</th>
                    <th className="px-6 py-4 text-left font-semibold">Ingreso Mensual</th>
                    <th className="px-6 py-4 text-left font-semibold">Perfil</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {earnings.map((row, index) => (
                    <tr key={index} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-semibold">{row.weight}</td>
                      <td className="px-6 py-4 text-green-600 font-bold">{row.commission}</td>
                      <td className="px-6 py-4">{row.trips}</td>
                      <td className="px-6 py-4 text-sky-600 font-bold text-lg">{row.monthly}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6 max-w-3xl mx-auto">
              * Comisiones aproximadas basadas en tarifas promedio del mercado. Tú defines tus propias tarifas. 
              Viajeros con mejor reputación y ratings altos acceden a solicitudes premium con mejores comisiones.
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section ref={requirementsAnim.ref} className={`py-20 bg-white transition-all duration-1000 ${requirementsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Requisitos para Ser Viajero</h2>
              <p className="text-xl text-muted-foreground">Todo lo que necesitas para empezar</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {requirements.map((req, index) => (
                <Card key={index} className="p-8 bg-gradient-to-br from-sky-500/5 to-blue-600/5">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mb-6">
                    <req.icon className="w-8 h-8 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{req.title}</h3>
                  <ul className="space-y-2">
                    {req.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section ref={benefitsAnim.ref} className={`py-20 bg-muted/30 transition-all duration-1000 ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Ventajas de Ser Viajero Boxifly</h2>
              <p className="text-xl text-muted-foreground">Por qué miles de viajeros confían en nosotros</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {advantages.map((adv, index) => (
                <Card key={index} className="p-8 bg-white hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-500/10 flex items-center justify-center mx-auto mb-4">
                    <adv.icon className="w-8 h-8 text-sky-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{adv.title}</h3>
                  <p className="text-muted-foreground text-center leading-relaxed mb-4">{adv.description}</p>
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-600 text-sm font-semibold px-3 py-1 rounded-full">
                      <Star className="w-4 h-4" />
                      {adv.stats}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Allowed and Prohibited Items */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Allowed */}
                <Card className="p-8 bg-gradient-to-br from-green-500/5 to-green-600/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold">Puedes Transportar</h3>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {allowedItems.map((category, index) => (
                      <AccordionItem key={index} value={`allowed-${index}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-left font-semibold hover:no-underline">
                          {category.category}
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>

                {/* Prohibited */}
                <Card className="p-8 bg-gradient-to-br from-red-500/5 to-red-600/5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Ban className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold">Prohibido Transportar</h3>
                  </div>
                  <Accordion type="single" collapsible className="space-y-2">
                    {prohibitedItems.map((category, index) => (
                      <AccordionItem key={index} value={`prohibited-${index}`} className="border rounded-lg px-4 border-red-200">
                        <AccordionTrigger className="text-left font-semibold hover:no-underline text-red-600">
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
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-semibold">
                      ⚠️ Transportar productos prohibidos resulta en suspensión permanente inmediata y posibles acciones legales.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sky-500 font-semibold text-sm uppercase tracking-wider mb-3 block">Tu Seguridad Primero</span>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Protección integral para viajeros</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Múltiples capas de seguridad legal, financiera y operativa
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="p-8 bg-white hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-full bg-sky-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-8 h-8 text-sky-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ethics Code */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Código de Ética del Viajero</h2>
              <p className="text-xl text-muted-foreground">Principios que guían a viajeros exitosos</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {ethicsCode.map((principle, index) => (
                <Card key={index} className="p-6 bg-gradient-to-br from-sky-500/5 to-blue-600/5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sky-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">{principle.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{principle.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section ref={faqAnim.ref} className={`py-20 bg-muted/30 transition-all duration-1000 ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
              <p className="text-xl text-muted-foreground">Respuestas completas a las dudas más comunes</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-6 bg-white">
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
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4">¿Listo para empezar a ganar?</h3>
              <p className="text-muted-foreground mb-8">
                Soporte 24/7 disponible para resolver todas tus dudas
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
        <section className="py-20 bg-gradient-to-br from-sky-500 to-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para monetizar tus viajes?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Únete a miles de viajeros que ya generan ingresos extra mientras viajan
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-sky-500 hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold" onClick={() => navigate('/iniciar-sesion')}>
                  <Plane className="mr-2 w-5 h-5" />
                  Registrarme como Viajero
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

export default Viajero;
