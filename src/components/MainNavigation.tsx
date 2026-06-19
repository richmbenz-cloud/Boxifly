import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Menu, Package, Building2, Plane, ShoppingBag, ChevronRight, User, LogOut, ShoppingCart as ShoppingCartIcon, Store, Calculator, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import logoFull from '@/assets/logo-boxifly-full.png';

const services = [
  {
    title: 'Personas',
    description: 'Tu dirección en Miami para compras online',
    icon: Package,
    path: '/cliente/dashboard'
  },
  {
    title: 'Empresas',
    description: 'Soluciones corporativas y empresariales',
    icon: Building2,
    path: '/b2b/dashboard'
  }
];

export function MainNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fetch user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className={`border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Tamaños optimizados */}
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center focus:outline-none hover:opacity-80 transition-opacity"
          >
            <img 
              src={logoFull} 
              alt="Boxifly" 
              className="w-20 md:w-28 h-auto object-contain"
              style={{ minWidth: '80px', maxWidth: '120px' }}
            />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-4 flex-1 justify-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/personas')}
              className={`text-sm font-medium h-10 px-4 flex items-center gap-2 transition-all hover:scale-105 ${isActive('/personas') ? 'text-primary' : ''}`}
            >
              <Package className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Personas
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => navigate('/cotizador')}
              className={`text-sm font-medium h-10 px-4 flex items-center gap-2 transition-all hover:scale-105 ${isActive('/cotizador') ? 'text-primary' : ''}`}
            >
              <Calculator className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Cotizador
            </Button>

            <Button 
              variant="ghost" 
              onClick={() => navigate('/empresas')}
              className={`text-sm font-medium h-10 px-4 flex items-center gap-2 transition-all hover:scale-105 ${isActive('/empresas') ? 'text-primary' : ''}`}
            >
              <Building2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
              Empresas
            </Button>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        {profile?.avatar_url && (
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Usuario"} />
                        )}
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getInitials(profile?.full_name || "Usuario")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden lg:inline">Mi Cuenta</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/cliente/dashboard')}>
                      <User className="h-4 w-4 mr-2" />
                      Mi Cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/my-orders')}>
                      <ShoppingCartIcon className="h-4 w-4 mr-2" />
                      Mis Pedidos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                  className="text-sm font-medium h-10 px-5"
                >
                  Iniciar Sesión
                </Button>
              )}
            </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Abrir menú de navegación">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full p-0 animate-slide-in-right">
                <SheetHeader className="p-6 pb-4 border-b animate-fade-in">
                  <SheetTitle>
                    <img src={logoFull} alt="Boxifly" className="h-12 md:h-14" />
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
                  {/* Lista vertical de todos los ítems */}
                  <div className="p-6 space-y-3">
                    <button
                      onClick={() => {
                        navigate('/personas');
                        setMobileOpen(false);
                      }}
                      className={`group w-full flex items-center gap-4 text-left px-6 py-4 text-base font-medium rounded-xl hover:bg-primary/10 active:scale-95 transition-all animate-fade-in ${
                        isActive('/personas') ? 'text-primary bg-primary/10' : ''
                      }`}
                      style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Package className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <span>Personas</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/cotizador');
                        setMobileOpen(false);
                      }}
                      className={`group w-full flex items-center gap-4 text-left px-6 py-4 text-base font-medium rounded-xl hover:bg-primary/10 active:scale-95 transition-all animate-fade-in ${
                        isActive('/cotizador') ? 'text-primary bg-primary/10' : ''
                      }`}
                      style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Calculator className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <span>Cotizador</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/empresas');
                        setMobileOpen(false);
                      }}
                      className={`group w-full flex items-center gap-4 text-left px-6 py-4 text-base font-medium rounded-xl hover:bg-primary/10 active:scale-95 transition-all animate-fade-in ${
                        isActive('/empresas') ? 'text-primary bg-primary/10' : ''
                      }`}
                      style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <span>Empresas</span>
                    </button>

                    {user ? (
                      <>
                        <button
                          onClick={() => {
                            navigate('/cliente/dashboard');
                            setMobileOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                          style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
                        >
                          <User className="h-4 w-4 inline mr-2" />
                          Mi Cuenta
                        </button>
                        <button
                          onClick={() => {
                            navigate('/my-orders');
                            setMobileOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                          style={{ animationDelay: '0.45s', animationFillMode: 'backwards' }}
                        >
                          <ShoppingCartIcon className="h-4 w-4 inline mr-2" />
                          Mis Pedidos
                        </button>
                        <Button 
                          onClick={() => {
                            signOut();
                            setMobileOpen(false);
                          }}
                          variant="destructive"
                          className="w-full mt-4 animate-fade-in"
                          size="lg"
                          style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Cerrar Sesión
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => {
                          navigate('/auth');
                          setMobileOpen(false);
                        }}
                        className="w-full animate-fade-in"
                        size="lg"
                        style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Iniciar Sesión
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
