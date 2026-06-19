import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react';

interface KYCDocument {
  id: string;
  user_id: string;
  user_role: string;
  document_type: string;
  document_url: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

interface GroupedDocuments {
  [userId: string]: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    documents: KYCDocument[];
  };
}

export default function KYCVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<string>('pending');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from('kyc_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: docsData, error: docsError } = await query;

      if (docsError) throw docsError;

      // Fetch profile data separately for each user
      const docsWithProfiles = await Promise.all(
        (docsData || []).map(async (doc) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', doc.user_id)
            .single();

          return {
            ...doc,
            user_profile: profile
          };
        })
      );

      setDocuments(docsWithProfiles);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const groupDocumentsByUser = (): GroupedDocuments => {
    const grouped: GroupedDocuments = {};

    documents.forEach(doc => {
      if (!grouped[doc.user_id]) {
        grouped[doc.user_id] = {
          user: {
            id: doc.user_id,
            name: doc.user_profile?.full_name || 'Usuario sin nombre',
            email: doc.user_profile?.email || '',
            role: doc.user_role
          },
          documents: []
        };
      }
      grouped[doc.user_id].documents.push(doc);
    });

    return grouped;
  };

  const handleReview = async () => {
    if (!selectedDoc || !reviewAction) return;

    try {
      const updates: any = {
        status: reviewAction === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString()
      };

      if (reviewAction === 'reject' && rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('kyc_documents')
        .update(updates)
        .eq('id', selectedDoc.id);

      if (error) throw error;

      // Update profile verification status if all documents are approved
      if (reviewAction === 'approve') {
        await checkAndUpdateUserVerification(selectedDoc.user_id, selectedDoc.user_role);
      }

      toast({
        title: reviewAction === 'approve' ? "Documento aprobado" : "Documento rechazado",
        description: "La revisión se ha guardado correctamente",
      });

      setSelectedDoc(null);
      setReviewAction(null);
      setRejectionReason('');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error reviewing document:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la revisión",
        variant: "destructive"
      });
    }
  };

  const checkAndUpdateUserVerification = async (userId: string, role: string) => {
    // Check if all required documents are approved
    const { data: userDocs } = await supabase
      .from('kyc_documents')
      .select('*')
      .eq('user_id', userId)
      .eq('user_role', role);

    const requiredDocs = ['dni', 'selfie', 'proof_address'];
    const allApproved = requiredDocs.every(docType =>
      userDocs?.some(doc => doc.document_type === docType && doc.status === 'approved')
    );

    if (allApproved) {
      const field = role === 'traveler' ? 'traveler_verified' : 'shopper_verified';
      const dateField = role === 'traveler' ? 'traveler_verified_at' : 'shopper_verified_at';
      const byField = role === 'traveler' ? 'traveler_verified_by' : 'shopper_verified_by';

      await supabase
        .from('profiles')
        .update({
          [field]: true,
          [dateField]: new Date().toISOString(),
          [byField]: user?.id
        } as any)
        .eq('id', userId);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pendiente', icon: Clock, variant: 'secondary' as const },
      approved: { label: 'Aprobado', icon: CheckCircle, variant: 'default' as const },
      rejected: { label: 'Rechazado', icon: XCircle, variant: 'destructive' as const },
    };

    const { label, icon: Icon, variant } = config[status as keyof typeof config];
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dni: 'DNI / Cédula',
      passport: 'Pasaporte',
      license: 'Licencia de Conducir',
      selfie: 'Selfie con DNI',
      proof_address: 'Comprobante de Domicilio',
    };
    return labels[type] || type;
  };

  const groupedDocs = groupDocumentsByUser();

  return (
    <DashboardLayout title="Verificación KYC">
      <div className="space-y-6">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="approved">Aprobados</TabsTrigger>
            <TabsTrigger value="rejected">Rechazados</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">Cargando...</div>
        ) : Object.keys(groupedDocs).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay documentos para revisar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {Object.values(groupedDocs).map(({ user: userData, documents: userDocs }) => (
              <Card key={userData.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{userData.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{userData.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{userData.role === 'traveler' ? 'Viajero' : 'Personal Shopper'}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userDocs.map(doc => (
                      <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</p>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.document_url, '_blank')}
                          >
                            Ver
                          </Button>
                          {doc.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setReviewAction('approve');
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedDoc(doc);
                                  setReviewAction('reject');
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewAction} onOpenChange={() => {
        setReviewAction(null);
        setSelectedDoc(null);
        setRejectionReason('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Aprobar Documento' : 'Rechazar Documento'}
            </DialogTitle>
            <DialogDescription>
              {selectedDoc && `${getDocumentTypeLabel(selectedDoc.document_type)} - ${selectedDoc.user_profile?.full_name}`}
            </DialogDescription>
          </DialogHeader>

          {reviewAction === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo del rechazo *</Label>
              <Textarea
                id="reason"
                placeholder="Explica por qué se rechaza este documento..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setReviewAction(null);
              setSelectedDoc(null);
              setRejectionReason('');
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewAction === 'reject' && !rejectionReason.trim()}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
