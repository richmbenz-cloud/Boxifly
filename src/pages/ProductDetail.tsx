import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package, Plus, Minus, Truck, Shield, RotateCcw, Star, Zap, Play, ZoomIn, Eye, TrendingUp, Flame } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";
import { ChatWidget } from "@/components/ChatWidget";
import { ProductReviewForm } from "@/components/ProductReviewForm";
import { ProductReviews } from "@/components/ProductReviews";
import { useCartContext } from "@/context/CartContext";
import { SEO } from "@/components/SEO";


import { ShopHeader } from "@/components/ShopHeader";
import { AddToCartAnimation } from "@/components/AddToCartAnimation";
import { CountdownTimer } from "@/components/CountdownTimer";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ProductDetailProps {
  onCartOpen?: () => void;
}

export default function ProductDetail({ onCartOpen }: ProductDetailProps) {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [priceModifier, setPriceModifier] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [showAddToCartAnimation, setShowAddToCartAnimation] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [viewersCount, setViewersCount] = useState(0);

  // Simular contador de personas viendo el producto
  useEffect(() => {
    // Generar número aleatorio entre 5 y 23
    const randomViewers = Math.floor(Math.random() * (23 - 5 + 1)) + 5;
    setViewersCount(randomViewers);

    // Actualizar periódicamente con pequeñas variaciones
    const interval = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(3, Math.min(30, newCount));
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [id]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            id,
            image_url,
            is_primary,
            display_order
          ),
          categories (
            name
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      
      const primary = data.product_images?.find((img: any) => img.is_primary);
      if (primary && !selectedImage) {
        setSelectedImage(primary.image_url);
      }
      
      return data;
    },
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category_id, id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          product_images (
            image_url,
            is_primary
          )
        `)
        .eq("category_id", product.category_id)
        .eq("is_active", true)
        .neq("id", id)
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id && !!id,
  });

  const handleAddToCart = async () => {
    if (!id) return;
    await addToCart.mutateAsync({ productId: id, quantity });
    setQuantity(1);
    
    // Mostrar animación de éxito
    setShowAddToCartAnimation(true);
    
    // Abrir carrito automáticamente con delay
    if (onCartOpen) {
      setTimeout(() => {
        onCartOpen();
      }, 800);
    }
  };

  const handleBuyNow = async () => {
    if (!id) return;
    await addToCart.mutateAsync({ productId: id, quantity });
    navigate("/checkout");
  };

  // Sticky button on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyButton(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse animate-fade-in">
            <div className="h-8 skeleton w-32 mb-8" />
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4">
                <div className="h-[400px] md:h-[500px] skeleton rounded-lg" />
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 md:h-24 skeleton" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 md:h-8 skeleton" />
                <div className="h-10 md:h-12 skeleton w-2/3" />
                <div className="h-24 md:h-32 skeleton" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <ShopHeader categories={[]} onCartOpen={onCartOpen} />
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="animate-scale-in">
            <CardContent className="p-8 md:p-16 text-center">
              <Package className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mx-auto mb-4 animate-bounce-subtle" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Producto no encontrado</h2>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                El producto que buscas no existe o no está disponible
              </p>
              <Link to="/">
                <Button size="lg" className="hover-lift">
                  Volver a la tienda
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const images = product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
  const finalPrice = Number(product.price) + priceModifier;

  const handleVariantSelect = (variantId: string | null, modifier: number) => {
    setSelectedVariant(variantId);
    setPriceModifier(modifier);
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: images[0]?.image_url ? [images[0].image_url] : undefined,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `https://boxifly.lovable.app/product/${product.id}`,
      priceCurrency: "PEN",
      price: finalPrice,
      availability: (product.stock ?? 1) > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <SEO
        title={`${product.name} | Boxifly`}
        description={(product.description || `Compra ${product.name} en Boxifly con entrega en Perú.`).slice(0, 160)}
        path={`/product/${product.id}`}
        ogType="product"
        image={images[0]?.image_url}
        jsonLd={productJsonLd}
      />
      <ChatWidget />
      <AddToCartAnimation show={showAddToCartAnimation} productName={product?.name || ""} />
      
      
      {/* Header */}
      <ShopHeader
        categories={[]}
        onCartOpen={onCartOpen}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 pb-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Image Gallery with Zoom & Video */}
          <div className="space-y-4 animate-fade-in">
            <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow relative group">
              <div className="relative aspect-square bg-gradient-to-br from-background to-muted/30">
                {!showVideo ? (
                  <>
                    {selectedImage || images[0] ? (
                      <Zoom>
                        <img
                          src={selectedImage || images[0]?.image_url}
                          alt={product.name}
                          loading="eager"
                          className="w-full h-full object-contain p-8 cursor-zoom-in"
                        />
                      </Zoom>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-24 md:h-32 w-24 md:w-32 text-muted-foreground" />
                      </div>
                    )}
                    {/* Zoom hint badge */}
                    <Badge className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="h-3 w-3 mr-1" />
                      Click para ampliar
                    </Badge>
                  </>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <video
                      src="https://www.w3schools.com/html/mov_bbb.mp4"
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    >
                      Tu navegador no soporta videos
                    </video>
                  </div>
                )}
                {product.featured && !showVideo && (
                  <Badge className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm animate-bounce-subtle z-10">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Destacado
                  </Badge>
                )}
              </div>
            </Card>
            
            {/* Thumbnails with Video Option */}
            <div className="grid grid-cols-5 gap-2 md:gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {/* Video thumbnail - demo purposes */}
              <Card
                className="cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary hover-lift ring-1 ring-border group relative"
                onClick={() => setShowVideo(true)}
              >
                <div className="aspect-square bg-black/80 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1 left-1 text-[10px] text-white font-semibold">Video</span>
              </Card>
              
              {images.slice(0, 4).map((img: any, index: number) => (
                <Card
                  key={img.id}
                  className={`cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary hover-lift ${
                    selectedImage === img.image_url && !showVideo ? "ring-2 ring-primary shadow-lg animate-scale-in" : "ring-1 ring-border"
                  }`}
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  onClick={() => {
                  setShowVideo(false);
                  setSelectedImage(img.image_url);
                }}
              >
                <div className="aspect-square bg-gradient-to-br from-background to-muted/20">
                  <img
                    src={img.image_url}
                    alt={`${product.name} - Vista ${img.display_order + 1}`}
                    loading="lazy"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </Card>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 md:space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 flex-wrap">
              {product.categories && (
                <Badge variant="secondary" className="text-xs md:text-sm">
                  {product.categories.name}
                </Badge>
              )}
              {product.featured && (
                <Badge className="text-xs md:text-sm bg-gradient-to-r from-secondary to-orange-500 border-0 animate-pulse-ring">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Best Seller
                </Badge>
              )}
              {product.stock <= 10 && product.stock > 0 && (
                <Badge variant="destructive" className="text-xs md:text-sm animate-pulse">
                  <Flame className="h-3 w-3 mr-1 fill-current" />
                  ¡Últimas {product.stock} unidades!
                </Badge>
              )}
            </div>

            {/* Live Viewers Counter */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg px-4 py-2 inline-flex items-center gap-2 animate-fade-in">
              <Eye className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-semibold text-blue-700">
                <span className="tabular-nums">{viewersCount}</span> personas viendo este producto ahora
              </span>
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{product.name}</h1>
              {product.sku && (
                <p className="text-xs md:text-sm text-muted-foreground">SKU: {product.sku}</p>
              )}
            </div>
            
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-3xl md:text-4xl font-bold text-primary animate-pulse-ring">
                S/ {finalPrice.toFixed(2)}
              </p>
              {priceModifier > 0 && (
                <span className="text-xs md:text-sm text-muted-foreground line-through">
                  S/ {Number(product.price).toFixed(2)}
                </span>
              )}
              {product.stock > 0 && (
                <span className="text-xs md:text-sm text-muted-foreground">
                  + Envío incluido
                </span>
              )}
            </div>

            <Separator />

            {/* Product Variants */}
            <ProductVariantSelector 
              productId={product.id}
              onVariantSelect={handleVariantSelect}
            />

            <Separator />

            {/* Countdown Timer for Flash Sale */}
            {product.featured && (
              <CountdownTimer targetDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} />
            )}

            <Separator />

            {product.description && (
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="font-semibold text-base md:text-lg mb-3">Descripción</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Purchase Section */}
            <div className="space-y-4 md:space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {product.stock > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="flex-1">
                      <label className="text-sm font-semibold mb-2 block">Cantidad</label>
                      <div className="flex items-center gap-3 justify-center sm:justify-start">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 md:h-12 w-10 md:w-12 transition-all hover:scale-110 active:scale-95"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="h-4 md:h-5 w-4 md:w-5" />
                        </Button>
                        <span className="w-12 md:w-16 text-center text-xl md:text-2xl font-semibold">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 md:h-12 w-10 md:w-12 transition-all hover:scale-110 active:scale-95"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        >
                          <Plus className="h-4 md:h-5 w-4 md:w-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <label className="text-sm font-semibold mb-2 block">Stock disponible</label>
                      {product.stock <= 5 ? (
                        <Badge variant="destructive" className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2 animate-pulse">
                          ⚠️ {product.stock === 1 ? "Última unidad" : `Últimas ${product.stock} unidades`}
                        </Badge>
                      ) : product.stock <= 10 ? (
                        <Badge variant="secondary" className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2 bg-orange-500/10 text-orange-700 border-orange-200">
                          🔥 Solo quedan {product.stock} unidades
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-sm md:text-base px-3 md:px-4 py-1 md:py-2">
                          ✓ {product.stock} unidades disponibles
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 text-base transition-all hover-lift group"
                      onClick={handleAddToCart}
                      disabled={addToCart.isPending || (product.stock === 0)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      {addToCart.isPending ? "Agregando..." : "Agregar"}
                    </Button>
                    <Button
                      size="lg"
                      className="w-full h-14 text-base shadow-lg hover:shadow-xl transition-all hover-lift group"
                      onClick={handleBuyNow}
                      disabled={addToCart.isPending || (product.stock === 0)}
                    >
                      <Zap className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Comprar Ahora
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 md:p-6 text-center animate-scale-in">
                  <Badge variant="destructive" className="text-base md:text-lg py-2 px-4 md:px-6 mb-3">
                    Producto Agotado
                  </Badge>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Este producto no está disponible actualmente
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Benefits */}
            <div className="grid grid-cols-1 gap-3 md:gap-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Truck className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base">Envío a todo el Perú</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Producto en stock, entrega rápida
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Shield className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base">Compra protegida</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Garantía de producto auténtico
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <RotateCcw className="h-4 md:h-5 w-4 md:w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base">Devoluciones fáciles</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    30 días para cambios y devoluciones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 md:mt-20 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Reseñas de Clientes</h2>
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2">
              <ProductReviews productId={product.id} />
            </div>
            <div>
              <ProductReviewForm productId={product.id} />
            </div>
          </div>
        </div>

        {/* Related Products - Premium Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16 md:mt-20 animate-fade-in">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">También te puede interesar</h2>
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  Ver todo
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((relatedProduct, index) => {
                const primaryImage = relatedProduct.product_images?.find((img: any) => img.is_primary)?.image_url;
                const isLowStock = relatedProduct.stock > 0 && relatedProduct.stock <= 5;
                
                return (
                  <Card 
                    key={relatedProduct.id} 
                    className="group overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 animate-slide-up border-2 border-transparent hover:border-primary/20"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                  <Link to={`/product/${relatedProduct.id}`}>
                    <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-background to-muted/20">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={relatedProduct.name}
                          loading="lazy"
                          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Package className="h-10 md:h-12 w-10 md:w-12 text-muted-foreground" />
                          </div>
                        )}
                        {isLowStock && (
                          <Badge variant="destructive" className="absolute top-2 left-2 text-xs animate-pulse">
                            ¡Últimas unidades!
                          </Badge>
                        )}
                        {relatedProduct.featured && (
                          <Badge className="absolute top-2 right-2 bg-secondary/90 text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Top
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                          <Button size="sm" className="shadow-lg">
                            Ver detalles
                          </Button>
                        </div>
                      </div>
                    </Link>
                    <CardContent className="p-3 md:p-4 space-y-2">
                      <Link to={`/product/${relatedProduct.id}`}>
                        <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                          {relatedProduct.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <p className="text-lg md:text-xl font-bold text-primary">
                          S/ {Number(relatedProduct.price).toFixed(2)}
                        </p>
                        {relatedProduct.stock > 0 ? (
                          <Badge variant="outline" className="text-xs">
                            Stock: {relatedProduct.stock}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Agotado
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Sticky Add to Cart Button */}
      {showStickyButton && product.stock > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-2xl animate-slide-up">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-background to-muted/20">
                  {images[0] ? (
                    <img
                      src={images[0].image_url}
                      alt={product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
                  <p className="text-lg font-bold text-primary">S/ {finalPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
                  onClick={handleAddToCart}
                  disabled={addToCart.isPending}
                >
                  <ShoppingCart className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">Agregar al Carrito</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
