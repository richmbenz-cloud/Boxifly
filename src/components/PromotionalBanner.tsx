import { useState, useEffect } from "react";
import { X, Zap, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Promotion {
  id: number;
  icon: React.ElementType;
  message: string;
  bgColor: string;
  textColor: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    icon: Zap,
    message: "⚡ Flash Sale: 30% OFF en productos seleccionados - ¡Solo por 24 horas!",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
    textColor: "text-white"
  },
  {
    id: 2,
    icon: Gift,
    message: "🎁 Envío GRATIS en compras mayores a S/ 150 - ¡Aprovecha ahora!",
    bgColor: "bg-gradient-to-r from-blue-500 to-purple-500",
    textColor: "text-white"
  },
  {
    id: 3,
    icon: TrendingUp,
    message: "🔥 Los más vendidos con 25% de descuento - ¡Últimas unidades!",
    bgColor: "bg-gradient-to-r from-green-500 to-teal-500",
    textColor: "text-white"
  }
];

export function PromotionalBanner() {
  const [currentPromotion, setCurrentPromotion] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromotion((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const promo = promotions[currentPromotion];
  const Icon = promo.icon;

  return (
    <div className={`${promo.bgColor} ${promo.textColor} animate-slide-down`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 gap-2">
          <div className="flex-1 flex items-center justify-center gap-2 text-sm md:text-base font-semibold animate-fade-in">
            <Icon className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
            <span className="text-center">{promo.message}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/20 flex-shrink-0"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 pb-2">
        {promotions.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentPromotion ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
