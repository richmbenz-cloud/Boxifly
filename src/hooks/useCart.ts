import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useGuestCart } from "./useGuestCart";
import { useToast } from "./use-toast";

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    stock: number;
    product_images: Array<{
      image_url: string;
      is_primary: boolean;
    }>;
  } | null;
}

export function useCart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    guestCart, 
    addToGuestCart, 
    updateGuestCartQuantity, 
    removeFromGuestCart,
    getGuestCartCount,
    clearGuestCart 
  } = useGuestCart();

  // Guest cart items
  const { data: guestCartItems, isLoading: isLoadingGuest } = useQuery({
    queryKey: ["guest-cart", guestCart],
    queryFn: async () => {
      if (guestCart.length === 0) return [];
      
      const productIds = guestCart.map(item => item.productId);
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          price,
          stock,
          product_images (
            image_url,
            is_primary
          )
        `)
        .in("id", productIds)
        .eq("is_active", true);

      if (error) throw error;
      
      return guestCart.map(cartItem => ({
        id: cartItem.productId,
        product_id: cartItem.productId,
        quantity: cartItem.quantity,
        products: data?.find(p => p.id === cartItem.productId) || null,
      })) as CartItem[];
    },
    enabled: !user && guestCart.length > 0,
  });

  // Authenticated cart items
  const { data: authCartItems, isLoading: isLoadingAuth } = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            id,
            name,
            price,
            stock,
            product_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const cartItems = user ? authCartItems : guestCartItems;
  const isLoading = user ? isLoadingAuth : isLoadingGuest;

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!user) {
        addToGuestCart(productId, quantity);
        return;
      }

      // Check if item already exists
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
      }
      toast({
        title: "Producto agregado",
        description: "El producto se agregó al carrito exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el producto al carrito",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (!user) {
        updateGuestCartQuantity(id, quantity);
        return;
      }
      
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
      }
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        removeFromGuestCart(id);
        return;
      }
      
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
      }
      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó del carrito",
      });
    },
  });

  const clearCart = async () => {
    if (!user) {
      clearGuestCart();
      queryClient.invalidateQueries({ queryKey: ["guest-cart"] });
    } else {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    }
  };

  const cartCount = user 
    ? cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
    : getGuestCartCount();

  const total = cartItems?.reduce((sum, item) => {
    return sum + (Number(item.products?.price || 0) * item.quantity);
  }, 0) || 0;

  return {
    cartItems: cartItems || [],
    isLoading,
    cartCount,
    total,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
