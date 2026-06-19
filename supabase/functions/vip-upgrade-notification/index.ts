import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VIPUpgradeRequest {
  userId: string;
  oldTier: string;
  newTier: string;
  lifetimePoints: number;
}

const tierBenefits = {
  bronce: {
    name: "Bronce",
    discount: 0,
    benefits: [
      "1 punto por cada S/ 33 gastados",
      "Acceso a ofertas exclusivas",
    ],
  },
  plata: {
    name: "Plata",
    discount: 5,
    benefits: [
      "5% de descuento adicional en todas tus compras",
      "Envío gratis en pedidos superiores a S/ 200",
      "Soporte prioritario",
      "Acceso anticipado a nuevos productos",
    ],
  },
  oro: {
    name: "Oro",
    discount: 10,
    benefits: [
      "10% de descuento adicional en todas tus compras",
      "Envío gratis en todos los pedidos",
      "Acceso anticipado a promociones especiales",
      "Soporte VIP 24/7",
      "Regalos exclusivos en cumpleaños",
    ],
  },
  platino: {
    name: "Platino",
    discount: 15,
    benefits: [
      "15% de descuento adicional en todas tus compras",
      "Envío express gratis",
      "Regalos exclusivos y sorpresas mensuales",
      "Personal shopper dedicado",
      "Acceso a eventos especiales VIP",
      "Prioridad absoluta en atención al cliente",
    ],
  },
};

const generateWelcomeCoupon = async (
  supabase: any,
  userId: string,
  newTier: string
): Promise<string> => {
  const discountValue = newTier === "plata" ? 20 : newTier === "oro" ? 30 : 50;
  const code = `VIP${newTier.toUpperCase()}${Date.now().toString().slice(-6)}`;

  const { error } = await supabase.from("coupons").insert({
    code: code,
    discount_type: "fixed",
    discount_value: discountValue,
    min_purchase_amount: 0,
    max_uses: 1,
    is_active: true,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
  });

  if (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }

  return code;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, oldTier, newTier, lifetimePoints }: VIPUpgradeRequest =
      await req.json();

    console.log(
      `Processing VIP upgrade for user ${userId}: ${oldTier} -> ${newTier}`
    );

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      throw new Error("User profile not found");
    }

    // Generate welcome coupon
    const couponCode = await generateWelcomeCoupon(supabase, userId, newTier);

    const tierInfo = tierBenefits[newTier as keyof typeof tierBenefits];

    // Build benefits HTML list
    const benefitsList = tierInfo.benefits
      .map((benefit) => `<li style="margin-bottom: 8px;">✓ ${benefit}</li>`)
      .join("");

    // Send congratulation email
    const emailResponse = await resend.emails.send({
      from: "Boxifly VIP <onboarding@resend.dev>",
      to: [profile.email],
      subject: `¡Felicitaciones! Has alcanzado el nivel ${tierInfo.name} 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header with gradient -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
                ¡Felicitaciones, ${profile.full_name}!
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">
                Has alcanzado el nivel VIP ${tierInfo.name}
              </p>
            </div>

            <!-- Main content -->
            <div style="background: white; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
              
              <!-- Achievement -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  <div style="font-size: 48px; margin-bottom: 10px;">👑</div>
                  <div style="color: white; font-size: 24px; font-weight: bold;">Nivel ${tierInfo.name}</div>
                  <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 5px;">${lifetimePoints} puntos acumulados</div>
                </div>
              </div>

              <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
                Gracias a tu lealtad y confianza en Boxifly, has desbloqueado beneficios exclusivos que harán tus compras aún más increíbles.
              </p>

              <!-- Benefits Section -->
              <div style="background: #f8f9ff; padding: 24px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea;">
                <h2 style="color: #667eea; margin: 0 0 16px 0; font-size: 20px;">
                  🎁 Tus Nuevos Beneficios
                </h2>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                  ${benefitsList}
                </ul>
              </div>

              <!-- Coupon Section -->
              <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                <h3 style="color: white; margin: 0 0 12px 0; font-size: 18px;">
                  🎉 Regalo de Bienvenida
                </h3>
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 16px 0; font-size: 14px;">
                  Cupón de S/ ${tierInfo.discount === 5 ? "20" : tierInfo.discount === 10 ? "30" : "50"} de descuento
                </p>
                <div style="background: white; padding: 16px 24px; border-radius: 8px; display: inline-block; margin-bottom: 12px;">
                  <div style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #19547b; letter-spacing: 2px;">
                    ${couponCode}
                  </div>
                </div>
                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 12px;">
                  Válido por 30 días • Úsalo en tu próxima compra
                </p>
              </div>

              <!-- Discount Badge -->
              <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
                <div style="font-size: 36px; font-weight: bold; color: #2e7d32; margin-bottom: 8px;">
                  ${tierInfo.discount}% OFF
                </div>
                <p style="margin: 0; color: #555; font-size: 14px;">
                  En todas tus compras de forma automática
                </p>
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://boxifly.com.pe/shop" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                  Empezar a Comprar
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e0e0e0; padding-top: 24px; margin-top: 32px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">
                  Sigue acumulando puntos para mantener y mejorar tu nivel VIP
                </p>
                <p style="color: #999; font-size: 12px; margin: 0;">
                  <a href="https://boxifly.com.pe/customer/loyalty-points" style="color: #667eea; text-decoration: none;">Ver mi progreso VIP</a>
                </p>
              </div>

            </div>

            <!-- Footer note -->
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">
                Este email ha sido enviado por Boxifly<br>
                <a href="https://boxifly.com.pe" style="color: #667eea; text-decoration: none;">boxifly.com.pe</a>
              </p>
            </div>

          </body>
        </html>
      `,
    });

    console.log("VIP upgrade email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
        couponCode: couponCode,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in vip-upgrade-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
