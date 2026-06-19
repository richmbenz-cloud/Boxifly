import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductImageUploadProps {
  productId?: string;
  existingImages?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
  onImagesChange?: (images: string[]) => void;
  maxImages?: number;
}

export function ProductImageUpload({ 
  productId,
  existingImages = [],
  onImagesChange,
  maxImages = 5 
}: ProductImageUploadProps) {
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    existingImages.map(img => img.image_url)
  );
  const [previewImages, setPreviewImages] = useState<Array<{ url: string; file?: File }>>(
    existingImages.map(img => ({ url: img.image_url }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const validateImage = (file: File): { valid: boolean; error?: string } => {
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Solo se permiten archivos JPG, PNG o WEBP' 
      };
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'El archivo no debe superar 5 MB' 
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (previewImages.length + files.length > maxImages) {
      toast({
        title: 'Límite alcanzado',
        description: `Solo puedes subir máximo ${maxImages} imágenes`,
        variant: 'destructive',
      });
      return;
    }

    // Validar cada archivo
    for (const file of files) {
      const validation = validateImage(file);
      if (!validation.valid) {
        toast({
          title: 'Archivo inválido',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }
    }

    // Crear previews
    const newPreviews = await Promise.all(
      files.map(async (file) => ({
        url: URL.createObjectURL(file),
        file
      }))
    );

    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);

    try {
      const filesToUpload = previewImages
        .filter(img => img.file)
        .map(img => img.file!);

      const uploadPromises = filesToUpload.map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length > 0) {
        const allImageUrls = [
          ...uploadedImages.filter(url => 
            !previewImages.find(p => p.url === url && !p.file)
          ),
          ...validUrls
        ];
        
        setUploadedImages(allImageUrls);
        setPreviewImages(allImageUrls.map(url => ({ url })));
        onImagesChange?.(allImageUrls);

        toast({
          title: 'Imágenes subidas',
          description: `${validUrls.length} imagen(es) subida(s) exitosamente`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error al subir imágenes',
        description: 'Por favor intenta nuevamente',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setPreviewImages(newPreviews);
    
    const newUrls = newPreviews
      .filter(img => !img.file)
      .map(img => img.url);
    
    setUploadedImages(newUrls);
    onImagesChange?.(newUrls);
  };

  const hasPendingUploads = previewImages.some(img => img.file);

  return (
    <div className="space-y-4">
      <div>
        <Label>Imágenes del Producto</Label>
        <p className="text-sm text-muted-foreground">
          JPG, PNG o WEBP. Máximo 5 MB por imagen. Máximo {maxImages} imágenes.
        </p>
      </div>

      {/* Preview Grid */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previewImages.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg border border-border bg-muted overflow-hidden group"
            >
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>

              {preview.file && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Pendiente
                </div>
              )}

              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Label
          htmlFor="product-images"
          className="flex-1 cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent transition-colors">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              Seleccionar imágenes
            </span>
          </div>
          <input
            id="product-images"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={previewImages.length >= maxImages}
          />
        </Label>

        {hasPendingUploads && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Subiendo...' : 'Subir Imágenes'}
          </Button>
        )}
      </div>

      {hasPendingUploads && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-400">
            Tienes {previewImages.filter(p => p.file).length} imagen(es) pendiente(s) de subir. 
            Haz clic en "Subir Imágenes" para guardarlas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
