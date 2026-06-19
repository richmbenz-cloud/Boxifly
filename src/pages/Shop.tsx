import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Package, Filter, X, SlidersHorizontal, TrendingUp, Flame } from "lucide-react";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { ChatWidget } from "@/components/ChatWidget";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { useCartContext } from "@/context/CartContext";
import { ShopHeader } from "@/components/ShopHeader";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { MainNavigation } from "@/components/MainNavigation";
import { SEO } from '@/components/SEO';

interface ShopProps {
  onCartOpen?: () => void;
}

export default function Shop({ onCartOpen }: ShopProps) {
  const { addToCart } = useCartContext();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Advanced filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [showInStock, setShowInStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
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
        .eq("is_active", true);

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      // Sorting
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      } else if (sortBy === "featured") {
        query = query.eq("featured", true).order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Calculate max price for slider
      if (data && data.length > 0) {
        const prices = data.map(p => Number(p.price));
        const calculatedMaxPrice = Math.ceil(Math.max(...prices));
        setMaxPrice(calculatedMaxPrice);
        setPriceRange([0, calculatedMaxPrice]);
      }
      
      return data;
    },
  });

  const filteredProducts = products?.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Price filter
    const productPrice = Number(product.price);
    const matchesPrice = productPrice >= priceRange[0] && productPrice <= priceRange[1];
    
    // Stock filter
    let matchesStock = true;
    if (showInStock && !showOutOfStock) {
      matchesStock = product.stock > 0;
    } else if (showOutOfStock && !showInStock) {
      matchesStock = product.stock === 0;
    }
    
    return matchesSearch && matchesPrice && matchesStock;
  });

  const activeFiltersCount = 
    (showInStock ? 1 : 0) + 
    (showOutOfStock ? 1 : 0) + 
    (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0);

  const clearAllFilters = () => {
    setPriceRange([0, maxPrice]);
    setShowInStock(false);
    setShowOutOfStock(false);
    setSelectedCategory("all");
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Rango de precio</Label>
        <div className="pt-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={maxPrice}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between mt-3 text-sm">
            <span className="font-medium">S/ {priceRange[0]}</span>
            <span className="font-medium">S/ {priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Availability Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Disponibilidad</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={showInStock}
              onCheckedChange={(checked) => setShowInStock(checked as boolean)}
            />
            <Label
              htmlFor="in-stock"
              className="text-sm font-normal cursor-pointer"
            >
              En stock
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="out-of-stock"
              checked={showOutOfStock}
              onCheckedChange={(checked) => setShowOutOfStock(checked as boolean)}
            />
            <Label
              htmlFor="out-of-stock"
              className="text-sm font-normal cursor-pointer"
            >
              Agotado
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Categorías</Label>
        <div className="space-y-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => setSelectedCategory("all")}
          >
            Todas las categorías
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros ({activeFiltersCount})
          </Button>
        </>
      )}
    </div>
  );

  const handleAddToCart = async (productId: string) => {
    await addToCart.mutateAsync({ productId, quantity: 1 });
    
    // Abrir carrito automáticamente después de que los datos se actualicen
    setTimeout(() => {
      if (onCartOpen) {
        onCartOpen();
      }
    }, 800);
  };

  return (
    <>
      <NewsletterPopup />
      <ChatWidget />
      <SEO title="Tienda online Boxifly: productos importados desde EE.UU." description="Compra productos importados desde EE.UU. con entrega en Perú. Catálogo curado, precios claros y pago seguro con Izipay." path="/shop" />
      <MainNavigation />
      
      {/* Header with Search and Categories */}
      <ShopHeader
        onSearch={setSearchQuery}
        onCategorySelect={setSelectedCategory}
        categories={categories}
        onCartOpen={onCartOpen}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <div className="container mx-auto px-4 py-8">
          {/* Header with Filters */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Todos los Productos</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredProducts?.length || 0} productos encontrados
                </p>
              </div>
              
              {/* Mobile Filter Button */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSection />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="hidden md:flex"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Desktop Filters Sidebar */}
            <div className="hidden md:block">
              <Card className="sticky top-20 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filtros
                    </h3>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary">{activeFiltersCount}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <FilterSection />
                </CardContent>
              </Card>
            </div>

            {/* Products Grid */}
            <div className="md:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(9)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="p-0">
                        <div className="h-48 sm:h-56 skeleton rounded-t" />
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="h-4 skeleton mb-2" />
                        <div className="h-4 skeleton w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts?.length === 0 ? (
                <Card className="animate-scale-in">
                  <CardContent className="flex flex-col items-center justify-center py-12 md:py-16">
                    <Package className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mb-4 animate-bounce-subtle" />
                    <h3 className="text-lg md:text-xl font-semibold mb-2">No se encontraron productos</h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-4 text-center px-4">
                      Intenta con otros filtros o términos de búsqueda
                    </p>
                    <Button variant="outline" onClick={clearAllFilters} className="hover-lift">
                      Limpiar filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts?.map((product, index) => {
                    const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url;
                    const allImages = product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
                    
                    return (
                      <Card 
                        key={product.id} 
                        className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift animate-slide-up"
                        style={{ animationDelay: `${(index % 9) * 0.05}s` }}
                      >
                        <CardHeader className="p-0 relative overflow-hidden">
                          <Link to={`/product/${product.id}`}>
                            <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-background to-muted/30">
                              {primaryImage ? (
                                <>
                                  <img
                                    src={primaryImage}
                                    alt={product.name}
                                    loading="lazy"
                                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                  />
                                  {allImages[1] && (
                                    <img
                                      src={allImages[1].image_url}
                                      alt={product.name}
                                      loading="lazy"
                                      className="absolute inset-0 w-full h-full object-contain p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                  )}
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                  <Package className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </Link>
                          
                          {/* Urgency & Scarcity Badges */}
                          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                            {product.featured && (
                              <Badge className="bg-gradient-to-r from-secondary to-orange-500 border-0 shadow-lg animate-pulse-ring">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Best Seller
                              </Badge>
                            )}
                            {product.stock > 0 && product.stock <= 5 && (
                              <Badge variant="destructive" className="shadow-lg animate-pulse">
                                <Flame className="h-3 w-3 mr-1 fill-current" />
                                ¡Solo {product.stock}!
                              </Badge>
                            )}
                          </div>
                          
                          {product.stock === 0 && (
                            <Badge variant="destructive" className="absolute top-2 right-2 z-10 animate-fade-in shadow-lg">
                              Agotado
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="p-4">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          {product.categories && (
                            <Badge variant="outline" className="mb-2 text-xs">
                              {product.categories.name}
                            </Badge>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-primary">
                              S/ {Number(product.price).toFixed(2)}
                            </p>
                            {product.stock > 0 && (
                              <div>
                                {product.stock <= 5 ? (
                                  <Badge variant="destructive" className="text-xs animate-pulse">
                                    ⚠️ {product.stock === 1 ? "Última" : `Últimas ${product.stock}`}
                                  </Badge>
                                ) : product.stock <= 10 ? (
                                  <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-700 border-orange-200">
                                    🔥 {product.stock} disponibles
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    {product.stock} disponibles
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button
                            className="w-full shadow-md hover:shadow-lg transition-all hover-lift"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Guarantee Section */}
        <GuaranteeSection />
      </div>
    </>
  );
}
