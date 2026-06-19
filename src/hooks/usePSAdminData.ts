import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PSAdminStats {
  totalRequests: number;
  pendingRequests: number;
  quotedRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalQuotes: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  expiredQuotes: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface PSAdminRequest {
  id: string;
  descripcion_producto: string;
  categoria: string;
  tipo_servicio: string;
  estado: string;
  presupuesto_max: number;
  presupuesto_min: number | null;
  created_at: string;
  updated_at: string;
  cliente?: {
    full_name: string;
    email: string;
  };
  quotes_count: number;
  has_order: boolean;
}

export interface PSAdminOrder {
  id: string;
  estado: string;
  monto_producto: number;
  costo_servicio: number;
  total_cliente: number;
  comision_boxifly: number;
  comision_ps: number | null;
  created_at: string;
  updated_at: string;
  requires_client_approval: boolean | null;
  cliente?: {
    full_name: string;
    email: string;
  };
  personal_shopper?: {
    full_name: string;
    email: string;
  };
  request?: {
    descripcion_producto: string;
    categoria: string;
    tipo_servicio: string;
  };
}

export interface PSAdminQuote {
  id: string;
  nombre_producto: string;
  precio_producto: number;
  costo_servicio: number;
  total_estimado: number;
  estado: string;
  es_seleccionada: boolean | null;
  expires_at: string | null;
  created_at: string;
  respondida_at: string | null;
  razon_rechazo: string | null;
  personal_shopper?: {
    full_name: string;
    email: string;
  };
  request?: {
    descripcion_producto: string;
    categoria: string;
    cliente_id: string;
  };
}

export function usePSAdminStats() {
  return useQuery({
    queryKey: ['ps-admin-stats'],
    queryFn: async (): Promise<PSAdminStats> => {
      // Fetch requests stats
      const { data: requests } = await supabase
        .from('ps_requests')
        .select('estado');

      const requestStats = {
        total: requests?.length || 0,
        pending: requests?.filter(r => r.estado === 'recibida').length || 0,
        quoted: requests?.filter(r => r.estado === 'cotizada').length || 0,
        approved: requests?.filter(r => r.estado === 'aprobada').length || 0,
        rejected: requests?.filter(r => r.estado === 'rechazada' || r.estado === 'cancelada').length || 0,
      };

      // Fetch orders stats
      const { data: orders } = await supabase
        .from('ps_orders')
        .select('estado, total_cliente, comision_boxifly');

      const completedStates = ['entregado'];
      const activeStates = ['solicitud_recibida', 'en_revision', 'aprobado_cliente', 'compra_en_proceso', 'producto_comprado', 'en_almacen_usa', 'en_transito', 'en_aduanas', 'en_reparto'];

      const orderStats = {
        total: orders?.length || 0,
        active: orders?.filter(o => activeStates.includes(o.estado)).length || 0,
        completed: orders?.filter(o => completedStates.includes(o.estado)).length || 0,
        revenue: orders?.reduce((sum, o) => sum + (o.comision_boxifly || 0), 0) || 0,
        avgValue: orders?.length ? (orders.reduce((sum, o) => sum + (o.total_cliente || 0), 0) / orders.length) : 0,
      };

      // Fetch quotes stats
      const { data: quotes } = await supabase
        .from('ps_quotes')
        .select('estado');

      const quoteStats = {
        total: quotes?.length || 0,
        pending: quotes?.filter(q => q.estado === 'pendiente').length || 0,
        accepted: quotes?.filter(q => q.estado === 'aceptada').length || 0,
        expired: quotes?.filter(q => q.estado === 'expirada').length || 0,
      };

      return {
        totalRequests: requestStats.total,
        pendingRequests: requestStats.pending,
        quotedRequests: requestStats.quoted,
        approvedRequests: requestStats.approved,
        rejectedRequests: requestStats.rejected,
        totalOrders: orderStats.total,
        activeOrders: orderStats.active,
        completedOrders: orderStats.completed,
        totalQuotes: quoteStats.total,
        pendingQuotes: quoteStats.pending,
        acceptedQuotes: quoteStats.accepted,
        expiredQuotes: quoteStats.expired,
        totalRevenue: orderStats.revenue,
        avgOrderValue: orderStats.avgValue,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function usePSAdminRequests(statusFilter?: string) {
  return useQuery({
    queryKey: ['ps-admin-requests', statusFilter],
    queryFn: async (): Promise<PSAdminRequest[]> => {
      let query = supabase
        .from('ps_requests')
        .select(`
          id,
          descripcion_producto,
          categoria,
          tipo_servicio,
          estado,
          presupuesto_max,
          presupuesto_min,
          created_at,
          updated_at,
          cliente_id
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('estado', statusFilter as any);
      }

      const { data: requests, error } = await query;

      if (error) throw error;

      // Fetch client profiles
      const clientIds = [...new Set(requests?.map(r => r.cliente_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', clientIds);

      // Fetch quotes count for each request
      const { data: quotesData } = await supabase
        .from('ps_quotes')
        .select('request_id');

      // Fetch orders to check which requests have orders
      const { data: ordersData } = await supabase
        .from('ps_orders')
        .select('request_id');

      const quotesCountMap = new Map<string, number>();
      quotesData?.forEach(q => {
        quotesCountMap.set(q.request_id, (quotesCountMap.get(q.request_id) || 0) + 1);
      });

      const ordersSet = new Set(ordersData?.map(o => o.request_id) || []);
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return (requests || []).map(r => ({
        ...r,
        cliente: profilesMap.get(r.cliente_id),
        quotes_count: quotesCountMap.get(r.id) || 0,
        has_order: ordersSet.has(r.id),
      }));
    },
    refetchInterval: 30000,
  });
}

export function usePSAdminOrders(statusFilter?: string) {
  return useQuery({
    queryKey: ['ps-admin-orders', statusFilter],
    queryFn: async (): Promise<PSAdminOrder[]> => {
      let query = supabase
        .from('ps_orders')
        .select(`
          id,
          estado,
          monto_producto,
          costo_servicio,
          total_cliente,
          comision_boxifly,
          comision_ps,
          created_at,
          updated_at,
          requires_client_approval,
          cliente_id,
          personal_shopper_id,
          request_id
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('estado', statusFilter as any);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Fetch all related data
      const clientIds = [...new Set(orders?.map(o => o.cliente_id) || [])];
      const shopperIds = [...new Set(orders?.map(o => o.personal_shopper_id) || [])];
      const requestIds = [...new Set(orders?.map(o => o.request_id) || [])];

      const [{ data: clients }, { data: shoppers }, { data: requests }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').in('id', clientIds),
        supabase.from('profiles').select('id, full_name, email').in('id', shopperIds),
        supabase.from('ps_requests').select('id, descripcion_producto, categoria, tipo_servicio').in('id', requestIds),
      ]);

      const clientsMap = new Map(clients?.map(c => [c.id, c]) || []);
      const shoppersMap = new Map(shoppers?.map(s => [s.id, s]) || []);
      const requestsMap = new Map(requests?.map(r => [r.id, r]) || []);

      return (orders || []).map(o => ({
        ...o,
        cliente: clientsMap.get(o.cliente_id),
        personal_shopper: shoppersMap.get(o.personal_shopper_id),
        request: requestsMap.get(o.request_id),
      }));
    },
    refetchInterval: 30000,
  });
}

export function usePSAdminQuotes(statusFilter?: string) {
  return useQuery({
    queryKey: ['ps-admin-quotes', statusFilter],
    queryFn: async (): Promise<PSAdminQuote[]> => {
      let query = supabase
        .from('ps_quotes')
        .select(`
          id,
          nombre_producto,
          precio_producto,
          costo_servicio,
          total_estimado,
          estado,
          es_seleccionada,
          expires_at,
          created_at,
          respondida_at,
          razon_rechazo,
          personal_shopper_id,
          request_id
        `)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('estado', statusFilter as any);
      }

      const { data: quotes, error } = await query;

      if (error) throw error;

      // Fetch related data
      const shopperIds = [...new Set(quotes?.map(q => q.personal_shopper_id) || [])];
      const requestIds = [...new Set(quotes?.map(q => q.request_id) || [])];

      const [{ data: shoppers }, { data: requests }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email').in('id', shopperIds),
        supabase.from('ps_requests').select('id, descripcion_producto, categoria, cliente_id').in('id', requestIds),
      ]);

      const shoppersMap = new Map(shoppers?.map(s => [s.id, s]) || []);
      const requestsMap = new Map(requests?.map(r => [r.id, r]) || []);

      return (quotes || []).map(q => ({
        ...q,
        personal_shopper: shoppersMap.get(q.personal_shopper_id),
        request: requestsMap.get(q.request_id),
      }));
    },
    refetchInterval: 30000,
  });
}
