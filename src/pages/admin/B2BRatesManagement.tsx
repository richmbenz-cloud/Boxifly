import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, TrendingDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface B2BRate {
  id: string;
  user_id: string;
  weight_min: number;
  weight_max: number;
  rate_per_kg: number;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  b2b_discount: number;
}

const B2BRatesManagement = () => {
  const { toast } = useToast();
  const [b2bUsers, setB2bUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [rates, setRates] = useState<B2BRate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<B2BRate | null>(null);
  const [formData, setFormData] = useState({
    weight_min: '',
    weight_max: '',
    rate_per_kg: ''
  });

  useEffect(() => {
    fetchB2BUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchRates();
    }
  }, [selectedUser]);

  const fetchB2BUsers = async () => {
    // Get users with B2B role
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'b2b');

    if (rolesData && rolesData.length > 0) {
      const userIds = rolesData.map(r => r.user_id);
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, b2b_discount')
        .in('id', userIds);

      if (profilesData) {
        setB2bUsers(profilesData);
        if (profilesData.length > 0) {
          setSelectedUser(profilesData[0].id);
        }
      }
    }
  };

  const fetchRates = async () => {
    const { data, error } = await supabase
      .from('b2b_rates')
      .select('*')
      .eq('user_id', selectedUser)
      .order('weight_min', { ascending: true });

    if (!error && data) {
      setRates(data);
    }
  };

  const handleOpenDialog = (rate?: B2BRate) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        weight_min: rate.weight_min.toString(),
        weight_max: rate.weight_max.toString(),
        rate_per_kg: rate.rate_per_kg.toString()
      });
    } else {
      setEditingRate(null);
      setFormData({
        weight_min: '',
        weight_max: '',
        rate_per_kg: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.weight_min || !formData.weight_max || !formData.rate_per_kg) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const rateData = {
      user_id: selectedUser,
      weight_min: parseFloat(formData.weight_min),
      weight_max: parseFloat(formData.weight_max),
      rate_per_kg: parseFloat(formData.rate_per_kg)
    };

    try {
      if (editingRate) {
        const { error } = await supabase
          .from('b2b_rates')
          .update(rateData)
          .eq('id', editingRate.id);

        if (error) throw error;

        toast({
          title: "Tarifa actualizada",
          description: "La tarifa B2B ha sido actualizada exitosamente"
        });
      } else {
        const { error } = await supabase
          .from('b2b_rates')
          .insert(rateData);

        if (error) throw error;

        toast({
          title: "Tarifa creada",
          description: "La nueva tarifa B2B ha sido creada exitosamente"
        });
      }

      fetchRates();
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteRate = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarifa?')) return;

    try {
      const { error } = await supabase
        .from('b2b_rates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Tarifa eliminada",
        description: "La tarifa B2B ha sido eliminada exitosamente"
      });

      fetchRates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateB2BDiscount = async (userId: string, discount: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ b2b_discount: discount })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Descuento actualizado",
        description: `Descuento B2B establecido en ${discount}%`
      });

      fetchB2BUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const selectedProfile = b2bUsers.find(u => u.id === selectedUser);

  return (
    <DashboardLayout title="Tarifas B2B">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-navy">Gestión de Tarifas B2B</h2>
            <p className="text-muted-foreground">Configura tarifas preferenciales por rango de peso para socios comerciales</p>
          </div>
        </div>

        {/* User Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Socio B2B</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Socio Comercial</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar socio" />
                  </SelectTrigger>
                  <SelectContent>
                    {b2bUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProfile && (
                <div className="space-y-2">
                  <Label>Descuento General B2B (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      defaultValue={selectedProfile.b2b_discount || 0}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (value !== selectedProfile.b2b_discount) {
                          updateB2BDiscount(selectedUser, value);
                        }
                      }}
                      placeholder="Ej: 15"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Descuento aplicado sobre la tarifa estándar
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Rates by Weight Range */}
        {selectedUser && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Tarifas por Rango de Peso</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Configura tarifas específicas según el peso del envío
                  </p>
                </div>
                <Button 
                  className="bg-action-primary hover:bg-primary"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Tarifa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rates.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No hay tarifas configuradas</p>
                  <Button 
                    className="bg-action-primary hover:bg-primary"
                    onClick={() => handleOpenDialog()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Tarifa
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <TrendingDown className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy">
                            {rate.weight_min}kg - {rate.weight_max}kg
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Tarifa especial por rango de peso
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                          <p className="text-2xl font-bold text-primary">
                            ${rate.rate_per_kg}/kg
                          </p>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleOpenDialog(rate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => deleteRate(rate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {b2bUsers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No hay usuarios B2B registrados en el sistema
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRate ? 'Editar Tarifa B2B' : 'Nueva Tarifa B2B'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight_min">Peso Mínimo (kg) *</Label>
              <Input
                id="weight_min"
                type="number"
                step="0.01"
                value={formData.weight_min}
                onChange={(e) => setFormData({ ...formData, weight_min: e.target.value })}
                placeholder="Ej: 0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_max">Peso Máximo (kg) *</Label>
              <Input
                id="weight_max"
                type="number"
                step="0.01"
                value={formData.weight_max}
                onChange={(e) => setFormData({ ...formData, weight_max: e.target.value })}
                placeholder="Ej: 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate_per_kg">Tarifa por Kg (USD) *</Label>
              <Input
                id="rate_per_kg"
                type="number"
                step="0.01"
                value={formData.rate_per_kg}
                onChange={(e) => setFormData({ ...formData, rate_per_kg: e.target.value })}
                placeholder="Ej: 6.50"
              />
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                💡 Las tarifas se aplicarán automáticamente según el peso del envío
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-action-primary hover:bg-primary"
              onClick={handleSubmit}
            >
              {editingRate ? 'Actualizar' : 'Crear'} Tarifa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default B2BRatesManagement;
