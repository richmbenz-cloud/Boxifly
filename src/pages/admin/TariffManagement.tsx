import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, X, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TariffCalculation } from '@/lib/tariffCalculator';

interface CustomCharge {
  name: string;
  amount: number;
}

interface WeightRate {
  weight_min: number;
  weight_max: number;
  rate: number;
}

interface CustomsHandlingRate {
  value_min: number;
  value_max: number;
  fee: number;
}

interface GuaranteeRate {
  value_min: number;
  value_max: number;
  percentage: number;
}

interface Tariff {
  id: string;
  name: string;
  base_rate_per_kg: number;
  customs_percentage: number;
  delivery_fee: number;
  tax_threshold: number;
  custom_charges: CustomCharge[];
  weight_rates: WeightRate[];
  customs_handling_rates: CustomsHandlingRate[];
  guarantee_rates: GuaranteeRate[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TariffManagement = () => {
  const { toast } = useToast();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    base_rate_per_kg: '',
    customs_percentage: '',
    delivery_fee: '',
    tax_threshold: '200',
    custom_charges: [] as CustomCharge[],
    weight_rates: [] as WeightRate[],
    customs_handling_rates: [] as CustomsHandlingRate[],
    guarantee_rates: [] as GuaranteeRate[],
    is_active: true
  });

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    const { data, error } = await supabase
      .from('tariffs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedTariffs = data.map(t => ({
        ...t,
        custom_charges: (t.custom_charges as any as CustomCharge[]) || [],
        weight_rates: (t.weight_rates as any as WeightRate[]) || [],
        customs_handling_rates: (t.customs_handling_rates as any as CustomsHandlingRate[]) || [],
        guarantee_rates: (t.guarantee_rates as any as GuaranteeRate[]) || [],
        tax_threshold: t.tax_threshold || 200
      }));
      setTariffs(mappedTariffs);
    }
  };

  const loadAeropostRates = () => {
    setFormData(prev => ({
      ...prev,
      weight_rates: [
        { weight_min: 0, weight_max: 0.5, rate: 7.50 },
        { weight_min: 0.51, weight_max: 1, rate: 15.25 },
        { weight_min: 1.01, weight_max: 1.5, rate: 19.75 },
        { weight_min: 1.51, weight_max: 2, rate: 24.50 },
        { weight_min: 2.01, weight_max: 2.5, rate: 30.50 },
        { weight_min: 2.51, weight_max: 3, rate: 36.50 },
      ],
      customs_handling_rates: [
        { value_min: 0, value_max: 100, fee: 3.75 },
        { value_min: 101, value_max: 200, fee: 5.95 },
        { value_min: 201, value_max: 1000, fee: 9.50 },
        { value_min: 1001, value_max: 2000, fee: 14.50 },
        { value_min: 2001, value_max: 999999, fee: 165 },
      ],
      guarantee_rates: [
        { value_min: 0, value_max: 100, percentage: 2.15 },
        { value_min: 100.01, value_max: 1500, percentage: 1.50 },
        { value_min: 1500.01, value_max: 999999, percentage: 2.5 },
      ],
    }));
    toast({
      title: "Tarifas cargadas",
      description: "Las tarifas de Aeropost han sido cargadas"
    });
  };

  const handleOpenDialog = (tariff?: Tariff) => {
    if (tariff) {
      setEditingTariff(tariff);
      setFormData({
        name: tariff.name,
        base_rate_per_kg: tariff.base_rate_per_kg.toString(),
        customs_percentage: tariff.customs_percentage.toString(),
        delivery_fee: tariff.delivery_fee.toString(),
        tax_threshold: (tariff.tax_threshold || 200).toString(),
        custom_charges: tariff.custom_charges || [],
        weight_rates: tariff.weight_rates || [],
        customs_handling_rates: tariff.customs_handling_rates || [],
        guarantee_rates: tariff.guarantee_rates || [],
        is_active: tariff.is_active
      });
    } else {
      setEditingTariff(null);
      setFormData({
        name: '',
        base_rate_per_kg: '',
        customs_percentage: '',
        delivery_fee: '',
        tax_threshold: '200',
        custom_charges: [],
        weight_rates: [],
        customs_handling_rates: [],
        guarantee_rates: [],
        is_active: true
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresa el nombre de la tarifa",
        variant: "destructive"
      });
      return;
    }

    const tariffData: any = {
      name: formData.name,
      base_rate_per_kg: parseFloat(formData.base_rate_per_kg) || 0,
      customs_percentage: parseFloat(formData.customs_percentage) || 0,
      delivery_fee: parseFloat(formData.delivery_fee) || 0,
      tax_threshold: parseFloat(formData.tax_threshold) || 200,
      custom_charges: formData.custom_charges,
      weight_rates: formData.weight_rates,
      customs_handling_rates: formData.customs_handling_rates,
      guarantee_rates: formData.guarantee_rates,
      is_active: formData.is_active
    };

    try {
      if (editingTariff) {
        const { error } = await supabase
          .from('tariffs')
          .update(tariffData)
          .eq('id', editingTariff.id);

        if (error) throw error;

        toast({
          title: "Tarifa actualizada",
          description: "La tarifa ha sido actualizada exitosamente"
        });
      } else {
        if (tariffData.is_active) {
          await supabase
            .from('tariffs')
            .update({ is_active: false })
            .neq('id', '00000000-0000-0000-0000-000000000000');
        }

        const { error } = await supabase
          .from('tariffs')
          .insert(tariffData);

        if (error) throw error;

        toast({
          title: "Tarifa creada",
          description: "La nueva tarifa ha sido creada exitosamente"
        });
      }

      fetchTariffs();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleActiveTariff = async (tariff: Tariff) => {
    try {
      if (!tariff.is_active) {
        await supabase
          .from('tariffs')
          .update({ is_active: false })
          .neq('id', tariff.id);
      }

      const { error } = await supabase
        .from('tariffs')
        .update({ is_active: !tariff.is_active })
        .eq('id', tariff.id);

      if (error) throw error;

      toast({
        title: tariff.is_active ? "Tarifa desactivada" : "Tarifa activada",
        description: `La tarifa "${tariff.name}" ha sido ${tariff.is_active ? 'desactivada' : 'activada'}`
      });

      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTariff = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarifa?')) return;

    try {
      const { error } = await supabase
        .from('tariffs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Tarifa eliminada",
        description: "La tarifa ha sido eliminada exitosamente"
      });

      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout title="Gestión de Tarifas">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tarifas Tipo Aeropost</h2>
            <p className="text-muted-foreground">Configura tablas de rangos para transporte, aduanas y garantías</p>
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarifa
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {tariffs.map((tariff) => (
            <Card key={tariff.id} className={tariff.is_active ? 'border-2 border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{tariff.name}</CardTitle>
                    {tariff.is_active && (
                      <Badge className="mt-2">Activa</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => handleOpenDialog(tariff)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => deleteTariff(tariff.id)}
                      disabled={tariff.is_active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Límite Exoneración:</span> ${tariff.tax_threshold || 200}
                  </div>
                </div>

                {tariff.weight_rates && tariff.weight_rates.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-sm">Tabla de Transporte:</p>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      {tariff.weight_rates.map((rate, idx) => (
                        <div key={idx}>
                          {rate.weight_min}kg - {rate.weight_max}kg: ${rate.rate}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tariff.customs_handling_rates && tariff.customs_handling_rates.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-sm">Manejo Aduanal:</p>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      {tariff.customs_handling_rates.map((rate, idx) => (
                        <div key={idx}>
                          ${rate.value_min} - ${rate.value_max}: ${rate.fee}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tariff.guarantee_rates && tariff.guarantee_rates.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-sm">Programa de Garantía:</p>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      {tariff.guarantee_rates.map((rate, idx) => (
                        <div key={idx}>
                          ${rate.value_min} - ${rate.value_max}: {rate.percentage}%
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <Switch
                    checked={tariff.is_active}
                    onCheckedChange={() => toggleActiveTariff(tariff)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tariffs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hay tarifas configuradas</p>
              <Button 
                onClick={() => handleOpenDialog()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Tarifa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {editingTariff ? 'Editar Tarifa' : 'Nueva Tarifa'}
              </DialogTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={loadAeropostRates}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Cargar Tarifas Aeropost
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Tarifa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Tarifa Aeropost 2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_threshold">Límite Exoneración Impuestos (USD) *</Label>
              <p className="text-xs text-muted-foreground">
                Si CIF {'>'} este valor, se aplica 18% de impuestos
              </p>
              <Input
                id="tax_threshold"
                type="number"
                step="0.01"
                value={formData.tax_threshold}
                onChange={(e) => setFormData({ ...formData, tax_threshold: e.target.value })}
                placeholder="200"
              />
            </div>

            {/* Weight Rates */}
            <div className="space-y-3 border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <Label className="text-base">Tabla de Transporte por Peso</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFormData({
                    ...formData,
                    weight_rates: [...formData.weight_rates, { weight_min: 0, weight_max: 0, rate: 0 }]
                  })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Rango
                </Button>
              </div>
              {formData.weight_rates.map((rate, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Min kg"
                    value={rate.weight_min}
                    onChange={(e) => {
                      const updated = [...formData.weight_rates];
                      updated[idx].weight_min = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, weight_rates: updated });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="Max kg"
                    value={rate.weight_max}
                    onChange={(e) => {
                      const updated = [...formData.weight_rates];
                      updated[idx].weight_max = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, weight_rates: updated });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Tarifa USD"
                    value={rate.rate}
                    onChange={(e) => {
                      const updated = [...formData.weight_rates];
                      updated[idx].rate = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, weight_rates: updated });
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setFormData({
                      ...formData,
                      weight_rates: formData.weight_rates.filter((_, i) => i !== idx)
                    })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Customs Handling Rates */}
            <div className="space-y-3 border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <Label className="text-base">Manejo Aduanal por Valor</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFormData({
                    ...formData,
                    customs_handling_rates: [...formData.customs_handling_rates, { value_min: 0, value_max: 0, fee: 0 }]
                  })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Rango
                </Button>
              </div>
              {formData.customs_handling_rates.map((rate, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Min USD"
                    value={rate.value_min}
                    onChange={(e) => {
                      const updated = [...formData.customs_handling_rates];
                      updated[idx].value_min = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, customs_handling_rates: updated });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Max USD"
                    value={rate.value_max}
                    onChange={(e) => {
                      const updated = [...formData.customs_handling_rates];
                      updated[idx].value_max = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, customs_handling_rates: updated });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Cargo USD"
                    value={rate.fee}
                    onChange={(e) => {
                      const updated = [...formData.customs_handling_rates];
                      updated[idx].fee = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, customs_handling_rates: updated });
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setFormData({
                      ...formData,
                      customs_handling_rates: formData.customs_handling_rates.filter((_, i) => i !== idx)
                    })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Guarantee Rates */}
            <div className="space-y-3 border p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <Label className="text-base">Programa de Garantía por Valor</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFormData({
                    ...formData,
                    guarantee_rates: [...formData.guarantee_rates, { value_min: 0, value_max: 0, percentage: 0 }]
                  })}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Rango
                </Button>
              </div>
              {formData.guarantee_rates.map((rate, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Min USD"
                    value={rate.value_min}
                    onChange={(e) => {
                      const updated = [...formData.guarantee_rates];
                      updated[idx].value_min = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, guarantee_rates: updated });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Max USD"
                    value={rate.value_max}
                    onChange={(e) => {
                      const updated = [...formData.guarantee_rates];
                      updated[idx].value_max = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, guarantee_rates: updated });
                    }}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="% Garantía"
                    value={rate.percentage}
                    onChange={(e) => {
                      const updated = [...formData.guarantee_rates];
                      updated[idx].percentage = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, guarantee_rates: updated });
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setFormData({
                      ...formData,
                      guarantee_rates: formData.guarantee_rates.filter((_, i) => i !== idx)
                    })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label htmlFor="active">Activar Tarifa</Label>
                <p className="text-xs text-muted-foreground">Solo una puede estar activa</p>
              </div>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingTariff ? 'Actualizar' : 'Crear'} Tarifa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default TariffManagement;
