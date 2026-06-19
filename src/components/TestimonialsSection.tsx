import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronLeft, ChevronRight, Users, Package, TrendingUp, Award, ShoppingBag, Plane, Truck, Store, Building2, BadgeCheck } from "lucide-react";

const LANDING_TESTIMONIALS = [
  {
    name: "María González",
    role: "Personal Shopper",
    rating: 5,
    comment:
      "Necesitaba unos Nike Air Jordan que estaban agotados en Perú. Mi shopper los consiguió en 3 días y llegaron impecables. El proceso fue transparente y súper fácil. ¡100% recomendado!",
    avatarUrl: undefined as string | undefined,
    service: "Personal Shopper" as const,
  },
  {
    name: "Carlos Mendoza",
    role: "Viajero",
    rating: 5,
    comment:
      "Viajé con 5 paquetes desde Miami sin complicaciones. La declaración jurada digital y el sistema de tracking son brutales. Gané $200 extra por viaje. Excelente oportunidad.",
    avatarUrl: undefined,
    service: "Viajeros" as const,
  },
  {
    name: "Ana Rodríguez",
    role: "Cliente",
    rating: 5,
    comment:
      "Consolidé 4 paquetes de diferentes tiendas y me ahorré 60% en envío. Llegaron en 8 días directo a mi casa en Lima. El tracking en tiempo real me dio total tranquilidad.",
    avatarUrl: undefined,
    service: "Courier" as const,
  },
  {
    name: "Luis Torres",
    role: "Cliente",
    rating: 5,
    comment:
      "La tienda online tiene productos originales a precios increíbles. Compré un MacBook y llegó en 5 días. El programa de puntos me dio $30 de descuento en mi segunda compra.",
    avatarUrl: undefined,
    service: "Tienda" as const,
  },
  {
    name: "Patricia Silva",
    role: "Cliente VIP",
    rating: 5,
    comment:
      "Llevo 6 meses usando Boxifly para todo: courier, personal shopper y la tienda. Ya soy VIP Gold y los beneficios son increíbles. Mejor que cualquier otra opción del mercado.",
    avatarUrl: undefined,
    service: "Courier" as const,
  },
  {
    name: "Roberto Castillo",
    role: "Aliado Comercial",
    rating: 5,
    comment:
      "Importo productos para mi negocio y Boxifly me da tarifas corporativas competitivas. Consolidación rápida, facturación clara y atención personalizada. Ahorro 40% vs otros couriers.",
    avatarUrl: undefined,
    service: "B2B" as const,
  },
  {
    name: "Sofia Ramírez",
    role: "Cliente",
    rating: 5,
    comment:
      "Primera vez usando courier internacional y fue perfecto. Me ayudaron con todas mis dudas, las fotos del paquete en warehouse me dieron tranquilidad. Llegó en perfecto estado a Arequipa.",
    avatarUrl: undefined,
    service: "Courier" as const,
  },
  {
    name: "Diego Paredes",
    role: "Cliente",
    rating: 5,
    comment:
      "Compré productos de Amazon USA y los consolidaron todos en un solo envío. Me ahorraron $120 en shipping. El proceso es súper claro y el seguimiento es en tiempo real.",
    avatarUrl: undefined,
    service: "Courier" as const,
  },
  {
    name: "Valentina Cruz",
    role: "Cliente",
    rating: 5,
    comment:
      "Mi personal shopper encontró exactamente lo que buscaba en Miami. Me mandó fotos antes de comprar, negociaron el precio y llegó en una semana. Servicio 10/10.",
    avatarUrl: undefined,
    service: "Personal Shopper" as const,
  },
  {
    name: "Marco Gutiérrez",
    role: "Cliente",
    rating: 5,
    comment:
      "La tienda tiene precios que no encuentras en ningún lado. Compré un iPhone 15 Pro y llegó con garantía. El empaquetado impecable y atención al cliente rápida.",
    avatarUrl: undefined,
    service: "Tienda" as const,
  },
  {
    name: "Isabella Fernández",
    role: "Cliente",
    rating: 5,
    comment:
      "Llevaba años buscando un servicio confiable de courier. Boxifly superó mis expectativas. Recibí notificaciones en cada paso, cero sorpresas con costos. Ya van 3 envíos sin problemas.",
    avatarUrl: undefined,
    service: "Courier" as const,
  },
  {
    name: "Andrés Morales",
    role: "Cliente",
    rating: 5,
    comment:
      "Compré suplementos que no se consiguen aquí. El personal shopper me asesoró sobre las mejores marcas y precios. Todo llegó sellado y con factura. Confianza total.",
    avatarUrl: undefined,
    service: "Personal Shopper" as const,
  },
];

