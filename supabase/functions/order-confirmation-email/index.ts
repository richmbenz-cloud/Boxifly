import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Simple email sending via fetch to Resend API
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderTotal: number;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, customerName, orderTotal, orderItems }: OrderConfirmationRequest = await req.json();

    console.log("Sending order confirmation email to:", customerEmail);

    // Generate order items HTML
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
          ${item.name}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; text-align: right;">
          S/ ${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de Pedido - Boxifly</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        ¡Gracias por tu pedido!
                      </h1>
                      <p style="margin: 12px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                        Tu pedido ha sido confirmado
                      </p>
                    </td>
                  </tr>

                  <!-- Order Details -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                        Hola <strong>${customerName}</strong>,
                      </p>
                      <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                        Hemos recibido tu pedido y estamos preparándolo para su envío. A continuación encontrarás los detalles:
                      </p>

                      <!-- Order Number -->
                      <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0; color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                              Número de pedido
                            </p>
                            <p style="margin: 8px 0 0; color: #1A73E8; font-size: 18px; font-weight: bold; font-family: monospace;">
                              #${orderId.slice(0, 8).toUpperCase()}
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Items Table -->
                      <table role="presentation" style="width: 100%; margin-bottom: 30px; border-collapse: collapse;">
                        <thead>
                          <tr style="border-bottom: 2px solid #e5e5e5;">
                            <th style="padding: 12px 0; text-align: left; color: #666666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              Producto
                            </th>
                            <th style="padding: 12px 0; text-align: center; color: #666666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              Cantidad
                            </th>
                            <th style="padding: 12px 0; text-align: right; color: #666666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                              Precio
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>

                      <!-- Total -->
                      <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px;">
                            <table role="presentation" style="width: 100%;">
                              <tr>
                                <td style="color: #666666; font-size: 15px;">
                                  <strong>Total del pedido:</strong>
                                </td>
                                <td style="text-align: right; color: #1A73E8; font-size: 24px; font-weight: bold;">
                                  S/ ${orderTotal.toFixed(2)}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Tracking Info -->
                      <table role="presentation" style="width: 100%; margin-bottom: 30px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 8px; color: #856404; font-size: 15px; font-weight: 600;">
                              📦 Seguimiento de pedido
                            </p>
                            <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                              Podrás rastrear tu pedido en cualquier momento usando tu email y el número de pedido en nuestra página de seguimiento.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${Deno.env.get('VITE_SUPABASE_URL')}/track-order?email=${encodeURIComponent(customerEmail)}&orderId=${orderId}" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(26, 115, 232, 0.3);">
                              Rastrear mi pedido
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Footer Message -->
                      <p style="margin: 0 0 10px; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Gracias por confiar en Boxifly
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6; text-align: center;">
                        Si tienes alguna pregunta, no dudes en contactarnos
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0 0 12px; color: #999999; font-size: 13px;">
                        © ${new Date().getFullYear()} Boxifly. Todos los derechos reservados.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        <a href="https://boxifly.com.pe" style="color: #1A73E8; text-decoration: none;">boxifly.com.pe</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Boxifly <onboarding@resend.dev>",
        to: [customerEmail],
        subject: `Confirmación de pedido #${orderId.slice(0, 8).toUpperCase()} - Boxifly`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, emailId: emailData.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);