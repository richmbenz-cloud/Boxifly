import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartContext } from "@/context/CartContext";

interface CartButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  onCartClick?: () => void;
}

export function CartButton({ 
  variant = "ghost", 
  size = "default", 
  showText = true,
  onCartClick 
}: CartButtonProps) {
  const { cartCount } = useCartContext();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onCartClick}
      className="relative gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
      {showText && <span className="hidden sm:inline">Carrito</span>}
      {cartCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-scale-in"
        >
          {cartCount}
        </Badge>
      )}
    </Button>
  );
}
