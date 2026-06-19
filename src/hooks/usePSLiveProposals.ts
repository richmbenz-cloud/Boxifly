import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export type PSLiveProposalResponse = 
  | 'pendiente'
  | 'aprobada'
  | 'rechazada'
  | 'timeout_auto_aprobada'
  | 'timeout_auto_rechazada';

export interface PSLiveProposal {
  id: string;
  session_id: string;
  live_order_id: string;
  nombre_producto: string;
  descripcion: string | null;
  precio: number;
  tienda: string;
  categoria: string;
  imagen_url: string | null;
  respuesta: PSLiveProposalResponse;
  respuesta_at: string | null;
  motivo_rechazo: string | null;
  silencio_aplicado: boolean;
  silencio_aplicado_at: string | null;
  presupuesto_disponible_al_proponer: number;
  created_at: string;
}

export interface PSLiveOrder {
  id: string;
  cliente_id: string;
  personal_shopper_id: string | null;
  presupuesto_maximo: number;
  presupuesto_gastado: number;
  moneda: string;
  categorias_permitidas: string[];
  tiendas_objetivo: string[] | null;
  duracion_max_sesion: number;
  limite_items: number;
  regla_silencio_segundos: number;
  regla_silencio_accion: 'rechazar_auto' | 'aprobar_auto' | 'pasar_siguiente';
  tipo_aprobacion: 'automatica' | 'manual_por_item';
  metodo_pago: 'wallet' | 'preautorizacion';
  estado: string;
  budget_exhausted: boolean;
  budget_exhausted_at: string | null;
}

interface CreateProposalParams {
  sessionId: string;
  liveOrderId: string;
  nombreProducto: string;
  precio: number;
  tienda: string;
  categoria: string;
  descripcion?: string;
  imagenUrl?: string;
}

