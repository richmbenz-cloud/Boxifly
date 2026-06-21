import { MainNavigation } from "@/components/MainNavigation";
import { SEO } from '@/components/SEO';
import { ChatWidget } from "@/components/ChatWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Users, DollarSign, TrendingUp, Gift, Target, CheckCircle2, Share2, Wallet, BarChart3, MessageSquare, HelpCircle, Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { toast } from "sonner";
const Afiliados = () => {
  const heroAnimation = useScrollAnimation();
  const howItWorksAnimation = useScrollAnimation();
  const benefitsAnimation = useScrollAnimation();
  const stepsAnimation = useScrollAnimation();
  const registrationAnimation = useScrollAnimation();
  const faqAnimation = useScrollAnimation();
  const [email, setEmail] = useState("");
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu email");
      return;
    }
    toast.success("¡Registro exitoso! Te contactaremos pronto.");
    setEmail("");
  };
  const benefits = [{
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: "Comisiones Atractivas",
    description: "Gana hasta 15% de comisión por cada cliente referido que realice una compra o envío"
  }, {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Ingresos Recurrentes",
    description: "Continúa ganando comisiones mientras tus referidos sigan usando nuestros servicios"
  }, {
    icon: <Gift className="h-8 w-8 text-primary" />,
    title: "Bonos Especiales",
    description: "Bonificaciones extra por alcanzar metas mensuales de referidos activos"
  }, {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Dashboard Completo",
    description: "Panel de control con métricas en tiempo real de tus referidos y ganancias"
  }, {
    icon: <Share2 className="h-8 w-8 text-primary" />,
    title: "Material de Marketing",
    description: "Acceso a banners, imágenes y contenido promocional para compartir"
  }, {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Soporte Dedicado",
    description: "Asesor personal para ayudarte a maximizar tus conversiones y resolver dudas"
  }];
  const steps = [{
    number: "01",
    title: "Regístrate Gratis",
    description: "Completa el formulario de registro y espera la aprobación de tu cuenta de afiliado",
    icon: <Users className="h-6 w-6" />
  }, {
    number: "02",
    title: "Obtén tu Link Único",
    description: "Recibe tu código de referido personal y accede a tu dashboard de afiliado",
    icon: <Target className="h-6 w-6" />
  }, {
    number: "03",
    title: "Comparte y Promociona",
    description: "Difunde tu link en redes sociales, blog, WhatsApp o cualquier canal digital",
    icon: <Share2 className="h-6 w-6" />
  }, {
    number: "04",
    title: "Gana Comisiones",
    description: "Recibe pagos mensuales por cada cliente referido que use nuestros servicios",
    icon: <Wallet className="h-6 w-6" />
  }];
  const faqs = [{
    question: "¿Cómo funciona el programa de afiliados?",
    answer: "Te registras, obtienes un link único, lo compartes con tu audiencia, y ganas comisiones cada vez que alguien usa tu link para contratar nuestros servicios. Es así de simple."
  }, {
    question: "¿Cuánto puedo ganar como afiliado?",
    answer: "Las comisiones varían entre 10% y 15% dependiendo del servicio contratado. Además, puedes ganar bonos extra por alcanzar metas mensuales. No hay límite de ganancias."
  }, {
    question: "¿Cuándo y cómo recibo mis pagos?",
    answer: "Los pagos se realizan mensualmente mediante transferencia bancaria, PayPal o Yape. El pago se efectúa los primeros 5 días hábiles de cada mes por las comisiones del mes anterior."
  }, {
    question: "¿Necesito experiencia previa en marketing?",
    answer: "No, cualquier persona puede ser afiliado. Te proporcionamos todo el material de marketing y soporte necesario para que tengas éxito desde el primer día."
  }, {
    question: "¿Hay algún costo por registrarme?",
    answer: "No, el programa de afiliados es completamente gratuito. No hay costos ocultos ni tarifas de inscripción. Solo necesitas registrarte y comenzar a compartir tu link."
  }, {
    question: "¿Puedo rastrear mis referidos y comisiones?",
    answer: "Sí, tendrás acceso a un dashboard completo donde podrás ver en tiempo real tus referidos, conversiones, comisiones ganadas y estadísticas detalladas de rendimiento."
  }];
  return <div className="min-h-screen bg-background">
      <SEO title="Programa de Afiliados Boxifly" description="Gana comisiones de hasta 15% refiriendo clientes a Boxifly. Únete a nuestro programa de afiliados." path="/afiliados" />
      <MainNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div ref={heroAnimation.ref} className={`container mx-auto px-4 transition-all duration-1000 ${heroAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 text-sm px-4 py-1" variant="secondary">
              Programa de Afiliados
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Gana Dinero Recomendando Boxifly
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a nuestro programa de afiliados y genera ingresos pasivos compartiendo 
              nuestros servicios de envíos internacionales con tu audiencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => {
              const form = document.getElementById("registro-form");
              form?.scrollIntoView({
                behavior: "smooth"
              });
            }}>
                Registrarse Ahora
              </Button>
              
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksAnimation.ref} className={`py-16 md:py-24 transition-all duration-1000 ${howItWorksAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Es simple: registra, comparte, gana. Sin complicaciones ni requisitos técnicos
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full" />
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-bold text-primary/20">
                      {step.number}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsAnimation.ref} className={`py-16 md:py-24 bg-muted/30 transition-all duration-1000 ${benefitsAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Beneficios del Programa</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para tener éxito como afiliado de Boxifly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <CardHeader>
                  <div className="mb-3">{benefit.icon}</div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section ref={stepsAnimation.ref} className={`py-16 md:py-24 transition-all duration-1000 ${stepsAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Estructura de Comisiones</h2>
              <p className="text-lg text-muted-foreground">
                Gana comisiones competitivas por cada cliente referido
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Casillero & Courier</CardTitle>
                  <CardDescription className="text-2xl font-bold text-primary">10%</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Por cada envío procesado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Comisión recurrente</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/20 hover:border-secondary/50 transition-colors">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle>Personal Shopper</CardTitle>
                  <CardDescription className="text-2xl font-bold text-secondary">12%</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Por compra completada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                      <span>Incluye comisión del shopper</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-500/20 hover:border-green-500/50 transition-colors">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                    <Gift className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle>Tienda Online & B2B</CardTitle>
                  <CardDescription className="text-2xl font-bold text-green-500">15%</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Por cada venta realizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Comisión más alta</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Bonos Extra por Metas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary">5+ Referidos</Badge>
                    <span className="text-sm">Bono de S/100 al mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary">10+ Referidos</Badge>
                    <span className="text-sm">Bono de S/250 al mes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Badge variant="secondary">20+ Referidos</Badge>
                    <span className="text-sm">Bono de S/500 al mes + regalo especial</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section ref={registrationAnimation.ref} id="registro-form" className={`py-16 md:py-24 bg-muted/30 transition-all duration-1000 ${registrationAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">Regístrate Ahora</CardTitle>
                <CardDescription className="text-base">
                  Completa el formulario y comienza a ganar comisiones hoy mismo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Email *
                    </label>
                    <Input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full" />
                  </div>
                  
                  <div className="bg-primary/5 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Te contactaremos en menos de 24 horas para completar tu registro 
                        y darte acceso a tu dashboard de afiliado.
                      </span>
                    </p>
                  </div>

                  <Button type="submit" size="lg" className="w-full text-lg">
                    Registrarse como Afiliado
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Al registrarte, aceptas nuestros{" "}
                    <a href="/terminos-y-condiciones" className="text-primary hover:underline">
                      términos y condiciones
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqAnimation.ref} className={`py-16 md:py-24 transition-all duration-1000 ${faqAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
              <p className="text-lg text-muted-foreground">
                Resolvemos tus dudas sobre el programa de afiliados
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>

            <Card className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-lg mb-4">¿Tienes más preguntas?</p>
                  <Button onClick={() => window.location.href = "/contacto"}>
                    Contactar Soporte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para Generar Ingresos Pasivos?
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Únete a cientos de afiliados que ya están ganando dinero recomendando Boxifly
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => {
          const form = document.getElementById("registro-form");
          form?.scrollIntoView({
            behavior: "smooth"
          });
        }}>
            Comenzar Ahora
          </Button>
        </div>
      </section>

      <ChatWidget />
    </div>;
};
export default Afiliados;