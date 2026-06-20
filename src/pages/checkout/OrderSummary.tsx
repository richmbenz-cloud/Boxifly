import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Package, Gift, CheckCircle, CreditCard } from "lucide-react";
import { CouponInput } from "@/components/CouponInput";

interface OrderSummaryProps {
  cartItems: any[];
  user: any;
  userPoints: number;
  maxPointsUsable: number;
  pointsToUse: number;
  setPointsToUse: (val: number) => void;
  showCoupon: boolean;
  setShowCoupon: (val: boolean) => void;
  subtotal: number;
  couponDiscount: number;
  pointsDiscount: number;
  total: number;
  itemCount: number;
  isFormValid: any;
  isPending: boolean;
  handleCouponApplied: (discount: number, code: string) => void;
  onPay: () => void;
}

export const OrderSummary = ({
  cartItems,
  user,
  userPoints,
  maxPointsUsable,
  pointsToUse,
  setPointsToUse,
  showCoupon,
  setShowCoupon,
  subtotal,
  couponDiscount,
  pointsDiscount,
  total,
  itemCount,
  isFormValid,
  isPending,
  handleCouponApplied,
  onPay,
}: OrderSummaryProps) => {
  return (
          <div>
            <Card className="sticky top-4 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                  {cartItems.map(item => {
                    const product = item.products;
                    const primaryImage = product?.product_images?.find((img: any) => img.is_primary);
                    
                    return (
                      <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="relative w-14 h-14 rounded overflow-hidden shrink-0">
                          {primaryImage ? (
                            <img
                              src={primaryImage.image_url}
                              alt={product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {item.quantity}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2 mb-1">
                            {product?.name}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            S/ {(Number(product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                {/* Loyalty Points Redemption */}
                {user && userPoints > 0 && (
                  <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Puntos de fidelidad</span>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {userPoints} pts
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Usar puntos (1 punto = S/1)</span>
                        <span>Máximo: {maxPointsUsable} pts</span>
                      </div>
                      
                      <Slider
                        value={[pointsToUse]}
                        onValueChange={(value) => setPointsToUse(value[0])}
                        max={maxPointsUsable}
                        step={1}
                        className="w-full"
                        disabled={maxPointsUsable === 0}
                      />
                      
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">
                          Puntos a usar:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {pointsToUse}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            pts
                          </span>
                        </div>
                      </div>
                      
                      {pointsToUse > 0 && (
                        <div className="flex justify-between text-xs pt-2 border-t">
                          <span className="text-success font-medium">Descuento:</span>
                          <span className="text-success font-bold">-S/ {pointsToUse.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Los puntos usados se descontarán después de confirmar tu pedido
                    </p>
                  </div>
                )}

                {/* Coupon Input - Discrete */}
                {!showCoupon ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCoupon(true)}
                    className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                  >
                    ¿Tienes un cupón?
                  </Button>
                ) : (
                  <div className="animate-fade-in">
                    <CouponInput 
                      subtotal={subtotal}
                      onCouponApplied={handleCouponApplied}
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium">S/ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-success animate-fade-in">
                      <span>Descuento cupón</span>
                      <span className="font-medium">-S/ {couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {pointsToUse > 0 && (
                    <div className="flex justify-between text-sm text-success animate-fade-in">
                      <span className="flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        Descuento puntos
                      </span>
                      <span className="font-medium">-S/ {pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <Badge variant="secondary" className="text-xs">Incluido</Badge>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between text-xl">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">S/ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>Productos auténticos</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                    <span>30 días devoluciones</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full shadow-lg hover:shadow-xl h-12 text-base transition-all"
                  onClick={onPay}
                  disabled={!isFormValid || isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isPending ? "Procesando..." : `Pagar S/ ${total.toFixed(2)}`}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Compra 100% segura
                </p>
              </CardContent>
            </Card>
          </div>
  );
};
