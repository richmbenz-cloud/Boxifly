import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

/**
 * Pilar #4 — Contador de importaciones SUNAT
 *
 * En Perú, cada ciudadano tiene derecho a 3 importaciones al año libres de
 * impuestos, siempre que cada envío sea menor a USD 200. Este componente le
 * muestra al cliente cuántas de esas importaciones lleva usadas en el año en
 * curso, con una barra de progreso y mensajes educativos.
 */

// --- Reglas de negocio SUNAT (régimen simplificado de envíos / franquicia) ---
export const FREE_IMPORTS_PER_YEAR = 3;
export const TAX_FREE_THRESHOLD_USD = 200;

// Estados que indican que el paquete ya constituye (o constituirá) una
// importación hacia el Perú. Mientras el paquete sigue en EE.UU. todavía no
// consume la franquicia anual.
const IMPORTED_STATUSES = [
  'in_transit',
  'arrived_peru',
  'ready_delivery',
  'delivered',
] as const;

export interface ImportCounterPackage {
  current_status: string | null;
  estimated_value: number | null;
  created_at: string | null;
}

interface ImportCounterProps {
  /** Paquetes ya cargados (evita una segunda consulta). Si se omite, el componente los obtiene. */
  packages?: ImportCounterPackage[];
  /** Año a evaluar. Por defecto, el año en curso. */
  year?: number;
  className?: string;
}

const ImportCounter = ({ packages: packagesProp, year, className }: ImportCounterProps) => {
  const { user } = useAuth();
  const targetYear = year ?? new Date().getFullYear();

  const [fetched, setFetched] = useState<ImportCounterPackage[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Solo consultamos si no nos pasaron los paquetes por props.
  useEffect(() => {
    if (packagesProp || !user) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('packages')
        .select('current_status, estimated_value, created_at')
        .eq('user_id', user.id);

      if (active) {
        if (!error && data) setFetched(data as ImportCounterPackage[]);
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [packagesProp, user]);

  const source = packagesProp ?? fetched ?? [];

  const { freeUsed, taxed, remaining, percent } = useMemo(() => {
    const importedThisYear = source.filter((p) => {
      if (!p.created_at || !p.current_status) return false;
      const sameYear = new Date(p.created_at).getFullYear() === targetYear;
      const isImport = IMPORTED_STATUSES.includes(
        p.current_status as (typeof IMPORTED_STATUSES)[number]
      );
      return sameYear && isImport;
    });

    const free = importedThisYear.filter(
      (p) => (p.estimated_value ?? 0) <= TAX_FREE_THRESHOLD_USD
    ).length;
    const overThreshold = importedThisYear.filter(
      (p) => (p.estimated_value ?? 0) > TAX_FREE_THRESHOLD_USD
    ).length;

    const rem = Math.max(0, FREE_IMPORTS_PER_YEAR - free);
    const pct = Math.min(100, (free / FREE_IMPORTS_PER_YEAR) * 100);

    return { freeUsed: free, taxed: overThreshold, remaining: rem, percent: pct };
  }, [source, targetYear]);

  const limitReached = remaining === 0;

  // Color de la barra según el avance.
  const barColor = limitReached
    ? '[&>div]:bg-status-warning'
    : remaining === 1
    ? '[&>div]:bg-amber-500'
    : '[&>div]:bg-status-delivered';

  return (
    <Card className={`border-l-4 ${limitReached ? 'border-l-status-warning' : 'border-l-status-delivered'} ${className ?? ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardDescription className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-status-delivered" />
              Importaciones sin impuestos {targetYear}
            </CardDescription>
            <CardTitle className="mt-1 text-2xl font-bold text-navy">
              {freeUsed} <span className="text-base font-medium text-muted-foreground">de {FREE_IMPORTS_PER_YEAR}</span>
            </CardTitle>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger aria-label="¿Cómo funciona el límite de importaciones?">
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                En el Perú tienes derecho a <strong>{FREE_IMPORTS_PER_YEAR} importaciones al año</strong>{' '}
                libres de impuestos, siempre que cada envío sea menor a{' '}
                <strong>USD {TAX_FREE_THRESHOLD_USD}</strong>. El contador se reinicia cada 1 de enero.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Progress value={percent} className={`h-2.5 ${barColor}`} />

        {loading ? (
          <p className="text-sm text-muted-foreground">Calculando tus importaciones…</p>
        ) : limitReached ? (
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-status-warning mt-0.5" />
            <p className="text-muted-foreground">
              Usaste tus <strong>{FREE_IMPORTS_PER_YEAR}</strong> importaciones libres de impuestos de {targetYear}.
              Los próximos envíos podrían pagar tributos en aduana.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-status-delivered mt-0.5" />
            <p className="text-muted-foreground">
              Te {remaining === 1 ? 'queda' : 'quedan'} <strong>{remaining}</strong>{' '}
              {remaining === 1 ? 'importación' : 'importaciones'} sin impuestos este año.
            </p>
          </div>
        )}

        {taxed > 0 && (
          <p className="text-xs text-muted-foreground">
            {taxed} {taxed === 1 ? 'envío supera' : 'envíos superan'} los USD {TAX_FREE_THRESHOLD_USD} y{' '}
            {taxed === 1 ? 'tributa' : 'tributan'} aparte (no consumen tu franquicia anual).
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportCounter;
