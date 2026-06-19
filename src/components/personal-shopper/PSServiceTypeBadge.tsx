import { Badge } from '@/components/ui/badge';
import { Video, UserCheck } from 'lucide-react';

interface PSServiceTypeBadgeProps {
  type?: 'asistido' | 'live';
  tipoServicio?: 'asistido' | 'live';
  size?: 'sm' | 'default' | 'lg';
}

/**
 * Badge component to visually differentiate between PS Asistido and PS Live services.
 * 
 * - Asistido: Traditional request-based service where clients submit product requests
 *   and shoppers provide quotes asynchronously.
 * - Live: Real-time streaming service where shoppers broadcast from stores and clients
 *   can request purchases in real-time.
 */
const PSServiceTypeBadge = ({ type, tipoServicio, size = 'default' }: PSServiceTypeBadgeProps) => {
  // Support both 'type' and 'tipoServicio' props for flexibility
  const serviceType = type || tipoServicio || 'asistido';
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  if (serviceType === 'live') {
    return (
      <Badge 
        variant="outline" 
        className={`border-red-500 text-red-600 bg-red-50 dark:bg-red-950/30 ${sizeClasses[size]}`}
      >
        <Video className={`mr-1 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
        Live
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`border-primary text-primary bg-primary/5 ${sizeClasses[size]}`}
    >
      <UserCheck className={`mr-1 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      Asistido
    </Badge>
  );
};

export default PSServiceTypeBadge;
