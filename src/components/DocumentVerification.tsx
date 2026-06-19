import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, ShieldCheck, Search } from 'lucide-react';

export interface VerifiedDocument {
  type: 'dni' | 'ruc';
  documentNumber: string;
  fullName: string | null;
  estado?: string | null;
  condicion?: string | null;
  direccion?: string | null;
  [key: string]: unknown;
}

interface DocumentVerificationProps {
  /** Callback con los datos verificados (para autocompletar el formulario padre). */
  onVerified?: (doc: VerifiedDocument) => void;
}

/**
 * Campo de verificación de DNI/RUC contra registros oficiales (RENIEC/SUNAT)
 * vía la Edge Function `consultar-documento`. Autocompleta el nombre de forma
 * exacta e inmodificable para evitar retenciones en aduanas (SUNAT).
 */
export function DocumentVerification({ onVerified }: DocumentVerificationProps) {
  const { toast } = useToast();
  const [docType, setDocType] = useState<'dni' | 'ruc'>('dni');
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const maxLen = docType === 'dni' ? 8 : 11;
  const isValidLength = numero.length === maxLen;

  const handleNumeroChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, maxLen);
    setNumero(digits);
    setResult(null);
    setError(null);
  };

  const handleTypeChange = (value: string) => {
    setDocType(value as 'dni' | 'ruc');
    setNumero('');
    setResult(null);
    setError(null);
  };

  const handleVerify = async () => {
    setError(null);
    if (!isValidLength) {
      setError(`El ${docType.toUpperCase()} debe tener ${maxLen} dígitos.`);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('consultar-documento', {
        body: { type: docType, numero },
      });

      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || 'No se pudo verificar el documento.');

      const verified = data.data as VerifiedDocument;
      setResult(verified);
      onVerified?.(verified);
      toast({
        title: 'Documento verificado ✅',
        description: verified.fullName || 'Datos obtenidos correctamente.',
      });
    } catch (e: any) {
      setError(e?.message || 'Error al verificar el documento.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Verificación de Documento (RENIEC / SUNAT)
        </CardTitle>
        <CardDescription>
          Validamos tu DNI o RUC en tiempo real para que tu nombre coincida exactamente con los
          registros oficiales. Esto evita que tu paquete quede retenido en aduanas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:w-32">
            <Label>Tipo</Label>
            <Select value={docType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dni">DNI</SelectItem>
                <SelectItem value="ruc">RUC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="docNumber">Número de {docType.toUpperCase()}</Label>
            <Input
              id="docNumber"
              inputMode="numeric"
              autoComplete="off"
              placeholder={docType === 'dni' ? '12345678' : '20123456789'}
              value={numero}
              onChange={(e) => handleNumeroChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVerify();
                }
              }}
            />
          </div>

          <Button type="button" onClick={handleVerify} disabled={loading || !isValidLength}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span className="ml-2">Verificar</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold text-green-700 dark:text-green-400">{result.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {result.type.toUpperCase()}: {result.documentNumber}
                  {result.type === 'ruc' && result.estado ? ` · ${result.estado}` : ''}
                </p>
                {result.type === 'ruc' && result.direccion ? (
                  <p className="text-xs text-muted-foreground">{result.direccion}</p>
                ) : null}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label>Nombre completo (verificado)</Label>
          <Input
            value={result?.fullName ?? ''}
            readOnly
            placeholder="Se completará automáticamente al verificar"
            className="bg-muted/50"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentVerification;
