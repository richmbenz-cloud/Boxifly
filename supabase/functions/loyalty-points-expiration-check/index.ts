import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting loyalty points expiration check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

    // Calculate date 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysISO = thirtyDaysFromNow.toISOString();

    const today = new Date().toISOString();

    console.log('Checking for points expiring between:', today, 'and', thirtyDaysISO);

    // Find all users with points that expire in the next 30 days
    // Group by user to aggregate their expiring points
    const { data: expiringPoints, error: pointsError } = await supabase
      .from('loyalty_points')
      .select('user_id, points_earned, points_spent, expires_at')
      .eq('transaction_type', 'earned')
      .gte('expires_at', today)
      .lte('expires_at', thirtyDaysISO)
      .order('expires_at', { ascending: true });

    if (pointsError) {
      console.error('Error fetching expiring points:', pointsError);
      throw pointsError;
    }

    console.log('Found expiring point records:', expiringPoints?.length || 0);

    if (!expiringPoints || expiringPoints.length === 0) {
      console.log('No points expiring in the next 30 days');
      return new Response(
        JSON.stringify({ message: 'No points expiring in the next 30 days' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group by user and calculate net expiring points (earned - spent)
    const userExpiringPoints = new Map<string, { points: number, expiresAt: string }>();
    
    for (const point of expiringPoints) {
      const userId = point.user_id;
      const netPoints = point.points_earned - point.points_spent;
      
      if (netPoints > 0) {
        const existing = userExpiringPoints.get(userId);
        if (!existing) {
          userExpiringPoints.set(userId, {
            points: netPoints,
            expiresAt: point.expires_at
          });
        } else {
          existing.points += netPoints;
          // Keep the earliest expiration date
          if (new Date(point.expires_at) < new Date(existing.expiresAt)) {
            existing.expiresAt = point.expires_at;
          }
        }
      }
    }

    console.log('Users with expiring points:', userExpiringPoints.size);

    // Check which users already have a recent notification (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    const notificationsToCreate = [];
    const emailsToSend = [];

    for (const [userId, data] of userExpiringPoints.entries()) {
      // Check if user already has a recent expiration notification
      const { data: recentNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .ilike('title', '%puntos están por expirar%')
        .gte('created_at', sevenDaysAgoISO)
        .limit(1);

      if (recentNotifications && recentNotifications.length > 0) {
        console.log(`User ${userId} already notified recently, skipping`);
        continue;
      }

      // Fetch user profile to get email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (!profile || !profile.email) {
        console.log(`User ${userId} has no email, skipping`);
        continue;
      }

      // Calculate days until expiration
      const daysUntilExpiration = Math.ceil(
        (new Date(data.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const expirationDateFormatted = new Date(data.expiresAt).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      notificationsToCreate.push({
        user_id: userId,
        title: '⚠️ Tus puntos están por expirar',
        message: `Tienes ${data.points} puntos que expiran en ${daysUntilExpiration} días. ¡Úsalos antes del ${expirationDateFormatted} para no perderlos!`,
        package_id: null,
      });

      emailsToSend.push({
        userId,
        email: profile.email,
        fullName: profile.full_name || 'Cliente',
        points: data.points,
        daysUntilExpiration,
        expirationDate: expirationDateFormatted
      });
    }

    console.log('Notifications to create:', notificationsToCreate.length);
    console.log('Emails to send:', emailsToSend.length);

    // Create in-app notifications
    if (notificationsToCreate.length > 0) {
      const { error: notifyError } = await supabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (notifyError) {
        console.error('Error creating notifications:', notifyError);
        throw notifyError;
      }

      console.log(`Successfully created ${notificationsToCreate.length} expiration notifications`);
    }

    // Send emails
    let emailsSent = 0;
    for (const emailData of emailsToSend) {
      try {
        const { error: emailError } = await resend.emails.send({
          from: 'Boxifly <onboarding@resend.dev>',
          to: [emailData.email],
          subject: '⚠️ Tus puntos Boxifly están por expirar',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                  }
                  .header {
                    background: linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%);
                    padding: 40px 20px;
                    text-align: center;
                  }
                  .header h1 {
                    color: #ffffff;
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                  }
                  .content {
                    padding: 40px 30px;
                  }
                  .greeting {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1A73E8;
                    margin-bottom: 20px;
                  }
                  .alert-box {
                    background-color: #FFF3CD;
                    border-left: 4px solid #F5A623;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 4px;
                  }
                  .alert-box h2 {
                    color: #856404;
                    margin: 0 0 10px 0;
                    font-size: 20px;
                  }
                  .points-info {
                    background-color: #E8F4FD;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 25px 0;
                    text-align: center;
                  }
                  .points-number {
                    font-size: 48px;
                    font-weight: 700;
                    color: #1A73E8;
                    margin: 10px 0;
                  }
                  .points-label {
                    color: #4A4A4A;
                    font-size: 16px;
                  }
                  .expiration-date {
                    background-color: #FFEBEE;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    text-align: center;
                  }
                  .expiration-date strong {
                    color: #EA4335;
                    font-size: 18px;
                  }
                  .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #1A73E8 0%, #0D47A1 100%);
                    color: #ffffff;
                    text-decoration: none;
                    padding: 16px 40px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    margin: 25px 0;
                    text-align: center;
                  }
                  .cta-container {
                    text-align: center;
                  }
                  .footer {
                    background-color: #F0F0F0;
                    padding: 30px;
                    text-align: center;
                    color: #666666;
                    font-size: 14px;
                  }
                  .footer a {
                    color: #1A73E8;
                    text-decoration: none;
                  }
                  ul {
                    padding-left: 20px;
                  }
                  li {
                    margin-bottom: 8px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>⚠️ Alerta de Expiración</h1>
                  </div>
                  
                  <div class="content">
                    <p class="greeting">¡Hola ${emailData.fullName}!</p>
                    
                    <div class="alert-box">
                      <h2>Tus puntos están por expirar</h2>
                      <p>Te recordamos que tienes puntos de fidelidad que expirarán pronto. ¡No pierdas la oportunidad de usarlos!</p>
                    </div>
                    
                    <div class="points-info">
                      <p class="points-label">Puntos por expirar:</p>
                      <div class="points-number">${emailData.points}</div>
                      <p class="points-label">Equivalente a <strong>S/ ${emailData.points}</strong> en descuento</p>
                    </div>
                    
                    <div class="expiration-date">
                      <p>Expiran en <strong>${emailData.daysUntilExpiration} días</strong></p>
                      <p>Fecha límite: <strong>${emailData.expirationDate}</strong></p>
                    </div>
                    
                    <p><strong>¿Cómo usar tus puntos?</strong></p>
                    <ul>
                      <li>Ingresa a tu cuenta en Boxifly</li>
                      <li>Realiza una compra en nuestra tienda</li>
                      <li>En el checkout, selecciona cuántos puntos quieres canjear</li>
                      <li>Cada punto = S/ 1 de descuento inmediato</li>
                    </ul>
                    
                    <div class="cta-container">
                      <a href="https://boxifly.com.pe/shop" class="cta-button">
                        🛍️ Canjear mis puntos ahora
                      </a>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666666; font-size: 14px;">
                      <em>Recuerda: Los puntos no utilizados antes de la fecha límite se perderán automáticamente.</em>
                    </p>
                  </div>
                  
                  <div class="footer">
                    <p><strong>Boxifly</strong> - Tu aliado en envíos USA → Perú</p>
                    <p>
                      <a href="https://boxifly.com.pe">Visitar sitio web</a> | 
                      <a href="https://boxifly.com.pe/privacy">Política de privacidad</a>
                    </p>
                    <p style="margin-top: 15px; font-size: 12px; color: #999999;">
                      Este es un email automático. Por favor no respondas a este mensaje.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        if (emailError) {
          console.error(`Error sending email to ${emailData.email}:`, emailError);
        } else {
          emailsSent++;
          console.log(`Email sent successfully to ${emailData.email}`);
        }
      } catch (error) {
        console.error(`Exception sending email to ${emailData.email}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${userExpiringPoints.size} users with expiring points`,
        notificationsCreated: notificationsToCreate.length,
        emailsSent: emailsSent
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in loyalty-points-expiration-check:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
