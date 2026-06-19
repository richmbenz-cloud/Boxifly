/**
 * CONFIGURACIÓN EDITABLE DE TARIFAS BOXIFLY
 * Todas las tarifas y reglas del sistema
 */

export const TARIFF_CONFIG = {
  // LÍMITES Y VALIDACIONES
  limits: {
    minWeight: 0.1, // kg
    maxValueAutoCalc: 2000, // USD - valores mayores requieren cotización
    weightRoundingIncrement: 0.5, // kg - redondear hacia arriba
    taxThreshold: 200, // USD - aplicar impuestos solo si valor > 200
  },

  // TABLA DE FLETE (TRANSPORTE) POR PESO
  freight: [
    { weightMax: 0.5, rate: 7.50 },
    { weightMax: 1.0, rate: 15.25 },
    { weightMax: 1.5, rate: 19.75 },
    { weightMax: 2.0, rate: 24.50 },
    { weightMax: 2.5, rate: 30.50 },
    { weightMax: 3.0, rate: 36.50 },
    // 3kg - 10kg: cada 0.5kg adicional
    { weightMax: 10.0, rate: 5.50, isIncremental: true, baseWeight: 3.0 },
    // 10kg - 20kg: cada 0.5kg adicional
    { weightMax: 20.0, rate: 5.50, isIncremental: true, baseWeight: 10.0 },
    // > 20kg: cada 0.5kg adicional
    { weightMax: Infinity, rate: 2.00, isIncremental: true, baseWeight: 20.0 },
  ],

  // MANEJO ADUANAL POR VALOR FACTURA
  customsHandling: [
    { valueMax: 100, fee: 3.75 },
    { valueMax: 200, fee: 5.95 },
    { valueMax: 1000, fee: 9.50 },
    { valueMax: 2000, fee: 14.50 },
    { valueMax: Infinity, fee: 165.00 }, // > 2000 (pero no se calcula automáticamente)
  ],

  // PROGRAMA DE GARANTÍA Y DEVOLUCIONES
  guarantee: {
    fixedRateThreshold: 100, // USD
    fixedRate: 2.15, // USD - si valor <= 100
    midTierMax: 1500, // USD
    midTierRatePer100: 1.5, // USD por cada $100
    highTierRate: 0.025, // 2.5% del valor - si valor > 1500
  },

  // SERVICIO A DOMICILIO - RUTA 30 (Lima/GAM)
  deliveryRoute30: [
    { weightMax: 0.5, fee: 3.00 },
    { weightMax: 1.0, fee: 3.50 },
    { weightMax: 2.0, fee: 4.00 },
    { weightMax: 3.0, fee: 4.50 },
    { weightMax: Infinity, additionalKgRate: 1.00, baseWeight: 3.0 }, // cada kg adicional
  ],

  // SERVICIO A DOMICILIO - RUTA 40 (Capitales)
  deliveryRoute40: [
    { weightMax: 0.5, fee: 4.00 },
    { weightMax: 1.0, fee: 4.75 },
    { weightMax: 2.0, fee: 6.75 },
    { weightMax: 3.0, fee: 8.75 },
    { weightMax: Infinity, additionalKgRate: 2.50, baseWeight: 3.0 },
  ],

  // MAPEO DE CIUDADES A RUTAS
  cityRoutes: {
    route30: [
      'Lima', 'Callao', 'San Isidro', 'Miraflores', 'Surco', 'La Molina',
      'San Borja', 'Barranco', 'Chorrillos', 'San Juan de Lurigancho',
      'Villa El Salvador', 'Villa María del Triunfo', 'Ate', 'Comas',
      'Los Olivos', 'San Martín de Porres', 'Independencia', 'Rímac',
      'Breña', 'Jesús María', 'Lince', 'Magdalena', 'Pueblo Libre',
      'San Miguel', 'Surquillo', 'La Victoria', 'El Agustino',
    ],
    route40: [
      'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos',
      'Huancayo', 'Tacna', 'Pucallpa', 'Ica', 'Juliaca', 'Chimbote',
      'Huaraz', 'Tarapoto', 'Cajamarca', 'Ayacucho', 'Puno', 'Tumbes',
      'Huánuco', 'Sullana', 'Chincha', 'Talara', 'Jaén', 'Huacho',
    ],
  },

  // RECOJO EN ALMACÉN MIAMI
  miamiPickup: {
    baseWeight: 1, // kg
    baseRate: 10.00, // USD
    additionalKgRate: 0.05, // USD por kg adicional
    bulkThreshold: 150, // kg
    bulkRate: 100.00, // USD tarifa fija para >= 150kg
    usaTaxNote: 'Posible impuesto USA 7% si no fue pagado',
  },

  // CARGOS ADICIONALES
  additionalCharges: {
    consolidationPerPiece: 2.00, // USD por pieza en consolidación
    storagePerDay: 1.00, // USD por día de almacenaje
    restrictedShipmentConsult: true, // requiere consulta
  },

  // CIF E IMPUESTOS (solo si valor > $200)
  taxes: {
    insuranceRate: 0.0075, // 0.75% del valor FOB para seguro aduanero
    adValoremRate: 0.04, // 4% por defecto (puede ser 6% para simular Aeropost)
    adValoremRateAeropost: 0.06, // 6% modo Aeropost
    igvRate: 0.18, // 18% IGV
    ipmRate: 0.02, // 2% IPM
    useAeropostMode: false, // cambiar a true para usar 6% Ad Valorem
  },

  // COMBUSTIBLE
  fuel: {
    rate: 0.00, // USD - placeholder para futuras implementaciones
  },

  // TEXTOS Y DISCLAIMERS
  texts: {
    disclaimer: 'Estimación sujeta a valoración aduanera. El monto final puede variar según las declaraciones aduaneras reales y otros cargos adicionales.',
    taxNote: 'Cálculos basados en tasa arancelaria estimada',
    highValueModal: 'Si el monto es mayor a $2,000, comunícate con nosotros para cotización personalizada.',
    contactEmail: 'ventas@boxifly.com',
    contactPhone: '+51 999 888 777',
  },
};

/**
 * Helper: Redondear peso hacia arriba al incremento más cercano (0.5 kg)
 */
export const roundWeight = (weight: number): number => {
  const increment = TARIFF_CONFIG.limits.weightRoundingIncrement;
  return Math.ceil(weight / increment) * increment;
};

/**
 * Helper: Determinar ruta de entrega según ciudad
 */
export const getCityRoute = (city: string): 'route30' | 'route40' | null => {
  const normalizedCity = city.trim();
  
  if (TARIFF_CONFIG.cityRoutes.route30.some(c => 
    c.toLowerCase() === normalizedCity.toLowerCase()
  )) {
    return 'route30';
  }
  
  if (TARIFF_CONFIG.cityRoutes.route40.some(c => 
    c.toLowerCase() === normalizedCity.toLowerCase()
  )) {
    return 'route40';
  }
  
  return null;
};