export function usePSLiveProposals(sessionId?: string, liveOrderId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [silenceTimers, setSilenceTimers] = useState<Map<string, number>>(new Map());

  // Fetch proposals for a session
  const proposalsQuery = useQuery({
    queryKey: ['ps-live-proposals', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('ps_live_proposals')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PSLiveProposal[];
    },
    enabled: !!sessionId,
    refetchInterval: 5000,
  });

  // Fetch order details for budget tracking
  const orderQuery = useQuery({
    queryKey: ['ps-live-order', liveOrderId],
    queryFn: async () => {
      if (!liveOrderId) return null;
      
      const { data, error } = await supabase
        .from('ps_live_orders')
        .select('*')
        .eq('id', liveOrderId)
        .maybeSingle();
      
      if (error) throw error;
      return data as PSLiveOrder | null;
    },
    enabled: !!liveOrderId,
    refetchInterval: 3000,
  });

  // Realtime subscription for proposals
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`ps-live-proposals-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ps_live_proposals',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ps-live-proposals', sessionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  // Realtime for order budget updates
  useEffect(() => {
    if (!liveOrderId) return;

    const channel = supabase
      .channel(`ps-live-order-budget-${liveOrderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ps_live_orders',
          filter: `id=eq.${liveOrderId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ps-live-order', liveOrderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveOrderId, queryClient]);

  // Silence timer tracking
  useEffect(() => {
    const proposals = proposalsQuery.data ?? [];
    const order = orderQuery.data;
    if (!order) return;

    const pendingProposals = proposals.filter(p => p.respuesta === 'pendiente');
    const newTimers = new Map<string, number>();

    pendingProposals.forEach(proposal => {
      const createdAt = new Date(proposal.created_at).getTime();
      const timeoutMs = order.regla_silencio_segundos * 1000;
      const remaining = Math.max(0, timeoutMs - (Date.now() - createdAt));
      newTimers.set(proposal.id, Math.ceil(remaining / 1000));
    });

    setSilenceTimers(newTimers);

    const interval = setInterval(() => {
      setSilenceTimers(prev => {
        const updated = new Map<string, number>();
        prev.forEach((seconds, id) => {
          if (seconds > 0) {
            updated.set(id, seconds - 1);
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [proposalsQuery.data, orderQuery.data]);

  // CREATE PROPOSAL via RPC (SHOPPER ONLY)
  const createProposalMutation = useMutation({
    mutationFn: async (params: CreateProposalParams) => {
      const { data, error } = await supabase.rpc('create_ps_live_proposal', {
        p_session_id: params.sessionId,
        p_live_order_id: params.liveOrderId,
        p_nombre_producto: params.nombreProducto,
        p_precio: params.precio,
        p_tienda: params.tienda,
        p_categoria: params.categoria,
        p_descripcion: params.descripcion || null,
        p_imagen_url: params.imagenUrl || null,
      });

      if (error) throw error;
      return data as { success: boolean; proposal_id: string; presupuesto_disponible: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      toast({
        title: 'Propuesta enviada',
        description: `Presupuesto disponible: $${data.presupuesto_disponible.toFixed(2)}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear propuesta',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // APPROVE PROPOSAL via RPC (CLIENT ONLY)
  const approveProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase.rpc('approve_live_proposal', {
        p_proposal_id: proposalId,
        p_cliente_id: user.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      toast({
        title: '✅ Propuesta aprobada',
        description: 'El producto será comprado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // REJECT PROPOSAL via RPC (CLIENT ONLY)
  const rejectProposalMutation = useMutation({
    mutationFn: async ({ proposalId, motivo }: { proposalId: string; motivo?: string }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase.rpc('reject_live_proposal', {
        p_proposal_id: proposalId,
        p_cliente_id: user.id,
        p_motivo: motivo || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-proposals'] });
      toast({
        title: '❌ Propuesta rechazada',
        description: 'El shopper buscará otra opción.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // APPLY SILENCE RULE (Backend trigger)
  const applySilenceRuleMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const { data, error } = await supabase.rpc('apply_silence_rule_to_proposal', {
        p_proposal_id: proposalId,
      });

      if (error) throw error;
      return data as { success: boolean; action: string; result: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      if (data.success) {
        toast({
          title: 'Regla de silencio aplicada',
          description: `Resultado: ${data.result}`,
        });
      }
    },
  });

  // Helper functions
  const getPendingProposals = useCallback((): PSLiveProposal[] => {
    return (proposalsQuery.data ?? []).filter(p => p.respuesta === 'pendiente');
  }, [proposalsQuery.data]);

  const getApprovedProposals = useCallback((): PSLiveProposal[] => {
    return (proposalsQuery.data ?? []).filter(
      p => p.respuesta === 'aprobada' || p.respuesta === 'timeout_auto_aprobada'
    );
  }, [proposalsQuery.data]);

  const getRejectedProposals = useCallback((): PSLiveProposal[] => {
    return (proposalsQuery.data ?? []).filter(
      p => p.respuesta === 'rechazada' || p.respuesta === 'timeout_auto_rechazada'
    );
  }, [proposalsQuery.data]);

  const getAvailableBudget = useCallback((): number => {
    const order = orderQuery.data;
    if (!order) return 0;
    return order.presupuesto_maximo - order.presupuesto_gastado;
  }, [orderQuery.data]);

  const getBudgetUsagePercent = useCallback((): number => {
    const order = orderQuery.data;
    if (!order || order.presupuesto_maximo === 0) return 0;
    return (order.presupuesto_gastado / order.presupuesto_maximo) * 100;
  }, [orderQuery.data]);

  const getTotalApproved = useCallback((): number => {
    return getApprovedProposals().reduce((sum, p) => sum + p.precio, 0);
  }, [getApprovedProposals]);

  const canApproveProposal = useCallback((proposal: PSLiveProposal): boolean => {
    const order = orderQuery.data;
    if (!order || !user?.id) return false;
    if (order.cliente_id !== user.id) return false;
    if (proposal.respuesta !== 'pendiente') return false;
    if (order.budget_exhausted) return false;
    return (order.presupuesto_maximo - order.presupuesto_gastado) >= proposal.precio;
  }, [orderQuery.data, user?.id]);

  const canAddMoreItems = useCallback((): boolean => {
    const order = orderQuery.data;
    if (!order) return false;
    if (order.budget_exhausted) return false;
    const approvedCount = getApprovedProposals().length;
    return approvedCount < order.limite_items;
  }, [orderQuery.data, getApprovedProposals]);

  const getTimeRemaining = useCallback((proposalId: string): number => {
    return silenceTimers.get(proposalId) ?? 0;
  }, [silenceTimers]);

  const getSilenceAction = useCallback((): string => {
    const order = orderQuery.data;
    if (!order) return 'rechazar_auto';
    return order.regla_silencio_accion;
  }, [orderQuery.data]);

  const isBudgetExhausted = useCallback((): boolean => {
    return orderQuery.data?.budget_exhausted ?? false;
  }, [orderQuery.data]);

  const canCreateProposal = useCallback((categoria: string, precio: number): { allowed: boolean; reason?: string } => {
    const order = orderQuery.data;
    if (!order) return { allowed: false, reason: 'Orden no encontrada' };
    if (!user?.id) return { allowed: false, reason: 'Usuario no autenticado' };
    if (order.personal_shopper_id !== user.id) return { allowed: false, reason: 'No autorizado' };
    if (order.budget_exhausted) return { allowed: false, reason: 'Presupuesto agotado' };
    
    const available = order.presupuesto_maximo - order.presupuesto_gastado;
    if (precio > available) return { allowed: false, reason: `Presupuesto insuficiente. Disponible: $${available.toFixed(2)}` };
    
    if (!order.categorias_permitidas.includes(categoria)) {
      return { allowed: false, reason: `Categoría no permitida: ${categoria}` };
    }
    
    const approvedCount = getApprovedProposals().length;
    if (approvedCount >= order.limite_items) {
      return { allowed: false, reason: `Límite de items alcanzado: ${order.limite_items}` };
    }
    
    return { allowed: true };
  }, [orderQuery.data, user?.id, getApprovedProposals]);

  return {
    // Data
    proposals: proposalsQuery.data ?? [],
    order: orderQuery.data,
    silenceTimers,
    
    // Loading states
    isLoading: proposalsQuery.isLoading,
    isLoadingOrder: orderQuery.isLoading,
    
    // Mutations (via atomic RPCs)
    createProposal: createProposalMutation.mutateAsync,
    approveProposal: approveProposalMutation.mutateAsync,
    rejectProposal: rejectProposalMutation.mutateAsync,
    applySilenceRule: applySilenceRuleMutation.mutateAsync,
    
    // Mutation states
    isCreating: createProposalMutation.isPending,
    isApproving: approveProposalMutation.isPending,
    isRejecting: rejectProposalMutation.isPending,
    
    // Helper functions
    getPendingProposals,
    getApprovedProposals,
    getRejectedProposals,
    getAvailableBudget,
    getBudgetUsagePercent,
    getTotalApproved,
    canApproveProposal,
    canAddMoreItems,
    getTimeRemaining,
    getSilenceAction,
    isBudgetExhausted,
    canCreateProposal,
  };
}
