import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Mapeo de rutas a labels legibles
const routeLabels: Record<string, string> = {
  // Main
  'dashboard': 'Panel de Control',
  'shop': 'Tienda',
  'landing': 'Inicio',
  
  // Customer
  'customer': 'Cliente',
  'new-prealert': 'Nueva Prealerta',
  'package': 'Paquete',
  'payment': 'Pago',
  'disputes': 'Disputas',
  'referrals': 'Referidos',
  'shopping-requests': 'Solicitudes de Compra',
  'loyalty-points': 'Puntos de Lealtad',
  'profile': 'Perfil',
  'vip-benefits': 'Beneficios VIP',
  
  // Warehouse
  'warehouse': 'Almacén',
  'consolidation': 'Consolidación',
  'international-tracking': 'Tracking Internacional',
  'packages': 'Paquetes',
  'inventory': 'Inventario',
  'incidents': 'Incidencias',
  
  // Admin
  'admin': 'Administración',
  'tariffs': 'Tarifas',
  'b2b-rates': 'Tarifas B2B',
  'users': 'Usuarios',
  'whatsapp': 'WhatsApp Simulator',
  'whatsapp-history': 'Historial WhatsApp',
  'reports': 'Reportes',
  'audit-logs': 'Logs de Auditoría',
  'shopper-verification': 'Verificación Shoppers',
  'kyc-verification': 'Verificación KYC',
  'products': 'Productos',
  'orders': 'Pedidos',
  'loyalty-analytics': 'Analíticas de Lealtad',
  'generate-profile-images': 'Generar Imágenes de Perfil',
  
  // B2B
  'b2b': 'B2B',
  'bulk-upload': 'Carga Masiva',
  
  // Traveler
  'traveler': 'Viajero',
  'available': 'Disponibles',
  'history': 'Historial',
  'affidavit': 'Declaración Jurada',
  
  // Shopper
  'shopper': 'Personal Shopper',
  'my-requests': 'Mis Solicitudes',
  
  // E-commerce
  'product': 'Producto',
  'cart': 'Carrito',
  'checkout': 'Checkout',
  'order-confirmation': 'Confirmación de Pedido',
  'track-order': 'Rastrear Pedido',
  'my-orders': 'Mis Pedidos',
};

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  
  return useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // No breadcrumbs para landing o rutas vacías
    if (pathSegments.length === 0 || pathSegments[0] === 'landing' || location.pathname === '/') {
      return [];
    }
    
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Si es un ID (uuid o número), omitir o mostrar como detalle
      const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) || 
                   /^\d+$/.test(segment);
      
      if (isId) {
        // Para IDs, mostrar "Detalle" en lugar del ID
        breadcrumbs.push({
          label: 'Detalle',
          href: index === pathSegments.length - 1 ? undefined : currentPath
        });
      } else {
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        
        // El último elemento no tiene href (es la página actual)
        breadcrumbs.push({
          label,
          href: index === pathSegments.length - 1 ? undefined : currentPath
        });
      }
    });
    
    return breadcrumbs;
  }, [location.pathname]);
}
