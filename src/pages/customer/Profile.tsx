import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VIPGradientBadge } from "@/components/VIPBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Phone, MapPin, Calendar, Crown, Save, Upload, Loader2, Building2, Fingerprint, ShieldCheck, CheckCircle2, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch user profile
  const { data: profile, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch VIP tier info
  const { data: vipInfo } = useQuery({
    queryKey: ["vip-tier-info", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .rpc("get_vip_tier_info", { p_user_id: user.id });

      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user,
  });

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Identidad (persona natural / empresa)
  const [personType, setPersonType] = useState<"natural" | "empresa">("natural");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [documentVerified, setDocumentVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Update when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setPersonType((profile.person_type as "natural" | "empresa") || "natural");
      setDocumentNumber(profile.document_number || "");
      setNombres(profile.nombres || "");
      setApellidoPaterno(profile.apellido_paterno || "");
      setApellidoMaterno(profile.apellido_materno || "");
      setRazonSocial(profile.razon_social || "");
      setDocumentVerified(!!profile.document_verified);
    }
  }, [profile]);

  const docLabel = personType === "empresa" ? "RUC" : "DNI";
  const docMaxLen = personType === "empresa" ? 11 : 8;

  const handlePersonTypeChange = (value: string) => {
    setPersonType(value as "natural" | "empresa");
    // Cambiar de tipo invalida el documento previo.
    setDocumentNumber("");
    setNombres("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setRazonSocial("");
    setDocumentVerified(false);
    setVerifyError(null);
  };

  const handleDocumentChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, docMaxLen);
    setDocumentNumber(digits);
    setDocumentVerified(false);
    setVerifyError(null);
  };

  // Consulta RENIEC (DNI) / SUNAT (RUC) vía la Edge Function consultar-documento.
  const handleVerifyDocument = async () => {
    setVerifyError(null);
    const type = personType === "empresa" ? "ruc" : "dni";
    if (documentNumber.length !== docMaxLen) {
      setVerifyError(`El ${docLabel} debe tener ${docMaxLen} dígitos.`);
      return;
    }
    setVerifying(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("consultar-documento", {
        body: { type, numero: documentNumber },
      });
      if (fnError) throw new Error(fnError.message);
      if (!data?.success) throw new Error(data?.error || "No se pudo verificar el documento.");

      const d = data.data as Record<string, any>;
      if (type === "dni") {
        setNombres(d.firstName || "");
        setApellidoPaterno(d.lastNameP || "");
        setApellidoMaterno(d.lastNameM || "");
        setRazonSocial("");
      } else {
        setRazonSocial(d.razonSocial || d.fullName || "");
        setNombres("");
        setApellidoPaterno("");
        setApellidoMaterno("");
      }
      setDocumentVerified(true);
      toast({
        title: "Documento verificado ✅",
        description: d.fullName || "Datos obtenidos desde RENIEC/SUNAT.",
      });
    } catch (e: any) {
      setDocumentVerified(false);
      setVerifyError(e?.message || "Error al verificar el documento.");
    } finally {
      setVerifying(false);
    }
  };

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) return;

      // full_name derivado de la identidad para mantener compatibilidad con
      // notificaciones, etiquetas de aduana, etc.
      const derivedFullName =
        personType === "empresa"
          ? razonSocial.trim()
          : [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ").trim();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: derivedFullName || fullName,
          phone: phone,
          address: address,
          city: city,
          person_type: personType,
          document_type: personType === "empresa" ? "ruc" : "dni",
          document_number: documentNumber || null,
          nombres: personType === "empresa" ? null : nombres || null,
          apellido_paterno: personType === "empresa" ? null : apellidoPaterno || null,
          apellido_materno: personType === "empresa" ? null : apellidoMaterno || null,
          razon_social: personType === "empresa" ? razonSocial || null : null,
          document_verified: documentVerified,
          document_verified_at: documentVerified ? new Date().toISOString() : null,
        })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados exitosamente",
      });
      setIsEditing(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar tu perfil",
        variant: "destructive",
      });
    },
  });

  // Upload avatar mutation
  const uploadAvatar = async (file: File) => {
    if (!user) return;

    try {
      setUploadingAvatar(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor selecciona una imagen válida');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5 MB');
      }

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('user-avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil ha sido actualizada exitosamente",
      });

      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });

    } catch (error: any) {
      toast({
        title: "Error al subir foto",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!profile) {
    return (
      <DashboardLayout title="Mi Perfil">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Mi Perfil">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card with VIP Badge */}
        <Card className="overflow-hidden border-2 bg-gradient-to-br from-background via-background to-primary/5">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  {profile.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  )}
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload Button Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-white" />
                  )}
                </button>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">{profile.full_name}</h2>
                <p className="text-muted-foreground mb-3">{profile.email}</p>
                
                {vipInfo && (
                  <div className="flex flex-col items-center md:items-start gap-3">
                    <VIPGradientBadge tier={vipInfo.tier || 'bronce'} size="lg" />
                    <div className="flex items-center gap-2 text-sm">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {vipInfo.lifetime_points || 0} puntos acumulados
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <User className="h-4 w-4 mr-2" />
                    Editar perfil
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => updateProfile.mutate()}
                      disabled={updateProfile.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(profile.full_name || "");
                        setPhone(profile.phone || "");
                        setAddress(profile.address || "");
                        setCity(profile.city || "");
                        setPersonType((profile.person_type as "natural" | "empresa") || "natural");
                        setDocumentNumber(profile.document_number || "");
                        setNombres(profile.nombres || "");
                        setApellidoPaterno(profile.apellido_paterno || "");
                        setApellidoMaterno(profile.apellido_materno || "");
                        setRazonSocial(profile.razon_social || "");
                        setDocumentVerified(!!profile.document_verified);
                        setVerifyError(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identidad y Documento (RENIEC / SUNAT) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Identidad y Documento
            </CardTitle>
            <CardDescription>
              Verificamos tu {docLabel} contra {personType === "empresa" ? "SUNAT" : "RENIEC"} para
              que tus datos coincidan con los registros oficiales y evitar retenciones en aduanas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {personType === "empresa" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  Tipo de persona
                </Label>
                <Select value={personType} onValueChange={handlePersonTypeChange} disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Persona natural (DNI)</SelectItem>
                    <SelectItem value="empresa">Empresa (RUC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentNumber" className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  {docLabel}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="documentNumber"
                    inputMode="numeric"
                    autoComplete="off"
                    value={documentNumber}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                    disabled={!isEditing || documentVerified}
                    placeholder={personType === "empresa" ? "20123456789" : "12345678"}
                    className={documentVerified ? "bg-muted/50" : ""}
                  />
                  {isEditing && !documentVerified && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleVerifyDocument}
                      disabled={verifying || documentNumber.length !== docMaxLen}
                    >
                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">Verificar</span>
                    </Button>
                  )}
                </div>
                {documentVerified && (
                  <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verificado contra {personType === "empresa" ? "SUNAT" : "RENIEC"}
                  </p>
                )}
              </div>
            </div>

            {verifyError && (
              <Alert variant="destructive">
                <AlertDescription>{verifyError}</AlertDescription>
              </Alert>
            )}

            {personType === "empresa" ? (
              <div className="space-y-2">
                <Label htmlFor="razonSocial" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Razón social
                </Label>
                <Input
                  id="razonSocial"
                  value={razonSocial}
                  readOnly
                  placeholder="Se completa automáticamente al verificar el RUC"
                  className="bg-muted/50"
                />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input id="nombres" value={nombres} readOnly placeholder="—" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
                  <Input id="apellidoPaterno" value={apellidoPaterno} readOnly placeholder="—" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidoMaterno">Apellido materno</Label>
                  <Input id="apellidoMaterno" value={apellidoMaterno} readOnly placeholder="—" className="bg-muted/50" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Actualiza tus datos de contacto y dirección
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  El email no puede ser modificado
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  placeholder="+51 999 999 999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ciudad
                </Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Lima"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dirección
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Av. Principal 123, Dpto 4B"
                />
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Miembro desde
                </Label>
                <p className="text-sm font-medium">
                  {format(new Date(profile.created_at), "PPP", { locale: es })}
                </p>
              </div>

              {profile.warehouse_code && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Código de casillero</Label>
                  <p className="text-sm font-mono font-bold">{profile.warehouse_code}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
