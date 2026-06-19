import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Package, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useGuestCart } from "@/hooks/useGuestCart";

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { guestCart, updateGuestCartQuantity, removeFromGuestCart } = useGuestCart();

  // Guest cart items from localStorage
  const { data: guestCartItems, isLoading: isLoadingGuest } = useQuery({
    queryKey: ["guest-cart", guestCart],
    queryFn: async () => {
      if (guestCart.length === 0) return [];
      
      const productIds = guestCart.map(item => item.productId);
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          stock,
          product_images (
            image_url,
            is_primary
          )
        `)
        .in("id", productIds)
        .eq("is_active", true);

      if (error) throw error;
      
      return guestCart.map(cartItem => ({
        id: cartItem.productId,
        product_id: cartItem.productId,
        quantity: cartItem.quantity,
        products: data?.find(p => p.id === cartItem.productId),
      }));
    },
    enabled: !user && guestCart.length > 0,
  });

  // Authenticated cart items from database
  const { data: authCartItems, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            id,
            name,
            price,
            stock,
            product_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const cartItems = user ? authCartItems : guestCartItems;
  const isLoading = user ? isLoadingAuth : isLoadingGuest;

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (!user) {
        // Guest cart update
        updateGuestCartQuantity(id, quantity);
        return;
      }
      
      // Authenticated cart update
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
      }
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        // Guest cart removal
        removeFromGuestCart(id);
        return;
      }
      
      // Authenticated cart removal
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
      }
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito exitosamente",
      });
    },
  });

  const total = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.products?.price || 0) * item.quantity);
  }, 0) || 0;

  const itemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6 animate-fade-in">
            <div className="h-8 skeleton w-48" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="h-24 w-24 skeleton mx-auto sm:mx-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 skeleton w-full sm:w-2/3" />
                          <div className="h-4 skeleton w-2/3 sm:w-1/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="h-64 skeleton" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems?.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Link to="/shop">
            <Button variant="ghost" className="mb-6 hover:bg-primary/10 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continuar comprando
            </Button>
          </Link>
          
          <Card className="max-w-2xl mx-auto animate-scale-in">
            <CardContent className="p-8 md:p-16 text-center">
              <ShoppingBag className="h-16 md:h-20 w-16 md:w-20 text-muted-foreground mx-auto mb-6 animate-bounce-subtle" />
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-8 text-sm md:text-base">
                Explora nuestra tienda y encuentra productos increíbles
              </p>
              <Link to="/shop">
                <Button size="lg" className="shadow-lg hover:shadow-xl transition-all hover-lift">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Explorar productos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/shop">
          <Button variant="ghost" className="mb-6 hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar comprando
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Mi Carrito</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {itemCount} {itemCount === 1 ? "producto" : "productos"} en tu carrito
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems?.map((item) => {
              const product = item.products;
              const primaryImage = product?.product_images?.find((img: any) => img.is_primary);
              const subtotal = Number(product?.price || 0) * item.quantity;
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-up hover-lift">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <Link to={`/product/${product?.id}`} className="shrink-0 mx-auto sm:mx-0">
                        <div className="relative w-24 sm:w-28 h-24 sm:h-28 rounded-lg overflow-hidden group">
                          {primaryImage ? (
                            <img
                              src={primaryImage.image_url}
                              alt={product?.name}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <Link to={`/product/${product?.id}`}>
                          <h3 className="font-bold text-base md:text-lg hover:text-primary transition-colors line-clamp-2 mb-2">
                            {product?.name}
                          </h3>
                        </Link>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-4">
                          <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 transition-all hover:scale-110 active:scale-95"
                          onClick={() => updateQuantity.mutate({
                            id: user ? item.id : item.product_id,
                            quantity: Math.max(1, item.quantity - 1)
                          })}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-bold text-base md:text-lg">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 transition-all hover:scale-110 active:scale-95"
                          onClick={() => updateQuantity.mutate({
                            id: user ? item.id : item.product_id,
                            quantity: Math.min(product?.stock || 0, item.quantity + 1)
                          })}
                          disabled={item.quantity >= (product?.stock || 0)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                          </div>
                          
                          {item.quantity >= (product?.stock || 0) && (
                            <Badge variant="secondary" className="text-xs animate-fade-in">
                              Máximo disponible
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                        <div className="text-center sm:text-right">
                          <p className="text-xs md:text-sm text-muted-foreground mb-1">Precio unitario</p>
                          <p className="text-base md:text-lg font-semibold text-primary">
                            S/ {Number(product?.price || 0).toFixed(2)}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-center sm:items-end gap-2">
                          <div className="text-center sm:text-right">
                            <p className="text-xs text-muted-foreground">Subtotal</p>
                            <p className="text-xl md:text-2xl font-bold">
                              S/ {subtotal.toFixed(2)}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all hover:scale-105"
                            onClick={() => removeItem.mutate(user ? item.id : item.product_id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div>
            <Card className="sticky top-4 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Resumen de compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-muted-foreground">Subtotal ({itemCount} {itemCount === 1 ? "producto" : "productos"})</span>
                    <span className="font-semibold">S/ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-muted-foreground">Envío</span>
                    <Badge variant="secondary" className="text-xs md:text-sm">Gratis</Badge>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between text-lg md:text-xl">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary animate-pulse-ring">S/ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 transition-all hover:bg-primary/10">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Envío a todo el Perú</p>
                      <p className="text-xs text-muted-foreground">
                        Productos en stock listos para enviar
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  size="lg"
                  className="w-full shadow-lg hover:shadow-xl h-12 md:h-14 text-base md:text-lg transition-all hover-lift"
                  onClick={() => navigate("/checkout")}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Proceder al pago
                </Button>
                <Link to="/shop" className="w-full">
                  <Button variant="outline" size="lg" className="w-full transition-all hover:bg-primary/5">
                    Seguir comprando
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}