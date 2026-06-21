import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, TrendingUp, Users, Gift, AlertTriangle, Download, FileSpreadsheet, FileText, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

interface LoyaltyStats {
  totalPointsEarned: number;
  totalPointsSpent: number;
  totalPointsExpired: number;
  totalActivePoints: number;
  conversionRate: number;
  usersByTier: { tier: string; count: number; color: string }[];
  pointsTrend: { month: string; earned: number; spent: number; expired: number }[];
  topUsers: { name: string; points: number; tier: string }[];
}

const LoyaltyAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [selectedPreset, setSelectedPreset] = useState('last_month');
  const [customDateOpen, setCustomDateOpen] = useState(false);
  
  const [stats, setStats] = useState<LoyaltyStats>({
    totalPointsEarned: 0,
    totalPointsSpent: 0,
    totalPointsExpired: 0,
    totalActivePoints: 0,
    conversionRate: 0,
    usersByTier: [],
    pointsTrend: [],
    topUsers: [],
  });

  const TIER_COLORS = {
    bronce: '#CD7F32',
    plata: '#C0C0C0',
    oro: '#FFD700',
    platino: '#E5E4E2',
  };

  const datePresets = [
    { label: 'Última Semana', value: 'last_week', from: subDays(new Date(), 7), to: new Date() },
    { label: 'Último Mes', value: 'last_month', from: subMonths(new Date(), 1), to: new Date() },
    { label: 'Último Trimestre', value: 'last_quarter', from: startOfQuarter(subMonths(new Date(), 3)), to: endOfQuarter(subMonths(new Date(), 3)) },
    { label: 'Este Mes', value: 'this_month', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    { label: 'Este Trimestre', value: 'this_quarter', from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) },
  ];

  useEffect(() => {
    fetchLoyaltyAnalytics();
  }, [dateRange]);

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const selected = datePresets.find(p => p.value === preset);
    if (selected) {
      setDateRange({ from: selected.from, to: selected.to });
    }
  };

  const handleCustomDateChange = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      setDateRange({ from, to });
      setSelectedPreset('custom');
      setCustomDateOpen(false);
    }
  };

  const fetchLoyaltyAnalytics = async () => {
    setLoading(true);
    try {
      const fromDate = dateRange.from.toISOString();
      const toDate = dateRange.to.toISOString();

      // Fetch loyalty points data filtered by date range
      const { data: loyaltyPoints } = await supabase
        .from('loyalty_points')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      // Fetch all profiles with VIP tier info
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, vip_tier, vip_points_lifetime')
        .order('vip_points_lifetime', { ascending: false });

      if (!loyaltyPoints || !profiles) {
        setLoading(false);
        return;
      }

      // Calculate total points earned
      const totalEarned = loyaltyPoints
        .filter(p => p.transaction_type === 'earned')
        .reduce((sum, p) => sum + p.points_earned, 0);

      // Calculate total points spent
      const totalSpent = loyaltyPoints
        .filter(p => p.transaction_type === 'spent')
        .reduce((sum, p) => sum + p.points_spent, 0);

      // Calculate expired points (earned points with past expiration date that weren't spent)
      const now = new Date();
      const expiredPoints = loyaltyPoints
        .filter(p => 
          p.transaction_type === 'earned' &&
          p.expires_at && 
          new Date(p.expires_at) < now &&
          (p.points_earned - p.points_spent) > 0
        )
        .reduce((sum, p) => sum + (p.points_earned - p.points_spent), 0);

      // Calculate active points (not expired, not spent)
      const activePoints = loyaltyPoints
        .filter(p => 
          p.transaction_type === 'earned' &&
          (!p.expires_at || new Date(p.expires_at) > now)
        )
        .reduce((sum, p) => sum + (p.points_earned - p.points_spent), 0);

      // Calculate conversion rate (points spent / points earned)
      const conversionRate = totalEarned > 0 ? (totalSpent / totalEarned) * 100 : 0;

      // Calculate users by tier
      const tierCounts = profiles.reduce((acc, profile) => {
        const tier = profile.vip_tier || 'bronce';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const usersByTier = Object.entries(tierCounts).map(([tier, count]) => ({
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        count,
        color: TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#999999',
      }));

      // Calculate points trend by month (last 6 months)
      const monthsAgo = 6;
      const trendData: { month: string; earned: number; spent: number; expired: number }[] = [];
      
      for (let i = monthsAgo - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const earnedInMonth = loyaltyPoints
          .filter(p => {
            const createdAt = new Date(p.created_at);
            return p.transaction_type === 'earned' &&
                   createdAt >= monthStart &&
                   createdAt <= monthEnd;
          })
          .reduce((sum, p) => sum + p.points_earned, 0);

        const spentInMonth = loyaltyPoints
          .filter(p => {
            const createdAt = new Date(p.created_at);
            return p.transaction_type === 'spent' &&
                   createdAt >= monthStart &&
                   createdAt <= monthEnd;
          })
          .reduce((sum, p) => sum + p.points_spent, 0);

        const expiredInMonth = loyaltyPoints
          .filter(p => {
            const expiresAt = p.expires_at ? new Date(p.expires_at) : null;
            return p.transaction_type === 'earned' &&
                   expiresAt &&
                   expiresAt >= monthStart &&
                   expiresAt <= monthEnd &&
                   expiresAt < now &&
                   (p.points_earned - p.points_spent) > 0;
          })
          .reduce((sum, p) => sum + (p.points_earned - p.points_spent), 0);

        trendData.push({
          month: date.toLocaleDateString('es-PE', { month: 'short' }),
          earned: earnedInMonth,
          spent: spentInMonth,
          expired: expiredInMonth,
        });
      }

      // Get top 10 users by lifetime points
      const topUsers = profiles
        .slice(0, 10)
        .map(profile => ({
          name: profile.full_name || 'Usuario',
          points: profile.vip_points_lifetime || 0,
          tier: (profile.vip_tier || 'bronce').charAt(0).toUpperCase() + (profile.vip_tier || 'bronce').slice(1),
        }));

      setStats({
        totalPointsEarned: totalEarned,
        totalPointsSpent: totalSpent,
        totalPointsExpired: expiredPoints,
        totalActivePoints: activePoints,
        conversionRate: Math.round(conversionRate * 100) / 100,
        usersByTier,
        pointsTrend: trendData,
        topUsers,
      });
    } catch (error) {
      console.error('Error fetching loyalty analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: KPIs Summary
      const kpisData = [
        ['Reporte de Fidelidad Boxifly'],
        [`Período: ${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`],
        [],
        ['Métrica', 'Valor'],
        ['Puntos Ganados Total', stats.totalPointsEarned.toLocaleString()],
        ['Puntos Canjeados Total', stats.totalPointsSpent.toLocaleString()],
        ['Puntos Activos', stats.totalActivePoints.toLocaleString()],
        ['Puntos Expirados', stats.totalPointsExpired.toLocaleString()],
        ['Tasa de Conversión (%)', stats.conversionRate],
        ['Tasa de Expiración (%)', stats.totalPointsEarned > 0 
          ? ((stats.totalPointsExpired / stats.totalPointsEarned) * 100).toFixed(2) 
          : 0],
      ];
      const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
      XLSX.utils.book_append_sheet(wb, kpisSheet, 'KPIs');

      // Sheet 2: Users by Tier
      const tierData = [
        ['Tier VIP', 'Cantidad de Usuarios', 'Porcentaje'],
        ...stats.usersByTier.map(tier => [
          tier.tier,
          tier.count,
          `${((tier.count / stats.usersByTier.reduce((sum, t) => sum + t.count, 0)) * 100).toFixed(2)}%`
        ])
      ];
      const tierSheet = XLSX.utils.aoa_to_sheet(tierData);
      XLSX.utils.book_append_sheet(wb, tierSheet, 'Usuarios por Tier');

      // Sheet 3: Points Trend
      const trendData = [
        ['Mes', 'Puntos Ganados', 'Puntos Canjeados', 'Puntos Expirados'],
        ...stats.pointsTrend.map(t => [t.month, t.earned, t.spent, t.expired])
      ];
      const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
      XLSX.utils.book_append_sheet(wb, trendSheet, 'Tendencia Mensual');

      // Sheet 4: Top Users
      const topUsersData = [
        ['Posición', 'Usuario', 'Puntos Acumulados', 'Tier VIP'],
        ...stats.topUsers.map((user, idx) => [idx + 1, user.name, user.points, user.tier])
      ];
      const topUsersSheet = XLSX.utils.aoa_to_sheet(topUsersData);
      XLSX.utils.book_append_sheet(wb, topUsersSheet, 'Top 10 Usuarios');

      // Generate filename with current date and period
      const date = new Date().toISOString().split('T')[0];
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');
      const filename = `Reporte_Fidelidad_${fromDate}_${toDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success('Reporte Excel generado exitosamente');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Error al generar reporte Excel');
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString('es-PE');
      const periodText = `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(26, 115, 232); // Primary color
      doc.text('Reporte de Analytics de Fidelidad', 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Boxifly - ${date}`, 14, 28);
      doc.text(`Período: ${periodText}`, 14, 34);
      
      // KPIs Section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Métricas Principales', 14, 44);
      
      autoTable(doc, {
        startY: 49,
        head: [['Métrica', 'Valor']],
        body: [
          ['Puntos Ganados Total', stats.totalPointsEarned.toLocaleString()],
          ['Puntos Canjeados Total', stats.totalPointsSpent.toLocaleString()],
          ['Puntos Activos', stats.totalActivePoints.toLocaleString()],
          ['Puntos Expirados', stats.totalPointsExpired.toLocaleString()],
          ['Tasa de Conversión', `${stats.conversionRate}%`],
          ['Tasa de Expiración', `${stats.totalPointsEarned > 0 
            ? ((stats.totalPointsExpired / stats.totalPointsEarned) * 100).toFixed(2) 
            : 0}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [26, 115, 232] },
      });

      // Users by Tier Section
      let finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Usuarios por Tier VIP', 14, finalY);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Tier', 'Cantidad', 'Porcentaje']],
        body: stats.usersByTier.map(tier => [
          tier.tier,
          tier.count.toString(),
          `${((tier.count / stats.usersByTier.reduce((sum, t) => sum + t.count, 0)) * 100).toFixed(2)}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [26, 115, 232] },
      });

      // Add new page for trends
      doc.addPage();
      
      // Points Trend Section
      doc.setFontSize(14);
      doc.text('Tendencia Mensual de Puntos', 14, 20);
      
      autoTable(doc, {
        startY: 25,
        head: [['Mes', 'Ganados', 'Canjeados', 'Expirados']],
        body: stats.pointsTrend.map(t => [
          t.month,
          t.earned.toLocaleString(),
          t.spent.toLocaleString(),
          t.expired.toLocaleString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [26, 115, 232] },
      });

      // Top Users Section
      finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Top 10 Usuarios', 14, finalY);
      
      autoTable(doc, {
        startY: finalY + 5,
        head: [['#', 'Usuario', 'Puntos', 'Tier']],
        body: stats.topUsers.map((user, idx) => [
          (idx + 1).toString(),
          user.name,
          user.points.toLocaleString(),
          user.tier
        ]),
        theme: 'grid',
        headStyles: { fillColor: [26, 115, 232] },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');
      const filename = `Reporte_Fidelidad_${fromDate}_${toDate}.pdf`;
      doc.save(filename);
      
      toast.success('Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Error al generar reporte PDF');
    }
  };

  return (
    <DashboardLayout title="Analytics de Fidelidad">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics de Fidelidad</h1>
            <p className="text-muted-foreground">
              Métricas y estadísticas del programa de puntos y VIP
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={exportToExcel} 
              variant="outline"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Excel
            </Button>
            <Button 
              onClick={exportToPDF} 
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Date Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Período
            </CardTitle>
            <CardDescription>
              Selecciona un período para generar reportes específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {datePresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={selectedPreset === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
              
              <Popover open={customDateOpen} onOpenChange={setCustomDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={selectedPreset === 'custom' ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Rango Personalizado
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Fecha de Inicio</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && handleCustomDateChange(date, dateRange.to)}
                        autoFocus
                        className={cn("pointer-events-auto")}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Fecha de Fin</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && handleCustomDateChange(dateRange.from, date)}
                        className={cn("pointer-events-auto")}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Badge variant="secondary" className="ml-2">
                {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Puntos Ganados
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPointsEarned.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total de puntos otorgados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Puntos Canjeados
              </CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPointsSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Conversión: {stats.conversionRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Puntos Activos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActivePoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Disponibles para canjear
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Puntos Expirados
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.totalPointsExpired.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                No utilizados a tiempo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Points Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Puntos</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.pointsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="earned" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Ganados"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spent" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Canjeados"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expired" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Expirados"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Users by Tier Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios por Tier VIP</CardTitle>
              <CardDescription>Distribución actual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.usersByTier}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tier, count, percent }: any) => `${tier}: ${count} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.usersByTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Points Comparison Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Puntos</CardTitle>
              <CardDescription>Ganados vs Canjeados vs Expirados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Puntos',
                      Ganados: stats.totalPointsEarned,
                      Canjeados: stats.totalPointsSpent,
                      Expirados: stats.totalPointsExpired,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Ganados" fill="hsl(var(--primary))" />
                  <Bar dataKey="Canjeados" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="Expirados" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Usuarios</CardTitle>
              <CardDescription>Por puntos acumulados históricos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {user.tier}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{user.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">puntos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Métricas</CardTitle>
            <CardDescription>Indicadores clave del programa de fidelidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  Puntos canjeados / Puntos ganados
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tasa de Expiración</p>
                <p className="text-2xl font-bold">
                  {stats.totalPointsEarned > 0 
                    ? ((stats.totalPointsExpired / stats.totalPointsEarned) * 100).toFixed(2) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Puntos expirados / Puntos ganados
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Puntos Pendientes</p>
                <p className="text-2xl font-bold">{stats.totalActivePoints.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Valor potencial: S/ {stats.totalActivePoints.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LoyaltyAnalytics;
