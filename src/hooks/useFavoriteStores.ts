import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface FavoriteStore {
  id: string;
  store_name: string;
  store_url: string;
  store_domain: string;
  category: string;
  created_at: string;
}

export const useFavoriteStores = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorite_stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (store: {
    name: string;
    url: string;
    domain: string;
    category: string;
  }) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar favoritos');
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorite_stores')
        .insert({
          user_id: user.id,
          store_name: store.name,
          store_url: store.url,
          store_domain: store.domain,
          category: store.category,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Esta tienda ya está en tus favoritos');
          return false;
        }
        throw error;
      }

      await fetchFavorites();
      toast.success('Tienda agregada a favoritos');
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Error al agregar a favoritos');
      return false;
    }
  };

  const removeFavorite = async (storeDomain: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorite_stores')
        .delete()
        .eq('user_id', user.id)
        .eq('store_domain', storeDomain);

      if (error) throw error;

      await fetchFavorites();
      toast.success('Tienda eliminada de favoritos');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error al eliminar de favoritos');
      return false;
    }
  };

  const isFavorite = (storeDomain: string) => {
    return favorites.some((fav) => fav.store_domain === storeDomain);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};
