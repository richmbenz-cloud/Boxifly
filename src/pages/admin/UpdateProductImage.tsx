import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon } from "lucide-react";
import iphoneImage from "@/assets/products/iphone-17-pro-max-improved.jpg";

export default function UpdateProductImage() {
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const { data: products } = useQuery({
    queryKey: ["products-for-image-update"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleUpdateImage = async () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Selecciona un producto primero",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Fetch the image from src/assets
      const response = await fetch(iphoneImage);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `${selectedProduct}-${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('product-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Set all other images for this product as non-primary
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', selectedProduct);

      // Insert new image record
      const { error: dbError } = await supabase
        .from('product_images')
        .insert({
          product_id: selectedProduct,
          image_url: publicUrl,
          is_primary: true,
          display_order: 0
        });

      if (dbError) throw dbError;

      toast({
        title: "Imagen actualizada",
        description: "La imagen del producto se actualizó exitosamente",
      });

      setSelectedProduct("");
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-6 w-6" />
              Actualizar Imagen de Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vista previa de la nueva imagen</Label>
              <div className="border rounded-lg p-4 bg-gradient-to-br from-background to-muted/30">
                <img
                  src={iphoneImage}
                  alt="iPhone 17 Pro Max - Nueva imagen"
                  className="w-full h-64 object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Esta imagen mejorada del iPhone 17 Pro Max se subirá al producto seleccionado
              </p>
            </div>

            <Button
              onClick={handleUpdateImage}
              disabled={!selectedProduct || uploading}
              className="w-full"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Subiendo..." : "Actualizar Imagen"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
