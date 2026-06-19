import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Mail, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Mostrar popup después de 10 segundos si no se ha cerrado antes
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen");
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const subscribe = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email,
          full_name: name || null,
        });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este correo ya está suscrito");
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "¡Suscripción exitosa!",
        description: "Recibirás un cupón de 10% en tu correo",
      });
      setIsVisible(false);
      localStorage.setItem("newsletter-popup-seen", "true");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("newsletter-popup-seen", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="max-w-sm w-full shadow-2xl animate-in zoom-in duration-300 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/90 hover:bg-white shadow-md transition-all hover:scale-110"
          onClick={handleClose}
        >
          <X className="h-4 w-4 text-gray-700" />
        </Button>

        <CardHeader className="bg-gradient-to-br from-primary to-primary/80 text-white text-center pb-6 pt-6">
          <div className="mx-auto mb-3 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Gift className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl mb-1">
            ¡10% de descuento!
          </CardTitle>
          <p className="text-sm text-white/90">
            Suscríbete y recibe ofertas exclusivas
          </p>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <Input
              placeholder="Tu nombre (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-sm"
            />
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 text-sm"
            />
          </div>

          <Button
            className="w-full h-10 text-sm"
            onClick={() => subscribe.mutate()}
            disabled={!email || subscribe.isPending}
          >
            <Mail className="h-4 w-4 mr-2" />
            {subscribe.isPending ? "Suscribiendo..." : "Obtener descuento"}
          </Button>

          <p className="text-[10px] text-center text-muted-foreground leading-tight">
            Al suscribirte aceptas recibir correos promocionales. Puedes darte de baja en cualquier momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
