import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PSNewSimilarRequestProps {
  originalRequest: {
    categoria: string;
    descripcion_producto: string;
    url_referencia: string | null;
    presupuesto_max: number;
    presupuesto_min: number | null;
    especificaciones: any;
    notas_cliente: string | null;
  };
  variant?: 'button' | 'card';
}

const PSNewSimilarRequest = ({ originalRequest, variant = 'button' }: PSNewSimilarRequestProps) => {
  const navigate = useNavigate();

  const handleCreateSimilar = () => {
    // Guardar datos en sessionStorage para prellenar el formulario
    const prefillData = {
      categoria: originalRequest.categoria,
      descripcion_producto: originalRequest.descripcion_producto,
      url_referencia: originalRequest.url_referencia,
      presupuesto_max: originalRequest.presupuesto_max,
      presupuesto_min: originalRequest.presupuesto_min,
      especificaciones: originalRequest.especificaciones,
      notas_cliente: originalRequest.notas_cliente,
      isFromSimilar: true,
    };
    
    sessionStorage.setItem('ps_prefill_data', JSON.stringify(prefillData));
    
    toast.info('Datos cargados', {
      description: 'Se han prellenado los campos con tu solicitud anterior'
    });
    
    navigate('/personal-shopper/solicitud');
  };

  if (variant === 'card') {
    return (
      <div className="p-4 rounded-lg border bg-muted/50 text-center">
        <Copy className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-3">
          ¿Deseas hacer una solicitud similar?
        </p>
        <Button onClick={handleCreateSimilar} variant="outline" className="gap-2">
          <Copy className="h-4 w-4" />
          Nueva solicitud similar
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleCreateSimilar} variant="outline" className="gap-2">
      <Copy className="h-4 w-4" />
      Nueva solicitud similar
    </Button>
  );
};

export default PSNewSimilarRequest;
