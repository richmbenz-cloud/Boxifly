import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const reviewSchema = z.object({
  customer_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  comment: z.string().min(10, "El comentario debe tener al menos 10 caracteres").max(1000, "El comentario no puede exceder 1000 caracteres"),
  rating: z.number().min(1, "Debes seleccionar una calificación").max(5),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ProductReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export function ProductReviewForm({ productId, onReviewSubmitted }: ProductReviewFormProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      customer_name: "",
      comment: "",
      rating: 0,
    },
  });

  const rating = form.watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("testimonials")
      .insert({
        product_id: productId,
        customer_name: data.customer_name,
        comment: data.comment,
        rating: data.rating,
        is_approved: false, // Requires admin approval
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar tu reseña. Intenta nuevamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Reseña enviada!",
        description: "Tu reseña será publicada una vez aprobada por nuestro equipo.",
      });
      form.reset();
      onReviewSubmitted?.();
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deja tu reseña</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación *</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= (hoveredRating || rating)
                                ? "fill-secondary text-secondary"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tu nombre *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tu opinión *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre tu experiencia con este producto..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Reseña"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
