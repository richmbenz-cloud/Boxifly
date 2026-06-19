import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User, Image } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Message {
  id: string;
  emisor_id: string;
  mensaje: string;
  tipo: 'texto' | 'imagen' | 'sistema';
  imagen_url?: string;
  created_at: string;
  leido?: boolean;
}

interface PSMessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  isSending?: boolean;
}

const PSMessageThread = ({ messages, currentUserId, onSendMessage, isSending }: PSMessageThreadProps) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSystemMessage = (msg: Message) => msg.tipo === 'sistema';
  const isOwnMessage = (msg: Message) => msg.emisor_id === currentUserId;

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5" />
          Mensajes Internos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comunicación Cliente ↔ Personal Shopper a través de Boxifly
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay mensajes aún</p>
              <p className="text-sm text-muted-foreground mt-1">
                Inicia la conversación con el cliente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                if (isSystemMessage(msg)) {
                  // System Message - centered, styled differently
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
                        <Bot className="h-4 w-4 text-primary" />
                        <span>{msg.mensaje}</span>
                        <span className="text-xs">
                          {format(new Date(msg.created_at), "HH:mm", { locale: es })}
                        </span>
                      </div>
                    </div>
                  );
                }

                const own = isOwnMessage(msg);
                
                return (
                  <div 
                    key={msg.id} 
                    className={`flex ${own ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${own ? 'order-1' : ''}`}>
                      {/* Sender indicator */}
                      <div className={`flex items-center gap-1 mb-1 ${own ? 'justify-end' : ''}`}>
                        {own ? (
                          <Badge variant="outline" className="text-xs font-normal">
                            Tú
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs font-normal">
                            <User className="h-3 w-3 mr-1" />
                            Cliente
                          </Badge>
                        )}
                      </div>
                      
                      {/* Message Bubble */}
                      <div 
                        className={`rounded-lg px-4 py-2 ${
                          own 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {msg.tipo === 'imagen' && msg.imagen_url && (
                          <div className="mb-2">
                            <img 
                              src={msg.imagen_url} 
                              alt="Imagen adjunta" 
                              className="max-w-full rounded"
                            />
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.mensaje}</p>
                      </div>
                      
                      {/* Timestamp */}
                      <p className={`text-xs text-muted-foreground mt-1 ${own ? 'text-right' : ''}`}>
                        {format(new Date(msg.created_at), "dd MMM HH:mm", { locale: es })}
                        {own && msg.leido && (
                          <span className="ml-2 text-status-delivered">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2">
            <Textarea
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[60px]"
              rows={2}
            />
            <Button 
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PSMessageThread;
