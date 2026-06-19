-- Create favorite_stores table for authenticated users
CREATE TABLE public.favorite_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  store_url text NOT NULL,
  store_domain text NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, store_domain)
);

-- Enable RLS
ALTER TABLE public.favorite_stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own favorite stores"
ON public.favorite_stores
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorite stores"
ON public.favorite_stores
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorite stores"
ON public.favorite_stores
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_favorite_stores_user_id ON public.favorite_stores(user_id);
CREATE INDEX idx_favorite_stores_domain ON public.favorite_stores(store_domain);