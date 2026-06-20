import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Package } from "lucide-react";
import { ValidationIcon } from "./ValidationIcon";

interface GuestInfoFormProps {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  createAccount: boolean;
  touchedFields: Record<string, boolean>;
  validationErrors: Record<string, string>;
  setGuestName: (val: string) => void;
  setGuestEmail: (val: string) => void;
  setGuestPhone: (val: string) => void;
  setCreateAccount: (val: boolean) => void;
  handleFieldChange: (field: string, value: string, setter: (val: string) => void) => void;
  handleFieldBlur: (field: string) => void;
}

export const GuestInfoForm = ({
  guestName,
  guestEmail,
  guestPhone,
  createAccount,
  touchedFields,
  validationErrors,
  setGuestName,
  setGuestEmail,
  setGuestPhone,
  setCreateAccount,
  handleFieldChange,
  handleFieldBlur,
}: GuestInfoFormProps) => {
  return (
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Tus datos</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Compra sin registrarte
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="relative">
                      <Label htmlFor="guest-name" className="text-sm font-medium">Nombre completo</Label>
                      <Input
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => handleFieldChange("guestName", e.target.value, setGuestName)}
                        onBlur={() => handleFieldBlur("guestName")}
                        placeholder="Juan Pérez"
                        required
                        className={`mt-1.5 pr-10 transition-colors ${
                          touchedFields.guestName && validationErrors.guestName 
                            ? "border-destructive focus-visible:ring-destructive" 
                            : touchedFields.guestName && !validationErrors.guestName
                            ? "border-success focus-visible:ring-success"
                            : ""
                        }`}
                      />
                      <ValidationIcon field="guestName" touchedFields={touchedFields} validationErrors={validationErrors} />
                      {touchedFields.guestName && validationErrors.guestName && (
                        <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.guestName}</p>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Label htmlFor="guest-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="guest-email"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => handleFieldChange("guestEmail", e.target.value, setGuestEmail)}
                        onBlur={() => handleFieldBlur("guestEmail")}
                        placeholder="tu@email.com"
                        required
                        className={`mt-1.5 pr-10 transition-colors ${
                          touchedFields.guestEmail && validationErrors.guestEmail 
                            ? "border-destructive focus-visible:ring-destructive" 
                            : touchedFields.guestEmail && !validationErrors.guestEmail
                            ? "border-success focus-visible:ring-success"
                            : ""
                        }`}
                      />
                      <ValidationIcon field="guestEmail" touchedFields={touchedFields} validationErrors={validationErrors} />
                      {touchedFields.guestEmail && validationErrors.guestEmail && (
                        <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.guestEmail}</p>
                      )}
                    </div>

                    <div className="relative">
                      <Label htmlFor="guest-phone" className="text-sm font-medium">Teléfono</Label>
                      <Input
                        id="guest-phone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => handleFieldChange("guestPhone", e.target.value, setGuestPhone)}
                        onBlur={() => handleFieldBlur("guestPhone")}
                        placeholder="+51 999 999 999"
                        required
                        className={`mt-1.5 pr-10 transition-colors ${
                          touchedFields.guestPhone && validationErrors.guestPhone 
                            ? "border-destructive focus-visible:ring-destructive" 
                            : touchedFields.guestPhone && !validationErrors.guestPhone
                            ? "border-success focus-visible:ring-success"
                            : ""
                        }`}
                      />
                      <ValidationIcon field="guestPhone" touchedFields={touchedFields} validationErrors={validationErrors} />
                      {touchedFields.guestPhone && validationErrors.guestPhone && (
                        <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.guestPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg border border-primary/20 transition-all hover:bg-primary/10">
                    <Checkbox 
                      id="create-account" 
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(checked as boolean)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor="create-account" 
                        className="text-sm font-medium cursor-pointer leading-tight"
                      >
                        Crear cuenta para seguimiento de pedidos
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Recibirás un email para establecer tu contraseña
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
  );
};
