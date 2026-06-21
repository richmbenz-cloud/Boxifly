import { useState } from "react";
import { SEO } from '@/components/SEO';
import { Mail, Phone, MapPin, FileText, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { MainNavigation } from "@/components/MainNavigation";
import { ChatWidget } from "@/components/ChatWidget";
import logoFull from "@/assets/logo-boxifly-full.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
const LibroReclamaciones = () => {
  const {
    ref: animatedRef
  } = useScrollAnimation({
    threshold: 0.2
  });
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    tipo: "reclamo",
    nombres: "",
    apellidos: "",
    tipoDocumento: "dni",
    numeroDocumento: "",
    email: "",
    telefono: "",
    direccion: "",
    servicio: "",
    detalleReclamo: "",
    pedido: ""
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Reclamo registrado",
      description: "Nos pondremos en contacto contigo dentro de las próximas 48 horas."
    });
    // Reset form
    setFormData({
      tipo: "reclamo",
      nombres: "",
      apellidos: "",
      tipoDocumento: "dni",
      numeroDocumento: "",
      email: "",
      telefono: "",
      direccion: "",
      servicio: "",
      detalleReclamo: "",
      pedido: ""
    });
  };
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <div className="min-h-screen bg-background">
      <SEO title="Libro de reclamaciones virtual" description="Registra tu reclamo o queja en el libro de reclamaciones virtual de Boxifly." path="/libro-de-reclamaciones" />
      <MainNavigation />
      <ChatWidget />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/5 pt-32 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Libro de Reclamaciones
            </h1>
            <p className="text-lg text-muted-foreground">
              En Boxifly valoramos tu opinión. Si tienes algún reclamo o sugerencia sobre nuestros servicios, 
              completa el siguiente formulario y nos pondremos en contacto contigo.
            </p>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Formulario de Reclamo o Queja</CardTitle>
              <CardDescription>
                Por favor, completa todos los campos requeridos. Responderemos a tu solicitud en un plazo máximo de 48 horas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de solicitud */}
                <div className="space-y-3">
                  <Label>Tipo de solicitud *</Label>
                  <RadioGroup value={formData.tipo} onValueChange={value => handleChange("tipo", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reclamo" id="reclamo" />
                      <Label htmlFor="reclamo" className="font-normal cursor-pointer">
                        Reclamo
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="queja" id="queja" />
                      <Label htmlFor="queja" className="font-normal cursor-pointer">
                        Queja
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Datos personales */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombres">Nombres *</Label>
                    <Input id="nombres" value={formData.nombres} onChange={e => handleChange("nombres", e.target.value)} required placeholder="Ingresa tus nombres" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input id="apellidos" value={formData.apellidos} onChange={e => handleChange("apellidos", e.target.value)} required placeholder="Ingresa tus apellidos" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoDocumento">Tipo de documento *</Label>
                    <select id="tipoDocumento" value={formData.tipoDocumento} onChange={e => handleChange("tipoDocumento", e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
                      <option value="dni">DNI</option>
                      <option value="ce">Carnet de Extranjería</option>
                      <option value="pasaporte">Pasaporte</option>
                      <option value="ruc">RUC</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numeroDocumento">Número de documento *</Label>
                    <Input id="numeroDocumento" value={formData.numeroDocumento} onChange={e => handleChange("numeroDocumento", e.target.value)} required placeholder="Ingresa tu número de documento" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => handleChange("email", e.target.value)} required placeholder="tu@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input id="telefono" type="tel" value={formData.telefono} onChange={e => handleChange("telefono", e.target.value)} required placeholder="+51 999 999 999" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input id="direccion" value={formData.direccion} onChange={e => handleChange("direccion", e.target.value)} required placeholder="Ingresa tu dirección completa" />
                </div>

                {/* Detalles del reclamo */}
                <div className="space-y-2">
                  <Label htmlFor="servicio">Servicio relacionado *</Label>
                  <select id="servicio" value={formData.servicio} onChange={e => handleChange("servicio", e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
                    <option value="">Selecciona un servicio</option>
                    <option value="casillero">Casillero</option>
                    <option value="personal-shopper">Personal Shopper</option>
                    <option value="viajero">Viajero</option>
                    <option value="b2b">Aliado Comercial B2B</option>
                    <option value="tienda">Tienda Online</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pedido">Número de pedido o tracking (opcional)</Label>
                  <Input id="pedido" value={formData.pedido} onChange={e => handleChange("pedido", e.target.value)} placeholder="Ej: BXFLY-12345" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detalleReclamo">Detalle del reclamo o queja *</Label>
                  <Textarea id="detalleReclamo" value={formData.detalleReclamo} onChange={e => handleChange("detalleReclamo", e.target.value)} required rows={6} placeholder="Describe tu reclamo o queja de manera detallada" />
                </div>

                <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground">
                  <p>
                    Al enviar este formulario, aceptas que Boxifly procesará tus datos personales para gestionar 
                    tu reclamo o queja de acuerdo con nuestra Política de Privacidad.
                  </p>
                </div>

                <Button type="submit" className="w-full md:w-auto" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Reclamo
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">¿Necesitas más ayuda?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-medium mb-1">Email</p>
                  <a href="mailto:soporte@boxifly.com" className="text-sm text-primary hover:underline">
                    soporte@boxifly.com
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-medium mb-1">Teléfono</p>
                  <a href="tel:+51951314150" className="text-sm text-primary hover:underline">
                    +51 951 314 150
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-medium mb-1">Horario</p>
                  <p className="text-sm text-muted-foreground">
                    Lun - Vie: 9:00 - 18:00
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-6">
            <img src={logoFull} alt="Boxifly Logo" className="h-12" />
            <p className="text-sm text-muted-foreground max-w-md">
              Tu solución logística para envíos de Estados Unidos a Perú. Rápido, seguro y sin complicaciones.
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Boxifly. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default LibroReclamaciones;