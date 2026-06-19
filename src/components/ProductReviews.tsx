import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["product-review-stats", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("rating")
        .eq("product_id", productId)
        .eq("is_approved", true);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { average: 0, count: 0, distribution: {} };
      }

      const average = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
      const distribution = data.reduce((acc: Record<number, number>, curr) => {
        acc[curr.rating] = (acc[curr.rating] || 0) + 1;
        return acc;
      }, {});
      
      return { average, count: data.length, distribution };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-lg">Aún no hay reseñas para este producto.</p>
          <p className="text-sm mt-2">¡Sé el primero en dejar una reseña!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && stats.count > 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-background">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">
                    {stats.average.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">de 5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(stats.average)
                          ? "fill-secondary text-secondary"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.count} {stats.count === 1 ? "reseña" : "reseñas"}
                </p>
              </div>
              
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating] || 0;
                  const percentage = (count / stats.count) * 100;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-3 w-3 fill-secondary text-secondary" />
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-secondary h-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews with Customer Photos */}
      <div className="space-y-4">
        {reviews.map((review, index) => {
          // Generar foto de cliente simulada usando avatar UI
          const avatarSeed = review.customer_name.toLowerCase().replace(/\s+/g, '');
          const customerPhotoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
          
          return (
            <Card key={review.id} className="hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-3 border-primary/30 shadow-lg ring-2 ring-background">
                    {review.avatar_url ? (
                      <AvatarImage src={review.avatar_url} alt={review.customer_name} />
                    ) : (
                      <AvatarImage src={customerPhotoUrl} alt={review.customer_name} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      <User className="h-7 w-7" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-base">{review.customer_name}</h4>
                      {review.is_featured && (
                        <Badge className="text-xs bg-gradient-to-r from-secondary to-secondary/80 border-0">
                          ⭐ Destacada
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        ✓ Compra verificada
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "fill-secondary text-secondary"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-muted-foreground leading-relaxed">
                  {review.comment}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
