import { useState, useMemo } from "react";
import { Search, Store, ExternalLink, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useFavoriteStores } from "@/hooks/useFavoriteStores";
import { useAuth } from "@/lib/auth";
import storesData from "@/data/storesData.json";
import { SEO } from "@/components/SEO";

const TiendasEnUSA = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const { user } = useAuth();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoriteStores();

  // Filtrar tiendas según búsqueda y categoría
  const filteredCategories = useMemo(() => {
    let filtered = storesData.categories;

    // Filtrar por categoría seleccionada
    if (selectedCategory !== "all") {
      filtered = filtered.filter((cat) => cat.id === selectedCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .map((category) => ({
          ...category,
          stores: category.stores.filter((store) =>
            store.name.toLowerCase().includes(query)
          ),
        }))
        .filter((category) => category.stores.length > 0);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const totalStores = storesData.categories.reduce(
    (sum, cat) => sum + cat.stores.length,
    0
  );

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFavoriteToggle = async (
    e: React.MouseEvent,
    store: { name: string; url: string; domain: string },
    category: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite(store.domain)) {
      await removeFavorite(store.domain);
    } else {
      await addFavorite({
        name: store.name,
        url: store.url,
        domain: store.domain,
        category,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Tiendas recomendadas en EE.UU. | Boxifly"
        description="Catálogo curado de tiendas online de EE.UU.: moda, tecnología, hogar y más. Compra y recibe en Perú con Boxifly."
        path="/tiendas-en-usa"
      />
      {/* Hero Section */}
      <section
        ref={heroAnimation.ref}
        className={`relative py-20 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background transition-all duration-1000 ${
          heroAnimation.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Store className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              Más de {totalStores} tiendas disponibles
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            Tiendas en USA
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Descubre el catálogo completo de tiendas estadounidenses con envío
            internacional. Compra en tus marcas favoritas y recibe en Perú con
            Boxifly.
          </p>

          {/* Buscador y Filtros */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar tienda por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {storesData.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navegación rápida por categorías */}
          {selectedCategory === "all" && !searchQuery && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {storesData.categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToCategory(category.id)}
                  className="text-xs"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tiendas Favoritas */}
      {user && favorites.length > 0 && selectedCategory === "all" && !searchQuery && (
        <section className="py-8 px-4 bg-primary/5">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                Mis Tiendas Favoritas
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favorites.map((favorite) => (
                <a
                  key={favorite.id}
                  href={favorite.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-card border border-primary/30 rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all duration-300"
                  title={`Visitar ${favorite.store_name}`}
                >
                  <button
                    onClick={(e) =>
                      handleFavoriteToggle(
                        e,
                        {
                          name: favorite.store_name,
                          url: favorite.store_url,
                          domain: favorite.store_domain,
                        },
                        favorite.category
                      )
                    }
                    className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
                    aria-label="Eliminar de favoritos"
                  >
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                  </button>

                  <div className="aspect-square flex items-center justify-center mb-3 relative">
                    <img
                      src={`https://logo.clearbit.com/${favorite.store_domain}`}
                      alt={`Logo de ${favorite.store_name}`}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://www.google.com/s2/favicons?domain=${favorite.store_domain}&sz=128`;
                      }}
                    />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <p className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary transition-colors">
                    {favorite.store_name}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorías y Tiendas */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No se encontraron tiendas
              </h3>
              <p className="text-muted-foreground">
                Intenta con otra búsqueda o categoría
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  id={category.id}
                  className="scroll-mt-24"
                >
                  {/* Título de Categoría */}
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {category.name}
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full" />
                  </div>

                  {/* Grid de Logos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {category.stores.map((store, index) => (
                      <a
                        key={`${store.name}-${index}`}
                        href={store.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-primary/50"
                        title={`Visitar ${store.name}`}
                      >
                        {/* Botón de Favorito */}
                        {user && (
                          <button
                            onClick={(e) =>
                              handleFavoriteToggle(e, store, category.name)
                            }
                            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 hover:bg-background transition-colors"
                            aria-label={
                              isFavorite(store.domain)
                                ? "Eliminar de favoritos"
                                : "Agregar a favoritos"
                            }
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                isFavorite(store.domain)
                                  ? "text-primary fill-primary"
                                  : "text-muted-foreground hover:text-primary"
                              }`}
                            />
                          </button>
                        )}

                        {/* Logo Container */}
                        <div className="aspect-square flex items-center justify-center mb-3 relative">
                          <img
                            src={`https://logo.clearbit.com/${store.domain}`}
                            alt={`Logo de ${store.name}`}
                            loading="lazy"
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              // Fallback a favicon si Clearbit falla
                              const target = e.target as HTMLImageElement;
                              target.src = `https://www.google.com/s2/favicons?domain=${store.domain}&sz=128`;
                            }}
                          />
                          {/* Overlay de hover */}
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ExternalLink className="w-6 h-6 text-primary" />
                          </div>
                        </div>

                        {/* Nombre de la tienda */}
                        <p className="text-sm font-medium text-center line-clamp-2 group-hover:text-primary transition-colors">
                          {store.name}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para empezar a comprar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Compra en cualquiera de estas tiendas y envía tus productos a tu
            casillero en Miami. Nosotros nos encargamos del resto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/auth">Obtener mi casillero</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/cotizador">Calcular envío</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TiendasEnUSA;
