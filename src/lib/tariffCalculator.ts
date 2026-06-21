import { supabase } from '@/integrations/supabase/client';
import { TARIFF_CONFIG, roundWeight, getCityRoute } from './tariffConfig';

export interface TariffCalculation {
  // Inputs procesados
  originalWeight: number;
  roundedWeight: number;
  declaredValue: number;
  deliveryType: 'pickup' | 'delivery';
  deliveryCity?: string;
  deliveryRoute?: 'route30' | 'route40';
  includeGuarantee: boolean;
  includeMiamiPickup: boolean;
  
  // Cargos de transporte
  freight_cost: number;
  freight_formula: string;
  fuel_cost: number;
  customs_handling_cost: number;
  customs_handling_formula: string;
  total_transport_charges: number;
  
  // Servicios adicionales
  guarantee_cost: number;
  guarantee_formula: string;
  miami_pickup_cost: number;
  miami_pickup_formula: string;
  delivery_cost: number;
  delivery_formula: string;
  consolidation_cost: number;
  total_additional_services: number;
  
  // Cargos gubernamentales (solo si valor > $200)
  applies_taxes: boolean;
  insurance_cost: number;
  cif_value: number;
  cif_formula: string;
  ad_valorem_tax: number;
  ad_valorem_rate: number;
  ad_valorem_formula: string;
  igv_tax: number;
  igv_formula: string;
  ipm_tax: number;
  ipm_formula: string;
  total_government_charges: number;
  
  // Total final
  final_cost: number;
}

/**
 * Calcular costo de flete según tabla de peso
 */
const calculateFreight = (roundedWeight: number): { cost: number; formula: string } => {
  const freight = TARIFF_CONFIG.freight;
  
  // Buscar en tabla fija (hasta 3kg)
  for (const tier of freight) {
    if (!tier.isIncremental && roundedWeight <= tier.weightMax) {
      return {
        cost: tier.rate,
        formula: `Tarifa fija para ${roundedWeight} kg = $${tier.rate.toFixed(2)}`,
      };
    }
  }
  
  // Calcular incremental
  let baseCost = 36.50; // Costo base hasta 3kg
  const baseWeight = 3.0;
  const currentWeight = roundedWeight;
  let formula = `Base 3kg = $36.50`;
  
  // 3kg - 10kg
  if (currentWeight > 3.0 && currentWeight <= 10.0) {
    const additionalWeight = currentWeight - 3.0;
    const increments = Math.ceil(additionalWeight / 0.5);
    const additionalCost = increments * 5.50;
    formula += ` + (${additionalWeight}kg × $5.50/0.5kg) = $${additionalCost.toFixed(2)}`;
    return {
      cost: baseCost + additionalCost,
      formula,
    };
  }
  
  // 10kg - 20kg
  if (currentWeight > 10.0 && currentWeight <= 20.0) {
    const tier1Additional = 7.0; // 3kg a 10kg
    const tier1Cost = Math.ceil(tier1Additional / 0.5) * 5.50;
    baseCost += tier1Cost;
    formula += ` + (7kg × $5.50/0.5kg) = $${tier1Cost.toFixed(2)}`;
    
    const tier2Additional = currentWeight - 10.0;
    const tier2Increments = Math.ceil(tier2Additional / 0.5);
    const tier2Cost = tier2Increments * 5.50;
    formula += ` + (${tier2Additional}kg × $5.50/0.5kg) = $${tier2Cost.toFixed(2)}`;
    
    return {
      cost: baseCost + tier2Cost,
      formula,
    };
  }
  
  // > 20kg
  if (currentWeight > 20.0) {
    const tier1Additional = 7.0; // 3kg a 10kg
    const tier1Cost = Math.ceil(tier1Additional / 0.5) * 5.50;
    const tier2Additional = 10.0; // 10kg a 20kg
    const tier2Cost = Math.ceil(tier2Additional / 0.5) * 5.50;
    baseCost += tier1Cost + tier2Cost;
    
    const tier3Additional = currentWeight - 20.0;
    const tier3Increments = Math.ceil(tier3Additional / 0.5);
    const tier3Cost = tier3Increments * 2.00;
    
    formula = `Base 3kg = $36.50 + (7kg × $5.50/0.5kg) + (10kg × $5.50/0.5kg) + (${tier3Additional}kg × $2.00/0.5kg)`;
    
    return {
      cost: baseCost + tier3Cost,
      formula,
    };
  }
  
  return { cost: 0, formula: 'Error en cálculo' };
};

