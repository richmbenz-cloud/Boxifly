import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import logoFull from '@/assets/logo-boxifly-full.png';
import SEO from '@/components/SEO';

interface AuthProps {
  defaultView?: 'login' | 'register';
}

const Auth = ({ defaultView = 'login' }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(defaultView === 'login');

  useEffect(() => {
    setIsLogin(defaultView === 'login');
  }, [defaultView]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente",
        });
        navigate('/dashboard');
      } else {
        if (!fullName.trim()) {
          throw new Error('El nombre completo es requerido');
        }
        
        const { error } = await signUp(email, password, fullName, role);
        if (error) throw error;
        
        toast({
          title: "¡Cuenta creada!",
          description: "Tu cuenta ha sido creada exitosamente",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = isLogin
    ? "Iniciar Sesión | Accede a tu Casillero Boxifly"
    : "Registrarse en Boxifly | Crea tu Casillero Gratis en USA";
  const pageDescription = isLogin
    ? "Accede a tu casillero internacional de Boxifly para prealertar tus paquetes, ver tarifas y rastrear tus envíos a Perú."
    : "Regístrate en Boxifly y obtén tu dirección de casillero gratuito en Miami para traer tus compras de USA a Perú de forma rápida y segura.";
  const pagePath = isLogin ? "/iniciar-sesion" : "/registrarse";

  return (
    <>
      <SEO title={pageTitle} description={pageDescription} path={pagePath} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-primary p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110 z-10"
      >
        <X className="h-5 w-5" />
      </Button>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <Link to="/" className="cursor-pointer">
              <img src={logoFull} alt="Boxifly" className="h-16 hover:opacity-90 transition-opacity" />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-navy">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Accede a tu panel de control' 
              : 'Únete a la plataforma logística líder'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Tipo de Cuenta</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-action-primary hover:bg-primary" 
              disabled={loading}
            >
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate(isLogin ? '/registrarse' : '/iniciar-sesion')}
              className="text-sm text-primary hover:text-secondary transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default Auth;
