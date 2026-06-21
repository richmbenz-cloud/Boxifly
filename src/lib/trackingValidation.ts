// Utilidad de validación y detección de códigos de rastreo (tracking)
// para couriers. Distingue entre un TRACKING real de transportadora
// (UPS, FedEx, USPS, DHL, Amazon Logistics) y un NÚMERO DE ORDEN de la
// tienda (Amazon, Shein, etc.), que es la causa #1 de paquetes huérfanos.

export type TrackingDetection = {
  /** Transportadora detectada, o null si no se reconoce. */
  carrier: string | null;
  /** True si el valor parece un número de orden de tienda, no un tracking. */
  isLikelyOrderNumber: boolean;
  /** True si reconocemos un formato de tracking de transportadora válido. */
  isValidCarrierFormat: boolean;
  /** Mensaje sugerido para mostrar al usuario (puede ser undefined). */
  message?: string;
  /** Severidad del mensaje para elegir el color en la UI. */
  level: 'success' | 'warning' | 'info' | 'none';
};

// Normaliza: quita espacios y guiones internos para los patrones que los ignoran.
const compact = (value: string) => value.replace(/[\s-]/g, '').toUpperCase();

// Patrones de TRANSPORTADORAS (tracking real).
const CARRIER_PATTERNS: { carrier: string; regex: RegExp; useCompact?: boolean }[] = [
  // UPS: 1Z + 16 alfanuméricos
  { carrier: 'UPS', regex: /^1Z[0-9A-Z]{16}$/i, useCompact: true },
  // Amazon Logistics: TBA + 12 o más dígitos
  { carrier: 'Amazon Logistics', regex: /^TBA\d{12,}$/i, useCompact: true },
  // DHL Express: 10 dígitos | DHL eCommerce: JD/JJD + dígitos | GM + ...
  { carrier: 'DHL', regex: /^(JJD\d{15,20}|JD\d{15,20}|GM\d{16,20}|\d{10})$/i, useCompact: true },
  // USPS: empieza en 92/93/94/95 con 20-22 dígitos
  { carrier: 'USPS', regex: /^(91|92|93|94|95|96)\d{18,24}$/, useCompact: true },
  // USPS internacional: 2 letras + 9 dígitos + US
  { carrier: 'USPS', regex: /^[A-Z]{2}\d{9}US$/i, useCompact: true },
  // FedEx: 12, 15, 20 o 22 dígitos
  { carrier: 'FedEx', regex: /^(\d{12}|\d{15}|\d{20}|\d{22})$/, useCompact: true },
];

// Patrones de NÚMEROS DE ORDEN (NO sirven para rastrear).
const ORDER_NUMBER_PATTERNS: { store: string; regex: RegExp }[] = [
  // Amazon order id: 3-7-7 dígitos (ej. 112-3456789-1234567)
  { store: 'Amazon', regex: /^\d{3}-\d{7}-\d{7}$/ },
];

/**
 * Analiza un valor de tracking y devuelve la detección.
 */
export function detectTracking(rawValue: string): TrackingDetection {
  const value = (rawValue || '').trim();

  if (!value) {
    return {
      carrier: null,
      isLikelyOrderNumber: false,
      isValidCarrierFormat: false,
      level: 'none',
    };
  }

  // 1) ¿Es un número de orden? (revisar el valor original, con guiones)
  for (const { store, regex } of ORDER_NUMBER_PATTERNS) {
    if (regex.test(value)) {
      return {
        carrier: null,
        isLikelyOrderNumber: true,
        isValidCarrierFormat: false,
        level: 'warning',
        message: `Eso parece un número de orden de ${store}, no un código de rastreo. Por favor ingresa el código de seguimiento de la transportadora (UPS, FedEx, USPS, DHL...).`,
      };
    }
  }

  // 2) ¿Coincide con alguna transportadora?
  const compacted = compact(value);
  for (const { carrier, regex, useCompact } of CARRIER_PATTERNS) {
    const target = useCompact ? compacted : value;
    if (regex.test(target)) {
      return {
        carrier,
        isLikelyOrderNumber: false,
        isValidCarrierFormat: true,
        level: 'success',
        message: `Detectado: ${carrier}`,
      };
    }
  }

  // 3) No reconocido. Si es muy corto o tiene caracteres raros, avisar.
  const looksLikeOrder = /^[A-Z]{0,3}\d{6,12}$/i.test(compacted) && compacted.length < 11;
  if (looksLikeOrder) {
    return {
      carrier: null,
      isLikelyOrderNumber: false,
      isValidCarrierFormat: false,
      level: 'info',
      message:
        'No reconocemos este formato. Verifica que sea el código de rastreo de la transportadora (suele tener 12+ dígitos o empezar con 1Z para UPS).',
    };
  }

  // 4) Formato desconocido pero plausible: dejamos pasar sin bloquear.
  return {
    carrier: null,
    isLikelyOrderNumber: false,
    isValidCarrierFormat: false,
    level: 'info',
    message: 'Asegúrate de que sea el código de la transportadora y no el número de orden de la tienda.',
  };
}

// Instrucciones por tienda para el panel de ayuda.
export const TRACKING_HELP: { store: string; steps: string }[] = [
  {
    store: 'Amazon',
    steps:
      'Ve a "Tus pedidos" → abre el pedido → "Rastrear paquete". El código de la transportadora (UPS/USPS/FedEx) aparece ahí. NO uses el número de pedido con formato 112-xxxxxxx-xxxxxxx.',
  },
  {
    store: 'Shein',
    steps:
      'Entra a "Mis pedidos" → "Ver detalles del envío" → copia el "Número de seguimiento" (tracking number), no el número de pedido (que empieza con GS...).',
  },
  {
    store: 'eBay',
    steps:
      'Abre "Pedidos comprados" → selecciona el artículo → "Ver pedido" → el número de seguimiento aparece junto a la transportadora.',
  },
];
