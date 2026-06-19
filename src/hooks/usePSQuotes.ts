import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export type PSQuoteStatus = 'pendiente' | 'aceptada' | 'rechazada' | 'expirada' | 'modificada';

export interface PSQuote {
  id: string;
  request_id: string;
  personal_shopper_id: string;
  nombre_producto: string;
  descripcion: string | null;
  url_producto: string | null;
  imagen_url: string | null;
  precio_producto: number;
  impuestos_estimados: number | null;
  costo_servicio: number;
  total_estimado: number;
  es_seleccionada: boolean | null;
  notas_ps: string | null;
  created_at: string;
  expires_at: string | null;
  estado: PSQuoteStatus;
  respondida_at: string | null;
  razon_rechazo: string | null;
}

export function usePSQuotes(requestId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch quotes for a request
  const quotesQuery = useQuery({
    queryKey: ['ps-quotes', requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const { data, error } = await supabase
        .from('ps_quotes')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PSQuote[];
    },
    enabled: !!requestId,
  });

  // Approve quote mutation - uses database function for atomic operation
  const approveQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      // Call the database function for atomic approval
      const { data, error } = await supabase.rpc('approve_ps_quote', {
        p_quote_id: quoteId,
        p_cliente_id: user.id,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });
      
      if (error) throw error;
      if (!data) throw new Error('No se pudo aprobar la cotización');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-quotes', requestId] });
      queryClient.invalidateQueries({ queryKey: ['ps-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['ps-order-by-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['ps-requests'] });
      toast.success('¡Cotización aprobada! Tu pedido ha sido confirmado.');
    },
    onError: (error: Error) => {
      toast.error(`Error al aprobar: ${error.message}`);
    },
  });

  // Reject quote mutation
  const rejectQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, razon }: { quoteId: string; razon: string }) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase.rpc('reject_ps_quote', {
        p_quote_id: quoteId,
        p_cliente_id: user.id,
        p_razon: razon,
        p_ip_address: null,
        p_user_agent: navigator.userAgent,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-quotes', requestId] });
      queryClient.invalidateQueries({ queryKey: ['ps-request', requestId] });
      toast.success('Cotización rechazada');
    },
    onError: (error: Error) => {
      toast.error(`Error al rechazar: ${error.message}`);
    },
  });

  // Check if quote is expired
  const isQuoteExpired = (quote: PSQuote): boolean => {
    if (!quote.expires_at) return false;
    return new Date(quote.expires_at) < new Date();
  };

  // Get quote status info for UI
  const getQuoteStatusInfo = (quote: PSQuote) => {
    if (isQuoteExpired(quote) && quote.estado === 'pendiente') {
      return { status: 'expirada', label: 'Expirada', className: 'bg-muted text-muted-foreground' };
    }
    
    const statusMap: Record<PSQuoteStatus, { label: string; className: string }> = {
      pendiente: { label: 'Pendiente', className: 'bg-status-warning text-foreground' },
      aceptada: { label: 'Aceptada', className: 'bg-status-delivered text-white' },
      rechazada: { label: 'Rechazada', className: 'bg-destructive text-white' },
      expirada: { label: 'Expirada', className: 'bg-muted text-muted-foreground' },
      modificada: { label: 'Reemplazada', className: 'bg-muted text-muted-foreground' },
    };
    
    return { status: quote.estado, ...statusMap[quote.estado] };
  };

  // Calculate time remaining for quote
  const getTimeRemaining = (quote: PSQuote): string | null => {
    if (!quote.expires_at || quote.estado !== 'pendiente') return null;
    
    const now = new Date();
    const expires = new Date(quote.expires_at);
    const diffMs = expires.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expirada';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} día${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    return `${minutes} minuto${minutes > 1 ? 's' : ''} restante${minutes > 1 ? 's' : ''}`;
  };

  return {
    quotes: quotesQuery.data || [],
    isLoading: quotesQuery.isLoading,
    approveQuote: approveQuoteMutation.mutate,
    rejectQuote: rejectQuoteMutation.mutate,
    isApproving: approveQuoteMutation.isPending,
    isRejecting: rejectQuoteMutation.isPending,
    isQuoteExpired,
    getQuoteStatusInfo,
    getTimeRemaining,
  };
}
