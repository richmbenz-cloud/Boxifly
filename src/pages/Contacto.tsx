import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';
const Contacto = () => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Mensaje Enviado",
        description: "Gracias por contactarnos. Te responderemos en menos de 24 horas."
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };
  const contactInfo = [{
    icon: Mail,
    title: 'Email',
    value: 'hola@boxifly.com',
    subtitle: 'Respuesta en 24h'
  }, {
    icon: Phone,
    title: 'Teléfono',
    value: '+51 951 314 150',
    subtitle: 'Lun - Vie: 9am - 6pm'
  }, {
    icon: MapPin,
    title: 'Oficina Lima',
    value: 'Av. Alfredo Benavides 501. Miraflores',
    subtitle: 'Lima 15047, Perú'
  }];
  const offices = [{
    city: 'Miami, USA',
    address: '1234 NW 84th Ave',
    zip: 'Doral, FL 33166',
    hours: 'Lun - Vie: 9am - 5pm EST',
    emoji: '🇺🇸'
  }, {
    city: 'Lima, Perú',
    address: 'Av. Alfredo Benavides 501',
    zip: 'Miraflores, Lima 15047',
    hours: 'Lun - Vie: 9am - 6pm PET',
    emoji: '🇵🇪'
  }];
  const faqs = [{
    question: '¿Cuánto demora un envío?',
    answer: '7-10 días desde liberación aduanera hasta tu puerta.'
  }, {
    question: '¿Cuánto cuesta el envío?',
    answer: 'Desde $5/kg. Usa nuestra calculadora para cotización exacta.'
  }, {
    question: '¿Cómo funciona el casillero?',
    answer: 'Te damos una dirección en Miami. Compras y enviamos a Perú.'
  }, {
    question: '¿Qué productos puedo enviar?',
    answer: 'Casi todo excepto prohibidos (armas, drogas, líquidos peligrosos).'
  }];
  return <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <SEO title="Contacto | Boxifly" description="Escríbenos por WhatsApp, correo o formulario. Atención al cliente Boxifly para envíos, casillero, personal shopper y viajeros." path="/contacto" />
        <MainNavigation />

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-navy py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Contáctanos
              </h1>
              <p className="text-lg md:text-xl text-white/90">
                Estamos aquí para ayudarte. Respuesta garantizada en menos de 24 horas.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {contactInfo.map((info, index) => <Card key={index} className="p-6 text-center hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                  <p className="text-primary font-semibold mb-1">{info.value}</p>
                  <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                </Card>)}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Envíanos un Mensaje</h2>
                <p className="text-xl text-muted-foreground">
                  Completa el formulario y te responderemos pronto
                </p>
              </div>

              <Card className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input id="name" required value={formData.name} onChange={e => setFormData({
                      ...formData,
                      name: e.target.value
                    })} placeholder="Juan Pérez" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({
                      ...formData,
                      email: e.target.value
                    })} placeholder="juan@email.com" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input id="phone" value={formData.phone} onChange={e => setFormData({
                      ...formData,
                      phone: e.target.value
                    })} placeholder="+51 999 888 777" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input id="subject" required value={formData.subject} onChange={e => setFormData({
                      ...formData,
                      subject: e.target.value
                    })} placeholder="Consulta sobre envío" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea id="message" required rows={6} value={formData.message} onChange={e => setFormData({
                    ...formData,
                    message: e.target.value
                  })} placeholder="Cuéntanos en qué podemos ayudarte..." className="resize-none" />
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto gap-2" disabled={isSubmitting}>
                    {isSubmitting ? <>
                        <Clock className="w-5 h-5 animate-spin" />
                        Enviando...
                      </> : <>
                        <Send className="w-5 h-5" />
                        Enviar Mensaje
                      </>}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>

        {/* Offices */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Nuestras Oficinas</h2>
              <p className="text-xl text-muted-foreground">
                Presencia física en USA y Perú
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {offices.map((office, index) => <Card key={index} className="p-8 hover:shadow-xl transition-all">
                  <div className="text-5xl mb-4">{office.emoji}</div>
                  <h3 className="text-2xl font-bold mb-4">{office.city}</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                      <div>
                        <p>{office.address}</p>
                        <p>{office.zip}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 flex-shrink-0 text-primary" />
                      <p>{office.hours}</p>
                    </div>
                  </div>
                </Card>)}
            </div>
          </div>
        </section>

        {/* FAQs */}
        

        {/* WhatsApp CTA */}
        <section className="py-20 bg-gradient-to-br from-success to-green-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <MessageCircle className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-6">
                ¿Prefieres hablar por WhatsApp?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Chatea con nosotros ahora. Atención 24/7 con respuesta inmediata.
              </p>
              <Button size="lg" className="bg-white text-success hover:bg-white/95 text-lg px-10 py-6 h-auto shadow-2xl font-semibold gap-2" onClick={() => window.open('https://wa.me/51951314150', '_blank')}>
                <MessageCircle className="w-5 h-5" />
                Abrir WhatsApp
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>;
};
export default Contacto;