import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { 
  ShoppingBag, Package, ArrowLeft, Plus, Trash2, 
  AlertTriangle, CheckCircle, Clock, DollarSign, 
  MapPin, FileText, Shield, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

// Schema de validación
const solicitudSchema = z.object({
  categoria: z.string().min(1, 'Selecciona una categoría'),
  descripcion_producto: z.string()
    .min(10, 'Describe el producto con al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  urls_productos: z.array(z.string()).optional(),
  presupuesto_max: z.number()
    .min(10, 'El presupuesto mínimo es $10')
    .max(10000, 'El presupuesto máximo es $10,000'),
  presupuesto_min: z.number().min(0).optional(),
  moneda: z.string(),
  pais_compra: z.string().min(1, 'Selecciona el país'),
  ciudad_compra: z.string().optional(),
  urgencia: z.string(),
  notas_cliente: z.string().max(500, 'Las notas no pueden exceder 500 caracteres').optional(),
  acepta_terminos: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones del servicio'
  })
});

type SolicitudFormData = z.infer<typeof solicitudSchema>;

const CATEGORIAS = [
  { value: 'moda', label: 'Moda y Accesorios', icon: '👗' },
  { value: 'electronica', label: 'Electrónica', icon: '📱' },
  { value: 'bebes', label: 'Bebés y Niños', icon: '🍼' },
  { value: 'hogar', label: 'Hogar y Cocina', icon: '🏠' },
  { value: 'deportes', label: 'Deportes y Fitness', icon: '⚽' },
  { value: 'belleza', label: 'Belleza y Cuidado Personal', icon: '💄' },
  { value: 'juguetes', label: 'Juguetes y Juegos', icon: '🧸' },
  { value: 'otros', label: 'Otros', icon: '📦' }
];

const PAISES = [
  { value: 'usa', label: 'Estados Unidos' },
  { value: 'uk', label: 'Reino Unido' },
  { value: 'espana', label: 'España' },
  { value: 'china', label: 'China' }
];

const URGENCIAS = [
  { value: 'normal', label: 'Normal', description: 'Proceso estándar (5-7 días para cotización)', icon: Clock },
  { value: 'prioritario', label: 'Prioritario', description: 'Atención preferente (2-3 días para cotización)', icon: Sparkles },
  { value: 'urgente', label: 'Urgente', description: 'Máxima prioridad (24-48 horas para cotización)', icon: AlertTriangle }
];

