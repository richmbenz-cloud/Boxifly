import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FacialBiometryProps {
  userId: string;
  userRole: 'traveler' | 'shopper';
  onComplete: () => void;
}

export function FacialBiometry({ userId, userRole, onComplete }: FacialBiometryProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      // Verificar soporte de getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara');
      }

      // Constraints simples y compatibles para móviles
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        const videoElement = videoRef.current;
        videoElement.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);

        // Intentar reproducir el video (algunos navegadores móviles lo requieren)
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('No se pudo iniciar la reproducción del video automáticamente:', err);
          });
        }

        // Fallback adicional cuando se cargan los metadatos
        videoElement.onloadedmetadata = () => {
          if (videoElement.paused) {
            videoElement.play().catch((err) => {
              console.warn('Error al reproducir el video después de metadata:', err);
            });
          }
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = "No se pudo acceder a la cámara.";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Permiso de cámara denegado. Por favor, permite el acceso en la configuración de tu navegador.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "No se encontró ninguna cámara en tu dispositivo.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = "La cámara está siendo usada por otra aplicación. Cierra otras apps y vuelve a intentar.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Tu cámara no cumple con los requisitos. Intenta con otro dispositivo.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error de Cámara",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Countdown before capture
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          performCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const performCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const uploadBiometry = async () => {
    if (!capturedImage) return;

    setIsUploading(true);

    try {
      // Convert base64 to blob
      const base64Response = await fetch(capturedImage);
      const blob = await base64Response.blob();
      
      // Upload to Supabase Storage
      const fileName = `${userId}/${userRole}/facial-biometry-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('package-photos')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('package-photos')
        .getPublicUrl(fileName);

      // Save document record
      const { error: insertError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: userId,
          user_role: userRole,
          document_type: 'selfie',
          document_url: publicUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Verificación completada",
        description: "Tu biometría facial ha sido capturada y enviada para revisión",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error uploading biometry:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la verificación facial",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Verificación Biométrica Facial
        </CardTitle>
        <CardDescription>
          Captura tu rostro en tiempo real para validar tu identidad
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Instrucciones:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Busca un lugar con buena iluminación</li>
              <li>Retira lentes, gorras o cualquier accesorio</li>
              <li>Mira directamente a la cámara</li>
              <li>Mantén tu rostro centrado en el marco</li>
              <li>Evita sonreír o gesticular durante la captura</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {!isCameraActive && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Camera className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Presiona el botón para activar la cámara</p>
            </div>
          )}

          {isCameraActive && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-white text-8xl font-bold animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
              <div className="absolute inset-0 border-4 border-primary/50 rounded-lg pointer-events-none" />
            </>
          )}

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured biometry"
              className="w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-2">
          {!isCameraActive && !capturedImage && (
            <Button onClick={startCamera} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Activar Cámara
            </Button>
          )}

          {isCameraActive && !capturedImage && (
            <>
              <Button onClick={capturePhoto} className="flex-1" disabled={countdown !== null}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Capturar Foto
              </Button>
              <Button onClick={stopCamera} variant="outline">
                Cancelar
              </Button>
            </>
          )}

          {capturedImage && (
            <>
              <Button onClick={retakePhoto} variant="outline" className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Tomar de Nuevo
              </Button>
              <Button 
                onClick={uploadBiometry} 
                className="flex-1"
                disabled={isUploading}
              >
                {isUploading ? 'Subiendo...' : 'Confirmar y Enviar'}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
