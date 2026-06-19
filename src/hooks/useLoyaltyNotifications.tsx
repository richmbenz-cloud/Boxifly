import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Crown, TrendingUp, Gift } from "lucide-react";

interface VIPTierInfo {
  tier: string;
  lifetime_points: number;
  discount_percentage: number;
  next_tier: string | null;
  points_to_next_tier: number;
}

export function useLoyaltyNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates for loyalty_points table
    const channel = supabase
      .channel('loyalty-points-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'loyalty_points',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const newTransaction = payload.new;
          
          // Only show notifications for earned points (not spent)
          if (newTransaction.transaction_type === 'earned' && newTransaction.points_earned > 0) {
            // Fetch updated VIP tier information
            try {
              const { data: vipInfo } = await supabase.rpc("get_vip_tier_info", {
                p_user_id: user.id,
              });

              const tierInfo = vipInfo?.[0] as VIPTierInfo | undefined;

              // Calculate progress percentage
              const progressPercentage = tierInfo?.points_to_next_tier 
                ? Math.round((tierInfo.lifetime_points / (tierInfo.lifetime_points + tierInfo.points_to_next_tier)) * 100)
                : 100;

              // Determine tier name in Spanish
              const tierNames: Record<string, string> = {
                'bronce': 'Bronce',
                'plata': 'Plata',
                'oro': 'Oro',
                'platino': 'Platino'
              };

              const currentTierName = tierInfo ? tierNames[tierInfo.tier] || tierInfo.tier : 'Bronce';
              const nextTierName = tierInfo?.next_tier ? tierNames[tierInfo.next_tier] : null;

              // Show toast notification
              toast({
                title: "🎉 ¡Puntos Ganados!",
                description: (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">
                        +{newTransaction.points_earned} puntos
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {newTransaction.description || 'Has ganado puntos de fidelidad'}
                    </div>
                    {tierInfo && (
                      <div className="pt-2 space-y-1 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Crown className="h-3.5 w-3.5 text-primary" />
                          <span>Nivel VIP: <span className="font-semibold">{currentTierName}</span></span>
                        </div>
                        {nextTierName && tierInfo.points_to_next_tier > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            <span>
                              {tierInfo.points_to_next_tier} puntos para {nextTierName}
                            </span>
                            <span className="ml-auto font-semibold text-primary">
                              {progressPercentage}%
                            </span>
                          </div>
                        )}
                        {!nextTierName && (
                          <div className="text-xs text-primary font-semibold">
                            ¡Nivel máximo alcanzado! 🏆
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ),
                duration: 8000, // Show for 8 seconds
              });
            } catch (error) {
              console.error('Error fetching VIP info for notification:', error);
              
              // Fallback notification without VIP info
              toast({
                title: "🎉 ¡Puntos Ganados!",
                description: (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">
                        +{newTransaction.points_earned} puntos
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {newTransaction.description || 'Has ganado puntos de fidelidad'}
                    </div>
                  </div>
                ),
                duration: 6000,
              });
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
}
