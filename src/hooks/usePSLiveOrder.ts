import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// Types based on database schema
export type PSLiveOrderStatus = 
  | 'borrador'
  | 'pendiente_aprobacion'
  | 'aprobada'
  | 'en_sesion'
  | 'completada'
  | 'cancelada'
  | 'expirada';

export type PSLiveSilenceRule = 'rechazar_auto' | 'aprobar_auto' | 'pasar_siguiente';
export type PSLiveApprovalType = 'automatica' | 'manual_por_item';
export type PSLivePaymentMethod = 'wallet' | 'preautorizacion';

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
  regla_silencio_accion: PSLiveSilenceRule;
  tipo_aprobacion: PSLiveApprovalType;
  metodo_pago: PSLivePaymentMethod;
  estado: PSLiveOrderStatus;
  fecha_preferida: string | null;
  hora_preferida_peru: string | null;
  terminos_aceptados: boolean;
  terminos_aceptados_at: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  completed_at: string | null;
}

export interface CreatePSLiveOrderData {
  presupuesto_maximo: number;
  moneda?: string;
  categorias_permitidas: string[];
  tiendas_objetivo?: string[];
  duracion_max_sesion?: number;
  limite_items?: number;
  regla_silencio_segundos?: number;
  regla_silencio_accion?: PSLiveSilenceRule;
  tipo_aprobacion?: PSLiveApprovalType;
  metodo_pago?: PSLivePaymentMethod;
  fecha_preferida?: string;
  hora_preferida_peru?: string;
}

// Valid state transitions for clients
const CLIENT_STATE_TRANSITIONS: Record<PSLiveOrderStatus, PSLiveOrderStatus[]> = {
  borrador: ['pendiente_aprobacion', 'cancelada'],
  pendiente_aprobacion: ['cancelada'], // Can only cancel while pending
  aprobada: ['cancelada'], // Can cancel before session starts
  en_sesion: [], // Cannot change during live session
  completada: [],
  cancelada: [],
  expirada: [],
};

// Check if client can perform action based on state
const canClientUpdateOrder = (estado: PSLiveOrderStatus): boolean => {
  return estado === 'borrador';
};

const canClientSubmitForApproval = (estado: PSLiveOrderStatus): boolean => {
  return estado === 'borrador';
};

const canClientCancel = (estado: PSLiveOrderStatus): boolean => {
  return ['borrador', 'pendiente_aprobacion', 'aprobada'].includes(estado);
};

