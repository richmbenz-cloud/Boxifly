import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IzipayPaymentData {
  amount: number;
  orderId: string;
  currency?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  description?: string;
}

interface IzipayPaymentResponse {
  success: boolean;
  formToken?: string;
  transactionId?: string;
  error?: string;
}

export const useIzipay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize a payment with Izipay
   * Returns a form token that can be used to render the Izipay payment form
   */
  const initiatePayment = async (
    paymentData: IzipayPaymentData
  ): Promise<IzipayPaymentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'izipay-initiate',
        {
          body: paymentData,
        }
      );

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      return data as IzipayPaymentResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Izipay payment initiation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load Izipay payment form script (HTML integration)
   * This injects the official kr-payment-form script and styles.
   */
  const loadIzipayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // If script already present, don't add it again
      if (document.querySelector('script[data-izipay-script="true"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src =
        'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js';
      script.async = true;
      script.setAttribute('data-izipay-script', 'true');
      // Public key for the embedded Krypton form. Configurable per environment
      // via VITE_IZIPAY_PUBLIC_KEY (set in Vercel: test key for preview, prod key for production).
      // Falls back to the test public key for local/dev if the env var is absent.
      const izipayPublicKey =
        (import.meta.env.VITE_IZIPAY_PUBLIC_KEY as string | undefined) ||
        '35764467:testpublickey_XdcR04Uy7qPN7Cy2VfoqeG2etnqB4ksajdOAMnvDPZQGm';
      script.setAttribute('kr-public-key', izipayPublicKey);
      script.setAttribute('kr-language', 'es-ES');

      script.onload = () => {
        console.log('Izipay script loaded successfully');
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Izipay script'));
      };

      // Optional: basic stylesheet for the hosted form
      if (!document.querySelector('link[data-izipay-style="true"]')) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href =
          'https://static.micuentaweb.pe/static/js/krypton-client/V4.0/ext/classic.css';
        style.setAttribute('data-izipay-style', 'true');
        document.head.appendChild(style);
      }

      document.head.appendChild(script);
    });
  };

  /**
   * Render Izipay payment form (HTML integration, without KRGlue)
   * @param formToken - Token received from initiatePayment
   * @param containerId - HTML element ID where form will be rendered
   */
  const renderPaymentForm = async (
    formToken: string,
    containerId: string
  ): Promise<void> => {
    try {
      await loadIzipayScript();

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error('Contenedor de pago no encontrado');
      }

      // Clean previous content and inject the kr-embedded div
      container.innerHTML = '';

      const wrapper = document.createElement('div');
      wrapper.id = 'micuentawebstd_rest_wrapper';

      const embedded = document.createElement('div');
      embedded.className = 'kr-embedded';
      embedded.setAttribute('kr-form-token', formToken);

      wrapper.appendChild(embedded);
      container.appendChild(wrapper);

      console.log('Izipay payment form container prepared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error rendering Izipay form:', err);
      throw err;
    }
  };

  return {
    initiatePayment,
    renderPaymentForm,
    loadIzipayScript,
    loading,
    error,
  };
};

