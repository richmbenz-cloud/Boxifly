import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tag, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CouponInputProps {
  subtotal: number;
  onCouponApplied: (discount: number, couponCode: string) => void;
}

export function CouponInput({ subtotal, onCouponApplied }: CouponInputProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const { toast } = useToast();

  const validateCoupon = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        throw new Error("Cupón no válido");
      }

      // Verificar si el cupón está expirado
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error("Este cupón ha expirado");
      }

      // Verificar si alcanzó el máximo de usos
      if (data.max_uses && data.used_count >= data.max_uses) {
        throw new Error("Este cupón ya no está disponible");
      }

      // Verificar monto mínimo de compra
      if (data.min_purchase_amount && subtotal < data.min_purchase_amount) {
        throw new Error(`Compra mínima requerida: S/ ${data.min_purchase_amount}`);
      }

      return data;
    },
    onSuccess: (data) => {
      const discount =
        data.discount_type === "percentage"
          ? subtotal * (data.discount_value / 100)
          : data.discount_value;

      setAppliedCoupon(data);
      onCouponApplied(discount, data.code);
      
      toast({
        title: "¡Cupón aplicado!",
        description: `Has ahorrado S/ ${discount.toFixed(2)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!couponCode.trim()) return;
    validateCoupon.mutate(couponCode.trim());
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    onCouponApplied(0, "");
  };

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Código de cupón"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApply()}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleApply} 
            disabled={!couponCode.trim() || validateCoupon.isPending}
            variant="outline"
          >
            {validateCoupon.isPending ? "Verificando..." : "Aplicar"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <div className="font-semibold text-success">
                Cupón aplicado: {appliedCoupon.code}
              </div>
              <div className="text-sm text-muted-foreground">
                {appliedCoupon.discount_type === "percentage" 
                  ? `${appliedCoupon.discount_value}% de descuento`
                  : `S/ ${appliedCoupon.discount_value} de descuento`}
              </div>
            </div>
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleRemove}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
