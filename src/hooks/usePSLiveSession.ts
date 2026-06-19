import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// Types based on database schema
export type PSLiveSessionStatus = 
  | 'programada'
  | 'esperando_ps'
  | 'en_vivo'
  | 'pausada'
  | 'finalizada'
  | 'cancelada'
  | 'expirada';

export interface PSLiveSession {
  id: string;
  personal_shopper_id: string;
  live_order_id: string | null;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  tienda: string;
  ubicacion: string;
  ciudad: string | null;
  fecha: string;
  hora_peru: string;
  hora_usa: string;
  duracion_estimada: number;
  estado: PSLiveSessionStatus;
  max_viewers: number;
  total_ventas: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  // Lock mechanism
  locked_at: string | null;
  locked_by: string | null;
  lock_reason: string | null;
}

export interface PSLiveEvent {
  id: string;
  session_id: string;
  tipo: string;
  actor_id: string;
  actor_tipo: 'cliente' | 'shopper' | 'sistema';
  descripcion: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Valid state transitions for shoppers
const SHOPPER_STATE_TRANSITIONS: Record<PSLiveSessionStatus, PSLiveSessionStatus[]> = {
  programada: ['esperando_ps', 'cancelada'],
  esperando_ps: ['en_vivo', 'cancelada'],
  en_vivo: ['pausada', 'finalizada'],
  pausada: ['en_vivo', 'finalizada', 'cancelada'],
  finalizada: [],
  cancelada: [],
  expirada: [],
};

// Check if shopper can start session
const canShopperStartSession = (estado: PSLiveSessionStatus): boolean => {
  return estado === 'esperando_ps';
};

// Check if session is active (client can interact)
const isSessionActive = (estado: PSLiveSessionStatus): boolean => {
  return estado === 'en_vivo';
};

// Check if session is locked
const isSessionLocked = (session: PSLiveSession | null): boolean => {
  return session?.locked_at !== null && session?.lock_reason === 'budget_exhausted';
};

export function usePSLiveSession(sessionId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch single session with order details
  const sessionQuery = useQuery({
    queryKey: ['ps-live-session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      
      const { data, error } = await supabase
        .from('ps_live_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();
      
      if (error) throw error;
      return data as PSLiveSession | null;
    },
    enabled: !!sessionId,
  });

  // Fetch session events (audit trail)
  const eventsQuery = useQuery({
    queryKey: ['ps-live-events', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('ps_live_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as PSLiveEvent[];
    },
    enabled: !!sessionId,
  });

  // Fetch sessions for shopper
  const shopperSessionsQuery = useQuery({
    queryKey: ['ps-live-sessions', 'shopper', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('ps_live_sessions')
        .select('*')
        .eq('personal_shopper_id', user.id)
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      return data as PSLiveSession[];
    },
    enabled: !!user?.id,
  });

  // Fetch sessions for client (via their orders)
  const clientSessionsQuery = useQuery({
    queryKey: ['ps-live-sessions', 'client', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // First get client's live orders
      const { data: orders, error: ordersError } = await supabase
        .from('ps_live_orders')
        .select('id')
        .eq('cliente_id', user.id);
      
      if (ordersError) throw ordersError;
      if (!orders || orders.length === 0) return [];

      const orderIds = orders.map(o => o.id);
      
      const { data, error } = await supabase
        .from('ps_live_sessions')
        .select('*')
        .in('live_order_id', orderIds)
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      return data as PSLiveSession[];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription for session updates
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`ps-live-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ps_live_sessions',
          filter: `id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ps-live-session', sessionId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ps_live_events',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['ps-live-events', sessionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, queryClient]);

  // =====================================================
  // ATOMIC RPCs - All session control via backend
  // =====================================================

  // Start session via RPC (SHOPPER ONLY)
  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc('start_ps_live_session', {
        p_session_id: sessionId,
      });

      if (error) throw error;
      return data as { success: boolean; estado: string; started_at: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-session'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      toast({
        title: '🔴 Sesión en vivo',
        description: 'La sesión ha comenzado.',
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

  // Pause session via RPC (SHOPPER ONLY)
  const pauseSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc('pause_ps_live_session', {
        p_session_id: sessionId,
      });

      if (error) throw error;
      return data as { success: boolean; estado: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-session'] });
      toast({
        title: 'Sesión pausada',
        description: 'La sesión está en pausa.',
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

  // Resume session via RPC (SHOPPER ONLY)
  const resumeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc('resume_ps_live_session', {
        p_session_id: sessionId,
      });

      if (error) throw error;
      return data as { success: boolean; estado: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-session'] });
      toast({
        title: '🔴 Sesión en vivo',
        description: 'La sesión ha sido reanudada.',
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

  // End session via RPC (SHOPPER ONLY)
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc('end_ps_live_session', {
        p_session_id: sessionId,
      });

      if (error) throw error;
      return data as { success: boolean; estado: string; total_ventas: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ps-live-session'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['ps-live-order'] });
      toast({
        title: 'Sesión finalizada',
        description: `La sesión terminó. Total ventas: $${data?.total_ventas?.toFixed(2) || '0.00'}`,
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

  // Helper functions
  const isActive = useCallback((session: PSLiveSession | null): boolean => {
    if (!session) return false;
    return isSessionActive(session.estado);
  }, []);

  const canStart = useCallback((session: PSLiveSession | null): boolean => {
    if (!session || !user?.id) return false;
    return session.personal_shopper_id === user.id && canShopperStartSession(session.estado);
  }, [user?.id]);

  const canControl = useCallback((session: PSLiveSession | null): boolean => {
    if (!session || !user?.id) return false;
    return session.personal_shopper_id === user.id && ['en_vivo', 'pausada'].includes(session.estado);
  }, [user?.id]);

  const canResume = useCallback((session: PSLiveSession | null): boolean => {
    if (!session || !user?.id) return false;
    // Cannot resume if budget exhausted
    if (session.lock_reason === 'budget_exhausted') return false;
    return session.personal_shopper_id === user.id && session.estado === 'pausada';
  }, [user?.id]);

  // Calculate session duration
  const getSessionDuration = useCallback((session: PSLiveSession | null): number => {
    if (!session?.started_at) return 0;
    const start = new Date(session.started_at);
    const end = session.ended_at ? new Date(session.ended_at) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / 1000 / 60); // minutes
  }, []);

  // Check if session is paused due to budget exhausted
  const isBudgetExhausted = useCallback((session: PSLiveSession | null): boolean => {
    return session?.lock_reason === 'budget_exhausted';
  }, []);

  return {
    // Data
    session: sessionQuery.data,
    events: eventsQuery.data ?? [],
    shopperSessions: shopperSessionsQuery.data ?? [],
    clientSessions: clientSessionsQuery.data ?? [],
    
    // Loading states
    isLoading: sessionQuery.isLoading,
    isLoadingEvents: eventsQuery.isLoading,
    
    // Mutations (via atomic RPCs)
    startSession: startSessionMutation.mutateAsync,
    pauseSession: pauseSessionMutation.mutateAsync,
    resumeSession: resumeSessionMutation.mutateAsync,
    endSession: endSessionMutation.mutateAsync,
    
    // Mutation states
    isStarting: startSessionMutation.isPending,
    isPausing: pauseSessionMutation.isPending,
    isResuming: resumeSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    
    // Helper functions
    isActive,
    canStart,
    canControl,
    canResume,
    getSessionDuration,
    isBudgetExhausted,
    isSessionLocked,
    
    // State transition helpers
    SHOPPER_STATE_TRANSITIONS,
  };
}
