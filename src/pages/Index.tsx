import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import CustomerDashboard from './customer/Dashboard';
import WarehouseDashboard from './warehouse/Dashboard';
import AdminDashboard from './admin/Dashboard';
import B2BDashboard from './b2b/Dashboard';
import TravelerDashboard from './traveler/Dashboard';
import ShopperDashboard from './shopper/Dashboard';

export default function Index() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando Boxifly...</p>
        </div>
      </div>
    );
  }

  if (!user || !userRole) {
    return null;
  }

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case 'customer':
      return <CustomerDashboard />;
    case 'warehouse':
      return <WarehouseDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'b2b':
      return <B2BDashboard />;
    case 'traveler':
      return <TravelerDashboard />;
    case 'shopper':
      return <ShopperDashboard />;
    default:
      return <CustomerDashboard />;
  }
}
