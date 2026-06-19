import { Shield, RotateCcw, Truck, CheckCircle, Award, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function GuaranteeSection() {
  const guarantees = [
    {
      icon: Shield,
      title: "Garantía de Satisfacción",
      description: "Si no estás satisfecho, te devolvemos tu dinero sin preguntas"
    },
    {
      icon: RotateCcw,
      title: "Devoluciones Gratis",
      description: "30 días para cambios y devoluciones sin costo adicional"
    },
    {
      icon: Truck,
      title: "Envío Seguro",
      description: "Seguimiento en tiempo real y seguro incluido en cada envío"
    },
    {
      icon: Award,
      title: "Productos Auténticos",
      description: "100% originales, verificados directamente con las marcas"
    },
    {
      icon: Lock,
      title: "Compra Protegida",
      description: "Tus datos y pagos están encriptados y seguros"
    },
    {
      icon: CheckCircle,
      title: "Soporte 24/7",
      description: "Estamos aquí para ayudarte en cualquier momento"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Nuestra Garantía de Calidad</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tu tranquilidad es nuestra prioridad. Compra con confianza total.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {guarantees.map((guarantee, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors shrink-0">
                    <guarantee.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{guarantee.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {guarantee.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
