import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CartButton } from "@/components/CartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { useLoyaltyNotifications } from "@/hooks/useLoyaltyNotifications";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Inicio from "./pages/Inicio";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ShippingCalculator from "./pages/ShippingCalculator";
import Tariffs from "./pages/Tariffs";
import RestrictedProducts from "./pages/RestrictedProducts";
import NewPrealert from "./pages/customer/NewPrealert";
import PackageDetail from "./pages/customer/PackageDetail";
import Payment from "./pages/customer/Payment";
import Consolidation from "./pages/warehouse/Consolidation";
import TariffManagement from "./pages/admin/TariffManagement";
import B2BRatesManagement from "./pages/admin/B2BRatesManagement";
import UserManagement from "./pages/admin/UserManagement";
import PackageHistory from "./pages/admin/PackageHistory";
import WhatsAppSimulator from "./pages/admin/WhatsAppSimulator";
import DisputeManagement from "./pages/admin/DisputeManagement";
import InternationalTracking from "./pages/warehouse/InternationalTracking";
import Disputes from "./pages/customer/Disputes";
import WhatsAppHistory from "./pages/admin/WhatsAppHistory";
import WarehouseInventory from "./pages/warehouse/Inventory";
import WarehouseIncidents from "./pages/warehouse/Incidents";
import B2BBulkUpload from "./pages/b2b/BulkUpload";
import B2BDashboard from "./pages/b2b/Dashboard";
import AdminReports from "./pages/admin/Reports";
import AdminAuditLogs from "./pages/admin/AuditLogs";
import TravelerDashboard from "./pages/traveler/Dashboard";
import AvailablePackages from "./pages/traveler/AvailablePackages";
import TripHistory from "./pages/traveler/TripHistory";
import TravelerAffidavit from "./pages/traveler/TravelerAffidavit";
import ShopperDashboard from "./pages/shopper/Dashboard";
import AvailableRequests from "./pages/shopper/AvailableRequests";
import MyRequests from "./pages/shopper/MyRequests";
import PSShopperDashboard from "./pages/personal-shopper/ShopperDashboard";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import ProductsManagement from "./pages/admin/ProductsManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";
import CustomerReferrals from "./pages/customer/Referrals";
import B2BReferrals from "./pages/b2b/Referrals";
import CustomerShoppingRequests from "./pages/customer/ShoppingRequests";
import ShopperVerification from "./pages/admin/ShopperVerification";
import KYCVerification from "./pages/admin/KYCVerification";
import TrackOrder from "./pages/TrackOrder";
import OrderConfirmation from "./pages/OrderConfirmation";
import LoyaltyPoints from "./pages/customer/LoyaltyPoints";
import Profile from "./pages/customer/Profile";
import VIPBenefits from "./pages/customer/VIPBenefits";
import CustomerPSDashboard from "./pages/customer/PersonalShopperDashboard";
import PersonalShopperAdmin from "./pages/admin/PersonalShopperAdmin";
import LoyaltyAnalytics from "./pages/admin/LoyaltyAnalytics";
import UpdateProductImage from "./pages/admin/UpdateProductImage";
import { CartProvider } from "@/context/CartContext";
import GenerateProfileImages from "./pages/admin/GenerateProfileImages";
import Casillero from "./pages/Casillero";
import PersonalShopperLanding from "./pages/PersonalShopper";
import PersonalShopperIndex from "./pages/personal-shopper/Index";
import PSAsistidoSolicitud from "./pages/personal-shopper/SolicitudAsistido";
import Viajero from "./pages/Viajero";
import B2B from "./pages/B2B";
import Blog from "./pages/Blog";
import Nosotros from "./pages/Nosotros";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import Contacto from "./pages/Contacto";
import Afiliados from "./pages/Afiliados";
import LibroReclamaciones from "./pages/LibroReclamaciones";
import PoliticaCambiosDevoluciones from "./pages/PoliticaCambiosDevoluciones";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import Ayuda from "./pages/Ayuda";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";
import TiposEntrega from "./pages/TiposEntrega";
import Legales from "./pages/Legales";
import AtencionWhatsApp from "./pages/AtencionWhatsApp";
import BoxiflyPuntos from "./pages/BoxiflyPuntos";
import GuiasCompras from "./pages/GuiasCompras";
import GanadoresConcursos from "./pages/GanadoresConcursos";
import TiendasEnUSA from "./pages/TiendasEnUSA";
import ViajerosIndex from "./pages/viajeros/Index";
import ViajerosCliente from "./pages/viajeros/Cliente";
import ViajerosViajero from "./pages/viajeros/Viajero";
import ViajerosLegales from "./pages/viajeros/Legales";
import IzipayTest from "./pages/IzipayTest";
import ComoComprarUSA from "./pages/ComoComprarUSA";
import ComoComprarUSAPDF from "./pages/ComoComprarUSAPDF";

