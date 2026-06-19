import { ShoppingCart, X, Plus, Minus, Trash2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "@/context/CartContext";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const navigate = useNavigate();
  const { cartItems, cartCount, total, updateQuantity, removeItem, isLoading } = useCartContext();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:w-[440px]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 animate-scale-in">
                <ShoppingCart className="h-7 w-7 text-primary" />
              </div>
              Mi Carrito
              {cartCount > 0 && (
                <Badge variant="secondary" className="ml-2 animate-fade-in">
                  {cartCount} {cartCount === 1 ? "producto" : "productos"}
                </Badge>
              )}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="hover:rotate-90 transition-transform duration-300">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="p-6 rounded-full bg-primary/10 mb-6 animate-bounce">
              <Package className="h-20 w-20 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-6">
              Explora nuestra tienda y encuentra productos increíbles
            </p>
            <Button onClick={handleContinueShopping} className="w-full max-w-xs group hover:scale-105 transition-transform">
              <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Ir a la tienda
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = item.products;
                  const primaryImage = product?.product_images?.find((img) => img.is_primary);
                  const subtotal = Number(product?.price || 0) * item.quantity;

                  return (
                  <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all animate-fade-in hover-lift"
                      style={{ animationDelay: `${cartItems.indexOf(item) * 0.05}s` }}
                    >
                      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-background to-muted/20">
                        {primaryImage ? (
                          <img
                            src={primaryImage.image_url}
                            alt={product?.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                          {product?.name}
                        </h4>
                        <p className="text-lg font-bold text-primary mb-2">
                          S/ {subtotal.toFixed(2)}
                        </p>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:border-primary transition-all group active:scale-90"
                            onClick={() =>
                              updateQuantity.mutate({
                                id: item.id,
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                          >
                            <Minus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Button>
                          <span className="w-10 text-center font-semibold text-base">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:border-primary transition-all group active:scale-90"
                            onClick={() =>
                              updateQuantity.mutate({
                                id: item.id,
                                quantity: Math.min(product?.stock || 0, item.quantity + 1),
                              })
                            }
                            disabled={item.quantity >= (product?.stock || 0)}
                          >
                            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 group transition-all active:scale-90"
                            onClick={() => removeItem.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t">
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold text-primary text-2xl">
                    S/ {total.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Los gastos de envío se calcularán en el checkout
                </p>
              </div>

              <Separator />

              <DrawerFooter className="px-6 py-4">
                <Button
                  size="lg"
                  className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all group hover:scale-105 active:scale-95"
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full hover-lift group"
                  onClick={handleContinueShopping}
                >
                  <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Seguir Comprando
                </Button>
              </DrawerFooter>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
