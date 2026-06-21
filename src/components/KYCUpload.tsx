import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FacialBiometry } from './FacialBiometry';
import { DocumentVerification } from './DocumentVerification';

interface KYCUploadProps {
  userRole: 'traveler' | 'shopper';
}

interface KYCDocument {
  id: string;
  document_type: string;
  document_url: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
}

const documentTypes = {
  dni: { label: 'DNI / Cédula', required: true },
  passport: { label: 'Pasaporte', required: false },
  license: { label: 'Licencia de Conducir', required: false },
  proof_address: { label: 'Comprobante de Domicilio', required: true },
};

export function KYCUpload({ userRole }: KYCUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBiometry, setShowBiometry] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*')
        .eq('user_id', user?.id)
        .eq('user_role', userRole)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!user) return;

    setUploading(documentType);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${userRole}/${documentType}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('package-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('package-photos')
        .getPublicUrl(fileName);

      // Save document record
      const { error: insertError } = await supabase
        .from('kyc_documents')
        .insert({
          user_id: user.id,
          user_role: userRole,
          document_type: documentType,
          document_url: publicUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Documento subido",
        description: "Tu documento está en revisión",
      });

      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el documento",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'En Revisión', icon: Clock, variant: 'secondary' as const },
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

  const getDocumentStatus = (docType: string) => {
    return documents.find(doc => doc.document_type === docType);
  };

  const allRequiredApproved = () => {
    return Object.entries(documentTypes)
      .filter(([_, config]) => config.required)
      .every(([type]) => {
        const doc = getDocumentStatus(type);
        return doc && doc.status === 'approved';
      });
  };

  const allDocumentsUploaded = () => {
    return Object.entries(documentTypes)
      .filter(([_, config]) => config.required)
      .every(([type]) => {
        const doc = getDocumentStatus(type);
        return doc !== undefined;
      });
  };

  const hasBiometryDocument = () => {
    return documents.some(doc => doc.document_type === 'selfie');
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <DocumentVerification />

      {allRequiredApproved() && hasBiometryDocument() && (
        <Alert className="bg-success/10 border-success">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            ¡Felicitaciones! Tu verificación KYC está completa y aprobada.
          </AlertDescription>
        </Alert>
      )}

      {allDocumentsUploaded() && !hasBiometryDocument() && !showBiometry && (
        <Alert>
          <AlertDescription>
            Has completado la carga de documentos. Ahora debes completar la verificación biométrica facial.
            <Button 
              onClick={() => setShowBiometry(true)} 
              className="mt-2 w-full"
            >
              Iniciar Verificación Facial
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {showBiometry && !hasBiometryDocument() && (
        <FacialBiometry
          userId={user?.id || ''}
          userRole={userRole}
          onComplete={() => {
            setShowBiometry(false);
            fetchDocuments();
          }}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Verificación de Identidad (KYC)</CardTitle>
          <CardDescription>
            Sube los documentos requeridos para verificar tu identidad y comenzar a trabajar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(documentTypes).map(([type, config]) => {
            const existingDoc = getDocumentStatus(type);
            const canUpload = !existingDoc || existingDoc.status === 'rejected';

            return (
              <div key={type} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {config.label}
                        {config.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      {existingDoc && (
                        <p className="text-xs text-muted-foreground">
                          Subido el {new Date(existingDoc.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {existingDoc && getStatusBadge(existingDoc.status)}
                </div>

                {existingDoc?.status === 'rejected' && existingDoc.rejection_reason && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Motivo de rechazo: {existingDoc.rejection_reason}
                    </AlertDescription>
                  </Alert>
                )}

                {canUpload && (
                  <div className="space-y-2">
                    <Label htmlFor={`file-${type}`}>
                      {existingDoc ? 'Subir nuevo documento' : 'Seleccionar archivo'}
                    </Label>
                    <Input
                      id={`file-${type}`}
                      type="file"
                      accept="image/*,.pdf"
                      disabled={uploading === type}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(type, file);
                        }
                      }}
                    />
                    {uploading === type && (
                      <p className="text-sm text-muted-foreground">Subiendo...</p>
                    )}
                  </div>
                )}

                {existingDoc?.status === 'approved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(existingDoc.document_url, '_blank')}
                  >
                    Ver documento
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