const queryClient = new QueryClient();

function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Enable real-time loyalty points notifications
  useLoyaltyNotifications();
  
  // Hide cart on landing page
  const isLandingPage = location.pathname === '/landing' || location.pathname === '/' || location.pathname === '/inicio';

  return (
    <>
      {!isLandingPage && <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />}
      
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<Inicio />} />
        <Route path="/landing" element={<Inicio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/calculator" element={<ShippingCalculator />} />
        <Route path="/tariffs" element={<Tariffs />} />
        <Route path="/restricted-products" element={<RestrictedProducts />} />
        
        {/* New Pages */}
        <Route path="/casillero" element={<Casillero />} />
        <Route path="/personal-shopper" element={<PersonalShopperIndex />} />
        <Route path="/personal-shopper/landing" element={<PersonalShopperLanding />} />
        <Route path="/personal-shopper/solicitud" element={
          <ProtectedRoute>
            <PSAsistidoSolicitud />
          </ProtectedRoute>
        } />
        <Route path="/viajero" element={<Viajero />} />
        <Route path="/viajeros" element={<ViajerosIndex />} />
        <Route path="/viajeros/cliente" element={<ViajerosCliente />} />
        <Route path="/viajeros/viajero" element={<ViajerosViajero />} />
        <Route path="/viajeros/legales" element={<ViajerosLegales />} />
        <Route path="/b2b" element={<B2B />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/afiliados" element={<Afiliados />} />
        <Route path="/libro-de-reclamaciones" element={<LibroReclamaciones />} />
          <Route path="/politica-cambios-devoluciones" element={<PoliticaCambiosDevoluciones />} />
          <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/centro-de-ayuda" element={<Ayuda />} />
          <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
          <Route path="/tipos-de-entrega" element={<TiposEntrega />} />
          <Route path="/legales" element={<Legales />} />
          <Route path="/atencion-por-whatsapp" element={<AtencionWhatsApp />} />
          <Route path="/boxifly-puntos" element={<BoxiflyPuntos />} />
          <Route path="/guias-de-compras" element={<GuiasCompras />} />
          <Route path="/ganadores-de-concursos" element={<GanadoresConcursos />} />
          <Route path="/tiendas-en-usa" element={<TiendasEnUSA />} />
          <Route path="/como-comprar-en-usa" element={<ComoComprarUSA />} />
          <Route path="/como-comprar-en-usa-pdf" element={<ComoComprarUSAPDF />} />
        <Route path="/shop" element={<Shop onCartOpen={() => setCartOpen(true)} />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/cliente/dashboard" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* E-commerce Routes */}
        <Route path="/product/:id" element={<ProductDetail onCartOpen={() => setCartOpen(true)} />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/izipay-test" element={<IzipayTest />} />
        <Route path="/my-orders" element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } />
        
        {/* Cliente Routes */}
        <Route path="/cliente/disputes" element={
          <ProtectedRoute requiredRole="customer">
            <Disputes />
          </ProtectedRoute>
        } />
        
        <Route path="/warehouse/consolidation" element={
          <ProtectedRoute requiredRole="warehouse">
            <Consolidation />
          </ProtectedRoute>
        } />
        <Route path="/warehouse/international-tracking" element={
          <ProtectedRoute requiredRole="warehouse">
            <InternationalTracking />
          </ProtectedRoute>
        } />
        <Route path="/warehouse/packages" element={
          <ProtectedRoute allowedRoles={['warehouse', 'admin']}>
            <PackageHistory />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/tariffs" element={
          <ProtectedRoute requiredRole="admin">
            <TariffManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/b2b-rates" element={
          <ProtectedRoute requiredRole="admin">
            <B2BRatesManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/loyalty-analytics" element={
          <ProtectedRoute requiredRole="admin">
            <LoyaltyAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/generate-profile-images" element={
          <ProtectedRoute requiredRole="admin">
            <GenerateProfileImages />
          </ProtectedRoute>
        } />
        <Route path="/admin/update-product-image" element={
          <ProtectedRoute requiredRole="admin">
            <UpdateProductImage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/packages" element={
          <ProtectedRoute requiredRole="admin">
            <PackageHistory />
          </ProtectedRoute>
        } />
        <Route path="/admin/whatsapp" element={
          <ProtectedRoute requiredRole="admin">
            <WhatsAppSimulator />
          </ProtectedRoute>
        } />
        <Route path="/admin/whatsapp-history" element={
          <ProtectedRoute requiredRole="admin">
            <WhatsAppHistory />
          </ProtectedRoute>
        } />
        <Route path="/admin/disputes" element={
          <ProtectedRoute requiredRole="admin">
            <DisputeManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRole="admin">
            <AdminReports />
          </ProtectedRoute>
        } />
        <Route path="/admin/audit-logs" element={
          <ProtectedRoute requiredRole="admin">
            <AdminAuditLogs />
          </ProtectedRoute>
        } />
        <Route path="/admin/shopper-verification" element={
          <ProtectedRoute requiredRole="admin">
            <ShopperVerification />
          </ProtectedRoute>
        } />
        <Route path="/admin/kyc-verification" element={
          <ProtectedRoute requiredRole="admin">
            <KYCVerification />
          </ProtectedRoute>
        } />
        <Route path="/admin/personal-shopper" element={
          <ProtectedRoute requiredRole="admin">
            <PersonalShopperAdmin />
          </ProtectedRoute>
        } />
        
        <Route path="/warehouse/inventory" element={
          <ProtectedRoute allowedRoles={['warehouse', 'admin']}>
            <WarehouseInventory />
          </ProtectedRoute>
        } />
        <Route path="/warehouse/incidents" element={
          <ProtectedRoute allowedRoles={['warehouse', 'admin']}>
            <WarehouseIncidents />
          </ProtectedRoute>
        } />
        
        <Route path="/b2b/bulk-upload" element={
          <ProtectedRoute requiredRole="b2b">
            <B2BBulkUpload />
          </ProtectedRoute>
        } />
        <Route path="/b2b/dashboard" element={
          <ProtectedRoute requiredRole="b2b">
            <B2BDashboard />
          </ProtectedRoute>
        } />
        <Route path="/b2b/referrals" element={
          <ProtectedRoute requiredRole="b2b">
            <B2BReferrals />
          </ProtectedRoute>
        } />
        
        <Route path="/traveler" element={
          <ProtectedRoute>
            <TravelerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/traveler/dashboard" element={
          <ProtectedRoute>
            <TravelerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/traveler/available" element={
          <ProtectedRoute>
            <AvailablePackages />
          </ProtectedRoute>
        } />
        <Route path="/traveler/history" element={
          <ProtectedRoute>
            <TripHistory />
          </ProtectedRoute>
        } />
        <Route path="/traveler/affidavit" element={
          <ProtectedRoute>
            <TravelerAffidavit />
          </ProtectedRoute>
        } />
        
        <Route path="/shopper" element={
          <ProtectedRoute>
            <ShopperDashboard />
          </ProtectedRoute>
        } />
        <Route path="/shopper/dashboard" element={
          <ProtectedRoute>
            <ShopperDashboard />
          </ProtectedRoute>
        } />
        <Route path="/shopper/available" element={
          <ProtectedRoute>
            <AvailableRequests />
          </ProtectedRoute>
        } />
        <Route path="/shopper/my-requests" element={
          <ProtectedRoute>
            <MyRequests />
          </ProtectedRoute>
        } />
        <Route path="/shopper/personal-shopper" element={
          <ProtectedRoute>
            <PSShopperDashboard />
          </ProtectedRoute>
        } />
        
        {/* E-commerce Admin Routes */}
        <Route path="/admin/products" element={
          <ProtectedRoute allowedRoles={['admin', 'warehouse']}>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['admin', 'warehouse']}>
            <OrdersManagement />
          </ProtectedRoute>
        } />
        
        {/* Referrals Routes */}
        <Route path="/cliente/referrals" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerReferrals />
          </ProtectedRoute>
        } />
        <Route path="/b2b/referrals" element={
          <ProtectedRoute requiredRole="b2b">
            <B2BReferrals />
          </ProtectedRoute>
        } />

        {/* Shopping Requests Routes */}
        <Route path="/cliente/shopping-requests" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerShoppingRequests />
          </ProtectedRoute>
        } />
        
        {/* Loyalty Points Route */}
        <Route path="/cliente/loyalty-points" element={
          <ProtectedRoute requiredRole="customer">
            <LoyaltyPoints />
          </ProtectedRoute>
        } />
        
        {/* Profile Route */}
        <Route path="/cliente/profile" element={
          <ProtectedRoute requiredRole="customer">
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* VIP Benefits Route */}
        <Route path="/cliente/vip-benefits" element={
          <ProtectedRoute requiredRole="customer">
            <VIPBenefits />
          </ProtectedRoute>
        } />
        
        {/* Personal Shopper Dashboard Route */}
        <Route path="/cliente/personal-shopper" element={
          <ProtectedRoute requiredRole="customer">
            <CustomerPSDashboard />
          </ProtectedRoute>
        } />
        
        {/* Track Order for Guests */}
        <Route path="/track-order" element={<TrackOrder />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
