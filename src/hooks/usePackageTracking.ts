import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TrackingEvent {
  id: string;
  package_id: string;
  carrier: string;
  tracking_number: string;
  status: string;
  location: string | null;
  description: string | null;
  event_timestamp: string;
  created_at: string | null;
}

/**
 * usePackageTracking
 * Lee los checkpoints granulares del carrier (tabla `tracking_events`) para un
 * paquete y se mantiene EN VIVO vía Supabase Realtime:
 *  - Cualquier cambio en `tracking_events` del paquete -> refetch del feed.
 *    (Las Edge Functions `sync-tracking` / `aftership-tracking` reemplazan los
 *     eventos con DELETE + INSERT, por eso un refetch completo es lo más robusto.)
 *  - UPDATE de `packages` -> actualiza `current_status` en vivo.
 *
 * Requiere que `tracking_events` y `packages` estén en la publicación
 * `supabase_realtime` (ver migración 20260622093000_realtime_tracking.sql).
 */
export function usePackageTracking(packageId: string | undefined) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!packageId) return;
    const { data, error } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('package_id', packageId)
      .order('event_timestamp', { ascending: false });

    if (!error && data) {
      setEvents(data as TrackingEvent[]);
    }
    setLoading(false);
  }, [packageId]);

  useEffect(() => {
    if (!packageId) return;

    fetchEvents();

    const channel = supabase
      .channel(`package-tracking-${packageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tracking_events',
          filter: `package_id=eq.${packageId}`,
        },
        () => {
          // Refetch ante INSERT/UPDATE/DELETE para reflejar el estado real.
          fetchEvents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'packages',
          filter: `id=eq.${packageId}`,
        },
        (payload) => {
          const updated = payload.new as { current_status?: string | null };
          if (updated?.current_status) {
            setCurrentStatus(updated.current_status);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [packageId, fetchEvents]);

  return { events, currentStatus, loading, refetch: fetchEvents };
}