export function usePSLiveOrder(orderId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch single order
  const orderQuery = useQuery({
    queryKey: ['ps-live-order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data, error } = await supabase
        .from('ps_live_orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      
      if (error) throw error;
      return data as PSLiveOrder | null;
    },
    enabled: !!orderId,
  });

  // Fetch all orders for current user (client)
  const myOrdersQuery = useQuery({
    queryKey: ['ps-live-orders', 'my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('ps_live_orders')
        .select('*')
        .eq('cliente_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PSLiveOrder[];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription for order updates
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`ps-live-order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ps_live_orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ps-live-order', orderId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, queryClient]);

  // Create new order (CLIENT ONLY)
  const createOrderMutation = useMutation({
    mutationFn: async (data: CreatePSLiveOrderData) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Validate required fields
      if (!data.presupuesto_maximo || data.presupuesto_maximo <= 0) {
        throw new Error('El presupuesto máximo debe ser mayor a 0');
      }
      if (!data.categorias_permitidas || data.categorias_permitidas.length === 0) {
        throw new Error('Debe seleccionar al menos una categoría');
      }

      const { data: newOrder, error } = await supabase
        .from('ps_live_orders')
        .insert({
          cliente_id: user.id,
          presupuesto_maximo: data.presupuesto_maximo,
          moneda: data.moneda || 'USD',
          categorias_permitidas: data.categorias_permitidas,
          tiendas_objetivo: data.tiendas_objetivo || null,
          duracion_max_sesion: data.duracion_max_sesion || 60,
          limite_items: data.limite_items || 10,
          regla_silencio_segundos: data.regla_silencio_segundos || 30,
          regla_silencio_accion: data.regla_silencio_accion || 'rechazar_auto',
          tipo_aprobacion: data.tipo_aprobacion || 'manual_por_item',
          metodo_pago: data.metodo_pago || 'preautorizacion',
          estado: 'borrador',
          fecha_preferida: data.fecha_preferida || null,
          hora_preferida_peru: data.hora_preferida_peru || null,
        })
        .select()
        .single();

      if (error) throw error;
      return newOrder as PSLiveOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-orders'] });
      toast({
        title: 'Orden creada',
        description: 'Tu orden PS Live ha sido creada como borrador.',
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

  // Update draft order (CLIENT ONLY, BORRADOR STATE ONLY)
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, data }: { orderId: string; data: Partial<CreatePSLiveOrderData> }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // First verify order state
      const { data: currentOrder, error: fetchError } = await supabase
        .from('ps_live_orders')
        .select('estado, cliente_id')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentOrder) throw new Error('Orden no encontrada');
      if (currentOrder.cliente_id !== user.id) throw new Error('No tienes permiso para modificar esta orden');
      if (!canClientUpdateOrder(currentOrder.estado as PSLiveOrderStatus)) {
        throw new Error('Solo puedes modificar órdenes en estado borrador');
      }

      const { data: updatedOrder, error } = await supabase
        .from('ps_live_orders')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('cliente_id', user.id)
        .eq('estado', 'borrador') // Double-check state
        .select()
        .single();

      if (error) throw error;
      return updatedOrder as PSLiveOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-orders'] });
      toast({
        title: 'Orden actualizada',
        description: 'Los cambios han sido guardados.',
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

  // Submit order for approval (BORRADOR → PENDIENTE_APROBACION)
  const submitForApprovalMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Verify order state and ownership
      const { data: currentOrder, error: fetchError } = await supabase
        .from('ps_live_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentOrder) throw new Error('Orden no encontrada');
      if (currentOrder.cliente_id !== user.id) throw new Error('No tienes permiso');
      if (!canClientSubmitForApproval(currentOrder.estado as PSLiveOrderStatus)) {
        throw new Error('Solo puedes enviar órdenes en estado borrador');
      }

      // Validate terms accepted
      if (!currentOrder.terminos_aceptados) {
        throw new Error('Debes aceptar los términos y condiciones');
      }

      const { data: updatedOrder, error } = await supabase
        .from('ps_live_orders')
        .update({
          estado: 'pendiente_aprobacion',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('cliente_id', user.id)
        .eq('estado', 'borrador')
        .select()
        .single();

      if (error) throw error;
      return updatedOrder as PSLiveOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-orders'] });
      toast({
        title: 'Orden enviada',
        description: 'Tu orden ha sido enviada para aprobación.',
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

  // Accept terms and conditions
  const acceptTermsMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const { data: updatedOrder, error } = await supabase
        .from('ps_live_orders')
        .update({
          terminos_aceptados: true,
          terminos_aceptados_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('cliente_id', user.id)
        .eq('estado', 'borrador')
        .select()
        .single();

      if (error) throw error;
      return updatedOrder as PSLiveOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
    },
  });

  // Cancel order (CLIENT can cancel in specific states)
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Verify order state
      const { data: currentOrder, error: fetchError } = await supabase
        .from('ps_live_orders')
        .select('estado, cliente_id')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentOrder) throw new Error('Orden no encontrada');
      if (currentOrder.cliente_id !== user.id) throw new Error('No tienes permiso');
      if (!canClientCancel(currentOrder.estado as PSLiveOrderStatus)) {
        throw new Error('No puedes cancelar una orden en este estado');
      }

      const { data: updatedOrder, error } = await supabase
        .from('ps_live_orders')
        .update({
          estado: 'cancelada',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('cliente_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return updatedOrder as PSLiveOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-orders'] });
      toast({
        title: 'Orden cancelada',
        description: 'Tu orden ha sido cancelada.',
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

  // Calculate available budget
  const getAvailableBudget = useCallback((order: PSLiveOrder | null): number => {
    if (!order) return 0;
    return Math.max(0, order.presupuesto_maximo - order.presupuesto_gastado);
  }, []);

  // Get budget usage percentage
  const getBudgetUsagePercent = useCallback((order: PSLiveOrder | null): number => {
    if (!order || order.presupuesto_maximo === 0) return 0;
    return Math.min(100, (order.presupuesto_gastado / order.presupuesto_maximo) * 100);
  }, []);

  // Check if order can be edited
  const canEdit = useCallback((order: PSLiveOrder | null): boolean => {
    if (!order || !user?.id) return false;
    return order.cliente_id === user.id && canClientUpdateOrder(order.estado);
  }, [user?.id]);

  // Check if order can be submitted
  const canSubmit = useCallback((order: PSLiveOrder | null): boolean => {
    if (!order || !user?.id) return false;
    return (
      order.cliente_id === user.id && 
      canClientSubmitForApproval(order.estado) &&
      order.terminos_aceptados
    );
  }, [user?.id]);

  // Check if order can be cancelled
  const canCancel = useCallback((order: PSLiveOrder | null): boolean => {
    if (!order || !user?.id) return false;
    return order.cliente_id === user.id && canClientCancel(order.estado);
  }, [user?.id]);

  return {
    // Data
    order: orderQuery.data,
    myOrders: myOrdersQuery.data ?? [],
    
    // Loading states
    isLoading: orderQuery.isLoading,
    isLoadingOrders: myOrdersQuery.isLoading,
    
    // Mutations
    createOrder: createOrderMutation.mutateAsync,
    updateOrder: updateOrderMutation.mutateAsync,
    submitForApproval: submitForApprovalMutation.mutateAsync,
    acceptTerms: acceptTermsMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    
    // Mutation states
    isCreating: createOrderMutation.isPending,
    isUpdating: updateOrderMutation.isPending,
    isSubmitting: submitForApprovalMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
    
    // Helper functions
    getAvailableBudget,
    getBudgetUsagePercent,
    canEdit,
    canSubmit,
    canCancel,
    
    // State transition helpers
    CLIENT_STATE_TRANSITIONS,
  };
}
