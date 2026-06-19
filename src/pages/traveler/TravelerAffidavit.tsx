import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import SignatureCanvas from "react-signature-canvas";
import { Download, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import logoFull from "@/assets/logo-boxifly-affidavit.png";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function TravelerAffidavit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    clientName: "",
    clientDNI: "",
    clientAddress: "",
    travelerName: "",
    travelerDNI: "",
  });
  
  const signatureRef = useRef<SignatureCanvas>(null);
  const today = format(new Date(), "dd-MM-yyyy", { locale: es });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.clientName || !formData.clientDNI || !formData.clientAddress || 
        !formData.travelerName || !formData.travelerDNI) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error("Por favor firma el documento");
      return;
    }

    try {
      const signatureData = signatureRef.current.toDataURL();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Save affidavit
      const { error: affidavitError } = await supabase
        .from("traveler_affidavits")
        .insert({
          user_id: user.id,
          client_name: formData.clientName,
          client_dni: formData.clientDNI,
          client_address: formData.clientAddress,
          traveler_name: formData.travelerName,
          traveler_dni: formData.travelerDNI,
          signature_data: signatureData,
        });

      if (affidavitError) throw affidavitError;

      // Update profile to mark affidavit as signed
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          affidavit_signed: true,
          affidavit_signed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success("Declaración jurada firmada exitosamente");
      navigate("/traveler/dashboard");
    } catch (error) {
      console.error("Error al guardar la declaración:", error);
      toast.error("Error al guardar la declaración jurada");
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-12 bg-white print:shadow-none">
          {/* Header */}
          <div className="text-center mb-8">
            <img src={logoFull} alt="Boxifly" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold underline">Declaración Jurada Viajeros</h1>
          </div>

          {/* Document Body */}
          <div className="space-y-4 text-sm leading-relaxed">
            {/* Date and Name Row */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span>Con fecha</span>
              <span className="font-semibold px-2 py-1 bg-muted rounded">{today}</span>
              <span>, yo,</span>
              <Input
                value={formData.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                placeholder="Nombre completo"
                className="inline-flex flex-1 min-w-[200px] print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
              />
            </div>

            {/* DNI and Address Row */}
            <div className="flex flex-wrap items-baseline gap-2">
              <span>, DNI N°</span>
              <Input
                value={formData.clientDNI}
                onChange={(e) => handleChange("clientDNI", e.target.value)}
                placeholder="DNI"
                className="inline-flex w-32 print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
              />
              <span>, con domicilio en</span>
              <Input
                value={formData.clientAddress}
                onChange={(e) => handleChange("clientAddress", e.target.value)}
                placeholder="Dirección en Perú (calle, n°, dpto, distrito, ciudad)"
                className="inline-flex flex-1 min-w-[300px] print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
              />
            </div>

            {/* Main Text */}
            <p>
              , en adelante el "Viajero", por medio del presente documento y en mi calidad de Viajero registrado en la
              plataforma <strong>Boxifly</strong> declaro bajo juramento que tengo conocimiento, comprendo y
              acepto en su totalidad los Términos y Condiciones y Políticas de Privacidad que se encuentran en el
              siguiente enlace:{" "}
              <a
                href="https://boxifly.com.pe/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://boxifly.com.pe/privacy
              </a>
              .
            </p>

            <p>
              En ese sentido, me comprometo a cumplir los Términos y Condiciones y Políticas de Privacidad en
              referencia, así como sus actualizaciones.
            </p>

            <p>
              Ratifico que, en mi calidad de Viajero soy el responsable de transportar los productos que adquieren los
              clientes de Boxifly hacia el destino señalado por éstos, asumiendo las responsabilidades
              contractuales de mi obligación de entrega del o los productos encargados por parte de sus clientes, de
              forma íntegra y dentro del plazo acordado, entendiendo que en caso de retraso en la entrega, éste
              deberá ser justificado y en caso de pérdida o daño deberá ser repuesto por mi parte, según lo
              establecido en los Términos y Condiciones.
            </p>

            <p>
              Asimismo, declaro entender y aceptar expresamente que los productos que transporto hacia los clientes
              de Boxifly son de propiedad de éstos, y en caso de apropiación o retención indebida por
              mi parte del o los productos encargados, se configurará el delito de apropiación ilícita, según el artículo
              190° del Código Penal Peruano y como sanción por parte de la Empresa se aplicará mi desvinculación
              definitiva como Viajero, sin perjuicio de cualquier otra acción legal que la Empresa o el cliente puedan
              ejercer en mi contra.
            </p>

            <p>
              Esta declaración será válida para todos los viajes que realice como viajero registrado en la Plataforma
              <strong> Boxifly</strong>.
            </p>

            {/* Signature Section */}
            <div className="grid md:grid-cols-2 gap-8 mt-12 pt-8 border-t">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="travelerName">Nombre Viajero</Label>
                  <Input
                    id="travelerName"
                    value={formData.travelerName}
                    onChange={(e) => handleChange("travelerName", e.target.value)}
                    placeholder="Nombre completo"
                    className="print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="travelerDNI">DNI Viajero</Label>
                  <Input
                    id="travelerDNI"
                    value={formData.travelerDNI}
                    onChange={(e) => handleChange("travelerDNI", e.target.value)}
                    placeholder="DNI"
                    className="print:border-b print:border-t-0 print:border-x-0 print:rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Firma Digital</Label>
                <div className="border-2 border-dashed border-border rounded-lg bg-muted/20">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-40 cursor-crosshair",
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  className="w-full print:hidden"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpiar Firma
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 print:hidden">
            <Button onClick={handleSubmit} className="flex-1">
              Firmar y Completar
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </Card>

        {/* Footer for print */}
        <div className="hidden print:block text-sm text-muted-foreground mt-4">
          <p>Declaración Jurada Viajeros Peru.docx</p>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
    </div>
  );
}
