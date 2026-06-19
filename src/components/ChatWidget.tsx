import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    // Mock chat - en producción conectar a sistema real
    console.log("Mensaje enviado:", message);
    setMessage("");
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-28 right-6 z-50 w-96 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat de Soporte
            </CardTitle>
            <p className="text-sm text-white/90">
              ¿En qué podemos ayudarte?
            </p>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="h-64 bg-muted/20 rounded-lg p-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-primary/10 rounded-lg p-3">
                  <p className="text-sm">
                    ¡Hola! 👋 Soy el asistente virtual de Boxifly. ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Escribe tu mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button size="icon" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground text-center">
              Tiempo de respuesta promedio: &lt;2 minutos
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