/**
 * Calcular manejo aduanal según valor declarado
 */
const calculateCustomsHandling = (declaredValue: number): { cost: number; formula: string } => {
  for (const tier of TARIFF_CONFIG.customsHandling) {
    if (declaredValue <= tier.valueMax) {
      return {
        cost: tier.fee,
        formula: `Valor declarado $${declaredValue.toFixed(2)} → Tarifa $${tier.fee.toFixed(2)}`,
      };
    }
  }
  return { cost: 0, formula: 'Valor fuera de rango' };
};

/**
 * Calcular programa de garantía
 */
const calculateGuarantee = (declaredValue: number): { cost: number; formula: string } => {
  const config = TARIFF_CONFIG.guarantee;
  
  // Regla 1: valor <= $100
  if (declaredValue <= config.fixedRateThreshold) {
    return {
      cost: config.fixedRate,
      formula: `Valor ≤ $${config.fixedRateThreshold} → Tarifa fija $${config.fixedRate.toFixed(2)}`,
    };
  }
  
  // Regla 2: $100 < valor <= $1500
  if (declaredValue <= config.midTierMax) {
    const cost = (declaredValue / 100) * config.midTierRatePer100;
    return {
      cost,
      formula: `($${declaredValue.toFixed(2)} / 100) × $${config.midTierRatePer100.toFixed(2)} = $${cost.toFixed(2)}`,
    };
  }
  
  // Regla 3: valor > $1500
  const cost = declaredValue * config.highTierRate;
  return {
    cost,
    formula: `$${declaredValue.toFixed(2)} × ${(config.highTierRate * 100).toFixed(1)}% = $${cost.toFixed(2)}`,
  };
};

/**
 * Calcular recojo en almacén Miami
 */
const calculateMiamiPickup = (roundedWeight: number): { cost: number; formula: string } => {
  const config = TARIFF_CONFIG.miamiPickup;
  
  // Tarifa fija para >= 150kg
  if (roundedWeight >= config.bulkThreshold) {
    return {
      cost: config.bulkRate,
      formula: `${roundedWeight}kg ≥ ${config.bulkThreshold}kg → Tarifa fija $${config.bulkRate.toFixed(2)}`,
    };
  }
  
  // Cálculo incremental
  if (roundedWeight <= config.baseWeight) {
    return {
      cost: config.baseRate,
      formula: `Base ${config.baseWeight}kg = $${config.baseRate.toFixed(2)}`,
    };
  }
  
  const additionalWeight = roundedWeight - config.baseWeight;
  const additionalCost = additionalWeight * config.additionalKgRate;
  const totalCost = config.baseRate + additionalCost;
  
  return {
    cost: totalCost,
    formula: `Base $${config.baseRate.toFixed(2)} + (${additionalWeight}kg × $${config.additionalKgRate.toFixed(2)}/kg) = $${totalCost.toFixed(2)}`,
  };
};

/**
 * Calcular envío a domicilio
 */
const calculateDelivery = (
  roundedWeight: number,
  city: string
): { cost: number; formula: string } => {
  const route = getCityRoute(city);
  
  if (!route) {
    return {
      cost: 0,
      formula: `Ciudad "${city}" no encontrada en rutas configuradas`,
    };
  }
  
  const routeConfig = route === 'route30' 
    ? TARIFF_CONFIG.deliveryRoute30 
    : TARIFF_CONFIG.deliveryRoute40;
  
  // Buscar en tabla fija
  for (const tier of routeConfig) {
    if (tier.weightMax !== Infinity && roundedWeight <= tier.weightMax) {
      return {
        cost: tier.fee!,
        formula: `${route.toUpperCase()} - ${city}: ${roundedWeight}kg → $${tier.fee!.toFixed(2)}`,
      };
    }
  }
  
  // Calcular adicional (peso > 3kg)
  const lastTier = routeConfig[routeConfig.length - 1];
  if (lastTier.additionalKgRate) {
    // Obtener tarifa base del tier de 3kg según la ruta
    const baseFee = route === 'route30' ? 4.50 : 8.75;
    const baseWeight = lastTier.baseWeight || 3.0;
    const additionalWeight = roundedWeight - baseWeight;
    const additionalCost = additionalWeight * lastTier.additionalKgRate;
    const totalCost = baseFee + additionalCost;
    
    return {
      cost: totalCost,
      formula: `${route.toUpperCase()} - ${city}: Base $${baseFee.toFixed(2)} (3kg) + (${additionalWeight}kg × $${lastTier.additionalKgRate.toFixed(2)}/kg) = $${totalCost.toFixed(2)}`,
    };
  }
  
  return { cost: 0, formula: 'Error en cálculo de entrega' };
};

