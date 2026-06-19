import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  DollarSign,
  MessageSquare,
  Users,
  Settings,
  ShoppingBag,
  Gift,
  Warehouse,
  AlertCircle,
  FileBarChart,
  ShieldAlert,
  ShoppingCart,
  UserCheck,
  Plane,
  MapPin,
  User,
  ImagePlus,
  Star,
  TrendingUp,
  Award,
  Upload,
  FileCheck,
  History
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import logoIcon from "@/assets/logo-boxifly-icon.png";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  userRole: string;
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  const getMenuGroups = () => {
    switch (userRole) {
      case 'customer':
        return [
          {
            label: "Principal",
            items: [
              { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
              { title: "Mi Perfil", url: "/cliente/profile", icon: User },
            ]
          },
          {
            label: "Envíos Courier",
            items: [
              { title: "Nueva Pre-alerta", url: "/new-prealert", icon: FileText },
              { title: "Mis Paquetes", url: "/dashboard", icon: Package },
              { title: "Disputas", url: "/cliente/disputes", icon: AlertCircle },
            ]
          },

          {
            label: "Recompensas",
            items: [
              { title: "Mis Puntos", url: "/cliente/loyalty-points", icon: Star },
              { title: "Beneficios VIP", url: "/cliente/vip-benefits", icon: Award },
              { title: "Referidos", url: "/cliente/referrals", icon: Gift },
            ]
          }
        ];
      case 'b2b':
        return [
          {
            label: "Principal",
            items: [
              { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
            ]
          },
          {
            label: "Operaciones",
            items: [
              { title: "Carga Masiva", url: "/b2b/bulk-upload", icon: Upload },
              { title: "Referidos", url: "/b2b/referrals", icon: Gift },
            ]
          }
        ];
      case 'warehouse':
        return [
          {
            label: "Principal",
            items: [
              { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
            ]
          },
          {
            label: "Operaciones",
            items: [
              { title: "Consolidación", url: "/warehouse/consolidation", icon: Package },
              { title: "Inventario", url: "/warehouse/inventory", icon: Warehouse },
              { title: "Incidencias", url: "/warehouse/incidents", icon: AlertCircle },
            ]
          },
          {
            label: "Seguimiento",
            items: [
              { title: "Tracking Internacional", url: "/warehouse/international-tracking", icon: Plane },
              { title: "Historial", url: "/warehouse/packages", icon: History },
            ]
          }
        ];
      case 'admin':
        return [
          {
            label: "Principal",
            items: [
              { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
            ]
          },
          {
            label: "Gestión",
            items: [
              { title: "Usuarios", url: "/admin/users", icon: Users },
              { title: "Paquetes", url: "/admin/packages", icon: Package },
              { title: "Disputas", url: "/admin/disputes", icon: AlertCircle },
            ]
          },

          {
            label: "Configuración",
            items: [
              { title: "Tarifas", url: "/admin/tariffs", icon: DollarSign },
              { title: "Tarifas B2B", url: "/admin/b2b-rates", icon: DollarSign },
              { title: "Verificación KYC", url: "/admin/kyc-verification", icon: UserCheck },
            ]
          },
          {
            label: "Reportes & Analítica",
            items: [
              { title: "Analytics Fidelidad", url: "/admin/loyalty-analytics", icon: TrendingUp },
              { title: "Reportes", url: "/admin/reports", icon: FileBarChart },
              { title: "Auditoría", url: "/admin/audit-logs", icon: ShieldAlert },
            ]
          },
          {
            label: "Herramientas",
            items: [
              { title: "WhatsApp", url: "/admin/whatsapp", icon: MessageSquare },
              { title: "Historial WA", url: "/admin/whatsapp-history", icon: MessageSquare },
              { title: "Generar Fotos", url: "/admin/generate-profile-images", icon: ImagePlus },
              { title: "Actualizar Imagen", url: "/admin/update-product-image", icon: Upload },
            ]
          }
        ];
      case 'traveler':
        return [
          {
            label: "Principal",
            items: [
              { title: "Dashboard", url: "/traveler/dashboard", icon: LayoutDashboard },
            ]
          },
          {
            label: "Viajes",
            items: [
              { title: "Paquetes Disponibles", url: "/traveler/available", icon: Package },
              { title: "Historial", url: "/traveler/history", icon: History },
            ]
          },
          {
            label: "Documentación",
            items: [
              { title: "Declaración Jurada", url: "/traveler/affidavit", icon: FileCheck },
            ]
          }
        ];
      case 'shopper':
        return [
          {
            label: "Principal",
            items: [
              { title: "Dashboard", url: "/shopper/dashboard", icon: LayoutDashboard },
            ]
          },
          {
            label: "Solicitudes",
            items: [
              { title: "Disponibles", url: "/shopper/available", icon: ShoppingCart },
              { title: "Mis Solicitudes", url: "/shopper/my-requests", icon: FileText },
            ]
          }
        ];
      default:
        return [];
    }
  };

  const menuGroups = getMenuGroups();

  return (
    <Sidebar
      className="border-r transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-center bg-gradient-to-b from-primary/5 to-transparent">
          <button 
            onClick={() => navigate('/')}
            className="transition-all duration-300 hover:scale-110 cursor-pointer rounded-lg p-2 hover:bg-primary/10"
            title="Ir a la página principal"
          >
            <img 
              src={logoIcon} 
              alt="Boxifly" 
              className={`transition-all duration-300 ${isCollapsed ? "h-8 w-8" : "h-12 w-12"}`} 
            />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 py-2">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.label}>
              <SidebarGroup>
                <SidebarGroupLabel className={`px-3 text-xs font-semibold uppercase tracking-wider ${isCollapsed ? "sr-only" : "text-muted-foreground"}`}>
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.url || 
                                     (item.url === '/dashboard' && location.pathname === '/');
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild
                            tooltip={isCollapsed ? item.title : undefined}
                          >
                            <NavLink
                              to={item.url}
                              end
                              className={`
                                group relative px-3 py-2 rounded-lg transition-all duration-200
                                hover:bg-primary/5 hover:text-primary
                                ${isActive ? 'bg-primary/10 text-primary font-medium shadow-sm' : 'text-muted-foreground'}
                              `}
                            >
                              {isActive && !isCollapsed && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full animate-in slide-in-from-left-2" />
                              )}
                              <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                              {!isCollapsed && (
                                <span className="truncate transition-all duration-200">
                                  {item.title}
                                </span>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              {groupIndex < menuGroups.length - 1 && !isCollapsed && (
                <SidebarSeparator className="my-2 mx-3 bg-border/50" />
              )}
            </div>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
