import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImagePlus, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateProfileImages() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; updated: number; message: string } | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-profile-images", {
        body: {},
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Fotos generadas exitosamente",
        description: data.message,
      });
    } catch (error: any) {
      console.error("Error generando fotos:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar las fotos de perfil",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout title="Generar Fotos de Perfil">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-6 w-6" />
              Generación de Fotos de Perfil con IA
            </CardTitle>
            <CardDescription>
              Genera fotos de perfil realistas para todos los clientes que escribieron reseñas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm">¿Qué hace esta herramienta?</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Busca todos los testimoniales sin foto de perfil o con fotos genéricas</li>
                <li>Genera fotos de perfil realistas usando IA para cada cliente</li>
                <li>Asigna el género apropiado basándose en el nombre del cliente</li>
                <li>Actualiza automáticamente la base de datos con las nuevas URLs</li>
                <li>Las fotos son consistentes: el mismo cliente siempre tendrá la misma foto</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generando fotos...
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-5 w-5" />
                    Generar Fotos de Perfil
                  </>
                )}
              </Button>

              {result && result.success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-500">¡Éxito!</AlertTitle>
                  <AlertDescription className="text-green-600">
                    {result.message}
                    <br />
                    <span className="font-semibold">{result.updated}</span> fotos de perfil actualizadas
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2 border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                Información Técnica
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Las fotos generadas se obtienen de un servicio de avatares realistas que utiliza IA 
                para crear personas que no existen. Cada foto es única y se asigna de forma consistente 
                basándose en el ID del testimonial, garantizando que el mismo cliente siempre tenga la 
                misma foto de perfil.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
