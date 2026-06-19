import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  success: number;
  errors: number;
  details: Array<{
    row: number;
    tracking: string;
    status: 'success' | 'error';
    message: string;
  }>;
}

const B2BBulkUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const downloadTemplate = () => {
    const csvContent = 'tracking_number,store_name,estimated_weight,estimated_value,notes\nABC123456,Amazon,2.5,50,Ejemplo de paquete\nDEF789012,eBay,1.2,30,';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_carga_masiva.csv';
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }

    return data;
  };

  const validateRow = (row: any, rowNumber: number): { valid: boolean; error?: string } => {
    if (!row.tracking_number) {
      return { valid: false, error: 'Tracking number es obligatorio' };
    }
    if (!row.store_name) {
      return { valid: false, error: 'Store name es obligatorio' };
    }
    if (!row.estimated_weight || isNaN(parseFloat(row.estimated_weight))) {
      return { valid: false, error: 'Peso estimado debe ser un número válido' };
    }
    if (!row.estimated_value || isNaN(parseFloat(row.estimated_value))) {
      return { valid: false, error: 'Valor estimado debe ser un número válido' };
    }

    return { valid: true };
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Selecciona un archivo CSV',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const uploadResult: UploadResult = {
      success: 0,
      errors: 0,
      details: [],
    };

    try {
      const text = await file.text();
      const data = parseCSV(text);

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const validation = validateRow(row, i + 2); // +2 because header is row 1

        if (!validation.valid) {
          uploadResult.errors++;
          uploadResult.details.push({
            row: i + 2,
            tracking: row.tracking_number || 'N/A',
            status: 'error',
            message: validation.error || 'Error de validación',
          });
          continue;
        }

        // Check for duplicates
        const { data: existingPackage } = await supabase
          .from('packages')
          .select('id')
          .eq('tracking_number', row.tracking_number)
          .single();

        if (existingPackage) {
          uploadResult.errors++;
          uploadResult.details.push({
            row: i + 2,
            tracking: row.tracking_number,
            status: 'error',
            message: 'Tracking number duplicado',
          });
          continue;
        }

        // Insert package
        const { error } = await supabase.from('packages').insert({
          user_id: user?.id,
          tracking_number: row.tracking_number,
          store_name: row.store_name,
          estimated_weight: parseFloat(row.estimated_weight),
          estimated_value: parseFloat(row.estimated_value),
          notes: row.notes || null,
          current_status: 'prealerted',
        });

        if (error) {
          uploadResult.errors++;
          uploadResult.details.push({
            row: i + 2,
            tracking: row.tracking_number,
            status: 'error',
            message: error.message,
          });
        } else {
          uploadResult.success++;
          uploadResult.details.push({
            row: i + 2,
            tracking: row.tracking_number,
            status: 'success',
            message: 'Paquete creado exitosamente',
          });
        }
      }

      setResult(uploadResult);
      toast({
        title: 'Carga Completada',
        description: `${uploadResult.success} paquetes creados, ${uploadResult.errors} errores`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al procesar el archivo CSV',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Carga Masiva de Paquetes">
      <div className="space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Instrucciones de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Descarga la plantilla CSV haciendo clic en el botón de abajo</li>
              <li>Completa la plantilla con los datos de tus paquetes</li>
              <li>Asegúrate de que todos los campos obligatorios estén completos</li>
              <li>Sube el archivo CSV completado</li>
              <li>Revisa el resultado de la carga</li>
            </ol>
            <div className="mt-4">
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Cargar Archivo CSV</CardTitle>
            <CardDescription>
              Selecciona tu archivo CSV con los paquetes a cargar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Archivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
              </div>
            )}
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-action-primary hover:bg-primary"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Procesando...' : 'Cargar Paquetes'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado de la Carga</CardTitle>
              <CardDescription>
                {result.success} exitosos, {result.errors} errores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="border-l-4 border-l-success">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Exitosos</p>
                        <p className="text-2xl font-bold text-success">{result.success}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-status-error">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-status-error" />
                      <div>
                        <p className="text-sm text-muted-foreground">Errores</p>
                        <p className="text-2xl font-bold text-status-error">{result.errors}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold mb-2">Detalle por Fila</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {result.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-md border ${
                        detail.status === 'success'
                          ? 'border-success bg-success/10'
                          : 'border-status-error bg-status-error/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {detail.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-success" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-status-error" />
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              Fila {detail.row}: {detail.tracking}
                            </p>
                            <p className="text-xs text-muted-foreground">{detail.message}</p>
                          </div>
                        </div>
                        <Badge variant={detail.status === 'success' ? 'default' : 'destructive'}>
                          {detail.status === 'success' ? 'Éxito' : 'Error'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default B2BBulkUpload;
