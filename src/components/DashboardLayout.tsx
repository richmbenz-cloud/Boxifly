import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import logoIcon from '@/assets/logo-boxifly-icon.png';
import { Badge } from '@/components/ui/badge';
import NotificationBell from './NotificationBell';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { VIPBadge } from './VIPBadge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  headerActions?: ReactNode;
}

const DashboardLayout = ({ children, title, headerActions }: DashboardLayoutProps) => {
  const { user, userRole, signOut } = useAuth();

  // Fetch user VIP tier
  const { data: profile } = useQuery({
    queryKey: ['profile-vip', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('vip_tier')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && userRole === 'customer',
  });

  const getRoleBadge = () => {
    const roleLabels = {
      customer: 'Cliente',
      b2b: 'Aliado Comercial B2B',
      warehouse: 'Warehouse',
      admin: 'Administrador',
      traveler: 'Viajero',
      shopper: 'Personal Shopper'
    };

    return roleLabels[userRole as keyof typeof roleLabels] || '';
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-muted">
        {/* Sidebar */}
        <AppSidebar userRole={userRole || 'customer'} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-navy border-b border-navy-foreground/10 sticky top-0 z-40 shadow-lg">
            <div className="container mx-auto px-4 py-3 md:py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Sidebar Trigger + Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <SidebarTrigger className="text-white hover:bg-white/10 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg md:text-xl font-bold text-white truncate">{title}</h1>
                    <div className="hidden md:flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-secondary text-navy">
                        {getRoleBadge()}
                      </Badge>
                      {userRole === 'customer' && profile?.vip_tier && (
                        <VIPBadge tier={profile.vip_tier} size="sm" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                  {userRole === 'customer' && profile?.vip_tier && (
                    <div className="hidden lg:block">
                      <VIPBadge tier={profile.vip_tier} size="md" />
                    </div>
                  )}
                  {headerActions && (
                    <div className="[&_button]:text-white [&_button]:hover:bg-white/10">
                      {headerActions}
                    </div>
                  )}
                  <div className="[&_button]:text-white [&_button]:hover:bg-white/10">
                    <NotificationBell />
                  </div>
                  <Button
                    variant="ghost"
                    onClick={signOut}
                    className="text-white hover:bg-white/10 gap-1 md:gap-2 px-2 md:px-4"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Salir</span>
                  </Button>
                </div>
              </div>

              {/* Mobile Role Badge */}
              <div className="md:hidden mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="bg-secondary text-navy text-xs">
                  {getRoleBadge()}
                </Badge>
                {userRole === 'customer' && profile?.vip_tier && (
                  <VIPBadge tier={profile.vip_tier} size="sm" />
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
