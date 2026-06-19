import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obtener todos los testimoniales sin avatar o con avatar de UI Avatars
    const { data: testimonials, error: fetchError } = await supabase
      .from("testimonials")
      .select("id, customer_name, avatar_url")
      .or("avatar_url.is.null,avatar_url.like.%ui-avatars.com%");

    if (fetchError) throw fetchError;

    console.log(`Procesando ${testimonials?.length || 0} testimoniales`);

    const updates = [];
    
    for (const testimonial of testimonials || []) {
      // Determinar género basado en el nombre (heurística mejorada)
      const firstName = testimonial.customer_name.split(" ")[0].toLowerCase();
      const femaleNames = [
        "maría", "maria", "ana", "patricia", "carmen", "rosa", "laura", "sofia", "sofía", 
        "isabella", "isabela", "gabriela", "valeria", "camila", "daniela", "isabel", 
        "carolina", "catalina", "fernanda", "andrea", "alejandra", "natalia", "paula",
        "mariana", "valentina", "lucía", "lucia", "diana", "claudia", "monica", "mónica"
      ];
      const isFemale = femaleNames.some(name => firstName.includes(name));
      const gender = isFemale ? "female" : "male";
      
      // Generar un seed único basado en el ID del testimonial para consistencia
      const seed = testimonial.id.substring(0, 8);
      
      // Usar servicio de avatares realistas de alta calidad
      const avatarUrl = `https://randomuser.me/api/portraits/${gender === 'female' ? 'women' : 'men'}/${Math.abs(parseInt(seed, 16) % 100)}.jpg`;
      
      updates.push({
        id: testimonial.id,
        avatar_url: avatarUrl,
      });
    }

    // Actualizar todos los testimoniales en batch
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from("testimonials")
          .update({ avatar_url: update.avatar_url })
          .eq("id", update.id);

        if (updateError) {
          console.error(`Error actualizando testimonial ${update.id}:`, updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated: updates.length,
        message: `${updates.length} fotos de perfil generadas exitosamente` 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
