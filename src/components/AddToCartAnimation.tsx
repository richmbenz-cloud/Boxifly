import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface AddToCartAnimationProps {
  show: boolean;
  productName: string;
}

export function AddToCartAnimation({ show, productName }: AddToCartAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-success text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-sm hover:scale-105 transition-transform">
        <div className="bg-white/20 rounded-full p-2 animate-scale-in">
          <CheckCircle2 className="h-6 w-6 animate-bounce" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">¡Agregado al carrito!</p>
          <p className="text-xs text-white/90 line-clamp-1">{productName}</p>
        </div>
      </div>
    </div>
  );
}
