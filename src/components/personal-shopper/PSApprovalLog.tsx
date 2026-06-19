import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, XCircle, Clock, FileCheck, AlertTriangle, 
  History, DollarSign, RefreshCw, Shield, User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Approval {
  id: string;
  tipo_aprobacion: string;
  descripcion?: string;
  monto_original?: number;
  monto_nuevo?: number;
  aprobado: boolean;
  created_at: string;
  aprobado_at?: string;
}

interface Decision {
  id: string;
  actor_tipo: string;
  tipo_decision: string;
  descripcion: string;
  contexto?: any;
  requires_approval?: boolean;
  approved?: boolean;
  approved_at?: string;
  created_at: string;
}

interface PSApprovalLogProps {
  approvals: Approval[];
  decisionLog: Decision[];
}

const PSApprovalLog = ({ approvals, decisionLog }: PSApprovalLogProps) => {
  
  const getApprovalTypeInfo = (tipo: string) => {
    const types: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
      cotizacion: { 
        label: 'Aprobación de Cotización', 
        icon: FileCheck, 
        color: 'text-primary' 
      },
      cambio_precio: { 
        label: 'Cambio de Precio', 
        icon: DollarSign, 
        color: 'text-status-warning' 
      },
      autoriza_compra: { 
        label: 'Autorización de Compra', 
        icon: CheckCircle, 
        color: 'text-status-delivered' 
      },
      acepta_riesgo: { 
        label: 'Acepta Riesgo Informado', 
        icon: AlertTriangle, 
        color: 'text-status-warning' 
      },
      alternativa_rechazada: { 
        label: 'Alternativa Rechazada', 
        icon: XCircle, 
        color: 'text-destructive' 
      },
      cambio_especificaciones: { 
        label: 'Cambio de Especificaciones', 
        icon: RefreshCw, 
        color: 'text-secondary' 
      },
    };
    return types[tipo] || { label: tipo, icon: FileCheck, color: 'text-muted-foreground' };
  };

  const getDecisionTypeInfo = (tipo: string) => {
    const types: Record<string, { label: string; description: string }> = {
      rechazo_alternativa: { 
        label: 'Alternativa Rechazada', 
        description: 'El cliente rechazó la alternativa sugerida' 
      },
      cambio_presupuesto: { 
        label: 'Cambio de Presupuesto', 
        description: 'El cliente modificó su presupuesto' 
      },
      cambio_especificaciones: { 
        label: 'Cambio de Especificaciones', 
        description: 'El cliente modificó las especificaciones del producto' 
      },
      autoriza_riesgo: { 
        label: 'Autoriza Riesgo', 
        description: 'El cliente aceptó continuar pese a un riesgo informado' 
      },
      acepta_variacion_precio: { 
        label: 'Acepta Variación de Precio', 
        description: 'El cliente aceptó un cambio en el precio' 
      },
      acepta_demora: { 
        label: 'Acepta Demora', 
        description: 'El cliente aceptó un cambio en tiempos estimados' 
      },
    };
    return types[tipo] || { label: tipo, description: '' };
  };

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case 'cliente':
        return <Badge variant="secondary"><User className="h-3 w-3 mr-1" />Cliente</Badge>;
      case 'shopper':
        return <Badge variant="outline">Personal Shopper</Badge>;
      case 'sistema':
        return <Badge className="bg-primary/10 text-primary">Sistema</Badge>;
      default:
        return <Badge variant="outline">{actor}</Badge>;
    }
  };

  // Merge and sort all entries by date
  const allEntries = [
    ...approvals.map(a => ({ 
      ...a, 
      type: 'approval' as const,
      date: new Date(a.aprobado_at || a.created_at) 
    })),
    ...decisionLog.map(d => ({ 
      ...d, 
      type: 'decision' as const,
      date: new Date(d.created_at) 
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      {/* Approvals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Aceptaciones del Cliente
          </CardTitle>
          <CardDescription>
            Registro de aprobaciones explícitas del cliente en hitos clave
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay aprobaciones registradas aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => {
                const typeInfo = getApprovalTypeInfo(approval.tipo_aprobacion);
                const TypeIcon = typeInfo.icon;
                
                return (
                  <div 
                    key={approval.id} 
                    className={`p-4 rounded-lg border ${
                      approval.aprobado 
                        ? 'border-status-delivered/30 bg-status-delivered/5' 
                        : 'border-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full bg-muted ${typeInfo.color}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{typeInfo.label}</p>
                          {approval.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {approval.descripcion}
                            </p>
                          )}
                          {(approval.monto_original || approval.monto_nuevo) && (
                            <div className="flex items-center gap-2 mt-2 text-sm">
                              {approval.monto_original && (
                                <span className="line-through text-muted-foreground">
                                  ${approval.monto_original.toFixed(2)}
                                </span>
                              )}
                              {approval.monto_nuevo && (
                                <span className="font-medium text-primary">
                                  → ${approval.monto_nuevo.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={approval.aprobado 
                          ? 'bg-status-delivered text-white' 
                          : 'bg-muted text-muted-foreground'
                        }>
                          {approval.aprobado ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Aprobado</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Pendiente</>
                          )}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(approval.aprobado_at || approval.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Decision Log Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Decisiones
          </CardTitle>
          <CardDescription>
            Registro de decisiones y autorizaciones para trazabilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {decisionLog.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No hay decisiones registradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {decisionLog.map((decision, index) => {
                const decisionInfo = getDecisionTypeInfo(decision.tipo_decision);
                
                return (
                  <div key={decision.id}>
                    <div className="flex items-start gap-4 py-3">
                      <div className="flex-shrink-0 w-16 text-xs text-muted-foreground text-right">
                        {format(new Date(decision.created_at), "dd MMM", { locale: es })}
                        <br />
                        {format(new Date(decision.created_at), "HH:mm", { locale: es })}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getActorBadge(decision.actor_tipo)}
                          <span className="font-medium text-sm">{decisionInfo.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{decision.descripcion}</p>
                        
                        {decision.requires_approval && (
                          <Badge 
                            variant="outline" 
                            className={`mt-2 ${
                              decision.approved 
                                ? 'border-status-delivered text-status-delivered' 
                                : 'border-status-warning text-status-warning'
                            }`}
                          >
                            {decision.approved ? 'Aprobado por cliente' : 'Requiere aprobación'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {index < decisionLog.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PSApprovalLog;