/**
 * Calcular CIF e impuestos (solo si valor > $200)
 */
const calculateTaxes = (
  declaredValue: number,
  freightCost: number,
  fuelCost: number
): {
  insurance: number;
  cif: number;
  cifFormula: string;
  adValorem: number;
  adValoremRate: number;
  adValoremFormula: string;
  igv: number;
  igvFormula: string;
  ipm: number;
  ipmFormula: string;
  total: number;
} => {
  const config = TARIFF_CONFIG.taxes;
  
  // Seguro aduanero
  const insurance = declaredValue * config.insuranceRate;
  
  // CIF
  const cif = declaredValue + freightCost + fuelCost + insurance;
  const cifFormula = `$${declaredValue.toFixed(2)} (Valor) + $${freightCost.toFixed(2)} (Flete) + $${fuelCost.toFixed(2)} (Combustible) + $${insurance.toFixed(2)} (Seguro ${(config.insuranceRate * 100).toFixed(2)}%) = $${cif.toFixed(2)}`;
  
  // Ad Valorem
  const adValoremRate = config.useAeropostMode ? config.adValoremRateAeropost : config.adValoremRate;
  const adValorem = cif * adValoremRate;
  const adValoremFormula = `CIF $${cif.toFixed(2)} × ${(adValoremRate * 100).toFixed(0)}% = $${adValorem.toFixed(2)}`;
  
  // IGV
  const igvBase = cif + adValorem;
  const igv = igvBase * config.igvRate;
  const igvFormula = `(CIF $${cif.toFixed(2)} + Ad Valorem $${adValorem.toFixed(2)}) × ${(config.igvRate * 100).toFixed(0)}% = $${igv.toFixed(2)}`;
  
  // IPM
  const ipm = cif * config.ipmRate;
  const ipmFormula = `CIF $${cif.toFixed(2)} × ${(config.ipmRate * 100).toFixed(0)}% = $${ipm.toFixed(2)}`;
  
  // Total
  const total = adValorem + igv + ipm;
  
  return {
    insurance,
    cif,
    cifFormula,
    adValorem,
    adValoremRate,
    adValoremFormula,
    igv,
    igvFormula,
    ipm,
    ipmFormula,
    total,
  };
};

/**
 * Función principal de cálculo
 */
