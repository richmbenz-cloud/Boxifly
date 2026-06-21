import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ExchangeRate {
  rate_date: string;
  base_currency: string;
  quote_currency: string;
  sbs_venta: number;
  sbs_compra: number | null;
  margin: number;
  effective_rate: number;
  source: string;
}

/**
 * Fetches today's USD->PEN exchange rate (SBS/SUNAT venta + margin) from the
 * `exchange-rate` edge function. Cached for an hour client-side.
 */
export const useExchangeRate = (enabled = true) => {
  return useQuery({
    queryKey: ['exchange-rate', 'USD', 'PEN'],
    queryFn: async (): Promise<ExchangeRate> => {
      const { data, error } = await supabase.functions.invoke('exchange-rate', {
        body: { base: 'USD', quote: 'PEN' },
      });
      if (error) throw new Error(error.message);
      if (!data?.effective_rate) throw new Error('No exchange rate available');
      return data as ExchangeRate;
    },
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
};
