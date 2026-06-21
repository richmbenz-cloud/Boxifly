import { MainNavigation } from '@/components/MainNavigation';
import { SEO } from '@/components/SEO';
import { ChatWidget } from '@/components/ChatWidget';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, FileText, AlertTriangle, Scale, Lock, Users } from 'lucide-react';

const ViajeroLegales = () => {
  const policies = [
    {
      icon: FileText,
      title: 'Términos y Condiciones del Servicio',
      content: `
**1. Alcance del Servicio**

Boxifly Viajeros es un servicio de conexión entre compradores y viajeros verificados para transporte de productos desde Estados Unidos hacia Lima, Perú. El servicio NO incluye compra de productos, gestión de importaciones comerciales ni transporte de mercancía de terceros no registrados.

**2. Registro y Cuenta de Usuario**

Todo viajero debe registrarse proporcionando información veraz y completa. La cuenta es personal e intransferible. El usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades realizadas bajo su cuenta.

**3. Verificación KYC Obligatoria**

Todos los viajeros deben completar verificación de identidad completa: documentos oficiales, biometría facial, comprobante de domicilio y firma de declaración jurada. Boxifly se reserva el derecho de rechazar o suspender cuentas que no cumplan con los requisitos de verificación.

**4. Aceptación de Términos**

Al registrarse y usar el servicio, el viajero acepta estos términos en su totalidad. El uso continuado de la plataforma constituye aceptación de cualquier modificación a los términos (notificados con 7 días de anticipación).

**5. Modificaciones**

Boxifly puede modificar estos términos en cualquier momento. Los usuarios serán notificados de cambios significativos vía email y plataforma. El uso continuado después de la notificación constituye aceptación de los nuevos términos.
      `
    },
    {
      icon: Shield,
      title: 'Políticas de Seguridad y Verificación',
      content: `
**1. Proceso de Verificación de Viajeros**

• Documentación oficial: DNI o pasaporte vigente, comprobante de domicilio
• Biometría facial: reconocimiento automático y selfie en vivo
• Antecedentes: revisión de historial (opcional para casos específicos)
• Declaración jurada: firma digital con validez legal

**2. Verificación de Productos y Compradores**

• Solo se transportan productos de tiendas oficiales con factura válida
• Compradores pre-verificados con registro completo en Boxifly
• Productos sin factura o de origen no verificable: prohibidos

**3. Seguro y Cobertura**

• Cobertura automática desde recepción hasta entrega en oficina Lima
• Protección ante daños, pérdida o incidentes durante transporte
• Cobertura legal: asistencia jurídica preventiva para viajeros
• Límites de cobertura: según valor declarado del producto (hasta $5,000/paquete)

**4. Documentación Fotográfica Obligatoria**

• Foto al recibir paquete en USA (evidencia de estado inicial)
• Foto antes del viaje (verificación de empaque)
• Foto al entregar en oficina Lima (confirmación de entrega)
• Documentación protege al viajero ante reclamos posteriores

**5. Derecho de Apertura y Verificación**

El viajero tiene derecho legal de abrir cualquier paquete para verificar contenido antes de aceptar transportarlo. Si el contenido no coincide con lo declarado o es sospechoso: rechazar inmediatamente y reportar a Boxifly.
      `
    },
    {
      icon: Users,
      title: 'Compromisos del Cliente',
      content: `
**1. Compra Directa en Tiendas Oficiales**

El cliente se compromete a comprar productos únicamente en tiendas autorizadas (Amazon, Best Buy, Walmart, etc.) y enviarlos directamente desde la tienda al viajero. Productos de familiares, amigos o particulares: estrictamente prohibidos.

**2. Información Veraz y Completa**

El cliente debe proporcionar: descripción exacta del producto, peso y dimensiones reales, valor declarado correcto, instrucciones especiales claras (si el producto es frágil, requiere cuidado especial, etc.).

**3. Respeto de Tarifas Acordadas**

Una vez aceptada una propuesta de viajero, el cliente no puede cancelar sin justificación. Cancelaciones de último minuto pueden generar penalización según políticas.

**4. Productos Permitidos**

El cliente solo puede solicitar transporte de productos legales, no restringidos y que cumplan normativas aduaneras de USA y Perú.

**5. Comunicación y Coordinación**

Mantener comunicación activa con el viajero para coordinar detalles de envío y recepción. Responder consultas del viajero en máximo 24 horas.

**6. Retiro Oportuno**

Una vez notificado que el paquete está disponible en oficina Lima, el cliente debe retirarlo en máximo 15 días hábiles. Almacenamiento prolongado puede generar costos adicionales.
      `
    },
    {
      icon: Scale,
      title: 'Compromisos del Viajero',
      content: `
**1. Transporte Exclusivo de Productos Autorizados**

El viajero se compromete a transportar únicamente productos enviados directamente por tiendas oficiales. No aceptar paquetes de particulares, familiares o fuentes no verificadas.

**2. Cuidado y Protección de Productos**

Transportar productos con cuidado razonable, protegiéndolos de golpes, humedad, temperatura extrema y cualquier condición que pueda dañarlos. Usar empaque adicional si es necesario.

**3. Cumplimiento de Normativas**

Respetar todas las regulaciones de transporte aéreo (TSA), normativas aduaneras de USA y Perú, y leyes locales. El incumplimiento es responsabilidad exclusiva del viajero.

**4. Entrega Puntual y Verificable**

Entregar todos los productos en oficina Boxifly Lima en las fechas acordadas. Retrasos deben notificarse con mínimo 48 horas de anticipación cuando sea posible.

**5. Comunicación Constante**

Mantener al cliente y a Boxifly informados del estado del transporte. Responder mensajes en máximo 24 horas. Reportar cualquier incidente inmediatamente.

**6. No Manipulación de Contenido**

No abrir, modificar o usar productos transportados sin autorización explícita. Solo verificación de contenido para seguridad propia está permitida.

**7. Confidencialidad**

No divulgar información personal de clientes ni detalles de productos transportados. Toda información es confidencial y protegida por acuerdos de privacidad.

**8. Transparencia en Tarifas**

Establecer tarifas justas y competitivas dentro del rango recomendado (10-20% del valor del producto). No cobrar tarifas excesivas injustificadas.
      `
    },
    {
      icon: AlertTriangle,
      title: 'Procedimientos ante Incidencias',
      content: `
**1. Protocolo de Reporte de Incidentes**

Cualquier incidente (daño, pérdida, retraso, sospecha) debe reportarse inmediatamente a Boxifly mediante: plataforma (sección incidencias), WhatsApp (+51 951 314 150), o email (hola@boxifly.com). El reporte debe incluir: descripción detallada, fotos/evidencia, hora y lugar del incidente, acciones tomadas.

**2. Productos Dañados**

• Viajero reporta con fotos inmediatas
• Boxifly investiga: revisa documentación, historial, evidencia fotográfica
• Determinación de responsabilidad: daño por negligencia del viajero vs accidente inevitable
• Compensación: seguro cubre daños sin negligencia; retención parcial de pago si hubo negligencia grave

**3. Productos Perdidos o Extraviados**

• Activación de protocolo de rastreo interno
• Revisión de última ubicación conocida y documentación
• Colaboración con cliente, viajero y potencialmente autoridades
• Compensación según cobertura de seguro: cliente recibe valor declarado; viajero: sin penalización si pérdida fue sin culpa (robo, etc.)

**4. Retrasos Significativos**

• Retrasos menores (<24h): comunicación suficiente, generalmente sin penalización
• Retrasos mayores (>24h): justificación requerida; posible ajuste de comisión según impacto
• Retrasos por causas de fuerza mayor (clima, cancelaciones de aerolínea): sin penalización si se documenta adecuadamente

**5. Conflictos entre Cliente y Viajero**

• Boxifly actúa como mediador neutral
• Revisión de toda la documentación, comunicaciones y evidencia fotográfica
• Audiencia virtual si es necesario con ambas partes
• Decisión final basada en evidencia objetiva
• Resolución típica en 5-7 días hábiles

**6. Productos Prohibidos Transportados por Error**

• Reporte inmediato obligatorio
• No continuar transporte bajo ninguna circunstancia
• Coordinación con autoridades si es necesario
• Investigación de cómo llegó el producto prohibido al viajero
• Suspensión temporal mientras se investiga; permanente si hubo conocimiento previo

**7. Problemas Legales o Aduaneros**

• Soporte legal inmediato 24/7 de Boxifly
• Asesoría jurídica preventiva incluida
• Documentación de respaldo proporcionada por Boxifly
• Si producto cumplía normativas: viajero protegido legalmente
• Coordinación con autoridades con acompañamiento de Boxifly
      `
    },
    {
      icon: Lock,
      title: 'Aclaraciones Legales del Servicio',
      content: `
**1. Naturaleza del Servicio**

Boxifly Viajeros es una plataforma de intermediación que conecta compradores con viajeros. Boxifly NO es courier, NO realiza las compras, y NO es responsable del contenido específico de los productos más allá de la verificación inicial. La responsabilidad del transporte recae en el viajero hasta la entrega en oficina.

**2. Limitaciones de Responsabilidad**

Boxifly no se hace responsable por:
• Daños causados por negligencia grave o dolo del viajero
• Productos prohibidos transportados a sabiendas por el viajero
• Retrasos o pérdidas causadas por causas de fuerza mayor (desastres naturales, guerras, pandemias)
• Problemas aduaneros derivados de declaraciones falsas del cliente
• Incumplimientos legales del viajero fuera del ámbito del servicio

**3. Jurisdicción y Ley Aplicable**

Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa se resolverá en los tribunales de Lima, Perú. El servicio opera bajo regulaciones peruanas de transporte, comercio y protección al consumidor.

**4. Declaración de Independencia**

Los viajeros actúan como contratistas independientes, NO como empleados de Boxifly. No existe relación laboral. El viajero es responsable de sus propias obligaciones tributarias derivadas de sus ingresos.

**5. Propiedad Intelectual**

La plataforma, marca, logos y contenido de Boxifly son propiedad exclusiva de Boxifly. Los usuarios no pueden usar, reproducir o distribuir material de la plataforma sin autorización escrita.

**6. Modificación o Terminación del Servicio**

Boxifly se reserva el derecho de: modificar características del servicio con notificación previa, suspender temporalmente el servicio por mantenimiento, terminar el servicio con aviso previo de 30 días. Cuentas de usuario pueden suspenderse por incumplimiento de términos.

**7. Fuerza Mayor**

Boxifly no será responsable por incumplimientos causados por circunstancias fuera de su control razonable: desastres naturales, actos de guerra, huelgas, pandemias, cambios regulatorios gubernamentales, fallas de infraestructura crítica.

**8. Separabilidad**

Si alguna cláusula de estos términos es declarada inválida, las demás cláusulas permanecen en pleno vigor.

**9. Acuerdo Completo**

Estos términos constituyen el acuerdo completo entre el usuario y Boxifly, reemplazando cualquier acuerdo previo verbal o escrito.
      `
    }
  ];

  const legalFaqs = [
    {
      question: '¿Qué respaldo legal tengo si algo sale mal durante el transporte?',
      answer: 'Boxifly proporciona: 1) Declaración jurada firmada digitalmente que documenta tu rol como transportista autorizado, 2) Asesoría jurídica preventiva 24/7 sin costo, 3) Documentación completa de cada transacción (contratos, facturas, registros), 4) Respaldo ante autoridades si eres cuestionado en aduanas o aeropuertos, 5) Cobertura de seguro que incluye protección legal. En 5+ años de operación, ningún viajero verificado de Boxifly ha tenido problemas legales graves cumpliendo nuestras políticas.'
    },
    {
      question: '¿Qué pasa si transporto algo prohibido sin saberlo?',
      answer: 'Si transportas algo prohibido SIN CONOCIMIENTO PREVIO: 1) Reporta inmediatamente a Boxifly, 2) No continúes el transporte, 3) Coopera con investigación interna, 4) Generalmente sin penalización si pruebas que no sabías (verificaste contenido razonablemente). Si transportas algo prohibido A SABIENDAS o sin verificar: suspensión permanente inmediata + posibles acciones legales + responsabilidad personal ante autoridades. Por eso enfatizamos: verifica siempre contenido, rechaza paquetes sospechosos, reporta inmediato cualquier irregularidad.'
    },
    {
      question: '¿Boxifly me representa legalmente ante problemas con aduanas?',
      answer: 'Sí, proporcionamos respaldo completo: documentación oficial que acredita tu servicio, contacto directo con equipo legal de Boxifly 24/7, asesoría sobre cómo responder preguntas de autoridades, certificados de que productos vienen de tiendas oficiales, historial de tu perfil verificado como viajero registrado. No estás solo ante problemas aduaneros. Todos los productos tienen trazabilidad completa y documentación que te protege.'
    },
    {
      question: '¿Puedo ser demandado por un cliente insatisfecho?',
      answer: 'Altamente improbable si cumples las políticas. Protección: 1) Todo pago pasa por Boxifly (no directamente al viajero), 2) Contratos digitales que documentan responsabilidades claras, 3) Boxifly media conflictos ANTES de llegar a instancias legales, 4) Sistema de calificaciones evita malos clientes, 5) Seguro cubre daños sin negligencia. En caso extremo de demanda: Boxifly proporciona asesoría legal y documentación de respaldo. En 5+ años, cero casos de viajeros demandados siguiendo nuestras políticas.'
    },
    {
      question: '¿Qué obligaciones tributarias tengo con SUNAT?',
      answer: 'Boxifly NO es asesor tributario, pero orientación general: Si tus ingresos anuales como viajero superan aproximadamente S/. 26,000 (actualizado 2025), probablemente debas emitir recibos por honorarios o registrarte como trabajador independiente. Consulta con un contador calificado. Boxifly te proporciona: comprobantes de pago digitales detallados, historial de todas tus transacciones descargable, declaración de ingresos anual para tu referencia. Mantener registros claros desde el inicio facilita cualquier trámite tributario futuro.'
    }
  ];

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Términos del programa de Viajeros Boxifly" description="Condiciones legales y responsabilidades del programa de viajeros de Boxifly." path="/viajeros/legales" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 py-20">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Scale className="w-4 h-4" />
                <span className="text-sm font-medium">Información Legal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Políticas y Términos Legales
                <span className="block text-white/90 text-2xl mt-3">Boxifly Viajeros</span>
              </h1>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Conoce tus derechos, obligaciones y protecciones legales como parte de la plataforma Boxifly
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {policies.map((policy, index) => (
                <Card key={index} className="p-8 mb-8 border-2">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <policy.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{policy.title}</h2>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
                    {policy.content}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Legal FAQ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Preguntas Legales Frecuentes</h2>
              <p className="text-xl text-muted-foreground">Aclaraciones sobre aspectos legales del servicio</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {legalFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`legal-faq-${index}`} className="border rounded-lg px-6 bg-white">
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
              <h3 className="text-2xl font-bold mb-4">¿Necesitas asesoría legal específica?</h3>
              <p className="text-muted-foreground mb-8">
                Contacta a nuestro equipo legal para consultas específicas sobre tu situación
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:legal@boxifly.com" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all">
                  <FileText className="w-5 h-5" />
                  legal@boxifly.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ViajeroLegales;
