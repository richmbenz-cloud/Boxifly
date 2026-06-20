import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CartButton } from "@/components/CartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { useLoyaltyNotifications } from "@/hooks/useLoyaltyNotifications";
const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Inicio = lazy(() => import("./pages/Inicio"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ShippingCalculator = lazy(() => import("./pages/ShippingCalculator"));
const Tariffs = lazy(() => import("./pages/Tariffs"));
const RestrictedProducts = lazy(() => import("./pages/RestrictedProducts"));
const NewPrealert = lazy(() => import("./pages/customer/NewPrealert"));
const PackageDetail = lazy(() => import("./pages/customer/PackageDetail"));
const Payment = lazy(() => import("./pages/customer/Payment"));
const Consolidation = lazy(() => import("./pages/warehouse/Consolidation"));
const TariffManagement = lazy(() => import("./pages/admin/TariffManagement"));
const B2BRatesManagement = lazy(() => import("./pages/admin/B2BRatesManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const PackageHistory = lazy(() => import("./pages/admin/PackageHistory"));
const WhatsAppSimulator = lazy(() => import("./pages/admin/WhatsAppSimulator"));
const DisputeManagement = lazy(() => import("./pages/admin/DisputeManagement"));
const InternationalTracking = lazy(() => import("./pages/warehouse/InternationalTracking"));
const Disputes = lazy(() => import("./pages/customer/Disputes"));
const WhatsAppHistory = lazy(() => import("./pages/admin/WhatsAppHistory"));
const WarehouseInventory = lazy(() => import("./pages/warehouse/Inventory"));
const WarehouseIncidents = lazy(() => import("./pages/warehouse/Incidents"));
const B2BBulkUpload = lazy(() => import("./pages/b2b/BulkUpload"));
const B2BDashboard = lazy(() => import("./pages/b2b/Dashboard"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const TravelerDashboard = lazy(() => import("./pages/traveler/Dashboard"));
const AvailablePackages = lazy(() => import("./pages/traveler/AvailablePackages"));
const TripHistory = lazy(() => import("./pages/traveler/TripHistory"));
const TravelerAffidavit = lazy(() => import("./pages/traveler/TravelerAffidavit"));
const ShopperDashboard = lazy(() => import("./pages/shopper/Dashboard"));
const AvailableRequests = lazy(() => import("./pages/shopper/AvailableRequests"));
const MyRequests = lazy(() => import("./pages/shopper/MyRequests"));
const PSShopperDashboard = lazy(() => import("./pages/personal-shopper/ShopperDashboard"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const ProductsManagement = lazy(() => import("./pages/admin/ProductsManagement"));
const OrdersManagement = lazy(() => import("./pages/admin/OrdersManagement"));
const CustomerReferrals = lazy(() => import("./pages/customer/Referrals"));
const B2BReferrals = lazy(() => import("./pages/b2b/Referrals"));
const CustomerShoppingRequests = lazy(() => import("./pages/customer/ShoppingRequests"));
const ShopperVerification = lazy(() => import("./pages/admin/ShopperVerification"));
const KYCVerification = lazy(() => import("./pages/admin/KYCVerification"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const LoyaltyPoints = lazy(() => import("./pages/customer/LoyaltyPoints"));
const Profile = lazy(() => import("./pages/customer/Profile"));
const VIPBenefits = lazy(() => import("./pages/customer/VIPBenefits"));
const CustomerPSDashboard = lazy(() => import("./pages/customer/PersonalShopperDashboard"));
const PersonalShopperAdmin = lazy(() => import("./pages/admin/PersonalShopperAdmin"));
const LoyaltyAnalytics = lazy(() => import("./pages/admin/LoyaltyAnalytics"));
const UpdateProductImage = lazy(() => import("./pages/admin/UpdateProductImage"));
import { CartProvider } from "@/context/CartContext";
const GenerateProfileImages = lazy(() => import("./pages/admin/GenerateProfileImages"));
const Casillero = lazy(() => import("./pages/Casillero"));
const PersonalShopperLanding = lazy(() => import("./pages/PersonalShopper"));
const PersonalShopperIndex = lazy(() => import("./pages/personal-shopper/Index"));
const PSAsistidoSolicitud = lazy(() => import("./pages/personal-shopper/SolicitudAsistido"));
const Viajero = lazy(() => import("./pages/Viajero"));
const B2B = lazy(() => import("./pages/B2B"));
const Blog = lazy(() => import("./pages/Blog"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const TerminosCondiciones = lazy(() => import("./pages/TerminosCondiciones"));
const Contacto = lazy(() => import("./pages/Contacto"));
const Afiliados = lazy(() => import("./pages/Afiliados"));
const LibroReclamaciones = lazy(() => import("./pages/LibroReclamaciones"));
const PoliticaCambiosDevoluciones = lazy(() => import("./pages/PoliticaCambiosDevoluciones"));
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));
const Ayuda = lazy(() => import("./pages/Ayuda"));
const PreguntasFrecuentes = lazy(() => import("./pages/PreguntasFrecuentes"));
const TiposEntrega = lazy(() => import("./pages/TiposEntrega"));
const Legales = lazy(() => import("./pages/Legales"));
const AtencionWhatsApp = lazy(() => import("./pages/AtencionWhatsApp"));
const BoxiflyPuntos = lazy(() => import("./pages/BoxiflyPuntos"));
const GuiasCompras = lazy(() => import("./pages/GuiasCompras"));
const GanadoresConcursos = lazy(() => import("./pages/GanadoresConcursos"));
const TiendasEnUSA = lazy(() => import("./pages/TiendasEnUSA"));
const ViajerosIndex = lazy(() => import("./pages/viajeros/Index"));
const ViajerosCliente = lazy(() => import("./pages/viajeros/Cliente"));
const ViajerosViajero = lazy(() => import("./pages/viajeros/Viajero"));
const ViajerosLegales = lazy(() => import("./pages/viajeros/Legales"));
const IzipayTest = lazy(() => import("./pages/IzipayTest"));
const ComoComprarUSA = lazy(() => import("./pages/ComoComprarUSA"));
const ComoComprarUSAPDF = lazy(() => import("./pages/ComoComprarUSAPDF"));

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
  const isLandingPage = location.pathname === '/' || location.pathname === '/inicio';

  return (
    <>
      {!isLandingPage && <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />}
      
      <ErrorBoundary key={location.pathname}>
      <Suspense fallback={
        <div className="flex h-[80vh] w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }>
        <Routes>
        {/* Main routes */}
        <Route path="/" element={<Inicio />} />
        
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/cotizador" element={<ShippingCalculator />} />
        <Route path="/tariffs" element={<Tariffs />} />
        <Route path="/restricted-products" element={<RestrictedProducts />} />
        
        {/* New Pages */}
        <Route path="/personas" element={<Casillero />} />
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
        <Route path="/empresas" element={<B2B />} />
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
        <Route path="/iniciar-sesion" element={<Auth defaultView="login" />} />
        <Route path="/registrarse" element={<Auth defaultView="register" />} />
        <Route path="/auth" element={<Navigate to="/iniciar-sesion" replace />} />
        
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
      </Suspense>
      </ErrorBoundary>
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
