import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, X, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCartContext } from "@/context/CartContext";

interface ShopHeaderProps {
  onSearch?: (query: string) => void;
  onCategorySelect?: (categoryId: string) => void;
  categories?: Array<{ id: string; name: string }>;
  onCartOpen?: () => void;
}

export function ShopHeader({ onSearch, onCategorySelect, categories, onCartOpen }: ShopHeaderProps) {
  const { cartCount } = useCartContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search suggestions query
  const { data: searchSuggestions } = useQuery({
    queryKey: ["search-suggestions", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
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
          ),
          categories (
            name
          )
        `)
        .eq("is_active", true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(6);

      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length >= 2,
  });

  // Popular searches query
  const { data: popularProducts } = useQuery({
    queryKey: ["popular-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .eq("is_active", true)
        .eq("featured", true)
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) onSearch(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b animate-fade-in">
      {/* Top Bar - Promoción */}
      <div className="bg-primary text-primary-foreground hidden md:block">
        <div className="container mx-auto px-4 py-2">
          <p className="text-center text-sm font-medium">
            🎉 Envío gratis en compras mayores a S/ 150 | 24/7 Atención al cliente
          </p>
        </div>
      </div>

      {/* Search and Cart Section */}
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex h-10 md:h-14 items-center justify-between gap-2 md:gap-4">

          {/* Desktop Search Bar with Autocomplete */}
          <div className="hidden md:flex flex-1 max-w-2xl" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="Buscar productos, marcas, categorías..."
                className="pl-10 pr-4 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 z-10"
                  onClick={() => {
                    setSearchQuery("");
                    if (onSearch) onSearch("");
                    setShowSuggestions(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-96 overflow-y-auto">
                  {searchSuggestions && searchSuggestions.length > 0 ? (
                    <div className="p-2">
                      <p className="text-xs font-semibold text-muted-foreground px-3 py-2">
                        Resultados
                      </p>
                      {searchSuggestions.map((product) => {
                        const primaryImage = product.product_images?.find((img: any) => img.is_primary);
                        return (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={handleSuggestionClick}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-muted">
                              {primaryImage ? (
                                <img
                                  src={primaryImage.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm font-bold text-primary">
                                  S/ {Number(product.price).toFixed(2)}
                                </p>
                                {product.stock > 0 ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {product.stock} disponibles
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    Agotado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-6 text-center">
                      <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium mb-1">No se encontraron resultados</p>
                      <p className="text-xs text-muted-foreground">
                        Intenta con otros términos de búsqueda
                      </p>
                    </div>
                  ) : null}

                  {/* Popular Products */}
                  {!searchQuery && popularProducts && popularProducts.length > 0 && (
                    <div className="p-2 border-t">
                      <div className="flex items-center gap-2 px-3 py-2">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <p className="text-xs font-semibold text-muted-foreground">
                          Búsquedas populares
                        </p>
                      </div>
                      {popularProducts.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={handleSuggestionClick}
                          className="block px-3 py-2 text-sm hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          {product.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
            </form>
          </div>

          {/* Cart Button - Desktop Only */}
          <div className="hidden md:flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-scale-in"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search with Cart */}
        <div className="md:hidden pb-1 flex items-center gap-2" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10 pr-4 w-full"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(searchQuery.length >= 2)}
              />
              
              {/* Search Suggestions for Mobile */}
              {showSuggestions && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-72 overflow-y-auto">
                  {searchSuggestions && searchSuggestions.length > 0 ? (
                    <div className="p-2">
                      {searchSuggestions.map((product) => {
                        const primaryImage = product.product_images?.find((img: any) => img.is_primary);
                        return (
                          <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            onClick={handleSuggestionClick}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-muted">
                              {primaryImage ? (
                                <img
                                  src={primaryImage.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs font-bold text-primary">
                                S/ {Number(product.price).toFixed(2)}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-muted-foreground">No se encontraron resultados</p>
                    </div>
                  ) : null}
                </Card>
              )}
            </div>
          </form>
          
          {/* Cart Button for Mobile - Next to Search */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10"
              onClick={onCartOpen}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>


      {/* Categories Bar */}
      {categories && categories.length > 0 && (
        <div className="border-t hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
              <Button
                variant="ghost"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => onCategorySelect && onCategorySelect("all")}
              >
                Todas las categorías
              </Button>
              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => onCategorySelect && onCategorySelect(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
