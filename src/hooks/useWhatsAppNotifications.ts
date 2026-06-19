import { supabase } from '@/integrations/supabase/client';

interface WhatsAppNotificationParams {
  userId: string;
  phone: string;
  templateName: string;
  parameters: {
    customerName: string;
    trackingNumber: string;
    status: string;
    statusMessage: string;
  };
}

export const useWhatsAppNotifications = () => {
  const sendWhatsAppNotification = async (params: WhatsAppNotificationParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-notify', {
        body: params,
      });

      if (error) {
        console.error('Error sending WhatsApp notification:', error);
        return { success: false, error };
      }

      console.log('WhatsApp notification sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Exception sending WhatsApp notification:', error);
      return { success: false, error };
    }
  };

  const sendPackageStatusNotification = async (
    userId: string,
    phone: string,
    customerName: string,
    trackingNumber: string,
    status: string
  ) => {
    const statusMessages: Record<string, { template: string; message: string }> = {
      prealerted: {
        template: 'package_prealerted',
        message: 'Tu paquete ha sido prealertado',
      },
      received_warehouse: {
        template: 'package_received',
        message: 'Tu paquete ha sido recibido en USA',
      },
      ready_consolidation: {
        template: 'package_ready_consolidation',
        message: 'Tu paquete está listo para consolidar',
      },
      consolidated: {
        template: 'package_consolidated',
        message: 'Tu paquete ha sido consolidado',
      },
      in_transit: {
        template: 'package_in_transit',
        message: 'Tu paquete está en tránsito a Perú',
      },
      arrived_peru: {
        template: 'package_arrived_peru',
        message: 'Tu paquete llegó a Perú',
      },
      ready_delivery: {
        template: 'package_ready_delivery',
        message: 'Tu paquete está listo para entrega',
      },
      delivered: {
        template: 'package_delivered',
        message: 'Tu paquete ha sido entregado',
      },
    };

    const statusConfig = statusMessages[status];
    if (!statusConfig) {
      console.warn('No WhatsApp template found for status:', status);
      return { success: false, error: 'Invalid status' };
    }

    return sendWhatsAppNotification({
      userId,
      phone,
      templateName: statusConfig.template,
      parameters: {
        customerName,
        trackingNumber,
        status,
        statusMessage: statusConfig.message,
      },
    });
  };

  return {
    sendWhatsAppNotification,
    sendPackageStatusNotification,
  };
};