export const calculatePackageTariff = async (
  weight: number,
  declaredValue: number,
  deliveryType: 'pickup' | 'delivery' = 'pickup',
  deliveryCity: string = '',
  includeGuarantee: boolean = false,
  includeMiamiPickup: boolean = false
): Promise<TariffCalculation | null> => {
  // Validaciones
  if (weight < TARIFF_CONFIG.limits.minWeight) {
    console.error(`Peso mínimo es ${TARIFF_CONFIG.limits.minWeight} kg`);
    return null;
  }
  
  if (declaredValue < 0) {
    console.error('Valor declarado debe ser mayor o igual a 0');
    return null;
  }
  
  // Redondear peso
  const roundedWeight = roundWeight(weight);
  
  // 1. CARGOS DE TRANSPORTE
  const freight = calculateFreight(roundedWeight);
  const customsHandling = calculateCustomsHandling(declaredValue);
  const totalTransportCharges = freight.cost + customsHandling.cost;
  
  // 2. SERVICIOS ADICIONALES
  const guarantee = includeGuarantee 
    ? calculateGuarantee(declaredValue) 
    : { cost: 0, formula: 'No incluido' };
  
  const miamiPickup = includeMiamiPickup 
    ? calculateMiamiPickup(roundedWeight) 
    : { cost: 0, formula: 'No incluido' };
  
  const delivery = deliveryType === 'delivery' && deliveryCity 
    ? calculateDelivery(roundedWeight, deliveryCity) 
    : { cost: 0, formula: deliveryType === 'pickup' ? 'Retiro en tienda (sin cargo)' : 'No seleccionado' };
  
  const consolidationCost = 0; // Configurable según necesidad
  
  const totalAdditionalServices = guarantee.cost + miamiPickup.cost + delivery.cost + consolidationCost;
  
  // 3. CARGOS GUBERNAMENTALES
  // CIF siempre se calcula (para transparencia)
  const insurance = declaredValue * TARIFF_CONFIG.taxes.insuranceRate;
  const cif = declaredValue + freight.cost + insurance;
  const cifFormula = `$${declaredValue.toFixed(2)} (Valor) + $${freight.cost.toFixed(2)} (Flete) + $${insurance.toFixed(2)} (Seguro ${(TARIFF_CONFIG.taxes.insuranceRate * 100).toFixed(2)}%) = $${cif.toFixed(2)}`;
  
  // Impuestos solo si valor > $200
  const appliesTaxes = declaredValue > TARIFF_CONFIG.limits.taxThreshold;
  let taxes = {
    insurance,
    cif,
    cifFormula,
    adValorem: 0,
    adValoremRate: 0,
    adValoremFormula: 'No aplica (valor ≤ $200)',
    igv: 0,
    igvFormula: 'No aplica (valor ≤ $200)',
    ipm: 0,
    ipmFormula: 'No aplica (valor ≤ $200)',
    total: 0,
  };
  
  if (appliesTaxes) {
    taxes = calculateTaxes(declaredValue, freight.cost, 0);
  }
  
  // 4. TOTAL FINAL
  const finalCost = totalTransportCharges + totalAdditionalServices + taxes.total;
  
  return {
    originalWeight: weight,
    roundedWeight,
    declaredValue,
    deliveryType,
    deliveryCity: deliveryCity || undefined,
    deliveryRoute: deliveryCity ? getCityRoute(deliveryCity) || undefined : undefined,
    includeGuarantee,
    includeMiamiPickup,
    
    freight_cost: freight.cost,
    freight_formula: freight.formula,
    fuel_cost: 0,
    customs_handling_cost: customsHandling.cost,
    customs_handling_formula: customsHandling.formula,
    total_transport_charges: totalTransportCharges,
    
    guarantee_cost: guarantee.cost,
    guarantee_formula: guarantee.formula,
    miami_pickup_cost: miamiPickup.cost,
    miami_pickup_formula: miamiPickup.formula,
    delivery_cost: delivery.cost,
    delivery_formula: delivery.formula,
    consolidation_cost: consolidationCost,
    total_additional_services: totalAdditionalServices,
    
    applies_taxes: appliesTaxes,
    insurance_cost: taxes.insurance,
    cif_value: taxes.cif,
    cif_formula: taxes.cifFormula,
    ad_valorem_tax: taxes.adValorem,
    ad_valorem_rate: taxes.adValoremRate,
    ad_valorem_formula: taxes.adValoremFormula,
    igv_tax: taxes.igv,
    igv_formula: taxes.igvFormula,
    ipm_tax: taxes.ipm,
    ipm_formula: taxes.ipmFormula,
    total_government_charges: taxes.total,
    
    final_cost: finalCost,
  };
};

/**
 * Actualizar costos de paquete (legacy - mantener compatibilidad)
 */
export const updatePackageCosts = async (
  packageId: string,
  actualWeight: number,
  dimensions: string | null,
  estimatedValue: number,
  deliveryType: string = 'pickup'
): Promise<{ success: boolean; calculation?: TariffCalculation; error?: string }> => {
  let finalEstimatedValue = estimatedValue;
  
  if (estimatedValue === 0) {
    const { data: packageData } = await supabase
      .from('packages')
      .select('estimated_value')
      .eq('id', packageId)
      .single();
    
    finalEstimatedValue = packageData?.estimated_value || 0;
  }

  const calculation = await calculatePackageTariff(
    actualWeight,
    finalEstimatedValue,
    deliveryType as 'pickup' | 'delivery',
    '',
    true,
    false
  );

  if (!calculation) {
    return { success: false, error: 'No se pudo calcular la tarifa' };
  }

  const { error } = await supabase
    .from('packages')
    .update({
      actual_weight: actualWeight,
      dimensions: dimensions,
      weight_cost: calculation.freight_cost,
      customs_cost: calculation.customs_handling_cost,
      delivery_cost: calculation.guarantee_cost,
      final_cost: calculation.final_cost,
      updated_at: new Date().toISOString(),
    })
    .eq('id', packageId);

  if (error) {
    console.error('Error actualizando costos:', error);
    return { success: false, error: error.message };
  }

  return { success: true, calculation };
};
