import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, MapPin, Clock } from "lucide-react";
import { AddressMapPicker } from "@/components/AddressMapPicker";
import { ValidationIcon } from "./ValidationIcon";

interface DeliveryEstimate {
  days: string;
  expressAvailable?: boolean;
  pickupAvailable?: boolean;
  nearestStore?: string | null;
}

interface ShippingFormProps {
  shippingAddress: string;
  shippingCity: string;
  notes: string;
  city: string;
  locationLoading: boolean;
  deliveryEstimate: DeliveryEstimate;
  touchedFields: Record<string, boolean>;
  validationErrors: Record<string, string>;
  setShippingAddress: (val: string) => void;
  setShippingCity: (val: string) => void;
  setNotes: (val: string) => void;
  setShippingCoordinates: (coords: { lat: number; lng: number }) => void;
  handleFieldChange: (field: string, value: string, setter: (val: string) => void) => void;
  handleFieldBlur: (field: string) => void;
  handleDetectLocation: () => void;
}

export const ShippingForm = ({
  shippingAddress,
  shippingCity,
  notes,
  city,
  locationLoading,
  deliveryEstimate,
  touchedFields,
  validationErrors,
  setShippingAddress,
  setShippingCity,
  setNotes,
  setShippingCoordinates,
  handleFieldChange,
  handleFieldBlur,
  handleDetectLocation,
}: ShippingFormProps) => {
  return (
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Dirección de envío</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">Entrega en todo Perú</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 relative">
                    <Label htmlFor="address" className="text-sm font-medium">Dirección completa</Label>
                    <Input
                      id="address"
                      value={shippingAddress}
                      onChange={(e) => handleFieldChange("shippingAddress", e.target.value, setShippingAddress)}
                      onBlur={() => handleFieldBlur("shippingAddress")}
                      placeholder="Av. Principal 123, Dpto 4B"
                      required
                      className={`mt-1.5 pr-10 transition-colors ${
                        touchedFields.shippingAddress && validationErrors.shippingAddress 
                          ? "border-destructive focus-visible:ring-destructive" 
                          : touchedFields.shippingAddress && !validationErrors.shippingAddress
                          ? "border-success focus-visible:ring-success"
                          : ""
                      }`}
                    />
                    <ValidationIcon field="shippingAddress" touchedFields={touchedFields} validationErrors={validationErrors} />
                    {touchedFields.shippingAddress && validationErrors.shippingAddress && (
                      <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.shippingAddress}</p>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Label htmlFor="city" className="text-sm font-medium flex items-center justify-between">
                      Ciudad
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleDetectLocation}
                        disabled={locationLoading}
                        className="h-auto py-1 px-2 text-xs"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {locationLoading ? "..." : "Detectar"}
                      </Button>
                    </Label>
                    <Input
                      id="city"
                      value={shippingCity}
                      onChange={(e) => handleFieldChange("shippingCity", e.target.value, setShippingCity)}
                      onBlur={() => handleFieldBlur("shippingCity")}
                      placeholder="Lima"
                      required
                      className={`mt-1.5 pr-10 transition-colors ${
                        touchedFields.shippingCity && validationErrors.shippingCity 
                          ? "border-destructive focus-visible:ring-destructive" 
                          : touchedFields.shippingCity && !validationErrors.shippingCity
                          ? "border-success focus-visible:ring-success"
                          : ""
                      }`}
                    />
                    <ValidationIcon field="shippingCity" touchedFields={touchedFields} validationErrors={validationErrors} />
                    {touchedFields.shippingCity && validationErrors.shippingCity && (
                      <p className="text-xs text-destructive mt-1 animate-fade-in">{validationErrors.shippingCity}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">País</Label>
                    <Input value="Perú" disabled className="mt-1.5 bg-muted/50" />
                  </div>
                </div>

                {/* Delivery Estimate Alert */}
                {(shippingCity || city) && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <Clock className="h-4 w-4 text-primary" />
                    <AlertDescription className="ml-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm">Entrega: {deliveryEstimate.days}</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {deliveryEstimate.expressAvailable && (
                            <Badge variant="secondary" className="text-xs">
                              Express disponible
                            </Badge>
                          )}
                          {deliveryEstimate.pickupAvailable && deliveryEstimate.nearestStore && (
                            <Badge variant="outline" className="text-xs">
                              Retiro en {deliveryEstimate.nearestStore}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Interactive Address Map */}
                <div className="mt-4">
                  <AddressMapPicker
                    address={shippingAddress}
                    city={shippingCity}
                    onAddressChange={setShippingAddress}
                    onCityChange={setShippingCity}
                    onCoordinatesChange={(lat, lng) => setShippingCoordinates({ lat, lng })}
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="notes" className="text-sm font-medium">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Referencias de entrega, horarios preferidos, etc."
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
  );
};
