import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface CreateQuoteData {
  requestId: string;
  nombreProducto: string;
  descripcion?: string;
  urlProducto?: string;
  imagenUrl?: string;
  precioProducto: number;
  impuestosEstimados?: number;
  costoServicio: number;
  notasPs?: string;
  expiresInDays?: number; // Default to 3 days
}

export interface UpdateQuoteData {
  quoteId: string;
  nombreProducto?: string;
  descripcion?: string;
  urlProducto?: string;
  imagenUrl?: string;
  precioProducto?: number;
  impuestosEstimados?: number;
  costoServicio?: number;
  notasPs?: string;
  expiresInDays?: number;
}

export function useCreatePSQuote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Create new quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (data: CreateQuoteData) => {
      if (!user) throw new Error('Usuario no autenticado');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 3));

      const totalEstimado = 
        data.precioProducto + 
        (data.impuestosEstimados || 0) + 
        data.costoServicio;

      // 1. Create the quote
      const { data: quote, error: quoteError } = await supabase
        .from('ps_quotes')
        .insert({
          request_id: data.requestId,
          personal_shopper_id: user.id,
          nombre_producto: data.nombreProducto,
          descripcion: data.descripcion || null,
          url_producto: data.urlProducto || null,
          imagen_url: data.imagenUrl || null,
          precio_producto: data.precioProducto,
          impuestos_estimados: data.impuestosEstimados || null,
          costo_servicio: data.costoServicio,
          total_estimado: totalEstimado,
          notas_ps: data.notasPs || null,
          expires_at: expiresAt.toISOString(),
          estado: 'pendiente',
          es_seleccionada: true, // New quote is the active one
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // 2. Mark other quotes as not selected
      await supabase
        .from('ps_quotes')
        .update({ es_seleccionada: false })
        .eq('request_id', data.requestId)
        .neq('id', quote.id);

      // 3. Update request status to 'cotizada'
      const { error: requestError } = await supabase
        .from('ps_requests')
        .update({ estado: 'cotizada' })
        .eq('id', data.requestId);

      if (requestError) throw requestError;

      // 4. Get the order for this request to send system message
      const { data: order } = await supabase
        .from('ps_orders')
        .select('id')
        .eq('request_id', data.requestId)
        .single();

      if (order) {
        // 5. Send automatic system message to client
        await supabase
          .from('ps_messages')
          .insert({
            order_id: order.id,
            emisor_id: user.id,
            mensaje: `📋 Nueva cotización enviada: ${data.nombreProducto} - Total: $${totalEstimado.toFixed(2)}. La cotización expira el ${expiresAt.toLocaleDateString('es-PE')}.`,
            tipo: 'sistema',
          });
      }

      return quote;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ps-quotes', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['ps-request', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['ps-shopper-orders'] });
      queryClient.invalidateQueries({ queryKey: ['ps-messages'] });
      toast.success('Cotización enviada al cliente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear cotización: ${error.message}`);
    },
  });

  // Update existing quote mutation (creates new version)
  const updateQuoteMutation = useMutation({
    mutationFn: async (data: UpdateQuoteData) => {
      if (!user) throw new Error('Usuario no autenticado');

      // Get existing quote to copy data
      const { data: existingQuote, error: fetchError } = await supabase
        .from('ps_quotes')
        .select('*')
        .eq('id', data.quoteId)
        .single();

      if (fetchError) throw fetchError;

      // Mark old quote as 'modificada'
      await supabase
        .from('ps_quotes')
        .update({ 
          estado: 'modificada',
          es_seleccionada: false,
        })
        .eq('id', data.quoteId);

      // Calculate new expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 3));

      // Calculate new total
      const precioProducto = data.precioProducto ?? existingQuote.precio_producto;
      const impuestos = data.impuestosEstimados ?? existingQuote.impuestos_estimados ?? 0;
      const costoServicio = data.costoServicio ?? existingQuote.costo_servicio;
      const totalEstimado = precioProducto + impuestos + costoServicio;

      // Create new quote version
      const { data: newQuote, error: createError } = await supabase
        .from('ps_quotes')
        .insert({
          request_id: existingQuote.request_id,
          personal_shopper_id: user.id,
          nombre_producto: data.nombreProducto ?? existingQuote.nombre_producto,
          descripcion: data.descripcion ?? existingQuote.descripcion,
          url_producto: data.urlProducto ?? existingQuote.url_producto,
          imagen_url: data.imagenUrl ?? existingQuote.imagen_url,
          precio_producto: precioProducto,
          impuestos_estimados: impuestos,
          costo_servicio: costoServicio,
          total_estimado: totalEstimado,
          notas_ps: data.notasPs ?? existingQuote.notas_ps,
          expires_at: expiresAt.toISOString(),
          estado: 'pendiente',
          es_seleccionada: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get order to send system message
      const { data: order } = await supabase
        .from('ps_orders')
        .select('id')
        .eq('request_id', existingQuote.request_id)
        .single();

      if (order) {
        await supabase
          .from('ps_messages')
          .insert({
            order_id: order.id,
            emisor_id: user.id,
            mensaje: `🔄 Cotización actualizada: ${data.nombreProducto ?? existingQuote.nombre_producto} - Nuevo total: $${totalEstimado.toFixed(2)}. La cotización expira el ${expiresAt.toLocaleDateString('es-PE')}.`,
            tipo: 'sistema',
          });
      }

      return newQuote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['ps-shopper-orders'] });
      queryClient.invalidateQueries({ queryKey: ['ps-messages'] });
      toast.success('Cotización actualizada y enviada al cliente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar cotización: ${error.message}`);
    },
  });

  // Mark quote as selected (active)
  const selectQuoteMutation = useMutation({
    mutationFn: async ({ quoteId, requestId }: { quoteId: string; requestId: string }) => {
      // Deselect all other quotes for this request
      await supabase
        .from('ps_quotes')
        .update({ es_seleccionada: false })
        .eq('request_id', requestId);

      // Select this quote
      const { error } = await supabase
        .from('ps_quotes')
        .update({ es_seleccionada: true })
        .eq('id', quoteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ps-quotes'] });
      toast.success('Cotización marcada como activa');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return {
    createQuote: createQuoteMutation.mutate,
    updateQuote: updateQuoteMutation.mutate,
    selectQuote: selectQuoteMutation.mutate,
    isCreating: createQuoteMutation.isPending,
    isUpdating: updateQuoteMutation.isPending,
    isSelecting: selectQuoteMutation.isPending,
  };
}
