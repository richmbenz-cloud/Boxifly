import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductVariantSelectorProps {
  productId: string;
  onVariantSelect: (variantId: string | null, priceModifier: number) => void;
}

export function ProductVariantSelector({ productId, onVariantSelect }: ProductVariantSelectorProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { data: variants, isLoading } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .eq("is_available", true)
        .order("variant_type")
        .order("variant_value");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded" />;
  }

  if (!variants || variants.length === 0) return null;

  const variantTypes = [...new Set(variants.map(v => v.variant_type))];

  const handleVariantSelect = (type: string, variantId: string, value: string, priceModifier: number) => {
    const newSelected = { ...selectedVariants, [type]: value };
    setSelectedVariants(newSelected);
    
    const allSelected = variantTypes.every(t => newSelected[t]);
    if (allSelected) {
      const totalModifier = variants
        .filter(v => Object.values(newSelected).includes(v.variant_value))
        .reduce((sum, v) => sum + Number(v.price_modifier || 0), 0);
      onVariantSelect(variantId, totalModifier);
    } else {
      onVariantSelect(null, 0);
    }
  };

  const getColorCode = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'negro': '#000000',
      'blanco': '#FFFFFF',
      'rojo': '#DC2626',
      'azul': '#2563EB',
      'verde': '#16A34A',
      'amarillo': '#EAB308',
      'naranja': '#EA580C',
      'rosa': '#EC4899',
      'morado': '#9333EA',
      'gris': '#6B7280',
      'rojo/blanco': '#DC2626',
      'azul marino': '#1E3A8A',
      'titanio natural': '#D4D4D8',
    };
    return colorMap[colorName.toLowerCase()] || '#6B7280';
  };

  return (
    <div className="space-y-6">
      {variantTypes.map(type => {
        const typeVariants = variants.filter(v => v.variant_type === type);
        const selectedValue = selectedVariants[type];
        const selectedVariant = typeVariants.find(v => v.variant_value === selectedValue);
        
        return (
          <div key={type} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">
                {type === 'size' ? 'Talla' : 
                 type === 'color' ? 'Color' : 
                 type === 'storage' ? 'Almacenamiento' : type}
              </h3>
              {selectedVariant && (
                <Badge variant="secondary" className="text-xs">
                  {selectedVariant.variant_value}
                  {selectedVariant.price_modifier > 0 && ` +S/ ${Number(selectedVariant.price_modifier).toFixed(2)}`}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {typeVariants.map(variant => {
                const isSelected = selectedVariants[type] === variant.variant_value;
                const isColor = type === 'color';
                const isLowStock = variant.stock <= 5 && variant.stock > 0;
                
                return (
                  <Button
                    key={variant.id}
                    variant={isSelected ? "default" : "outline"}
                    size="lg"
                    className={`relative h-auto py-3 px-2 flex flex-col items-center gap-2 ${
                      isSelected ? "ring-2 ring-primary shadow-lg" : ""
                    } ${isLowStock && !isSelected ? "border-orange-500/50" : ""}`}
                    onClick={() => handleVariantSelect(
                      type,
                      variant.id,
                      variant.variant_value,
                      Number(variant.price_modifier || 0)
                    )}
                    disabled={variant.stock === 0}
                  >
                    {isColor && (
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-border shadow-sm"
                        style={{ 
                          backgroundColor: getColorCode(variant.variant_value),
                          boxShadow: variant.variant_value.toLowerCase().includes('blanco') ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none'
                        }}
                      />
                    )}
                    <span className={`text-xs font-medium text-center leading-tight ${
                      isColor ? 'max-w-[80px] line-clamp-2' : ''
                    }`}>
                      {variant.variant_value}
                    </span>
                    {variant.price_modifier && Number(variant.price_modifier) > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        +S/ {Number(variant.price_modifier).toFixed(0)}
                      </span>
                    )}
                    {isLowStock && (
                      <Badge variant="outline" className="absolute -top-1 -right-1 text-[9px] px-1 py-0 h-4 bg-orange-500 text-white border-orange-600">
                        {variant.stock}
                      </Badge>
                    )}
                    {variant.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-sm rounded text-xs font-semibold text-destructive">
                        Agotado
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
            
            {selectedValue && typeVariants.some(v => v.variant_value === selectedValue && v.stock <= 5 && v.stock > 0) && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-600" />
                Pocas unidades disponibles
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