const PSAsistidoSolicitud = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productUrls, setProductUrls] = useState<string[]>(['']);

  const form = useForm<SolicitudFormData>({
    resolver: zodResolver(solicitudSchema),
    defaultValues: {
      categoria: undefined,
      descripcion_producto: '',
      urls_productos: [''],
      presupuesto_max: undefined,
      presupuesto_min: undefined,
      moneda: 'USD',
      pais_compra: 'usa',
      ciudad_compra: '',
      urgencia: 'normal',
      notas_cliente: '',
      acepta_terminos: false
    }
  });

  const addUrlField = () => {
    if (productUrls.length < 5) {
      setProductUrls([...productUrls, '']);
    }
  };

  const removeUrlField = (index: number) => {
    if (productUrls.length > 1) {
      const newUrls = productUrls.filter((_, i) => i !== index);
      setProductUrls(newUrls);
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...productUrls];
    newUrls[index] = value;
    setProductUrls(newUrls);
  };

  const onSubmit = async (data: SolicitudFormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para enviar una solicitud');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      // Filtrar URLs válidas
      const validUrls = productUrls.filter(url => url.trim() !== '');
      
      // Cast necesario porque los tipos de la tabla ps_requests aún no están sincronizados
      const insertData = {
        cliente_id: user.id,
        tipo_servicio: 'asistido' as const,
        categoria: data.categoria as 'moda' | 'electronica' | 'bebes' | 'hogar' | 'deportes' | 'belleza' | 'juguetes' | 'otros',
        descripcion_producto: data.descripcion_producto,
        url_referencia: validUrls.length > 0 ? validUrls[0] : null,
        especificaciones: {
          urls_adicionales: validUrls.slice(1),
          pais_compra: data.pais_compra,
          ciudad_compra: data.ciudad_compra,
          urgencia: data.urgencia,
          moneda: data.moneda
        },
        presupuesto_min: data.presupuesto_min || null,
        presupuesto_max: data.presupuesto_max,
        prioridad: data.urgencia === 'urgente' ? 5 : data.urgencia === 'prioritario' ? 3 : 1,
        notas_cliente: data.notas_cliente || null,
        estado: 'recibida' as const
      };

      const { error } = await supabase
        .from('ps_requests')
        .insert(insertData as any);

      if (error) throw error;

      toast.success('¡Solicitud enviada exitosamente!', {
        description: 'Te notificaremos cuando un Personal Shopper revise tu solicitud.'
      });

      navigate('/cliente/shopping-requests');
    } catch (error: any) {
      console.error('Error al enviar solicitud:', error);
      toast.error('Error al enviar la solicitud', {
        description: error.message || 'Intenta nuevamente'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-background">
        <MainNavigation />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-secondary to-orange-600 py-16 md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10 mb-6"
                onClick={() => navigate('/personal-shopper')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Personal Shopper
              </Button>
              
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <ShoppingBag className="w-4 h-4" />
                <span className="text-sm font-medium">Servicio Asistido</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Solicitar Personal Shopper
              </h1>
              
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                Cuéntanos qué producto deseas y nuestro equipo de shoppers expertos lo buscará, 
                cotizará y comprará por ti.
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Sin tarjeta USA</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Shield className="w-4 h-4" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Mejores precios</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              
              {/* Aviso Legal */}
              <Card className="mb-8 border-amber-200 bg-amber-50/50">
                <CardContent className="flex items-start gap-4 pt-6">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium mb-1">Aviso Importante</p>
                    <p className="text-sm text-amber-700">
                      El precio mostrado es una estimación. Los costos finales pueden variar según 
                      disponibilidad, declaraciones aduaneras y otros cargos aplicables. Recibirás 
                      un presupuesto detallado antes de confirmar la compra.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  {/* Sección 1: Tipo de Servicio */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">1</span>
                        </div>
                        <div>
                          <CardTitle>Tipo de Servicio</CardTitle>
                          <CardDescription>Servicio seleccionado automáticamente</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                        <ShoppingBag className="w-8 h-8 text-secondary" />
                        <div>
                          <p className="font-semibold">Personal Shopper Asistido</p>
                          <p className="text-sm text-muted-foreground">
                            Envías tu solicitud, cotizamos opciones, apruebas y compramos por ti
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sección 2: Categoría */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">2</span>
                        </div>
                        <div>
                          <CardTitle>Categoría del Producto</CardTitle>
                          <CardDescription>Selecciona la categoría que mejor describe tu producto</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="categoria"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {CATEGORIAS.map((cat) => (
                                  <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => field.onChange(cat.value)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left hover:border-secondary/50 ${
                                      field.value === cat.value 
                                        ? 'border-secondary bg-secondary/5' 
                                        : 'border-border'
                                    }`}
                                  >
                                    <span className="text-2xl mb-2 block">{cat.icon}</span>
                                    <span className="text-sm font-medium">{cat.label}</span>
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Sección 3: Información del Producto */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">3</span>
                        </div>
                        <div>
                          <CardTitle>Información del Producto</CardTitle>
                          <CardDescription>Describe detalladamente qué producto necesitas</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* URLs de productos */}
                      <div className="space-y-3">
                        <Label>URLs de Referencia (opcional)</Label>
                        <p className="text-sm text-muted-foreground">
                          Agrega enlaces a los productos que te interesan
                        </p>
                        {productUrls.map((url, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="https://amazon.com/producto..."
                              value={url}
                              onChange={(e) => updateUrl(index, e.target.value)}
                              className="flex-1"
                            />
                            {productUrls.length > 1 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={() => removeUrlField(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {productUrls.length < 5 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={addUrlField}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Agregar otro enlace
                          </Button>
                        )}
                      </div>

                      {/* Descripción */}
                      <FormField
                        control={form.control}
                        name="descripcion_producto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción del Producto *</FormLabel>
                            <FormDescription>
                              Indica marca, modelo, talla, color, especificaciones técnicas y cualquier detalle importante
                            </FormDescription>
                            <FormControl>
                              <Textarea
                                placeholder="Ejemplo: Busco un iPhone 15 Pro Max de 256GB en color Titanio Natural. Preferiblemente nuevo y sellado de Apple Store..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Sección 4: Presupuesto */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">4</span>
                        </div>
                        <div>
                          <CardTitle>Presupuesto</CardTitle>
                          <CardDescription>Define el rango de precio que estás dispuesto a pagar</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="moneda"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Moneda</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Moneda" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD (Dólares)</SelectItem>
                                  <SelectItem value="PEN">PEN (Soles)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="presupuesto_min"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mínimo (opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="presupuesto_max"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Máximo *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1000"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        Este presupuesto es solo para el producto. El costo final incluirá comisión del servicio y envío.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Sección 5: Ubicación de Compra */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">5</span>
                        </div>
                        <div>
                          <CardTitle>Ubicación de Compra</CardTitle>
                          <CardDescription>¿Desde qué país quieres que compremos?</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pais_compra"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>País *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona país" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PAISES.map((pais) => (
                                    <SelectItem key={pais.value} value={pais.value}>
                                      {pais.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="ciudad_compra"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad (opcional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ej: Miami, New York..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sección 6: Urgencia */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">6</span>
                        </div>
                        <div>
                          <CardTitle>Urgencia</CardTitle>
                          <CardDescription>¿Qué tan rápido necesitas la cotización?</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="urgencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="grid md:grid-cols-3 gap-4">
                                {URGENCIAS.map((urg) => (
                                  <button
                                    key={urg.value}
                                    type="button"
                                    onClick={() => field.onChange(urg.value)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left hover:border-secondary/50 ${
                                      field.value === urg.value 
                                        ? 'border-secondary bg-secondary/5' 
                                        : 'border-border'
                                    }`}
                                  >
                                    <urg.icon className={`w-6 h-6 mb-2 ${
                                      urg.value === 'urgente' ? 'text-red-500' :
                                      urg.value === 'prioritario' ? 'text-amber-500' :
                                      'text-muted-foreground'
                                    }`} />
                                    <p className="font-semibold mb-1">{urg.label}</p>
                                    <p className="text-xs text-muted-foreground">{urg.description}</p>
                                  </button>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Sección 7: Observaciones */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">7</span>
                        </div>
                        <div>
                          <CardTitle>Observaciones Adicionales</CardTitle>
                          <CardDescription>¿Algo más que debamos saber?</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="notas_cliente"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Ej: Prefiero productos originales sellados. Si hay ofertas, me avisan. Necesito factura..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Sección 8: Términos */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-secondary">8</span>
                        </div>
                        <div>
                          <CardTitle>Términos y Condiciones</CardTitle>
                          <CardDescription>Lee y acepta las condiciones del servicio</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                        <p>Al enviar esta solicitud, confirmo que:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Boxifly actúa como intermediario de compra, no como vendedor</li>
                          <li>Los precios son estimados y pueden variar según disponibilidad</li>
                          <li>Recibiré un presupuesto detallado antes de aprobar la compra</li>
                          <li>El pago se realiza únicamente a través de Boxifly</li>
                          <li>No se garantiza stock ni precios hasta la confirmación final</li>
                        </ul>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="acepta_terminos"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="cursor-pointer">
                                Acepto los{' '}
                                <a 
                                  href="/terminos-y-condiciones" 
                                  target="_blank" 
                                  className="text-secondary underline hover:no-underline"
                                >
                                  Términos y Condiciones
                                </a>
                                {' '}del servicio Personal Shopper
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Botón de envío */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      className="flex-1"
                      onClick={() => navigate('/personal-shopper')}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg"
                      className="flex-1 bg-secondary hover:bg-secondary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Package className="w-5 h-5 mr-2" />
                          Enviar Solicitud
                        </>
                      )}
                    </Button>
                  </div>

                </form>
              </Form>

              {/* Info adicional */}
              <div className="mt-12 grid md:grid-cols-3 gap-6">
                <Card className="p-6 text-center">
                  <Clock className="w-8 h-8 mx-auto mb-3 text-secondary" />
                  <h4 className="font-semibold mb-2">Respuesta Rápida</h4>
                  <p className="text-sm text-muted-foreground">
                    Recibirás cotización en 24-72 horas según urgencia
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-3 text-secondary" />
                  <h4 className="font-semibold mb-2">Compra Segura</h4>
                  <p className="text-sm text-muted-foreground">
                    Tu dinero está protegido hasta la entrega
                  </p>
                </Card>
                <Card className="p-6 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-secondary" />
                  <h4 className="font-semibold mb-2">Sin Compromiso</h4>
                  <p className="text-sm text-muted-foreground">
                    Puedes rechazar la cotización sin costo
                  </p>
                </Card>
              </div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PSAsistidoSolicitud;