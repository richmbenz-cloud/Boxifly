import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Search, Clock, User } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  package_id: string;
  logged_by: string;
  created_at: string;
  details: any;
  profiles?: {
    full_name: string;
    email: string;
  };
  packages?: {
    tracking_number: string;
  };
}

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [stats, setStats] = useState({
    totalActions: 0,
    uniqueUsers: 0,
    last24h: 0,
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, actionFilter]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('warehouse_logs')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        packages (
          tracking_number
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setLogs(data as any);
      
      // Calculate stats
      const now = new Date();
      const last24h = data.filter((log) => {
        const logDate = new Date(log.created_at);
        const diff = now.getTime() - logDate.getTime();
        return diff < 24 * 60 * 60 * 1000;
      }).length;

      const uniqueUsers = new Set(data.map((log) => log.logged_by)).size;

      setStats({
        totalActions: data.length,
        uniqueUsers,
        last24h,
      });
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((log) => {
        const tracking = log.packages?.tracking_number || '';
        const user = log.profiles?.full_name || '';
        const email = log.profiles?.email || '';
        
        return (
          tracking.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { label: string; className: string }> = {
      PACKAGE_RECEIVED: { label: 'Recepción', className: 'bg-status-info text-white' },
      STATUS_UPDATED: { label: 'Actualización', className: 'bg-status-processing text-white' },
      CONSOLIDATION_CREATED: { label: 'Consolidación', className: 'bg-success text-white' },
      INCIDENT_REPORTED: { label: 'Incidencia', className: 'bg-status-error text-white' },
      PHOTO_UPLOADED: { label: 'Foto', className: 'bg-secondary text-white' },
    };

    const config = actionMap[action] || { label: action, className: 'bg-muted' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <DashboardLayout title="Auditoría y Logs">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Control de Auditoría
        </h2>
        <p className="text-muted-foreground">
          Monitorea todas las acciones realizadas en el sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription>Total de Acciones</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{stats.totalActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <Shield className="h-8 w-8 text-primary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <CardDescription>Usuarios Activos</CardDescription>
            <CardTitle className="text-3xl font-bold text-secondary">{stats.uniqueUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <User className="h-8 w-8 text-secondary opacity-50" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription>Últimas 24 horas</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">{stats.last24h}</CardTitle>
          </CardHeader>
          <CardContent>
            <Clock className="h-8 w-8 text-success opacity-50" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tracking, usuario o acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Auditoría</CardTitle>
          <CardDescription>
            Mostrando {filteredLogs.length} de {logs.length} acciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="font-mono text-sm">
                        {log.packages?.tracking_number}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{log.profiles?.full_name}</span>
                    <span className="text-xs">({log.profiles?.email})</span>
                  </div>
                  {log.details && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron logs que coincidan con los filtros
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AdminAuditLogs;
