
-- ============================================================
-- 1) orders: restrict INSERT to authenticated; add guest RPC
-- ============================================================
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

CREATE POLICY "Authenticated users can create own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Server-side RPC for guest checkout (validates input, runs as definer).
CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_total_amount numeric,
  p_shipping_address text,
  p_shipping_city text,
  p_notes text,
  p_customer_email text,
  p_customer_phone text,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
BEGIN
  -- Basic validation
  IF p_customer_email IS NULL OR p_customer_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Email inválido';
  END IF;
  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) < 6 THEN
    RAISE EXCEPTION 'Teléfono inválido';
  END IF;
  IF p_shipping_address IS NULL OR length(trim(p_shipping_address)) < 5 THEN
    RAISE EXCEPTION 'Dirección inválida';
  END IF;
  IF p_shipping_city IS NULL OR length(trim(p_shipping_city)) < 2 THEN
    RAISE EXCEPTION 'Ciudad inválida';
  END IF;
  IF p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'Monto inválido';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Carrito vacío';
  END IF;

  INSERT INTO public.orders (
    user_id, total_amount, shipping_address, shipping_city,
    notes, payment_method, customer_email, customer_phone, payment_status
  ) VALUES (
    NULL, p_total_amount, p_shipping_address, p_shipping_city,
    p_notes, 'card', p_customer_email, p_customer_phone, 'pending'
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (order_id, product_id, quantity, price)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_guest_order(numeric, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_guest_order(numeric, text, text, text, text, text, jsonb) TO anon, authenticated;

-- ============================================================
-- 2) profiles: prevent self-escalation of privileged columns
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admin or service role: allow all changes
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::user_role) THEN
    RETURN NEW;
  END IF;

  -- For non-admins updating their own row, force privileged fields to OLD values
  NEW.shopper_verified      := OLD.shopper_verified;
  NEW.traveler_verified     := OLD.traveler_verified;
  NEW.vip_tier              := OLD.vip_tier;
  NEW.vip_points_lifetime   := OLD.vip_points_lifetime;
  NEW.vip_updated_at        := OLD.vip_updated_at;
  NEW.b2b_discount          := OLD.b2b_discount;
  NEW.affidavit_signed      := OLD.affidavit_signed;
  NEW.warehouse_code        := OLD.warehouse_code;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.prevent_profile_privileged_update() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_profile_privileged_update ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privileged_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privileged_update();

-- Also add an explicit WITH CHECK to the user policy (defense in depth)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================
-- 3) dispute_history: allow dispute owners to read their history
-- ============================================================
CREATE POLICY "Users can view own dispute history"
ON public.dispute_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.disputes d
    WHERE d.id = dispute_history.dispute_id
      AND d.user_id = auth.uid()
  )
);

-- ============================================================
-- 4) ps_live_sessions: restrict public-active policy to authenticated
-- ============================================================
DROP POLICY IF EXISTS "Publico ve sesiones activas" ON public.ps_live_sessions;

CREATE POLICY "Authenticated users view active sessions"
ON public.ps_live_sessions
FOR SELECT
TO authenticated
USING (estado = ANY (ARRAY['programada'::ps_live_status, 'en_vivo'::ps_live_status]));
