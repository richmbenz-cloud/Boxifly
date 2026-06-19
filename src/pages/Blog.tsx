import { useState } from 'react';
import DOMPurify from 'dompurify';
import { MainNavigation } from '@/components/MainNavigation';
import { ChatWidget } from '@/components/ChatWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, Calendar, Clock, ArrowRight, ExternalLink, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import { SEO } from '@/components/SEO';

const Blog = () => {
  const [selectedPost, setSelectedPost] = useState<typeof recentPosts[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const featuredPost = {
    id: 1,
    title: 'Black Friday & Cyber Monday 2025: Guía Completa para Ahorrar hasta 70%',
    description: 'Estrategias probadas, mejores tiendas, cupones exclusivos y fechas clave para aprovechar la temporada de descuentos más grande del año.',
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80',
    date: '15 Enero 2025',
    readTime: '18 min',
    fullContent: `
      <div class="mb-8">
        <img src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&q=80" alt="Black Friday 2025" class="w-full h-64 object-cover rounded-lg mb-6" />
      </div>

      <h2 class="text-3xl font-bold mb-4 mt-8">🗓️ Fechas Clave 2025</h2>
      <div class="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg mb-6">
        <ul class="space-y-2 text-lg">
          <li><strong>Black Friday:</strong> Viernes 28 de noviembre de 2025</li>
          <li><strong>Cyber Monday:</strong> Lunes 1 de diciembre de 2025</li>
          <li><strong>Pre-Black Friday:</strong> Semana del 21 al 27 de noviembre</li>
          <li><strong>Cyber Week:</strong> Hasta el 5 de diciembre</li>
        </ul>
      </div>

      <h2 class="text-3xl font-bold mb-4 mt-8">💰 Dónde Conseguir Cupones y Descuentos</h2>
      <div class="grid md:grid-cols-2 gap-4 mb-6">
        <div class="bg-muted/50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-2">🔗 Sitios de Cupones Confiables</h3>
          <ul class="space-y-1 text-sm">
            <li>• <a href="https://www.retailmenot.com" target="_blank" class="text-primary hover:underline">RetailMeNot.com</a></li>
            <li>• <a href="https://www.honey.com" target="_blank" class="text-primary hover:underline">Honey.com</a> (extensión de navegador)</li>
            <li>• <a href="https://slickdeals.net" target="_blank" class="text-primary hover:underline">SlickDeals.net</a></li>
            <li>• <a href="https://www.coupons.com" target="_blank" class="text-primary hover:underline">Coupons.com</a></li>
          </ul>
        </div>
        <div class="bg-muted/50 p-4 rounded-lg">
          <h3 class="font-bold text-lg mb-2">📧 Newsletters VIP</h3>
          <p class="text-sm mb-2">Suscríbete antes del Black Friday para recibir:</p>
          <ul class="space-y-1 text-sm">
            <li>• Acceso anticipado a ofertas</li>
            <li>• Cupones exclusivos 10-20% extra</li>
            <li>• Alertas de flash sales</li>
          </ul>
        </div>
      </div>

      <h2 class="text-3xl font-bold mb-4 mt-8">🎯 Estrategia de Compra Probada</h2>
      
      <div class="space-y-4 mb-6">
        <details class="bg-muted/30 rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <summary class="font-bold text-lg mb-2 cursor-pointer">📋 Fase 1: Preparación (1-2 semanas antes)</summary>
          <ul class="mt-3 space-y-2 ml-4">
            <li>✓ Crea tu lista de productos deseados con precios actuales</li>
            <li>✓ Registra tu casillero Boxifly GRATIS en Miami</li>
            <li>✓ Instala extensiones de cupones (Honey, Rakuten)</li>
            <li>✓ Activa alertas de precio en CamelCamelCamel</li>
            <li>✓ Suscríbete a newsletters de tiendas clave</li>
            <li>✓ Configura métodos de pago en las tiendas</li>
          </ul>
        </details>

        <details class="bg-muted/30 rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <summary class="font-bold text-lg mb-2 cursor-pointer">⚡ Fase 2: Durante el evento</summary>
          <ul class="mt-3 space-y-2 ml-4">
            <li>✓ Compra en las primeras 3 horas (mejor disponibilidad)</li>
            <li>✓ Usa múltiples pestañas del navegador</li>
            <li>✓ Activa notificaciones de stock para productos agotados</li>
            <li>✓ Compara precios en tiempo real entre tiendas</li>
            <li>✓ Usa tu casillero Boxifly como dirección de envío</li>
            <li>✓ Consolida varios paquetes para ahorrar en envío</li>
          </ul>
        </details>

        <details class="bg-muted/30 rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <summary class="font-bold text-lg mb-2 cursor-pointer">📦 Fase 3: Post-compra</summary>
          <ul class="mt-3 space-y-2 ml-4">
            <li>✓ Registra tus tracking numbers en Boxifly</li>
            <li>✓ Solicita consolidación de múltiples paquetes</li>
            <li>✓ Revisa fotos de tus paquetes en el warehouse</li>
            <li>✓ Calcula costos de importación con nuestra calculadora</li>
            <li>✓ Elige tu método de entrega preferido</li>
          </ul>
        </details>
      </div>

      <h2 class="text-3xl font-bold mb-4 mt-8">🏪 Top 15 Tiendas Imperdibles Black Friday 2025</h2>
      
      <div class="grid md:grid-cols-3 gap-4 mb-6">
        <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <h3 class="font-bold text-primary mb-2">🖥️ Electrónica</h3>
          <ul class="text-sm space-y-1">
            <li>• <strong>Amazon</strong> - hasta 70% off</li>
            <li>• <strong>Best Buy</strong> - doorbusters tech</li>
            <li>• <strong>Newegg</strong> - componentes PC</li>
            <li>• <strong>B&H Photo</strong> - cámaras/audio</li>
            <li>• <strong>Apple Store</strong> - gift cards</li>
          </ul>
        </div>

        <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <h3 class="font-bold text-primary mb-2">👟 Moda & Deporte</h3>
          <ul class="text-sm space-y-1">
            <li>• <strong>Nike</strong> - hasta 50% off</li>
            <li>• <strong>Adidas</strong> - extra 30% con código</li>
            <li>• <strong>Macy's</strong> - ropa de marca</li>
            <li>• <strong>Nordstrom</strong> - lujo accesible</li>
            <li>• <strong>Gap</strong> - 60% off sitewide</li>
          </ul>
        </div>

        <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <h3 class="font-bold text-primary mb-2">🏠 Hogar & Lifestyle</h3>
          <ul class="text-sm space-y-1">
            <li>• <strong>Target</strong> - todo el hogar</li>
            <li>• <strong>Walmart</strong> - precios bajos</li>
            <li>• <strong>Wayfair</strong> - muebles 70% off</li>
            <li>• <strong>Bed Bath & Beyond</strong></li>
            <li>• <strong>HomeDepot</strong> - herramientas</li>
          </ul>
        </div>
      </div>

      <h2 class="text-3xl font-bold mb-4 mt-8">💡 Tips Pro para Maximizar Ahorros</h2>
      <div class="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-6">
        <ul class="space-y-3">
          <li class="flex items-start gap-2">
            <span class="text-green-600 font-bold">✓</span>
            <span><strong>Combina ofertas:</strong> Usa cupones + cashback + descuentos de miembros simultáneamente</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-600 font-bold">✓</span>
            <span><strong>Price match:</strong> Muchas tiendas igualan precios de competidores en Black Friday</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-600 font-bold">✓</span>
            <span><strong>Cashback apps:</strong> Rakuten paga 10-40% extra en muchas tiendas este día</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-600 font-bold">✓</span>
            <span><strong>Envío a Boxifly:</strong> Evita sobrecostos de shipping internacional usando tu casillero en Miami</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-600 font-bold">✓</span>
            <span><strong>Compara siempre:</strong> Un producto puede estar más barato en otra tienda con "menor descuento"</span>
          </li>
        </ul>
      </div>

      <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
        <h3 class="text-2xl font-bold mb-3">🚀 ¿Listo para el Black Friday 2025?</h3>
        <p class="mb-4">Registra tu casillero GRATIS en Boxifly y comienza a recibir tus compras en Miami hoy mismo.</p>
        <a href="/iniciar-sesion" class="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          Obtener mi casillero gratis →
        </a>
      </div>
    `
  };

  const categories = ['Todos', 'Guías', 'Noticias', 'Tips', 'E-commerce'];

  const recentPosts = [
    {
      id: 2,
      title: 'Calculadora de Aranceles 2025: Guía Completa con Ejemplos Reales',
      category: 'Guías',
      date: '12 Enero 2025',
      readTime: '12 min',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
      description: 'Entiende exactamente cuánto pagarás en aduanas. Incluye calculadora interactiva, ejemplos paso a paso y tips para ahorrar en impuestos.',
      fullContent: `
        <div class="mb-8">
          <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80" alt="Calculadora de Aranceles" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>

        <h2 class="text-3xl font-bold mb-4">📊 Entendiendo los Costos de Importación</h2>
        <p class="text-lg mb-6">Cuando realizas compras desde Estados Unidos a Perú, es fundamental comprender <strong>todos los costos involucrados</strong> para evitar sorpresas. Esta guía te explica cada componente con ejemplos reales.</p>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg mb-8">
          <p class="font-bold text-lg mb-2">⚠️ Regla de Oro del Umbral</p>
          <p class="text-base">Si tu <strong>Valor CIF es menor a $200 USD</strong>, NO pagas impuestos adicionales. Solo envío y manejo aduanal.</p>
        </div>

        <h2 class="text-3xl font-bold mb-4 mt-8">🧮 ¿Qué es el Valor CIF?</h2>
        <p class="mb-4">CIF significa <strong>Cost, Insurance and Freight</strong> (Costo, Seguro y Flete). Es la base para calcular los impuestos aduaneros.</p>
        
        <div class="bg-muted/50 p-6 rounded-lg mb-6">
          <h3 class="font-bold text-xl mb-3">Fórmula del CIF:</h3>
          <p class="text-lg font-mono bg-white p-4 rounded border">
            CIF = Valor del Producto + Envío Internacional + Seguro
          </p>
        </div>

        <h2 class="text-3xl font-bold mb-4 mt-8">💰 Impuestos cuando CIF > $200</h2>
        <p class="mb-4">Si tu CIF supera los $200 USD, debes pagar tres impuestos:</p>
        
        <div class="space-y-4 mb-8">
          <div class="border-l-4 border-primary p-4 bg-primary/5 rounded-r">
            <h3 class="font-bold text-lg">1. Ad Valorem (4%)</h3>
            <p>Arancel aduanero sobre el valor CIF</p>
          </div>
          <div class="border-l-4 border-primary p-4 bg-primary/5 rounded-r">
            <h3 class="font-bold text-lg">2. IGV - Impuesto General a las Ventas (16%)</h3>
            <p>Se calcula sobre: CIF + Ad Valorem</p>
          </div>
          <div class="border-l-4 border-primary p-4 bg-primary/5 rounded-r">
            <h3 class="font-bold text-lg">3. IPM - Impuesto de Promoción Municipal (2%)</h3>
            <p>Se calcula sobre: CIF + Ad Valorem</p>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-4 mt-8">📝 Ejemplo Práctico Paso a Paso</h2>
        
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg mb-8 border-2 border-blue-200">
          <h3 class="font-bold text-2xl mb-6 text-blue-900">Caso: Laptop Gaming</h3>
          
          <div class="space-y-4">
            <div class="bg-white p-4 rounded shadow-sm">
              <p class="text-sm text-muted-foreground mb-1">Precio del producto</p>
              <p class="text-2xl font-bold text-blue-600">$850.00</p>
            </div>
            
            <div class="bg-white p-4 rounded shadow-sm">
              <p class="text-sm text-muted-foreground mb-1">Envío internacional</p>
              <p class="text-2xl font-bold text-blue-600">$45.00</p>
            </div>
            
            <div class="bg-white p-4 rounded shadow-sm">
              <p class="text-sm text-muted-foreground mb-1">Seguro (1.5% del valor)</p>
              <p class="text-2xl font-bold text-blue-600">$12.75</p>
            </div>
            
            <div class="border-t-2 border-dashed border-blue-300 pt-4">
              <p class="text-sm text-muted-foreground mb-1">Valor CIF Total</p>
              <p class="text-3xl font-bold text-blue-900">$907.75</p>
            </div>
          </div>

          <div class="mt-8 space-y-3 border-t-2 border-blue-200 pt-6">
            <p class="font-bold text-lg text-blue-900 mb-4">Cálculo de Impuestos:</p>
            
            <div class="flex justify-between items-center bg-white p-3 rounded">
              <span>Ad Valorem (4%)</span>
              <span class="font-bold">$907.75 × 4% = $36.31</span>
            </div>
            
            <div class="flex justify-between items-center bg-white p-3 rounded">
              <span>Base imponible</span>
              <span class="font-bold">$907.75 + $36.31 = $944.06</span>
            </div>
            
            <div class="flex justify-between items-center bg-white p-3 rounded">
              <span>IGV (16%)</span>
              <span class="font-bold">$944.06 × 16% = $151.05</span>
            </div>
            
            <div class="flex justify-between items-center bg-white p-3 rounded">
              <span>IPM (2%)</span>
              <span class="font-bold">$944.06 × 2% = $18.88</span>
            </div>
            
            <div class="flex justify-between items-center bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg border-2 border-green-400 mt-4">
              <span class="font-bold text-lg">Total Impuestos:</span>
              <span class="font-bold text-2xl text-green-700">$206.24</span>
            </div>
            
            <div class="flex justify-between items-center bg-gradient-to-r from-blue-100 to-blue-200 p-4 rounded-lg border-2 border-blue-500">
              <span class="font-bold text-lg">COSTO FINAL:</span>
              <span class="font-bold text-2xl text-blue-900">$1,113.99</span>
            </div>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-4 mt-8">💡 Tips para Ahorrar en Impuestos</h2>
        <div class="grid md:grid-cols-2 gap-4 mb-8">
          <div class="bg-green-50 p-5 rounded-lg border border-green-200">
            <h3 class="font-bold text-lg mb-2 text-green-800">✓ Consolida paquetes</h3>
            <p class="text-sm">Agrupa varios productos pequeños en un solo envío para optimizar el costo por kg</p>
          </div>
          <div class="bg-green-50 p-5 rounded-lg border border-green-200">
            <h3 class="font-bold text-lg mb-2 text-green-800">✓ Declara correctamente</h3>
            <p class="text-sm">Siempre declara el valor real. Subdeclarar puede resultar en multas y retención</p>
          </div>
          <div class="bg-green-50 p-5 rounded-lg border border-green-200">
            <h3 class="font-bold text-lg mb-2 text-green-800">✓ Usa nuestra calculadora</h3>
            <p class="text-sm">Calcula tus costos antes de comprar para tomar decisiones informadas</p>
          </div>
          <div class="bg-green-50 p-5 rounded-lg border border-green-200">
            <h3 class="font-bold text-lg mb-2 text-green-800">✓ Compra local cuando convenga</h3>
            <p class="text-sm">Productos muy pesados o de bajo valor pueden ser más económicos en Perú</p>
          </div>
        </div>

        <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
          <h3 class="text-2xl font-bold mb-3">🧮 Calcula tus costos ahora</h3>
          <p class="mb-4">Usa nuestra calculadora de envíos para conocer el costo exacto de tu importación antes de comprar.</p>
          <a href="/cotizador" class="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Ir a la Calculadora →
          </a>
        </div>
      `
    },
    {
      id: 3,
      title: 'Las 25 Mejores Tiendas Online USA 2025 por Categoría',
      category: 'Tips',
      date: '10 Enero 2025',
      readTime: '15 min',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      description: 'Directorio completo de las tiendas más confiables para comprar tecnología, moda, hogar y más desde Estados Unidos. Con cupones y tips de compra.',
      fullContent: `
        <div class="mb-8">
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80" alt="Tiendas Online USA" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>

        <p class="text-lg mb-8">Comprar en Estados Unidos puede significar <strong>ahorros de hasta 60%</strong> comparado con Perú. Aquí está tu guía completa de las mejores tiendas por categoría, con links directos y tips exclusivos.</p>

        <h2 class="text-3xl font-bold mb-6 mt-10">💻 Tecnología & Electrónica</h2>
        
        <div class="space-y-6 mb-10">
          <div class="border rounded-lg p-6 hover:shadow-xl transition-shadow bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-2xl font-bold text-blue-900">Amazon</h3>
              <a href="https://www.amazon.com" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
                Visitar <span class="text-xs">↗</span>
              </a>
            </div>
            <p class="mb-3"><strong>Por qué compramos aquí:</strong> La selección más grande del mundo, precios competitivos, envíos rápidos a tu casillero Boxifly.</p>
            <p class="text-sm text-muted-foreground mb-2"><strong>Categorías destacadas:</strong> Electrónica, Libros, Hogar, Gaming</p>
            <div class="bg-yellow-100 p-3 rounded mt-3 border-l-4 border-yellow-500">
              <p class="text-sm"><strong>💡 Tip:</strong> Amazon Prime Day (julio) y Black Friday tienen las mejores ofertas. Busca productos "Prime" para envío gratis a Miami.</p>
            </div>
          </div>

          <div class="border rounded-lg p-6 hover:shadow-xl transition-shadow bg-gradient-to-r from-blue-50 to-cyan-50">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-2xl font-bold text-blue-900">Best Buy</h3>
              <a href="https://www.bestbuy.com" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
                Visitar <span class="text-xs">↗</span>
              </a>
            </div>
            <p class="mb-3"><strong>Por qué compramos aquí:</strong> El gigante de electrónica. Garantías extendidas, asesoría técnica, y ofertas flash increíbles.</p>
            <p class="text-sm text-muted-foreground mb-2"><strong>Categorías destacadas:</strong> Laptops, TVs, Smartphones, Electrodomésticos, Gaming</p>
            <div class="bg-yellow-100 p-3 rounded mt-3 border-l-4 border-yellow-500">
              <p class="text-sm"><strong>💡 Tip:</strong> Los "Doorbusters" del Black Friday valen la pena. Configura alertas para los productos que quieres.</p>
            </div>
          </div>

          <div class="border rounded-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-xl font-bold">Newegg</h3>
              <a href="https://www.newegg.com" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
                Visitar <span class="text-xs">↗</span>
              </a>
            </div>
            <p class="text-sm mb-2">Especialistas en componentes PC. Ideal para armar tu setup gaming o workstation.</p>
            <p class="text-xs text-muted-foreground"><strong>Destacado:</strong> Tarjetas gráficas, CPUs, SSDconfigurations, RAM</p>
          </div>

          <div class="border rounded-lg p-6 hover:shadow-xl transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-xl font-bold">B&H Photo Video</h3>
              <a href="https://www.bhphotovideo.com" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
                Visitar <span class="text-xs">↗</span>
              </a>
            </div>
            <p class="text-sm mb-2">La meca de fotógrafos y videógrafos profesionales. Precios competitivos y servicio experto.</p>
            <p class="text-xs text-muted-foreground"><strong>Destacado:</strong> Cámaras, Lentes, Audio Pro, Iluminación, Drones</p>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">👟 Moda, Ropa & Calzado</h2>
        
        <div class="grid md:grid-cols-2 gap-4 mb-10">
          <div class="border rounded-lg p-5 hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-bold mb-2">Nike.com</h3>
            <p class="text-sm mb-2">Zapatillas exclusivas USA, ropa deportiva, hasta 50% off en outlets.</p>
            <a href="https://www.nike.com" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1">
              Visitar tienda ↗
            </a>
          </div>

          <div class="border rounded-lg p-5 hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-bold mb-2">Adidas.com</h3>
            <p class="text-sm mb-2">Colecciones exclusivas, colaboraciones limitadas, descuentos frecuentes.</p>
            <a href="https://www.adidas.com" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1">
              Visitar tienda ↗
            </a>
          </div>

          <div class="border rounded-lg p-5 hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-bold mb-2">Macy's</h3>
            <p class="text-sm mb-2">Gran almacén con todas las marcas. Descuentos constantes 40-70%.</p>
            <a href="https://www.macys.com" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1">
              Visitar tienda ↗
            </a>
          </div>

          <div class="border rounded-lg p-5 hover:shadow-lg transition-shadow">
            <h3 class="text-lg font-bold mb-2">Nordstrom</h3>
            <p class="text-sm mb-2">Ropa de diseñador accesible. Devoluciones generosas.</p>
            <a href="https://www.nordstrom.com" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1">
              Visitar tienda ↗
            </a>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">🏠 Hogar & Decoración</h2>
        
        <div class="space-y-4 mb-10">
          <div class="bg-gradient-to-r from-orange-50 to-red-50 p-5 rounded-lg border">
            <h3 class="text-xl font-bold mb-2">Wayfair.com</h3>
            <p class="text-sm mb-3">Muebles y decoración con descuentos hasta 70%. Envíos consolidados recomendados.</p>
            <p class="text-xs text-muted-foreground mb-2"><strong>Destacado:</strong> Sofás, Mesas, Lámparas, Alfombras, Organización</p>
            <a href="https://www.wayfair.com" target="_blank" class="text-primary hover:underline text-sm flex items-center gap-1">
              Ver catálogo completo ↗
            </a>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="border p-4 rounded-lg">
              <h3 class="font-bold mb-1">Target</h3>
              <p class="text-sm text-muted-foreground mb-2">Todo para el hogar a precios accesibles</p>
              <a href="https://www.target.com" target="_blank" class="text-primary hover:underline text-xs">Visitar ↗</a>
            </div>
            <div class="border p-4 rounded-lg">
              <h3 class="font-bold mb-1">HomeDepot</h3>
              <p class="text-sm text-muted-foreground mb-2">Herramientas, mejoras del hogar, jardín</p>
              <a href="https://www.homedepot.com" target="_blank" class="text-primary hover:underline text-xs">Visitar ↗</a>
            </div>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">🎮 Gaming & Entretenimiento</h2>
        
        <div class="grid md:grid-cols-3 gap-4 mb-10">
          <div class="border p-4 rounded-lg hover:shadow-lg transition-shadow">
            <h3 class="font-bold mb-2">GameStop</h3>
            <p class="text-xs text-muted-foreground mb-2">Consolas, juegos físicos/digitales, coleccionables</p>
            <a href="https://www.gamestop.com" target="_blank" class="text-primary hover:underline text-xs">Visitar ↗</a>
          </div>
          <div class="border p-4 rounded-lg hover:shadow-lg transition-shadow">
            <h3 class="font-bold mb-2">Steam (digital)</h3>
            <p class="text-xs text-muted-foreground mb-2">Juegos PC. Sales hasta 90% off</p>
            <a href="https://store.steampowered.com" target="_blank" class="text-primary hover:underline text-xs">Visitar ↗</a>
          </div>
          <div class="border p-4 rounded-lg hover:shadow-lg transition-shadow">
            <h3 class="font-bold mb-2">PlayStation Direct</h3>
            <p class="text-xs text-muted-foreground mb-2">PS5, accesorios oficiales, exclusivos</p>
            <a href="https://direct.playstation.com" target="_blank" class="text-primary hover:underline text-xs">Visitar ↗</a>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">💄 Belleza & Cuidado Personal</h2>
        
        <div class="grid md:grid-cols-2 gap-4 mb-10">
          <div class="bg-pink-50 p-5 rounded-lg border border-pink-200">
            <h3 class="font-bold text-lg mb-2">Sephora</h3>
            <p class="text-sm mb-3">Maquillaje de alta gama, skincare, fragancias de diseñador</p>
            <div class="text-xs text-muted-foreground mb-2">💝 Programa de recompensas Beauty Insider</div>
            <a href="https://www.sephora.com" target="_blank" class="text-primary hover:underline text-sm">Explorar →</a>
          </div>

          <div class="bg-purple-50 p-5 rounded-lg border border-purple-200">
            <h3 class="font-bold text-lg mb-2">Ulta Beauty</h3>
            <p class="text-sm mb-3">Amplia selección de marcas, precios accesibles, ofertas frecuentes</p>
            <div class="text-xs text-muted-foreground mb-2">🎁 Descuentos constantes 40-50%</div>
            <a href="https://www.ulta.com" target="_blank" class="text-primary hover:underline text-sm">Explorar →</a>
          </div>
        </div>

        <div class="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mb-8 mt-10">
          <h3 class="text-xl font-bold mb-3 text-green-800">✓ Checklist antes de comprar:</h3>
          <ul class="space-y-2 text-sm">
            <li>□ Compara precios en al menos 3 tiendas</li>
            <li>□ Busca cupones en RetailMeNot o Honey</li>
            <li>□ Verifica que la tienda envíe a direcciones de Florida</li>
            <li>□ Usa tu casillero Boxifly como dirección de envío</li>
            <li>□ Calcula costos de importación antes de comprar</li>
            <li>□ Aprovecha consolidación de múltiples paquetes</li>
          </ul>
        </div>

        <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
          <h3 class="text-2xl font-bold mb-3">🗺️ Explora el catálogo completo</h3>
          <p class="mb-4">Tenemos más de 200 tiendas organizadas por categoría para que encuentres exactamente lo que buscas.</p>
          <a href="/tiendas-en-usa" class="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Ver catálogo de tiendas →
          </a>
        </div>
      `
    },
    {
      id: 4,
      title: 'Cómo Usar tu Casillero en Miami: Guía Completa 2025',
      category: 'Guías',
      date: '8 Enero 2025',
      readTime: '10 min',
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800&q=80',
      description: 'Tutorial paso a paso para usar tu casillero Boxifly: desde el registro hasta recibir tus paquetes en casa. Todo lo que necesitas saber.',
      fullContent: `
        <div class="mb-8">
          <img src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&q=80" alt="Casillero en Miami" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>

        <p class="text-lg mb-8">Un casillero en Miami es tu puerta a miles de tiendas estadounidenses que no envían directamente a Perú. Con Boxifly, el proceso es <strong>100% gratuito</strong> y súper sencillo. Aquí te explicamos todo.</p>

        <h2 class="text-3xl font-bold mb-6">📋 Paso 1: Registro (2 minutos)</h2>
        
        <div class="bg-primary/10 p-6 rounded-lg mb-8 border-l-4 border-primary">
          <ol class="space-y-3 text-base">
            <li><strong>1.</strong> Haz clic en "Obtener mi casillero gratis" en la página principal</li>
            <li><strong>2.</strong> Completa el formulario con tus datos personales</li>
            <li><strong>3.</strong> Verifica tu email</li>
            <li><strong>4.</strong> ¡Listo! Recibes tu dirección única en Miami</li>
          </ol>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg mb-8 border border-blue-200">
          <h3 class="font-bold text-xl mb-3">Tu dirección Boxifly se verá así:</h3>
          <div class="bg-white p-4 rounded border font-mono text-sm">
            <p><strong>John Doe</strong></p>
            <p><strong>Suite: BXFLY-12345</strong></p>
            <p>7860 NW 46th St</p>
            <p>Doral, FL 33166</p>
            <p>United States</p>
            <p>Phone: +1 (305) 123-4567</p>
          </div>
          <p class="text-xs text-muted-foreground mt-3">⚠️ El número "Suite" es único y personal. NUNCA lo compartas con nadie.</p>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">🛒 Paso 2: Compra en Tiendas USA</h2>
        
        <div class="space-y-4 mb-8">
          <div class="border-l-4 border-green-500 bg-green-50 p-5 rounded-r-lg">
            <h3 class="font-bold mb-2">✓ Usa tu dirección Boxifly al pagar</h3>
            <p class="text-sm">Copia y pega tu dirección exactamente como te la dimos. No olvides el número de Suite.</p>
          </div>
          
          <div class="border-l-4 border-green-500 bg-green-50 p-5 rounded-r-lg">
            <h3 class="font-bold mb-2">✓ Guarda tu tracking number</h3>
            <p class="text-sm">La tienda te dará un número de seguimiento. Lo necesitarás para pre-alertar tu paquete.</p>
          </div>
          
          <div class="border-l-4 border-green-500 bg-green-50 p-5 rounded-r-lg">
            <h3 class="font-bold mb-2">✓ Tiendas recomendadas</h3>
            <p class="text-sm">Amazon, Best Buy, Walmart, Target, Macy's, Nike... <a href="/tiendas-en-usa" class="text-primary hover:underline">Ver catálogo completo</a></p>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">📦 Paso 3: Pre-alerta tu Paquete</h2>
        
        <p class="mb-4">La pre-alerta ayuda a nuestro warehouse a identificar tu paquete cuando llegue. Es <strong>súper importante</strong> y toma solo 1 minuto.</p>
        
        <div class="bg-muted/50 p-6 rounded-lg mb-8">
          <h3 class="font-bold text-lg mb-4">Cómo hacer tu pre-alerta:</h3>
          <ol class="space-y-3">
            <li><strong>1.</strong> Inicia sesión en tu cuenta Boxifly</li>
            <li><strong>2.</strong> Ve a "Mis Paquetes" → "Nueva Pre-alerta"</li>
            <li><strong>3.</strong> Ingresa:
              <ul class="ml-6 mt-2 space-y-1 text-sm">
                <li>• Tracking number (de la tienda)</li>
                <li>• Nombre de la tienda</li>
                <li>• Descripción del producto</li>
                <li>• Valor aproximado</li>
                <li>• Peso aproximado (opcional)</li>
              </ul>
            </li>
            <li><strong>4.</strong> Guarda y espera la confirmación</li>
          </ol>
        </div>

        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-r-lg mb-8">
          <p class="font-bold mb-2">⚠️ Importante sobre el valor declarado:</p>
          <p class="text-sm">Declara el valor REAL que pagaste (incluyendo impuestos/envío). Subdeclarar puede causar problemas aduaneros y multas.</p>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">🏭 Paso 4: Tu Paquete en el Warehouse</h2>
        
        <div class="grid md:grid-cols-2 gap-4 mb-8">
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-lg border">
            <h3 class="font-bold mb-3">📸 Fotos de inspección</h3>
            <p class="text-sm mb-3">Cuando tu paquete llegue al warehouse, tomamos fotos y las subes a tu cuenta para que verifiques el estado.</p>
            <p class="text-xs text-muted-foreground">Disponible 24-48 horas después de la recepción</p>
          </div>

          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-lg border">
            <h3 class="font-bold mb-3">📏 Pesaje y medición</h3>
            <p class="text-sm mb-3">Medimos peso real y dimensiones de cada paquete para calcular tu costo de envío exacto.</p>
            <p class="text-xs text-muted-foreground">Peso volumétrico se aplica si es mayor al real</p>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">📦➕ Paso 5: Consolidación (Opcional)</h2>
        
        <p class="mb-4">Si tienes <strong>varios paquetes</strong> en el warehouse, puedes consolidarlos en uno solo para <strong>ahorrar en envío</strong>.</p>

        <div class="bg-green-50 p-6 rounded-lg mb-8 border border-green-200">
          <h3 class="font-bold text-lg mb-4 text-green-800">Ventajas de consolidar:</h3>
          <ul class="space-y-2">
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span>Ahorro hasta 60% en costos de envío</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span>Un solo trámite aduanal en lugar de varios</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span>Menos posibilidades de pérdida/extravío</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span>Embalaje reforzado sin costo extra</span>
            </li>
          </ul>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">✈️ Paso 6: Envío a Perú</h2>
        
        <p class="mb-6">Una vez que tus paquetes estén listos (consolidados o individuales), elige tu método de envío:</p>

        <div class="space-y-4 mb-8">
          <div class="border rounded-lg p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-bold text-lg">🚚 Delivery a Domicilio</h3>
              <span class="text-primary font-bold">Más popular</span>
            </div>
            <p class="text-sm mb-2">Recibe tu paquete directamente en tu casa u oficina en Lima o provincias.</p>
            <p class="text-xs text-muted-foreground">Tiempo: 10-15 días laborables | Tracking incluido</p>
          </div>

          <div class="border rounded-lg p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-bold text-lg">📍 Recojo en Almacén</h3>
              <span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Más económico</span>
            </div>
            <p class="text-sm mb-2">Retira tu paquete en nuestro almacén en Lima (Miraflores).</p>
            <p class="text-xs text-muted-foreground">Tiempo: 8-12 días laborables | Ahorra en delivery</p>
          </div>

          <div class="border rounded-lg p-5 hover:shadow-lg transition-shadow">
            <h3 class="font-bold text-lg mb-2">⚡ Express</h3>
            <p class="text-sm mb-2">Envío prioritario con aduana express para paquetes urgentes.</p>
            <p class="text-xs text-muted-foreground">Tiempo: 5-7 días laborables | Premium service</p>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">💰 Paso 7: Pago y Seguimiento</h2>
        
        <div class="bg-muted/50 p-6 rounded-lg mb-8">
          <h3 class="font-bold text-lg mb-4">Métodos de pago aceptados:</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-white p-3 rounded text-center text-sm">💳 Tarjetas</div>
            <div class="bg-white p-3 rounded text-center text-sm">📱 Yape</div>
            <div class="bg-white p-3 rounded text-center text-sm">💵 Plin</div>
            <div class="bg-white p-3 rounded text-center text-sm">🏦 Transferencia</div>
          </div>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
          <h3 class="font-bold mb-3">🔍 Tracking en tiempo real</h3>
          <p class="text-sm">Una vez enviado, recibes un tracking number internacional para seguir tu paquete hasta tu puerta:</p>
          <ul class="mt-3 space-y-1 text-sm ml-4">
            <li>• Salida de Miami</li>
            <li>• Llegada a Lima</li>
            <li>• Proceso aduanal</li>
            <li>• En ruta a tu domicilio</li>
            <li>• Entregado ✓</li>
          </ul>
        </div>

        <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
          <h3 class="text-2xl font-bold mb-3">🎉 ¿Listo para empezar?</h3>
          <p class="mb-4">Obtén tu casillero gratis en Miami y comienza a disfrutar de los precios de Estados Unidos hoy mismo.</p>
          <a href="/iniciar-sesion" class="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Registrarme ahora →
          </a>
        </div>
      `
    },
    {
      id: 5,
      title: 'Productos Prohibidos y Restricciones de Importación 2025',
      category: 'Guías',
      date: '5 Enero 2025',
      readTime: '8 min',
      image: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&q=80',
      description: 'Lista actualizada de productos que NO puedes importar a Perú y restricciones especiales. Evita problemas aduaneros.',
      fullContent: `
        <div class="mb-8">
          <img src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200&q=80" alt="Restricciones de Importación" class="w-full h-64 object-cover rounded-lg mb-6" />
        </div>

        <div class="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg mb-8">
          <p class="font-bold text-lg mb-2 text-red-800">⚠️ Importante</p>
          <p class="text-base">Importar productos prohibidos puede resultar en <strong>decomiso, multas hasta $50,000</strong> y problemas legales. Lee esta guía completa antes de comprar.</p>
        </div>

        <h2 class="text-3xl font-bold mb-6">🚫 Productos TOTALMENTE Prohibidos</h2>
        
        <div class="space-y-4 mb-10">
          <div class="bg-red-50 border border-red-200 rounded-lg p-5">
            <h3 class="font-bold text-lg text-red-800 mb-3">❌ Armas y Municiones</h3>
            <ul class="space-y-1 text-sm ml-4">
              <li>• Armas de fuego de cualquier tipo</li>
              <li>• Réplicas realistas de armas</li>
              <li>• Municiones y explosivos</li>
              <li>• Tasers y armas eléctricas</li>
              <li>• Navajas automáticas y armas blancas prohibidas</li>
            </ul>
          </div>

          <div class="bg-red-50 border border-red-200 rounded-lg p-5">
            <h3 class="font-bold text-lg text-red-800 mb-3">❌ Drogas y Sustancias Controladas</h3>
            <ul class="space-y-1 text-sm ml-4">
              <li>• Drogas ilegales de cualquier tipo</li>
              <li>• Medicamentos con sustancias controladas sin receta</li>
              <li>• Esteroides anabólicos</li>
              <li>• Cannabis/CBD (incluso en estados donde es legal)</li>
            </ul>
          </div>

          <div class="bg-red-50 border border-red-200 rounded-lg p-5">
            <h3 class="font-bold text-lg text-red-800 mb-3">❌ Productos Perecederos</h3>
            <ul class="space-y-1 text-sm ml-4">
              <li>• Alimentos frescos (carnes, lácteos, frutas, verduras)</li>
              <li>• Plantas vivas y semillas (requieren permisos SENASA)</li>
              <li>• Productos de origen animal sin certificados</li>
            </ul>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">⚠️ Productos con Restricciones Especiales</h2>
        
        <div class="space-y-6 mb-10">
          <div class="border-l-4 border-yellow-500 bg-yellow-50 p-5 rounded-r-lg">
            <h3 class="font-bold text-lg mb-3">📱 Electrónica y Tecnología</h3>
            <div class="space-y-3">
              <div class="bg-white p-4 rounded">
                <p class="font-semibold mb-2">Celulares y tablets</p>
                <p class="text-sm text-muted-foreground mb-2"><strong>Límite:</strong> 2 dispositivos por persona cada 12 meses</p>
                <p class="text-xs">Más unidades pagan impuestos comerciales adicionales</p>
              </div>
              
              <div class="bg-white p-4 rounded">
                <p class="font-semibold mb-2">Laptops y computadoras</p>
                <p class="text-sm text-muted-foreground mb-2"><strong>Límite:</strong> 2 unidades por envío</p>
                <p class="text-xs">Valores altos (>$2000) pueden requerir revisión adicional</p>
              </div>

              <div class="bg-white p-4 rounded">
                <p class="font-semibold mb-2">Drones</p>
                <p class="text-sm text-muted-foreground mb-2"><strong>Restricción:</strong> Requieren registro MTC si tienen cámara</p>
                <p class="text-xs">Peso máximo 25kg sin licencia especial</p>
              </div>
            </div>
          </div>

          <div class="border-l-4 border-yellow-500 bg-yellow-50 p-5 rounded-r-lg">
            <h3 class="font-bold text-lg mb-3">💊 Medicamentos y Suplementos</h3>
            <div class="space-y-3">
              <div class="bg-white p-4 rounded">
                <p class="font-semibold mb-2">Medicamentos con receta</p>
                <p class="text-sm text-muted-foreground mb-2"><strong>Requisito:</strong> Receta médica original y válida</p>
                <p class="text-xs">Solo para uso personal, máximo 3 meses de tratamiento</p>
              </div>
              
              <div class="bg-white p-4 rounded">
                <p class="font-semibold mb-2">Vitaminas y suplementos</p>
                <p class="text-sm text-muted-foreground mb-2"><strong>Permitido:</strong> Uso personal razonable</p>
                <p class="text-xs">No debe parecer venta comercial (max 6 frascos por producto)</p>
              </div>
            </div>
          </div>

          <div class="border-l-4 border-yellow-500 bg-yellow-50 p-5 rounded-r-lg">
            <h3 class="font-bold text-lg mb-3">👗 Ropa y Calzado</h3>
            <div class="bg-white p-4 rounded">
              <p class="font-semibold mb-2">Límite recomendado</p>
              <p class="text-sm text-muted-foreground mb-2">Hasta 20 prendas o 10 pares de zapatos por envío</p>
              <p class="text-xs">Cantidades mayores pueden interpretarse como importación comercial y pagar más impuestos</p>
            </div>
          </div>
        </div>

        <h2 class="text-3xl font-bold mb-6 mt-10">✅ Buenos para Importar (Sin Restricciones)</h2>
        
        <div class="bg-green-50 p-6 rounded-lg mb-8 border border-green-200">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-bold mb-3 text-green-800">✓ Electrónica general</h3>
              <ul class="text-sm space-y-1 ml-4">
                <li>• Consolas de videojuegos</li>
                <li>• Audífonos y parlantes</li>
                <li>• Accesorios tech</li>
                <li>• Smart home devices</li>
                <li>• Cámaras y lentes</li>
              </ul>
            </div>
            <div>
              <h3 class="font-bold mb-3 text-green-800">✓ Ropa y accesorios</h3>
              <ul class="text-sm space-y-1 ml-4">
                <li>• Ropa de marca</li>
                <li>• Zapatos deportivos</li>
                <li>• Carteras y mochilas</li>
                <li>• Relojes</li>
                <li>• Joyas (declara correctamente)</li>
              </ul>
            </div>
            <div>
              <h3 class="font-bold mb-3 text-green-800">✓ Hogar y lifestyle</h3>
              <ul class="text-sm space-y-1 ml-4">
                <li>• Decoración</li>
                <li>• Utensilios de cocina</li>
                <li>• Herramientas pequeñas</li>
                <li>• Libros y revistas</li>
                <li>• Juguetes</li>
              </ul>
            </div>
            <div>
              <h3 class="font-bold mb-3 text-green-800">✓ Belleza y cuidado</h3>
              <ul class="text-sm space-y-1 ml-4">
                <li>• Maquillaje</li>
                <li>• Skincare</li>
                <li>• Fragancias (max 3 unidades)</li>
                <li>• Productos para cabello</li>
                <li>• Herramientas de belleza</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
          <h3 class="font-bold text-lg mb-3">💡 Tips para Evitar Problemas</h3>
          <ul class="space-y-2 text-sm">
            <li>✓ Siempre declara el valor real de tus productos</li>
            <li>✓ Conserva facturas y comprobantes de compra</li>
            <li>✓ No mezcles productos personales con comerciales</li>
            <li>✓ Si tienes dudas, consúltanos ANTES de comprar</li>
            <li>✓ Lee las políticas de la tienda sobre devoluciones</li>
          </ul>
        </div>

        <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-8">
          <h3 class="text-2xl font-bold mb-3">❓ ¿Tienes dudas sobre un producto específico?</h3>
          <p class="mb-4">Nuestro equipo de soporte está disponible para ayudarte a verificar si tu producto puede ser importado legalmente.</p>
          <a href="/contacto" class="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Contactar soporte →
          </a>
        </div>
      `
    },
  ];

  const filteredPosts = recentPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedPost) {
    return (
      <>
        <ChatWidget />
        <div className="min-h-screen bg-background">
          <SEO title="Blog Boxifly: guías y novedades de envíos EE.UU.–Perú" description="Consejos, guías de compra y novedades sobre envíos, casillero, personal shopper y aduanas. Aprende con Boxifly." path="/blog" />
          <MainNavigation />
          
          <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Button
              variant="ghost"
              onClick={() => setSelectedPost(null)}
              className="mb-6"
            >
              ← Volver al Blog
            </Button>
            
            <article className="prose prose-lg max-w-none">
              <div className="mb-8">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
                  {selectedPost.category}
                </span>
                <h1 className="text-4xl font-bold mb-4">{selectedPost.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{selectedPost.date}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                </div>
              </div>
              
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(selectedPost.fullContent || selectedPost.description, {
                    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'img', 'div', 'span', 'blockquote', 'code', 'pre'],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel']
                  })
                }}
              />
            </article>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ChatWidget />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
        <MainNavigation />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Blog Boxifly
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Guías, tips y las últimas noticias sobre compras internacionales y logística
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category Buttons */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 justify-center flex-wrap">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Destacado</h2>
              <Card className="overflow-hidden hover:shadow-2xl transition-all cursor-pointer group">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-auto">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
              <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h3>
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {featuredPost.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime}
                </span>
              </div>
              <Button className="w-fit gap-2" onClick={() => setSelectedPost(featuredPost)}>
                Leer más
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Posts */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Artículos Recientes</h2>
              
              {filteredPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer group"
                      onClick={() => setSelectedPost(post)}
                    >
                      <CardHeader className="p-6 pb-4">
                        <Badge className="w-fit mb-3">{post.category}</Badge>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.description}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-xl text-muted-foreground">
                    No se encontraron artículos que coincidan con tu búsqueda
                  </p>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter Subscription */}
        <section className="py-20 bg-gradient-to-br from-primary to-navy">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center text-white">
              <h2 className="text-4xl font-bold mb-4">
                Suscríbete a nuestro newsletter
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Recibe las últimas guías, tips y ofertas exclusivas directo en tu correo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 bg-white text-foreground"
                />
                <Button size="lg" variant="secondary">
                  Suscribirse
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;
