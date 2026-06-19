import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Package, Download, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PackageWithUser {
  id: string;
  tracking_number: string;
  store_name: string;
  current_status: string;
  final_cost: number | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  actual_weight: number | null;
  is_consolidated: boolean | null;
  consolidation_group: string | null;
  profiles: {
    full_name: string;
    email: string;
    warehouse_code: string | null;
  };
}

const PackageHistory = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<PackageWithUser[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<PackageWithUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, dateFilter, packages]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(pkg => pkg.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, warehouse_code')
        .in('id', userIds);

      // Merge profiles with packages
      const packagesWithProfiles = data?.map(pkg => ({
        ...pkg,
        profiles: profilesData?.find(p => p.id === pkg.user_id) || {
          full_name: 'Usuario desconocido',
          email: '-',
          warehouse_code: null
        }
      })) || [];

      setPackages(packagesWithProfiles);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los paquetes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pkg => 
        pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.profiles?.warehouse_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.current_status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }

      if (dateFilter !== 'all') {
        filtered = filtered.filter(pkg => new Date(pkg.created_at) >= filterDate);
      }
    }

    setFilteredPackages(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      prealerted: "secondary",
      received_warehouse: "default",
      ready_consolidation: "default",
      consolidated: "default",
      ready_international: "default",
      in_transit: "default",
      arrived_peru: "default",
      ready_delivery: "outline",
      delivered: "default"
    };
    
    const labels: Record<string, string> = {
      prealerted: "Prealertado",
      received_warehouse: "Recibido",
      ready_consolidation: "Listo para Consolidar",
      consolidated: "Consolidado",
      ready_international: "Listo para Envío",
      in_transit: "En Tránsito",
      arrived_peru: "Llegó a Perú",
      ready_delivery: "Listo para Entrega",
      delivered: "Entregado"
    };

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Tracking', 'Cliente', 'Email', 'Código Warehouse', 'Tienda', 'Estado', 'Peso', 'Costo', 'Fecha Creación', 'Última Actualización'];
    const csvData = filteredPackages.map(pkg => [
      pkg.tracking_number,
      pkg.profiles?.full_name || '-',
      pkg.profiles?.email || '-',
      pkg.profiles?.warehouse_code || '-',
      pkg.store_name,
      pkg.current_status,
      pkg.actual_weight ? `${pkg.actual_weight} kg` : '-',
      pkg.final_cost ? `$${pkg.final_cost.toFixed(2)}` : '-',
      new Date(pkg.created_at).toLocaleDateString('es-PE'),
      new Date(pkg.updated_at || pkg.created_at).toLocaleDateString('es-PE')
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-paquetes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exportación exitosa",
      description: "El historial ha sido exportado a CSV",
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Historial de Paquetes">
        <div className="flex items-center justify-center h-64">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Historial de Paquetes">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Historial Completo de Paquetes
            </CardTitle>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tracking, cliente, email, warehouse code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="prealerted">Prealertado</SelectItem>
                <SelectItem value="received_warehouse">Recibido</SelectItem>
                <SelectItem value="ready_consolidation">Listo para Consolidar</SelectItem>
                <SelectItem value="consolidated">Consolidado</SelectItem>
                <SelectItem value="ready_international">Listo para Envío</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="arrived_peru">Llegó a Perú</SelectItem>
                <SelectItem value="ready_delivery">Listo para Entrega</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por fecha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border mb-4">
            <div className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Mostrando {filteredPackages.length} de {packages.length} paquetes
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Código Warehouse</TableHead>
                  <TableHead>Tienda</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Costo Final</TableHead>
                  <TableHead>Consolidado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      No se encontraron paquetes con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPackages.map((pkg) => (
                    <TableRow key={pkg.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono">{pkg.tracking_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{pkg.profiles?.full_name || '-'}</span>
                          <span className="text-xs text-muted-foreground">{pkg.profiles?.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{pkg.profiles?.warehouse_code || '-'}</TableCell>
                      <TableCell>{pkg.store_name}</TableCell>
                      <TableCell>{getStatusBadge(pkg.current_status)}</TableCell>
                      <TableCell>
                        {pkg.actual_weight ? `${pkg.actual_weight} kg` : '-'}
                      </TableCell>
                      <TableCell>
                        {pkg.final_cost ? `$${pkg.final_cost.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {pkg.is_consolidated ? (
                          <Badge variant="default">Sí</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(pkg.created_at).toLocaleDateString('es-PE')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/package/${pkg.id}`)}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PackageHistory;