const SERVICE_BADGES = {
  "Personal Shopper": {
    icon: ShoppingBag,
    color: "bg-purple-500/10 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500",
    label: "Personal Shopper",
  },
  "Viajeros": {
    icon: Plane,
    color: "bg-sky-500/10 text-sky-700 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500",
    label: "Viajeros",
  },
  "Courier": {
    icon: Truck,
    color: "bg-orange-500/10 text-orange-700 border-orange-300 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500",
    label: "Courier",
  },
  "Tienda": {
    icon: Store,
    color: "bg-green-500/10 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500",
    label: "Tienda Online",
  },
  "B2B": {
    icon: Building2,
    color: "bg-blue-500/10 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500",
    label: "Aliado Comercial",
  },
} as const;

const STATS = [
  { icon: Users, label: "Clientes Satisfechos", value: 15000, suffix: "+" },
  { icon: Package, label: "Paquetes Entregados", value: 50000, suffix: "+" },
  { icon: TrendingUp, label: "Ahorro Promedio", value: 45, suffix: "%" },
  { icon: Award, label: "Calificación", value: 4.9, suffix: "/5", decimals: 1 },
];

function useCountUp(end: number, duration: number = 2000, start: boolean = false, decimals: number = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function para suavizar
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = easeOutQuart * end;

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const itemsPerView = isMobile ? 1 : 3; // 1 en móvil, 3 en desktop

  // Intersection Observer para activar animación de contadores
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Auto-rotación cada 5 segundos
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LANDING_TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? LANDING_TESTIMONIALS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % LANDING_TESTIMONIALS.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!LANDING_TESTIMONIALS.length) return null;

  return (
    <section id="testimonios" className="py-24 bg-gradient-to-br from-muted/30 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider mb-3 block">
            Testimonios
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Opiniones reales sobre nuestros servicios de Personal Shopper, Viajeros, Courier y Tienda Online
          </p>
        </div>

        {/* Contador animado de estadísticas */}
        <div ref={statsRef} className="mb-16 sm:mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 sm:px-0">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              const animatedValue = useCountUp(
                stat.value,
                2500,
                hasAnimated,
                stat.decimals || 0
              );

              return (
                <div
                  key={stat.label}
                  className="text-center group animate-fade-in"
                >
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="p-3 sm:p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-2 tabular-nums">
                    {animatedValue}
                    <span className="text-3xl sm:text-4xl md:text-5xl">{stat.suffix}</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium px-2">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="relative max-w-7xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Controles de navegación */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden lg:flex bg-background/95 backdrop-blur hover:bg-background shadow-lg border-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden lg:flex bg-background/95 backdrop-blur hover:bg-background shadow-lg border-2"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Carrusel de testimonios */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              }}
            >
              {LANDING_TESTIMONIALS.map((testimonial, index) => {
                const serviceBadge = SERVICE_BADGES[testimonial.service];
                const BadgeIcon = serviceBadge.icon;

                return (
                  <div
                    key={testimonial.name + testimonial.role}
                    className="w-full lg:w-1/3 flex-shrink-0 px-2 sm:px-3"
                  >
                    <Card
                      className={`h-full group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                        index === currentIndex ? "ring-2 ring-primary/20" : ""
                      }`}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
                            {testimonial.avatarUrl && (
                              <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                              {testimonial.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                              <h3 className="font-bold text-base sm:text-lg truncate">{testimonial.name}</h3>
                              <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary fill-primary/20 flex-shrink-0" />
                            </div>
                            {testimonial.role && (
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">{testimonial.role}</p>
                            )}
                            <Badge
                              variant="secondary"
                              className="text-xs mt-1 bg-primary/5 text-primary border-primary/20"
                            >
                              Cliente Verificado
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-secondary text-secondary" />
                          ))}
                        </div>

                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4">
                          "{testimonial.comment}"
                        </p>

                        {/* Badge del servicio */}
                        <Badge
                          variant="outline"
                          className={`${serviceBadge.color} font-medium text-xs`}
                        >
                          <BadgeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
                          {serviceBadge.label}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicadores de posición (dots) */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 px-4">
            {LANDING_TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 sm:w-8 bg-primary"
                    : "w-1.5 sm:w-2 bg-primary/30 hover:bg-primary/50"
                }`}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>

          {/* Controles móviles */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 lg:hidden">
            <Button variant="outline" size="icon" onClick={handlePrev} className="h-9 w-9 sm:h-10 sm:w-10">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext} className="h-9 w-9 sm:h-10 sm:w-10">
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
