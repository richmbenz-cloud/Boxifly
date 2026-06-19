-- Crear tabla de códigos de referido
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de referidos
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Crear tabla de recompensas
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear índices
CREATE INDEX idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX idx_referral_rewards_user ON public.referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_referral ON public.referral_rewards(referral_id);

-- Habilitar RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- Políticas para referral_codes
CREATE POLICY "Users can view own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active codes for signup"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

-- Políticas para referrals
CREATE POLICY "Users can view own referrals as referrer"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referrals as referred"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Políticas para referral_rewards
CREATE POLICY "Users can view own rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON public.referral_rewards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create rewards"
  ON public.referral_rewards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all rewards"
  ON public.referral_rewards FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role));

-- Función para generar código único
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código aleatorio de 8 caracteres
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Verificar si ya existe
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = new_code) INTO code_exists;
    
    -- Si no existe, retornar
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Función para completar referido y crear recompensas
CREATE OR REPLACE FUNCTION public.complete_referral(referral_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referral_record RECORD;
  reward_amount NUMERIC := 20.00;
BEGIN
  -- Obtener información del referido
  SELECT * INTO referral_record
  FROM public.referrals
  WHERE id = referral_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral not found';
  END IF;
  
  -- Actualizar estado del referido
  UPDATE public.referrals
  SET status = 'completed', completed_at = now()
  WHERE id = referral_id_param;
  
  -- Crear recompensa para el referente
  INSERT INTO public.referral_rewards (user_id, referral_id, reward_type, amount, expires_at)
  VALUES (
    referral_record.referrer_id,
    referral_id_param,
    'discount',
    reward_amount,
    now() + interval '90 days'
  );
  
  -- Crear recompensa para el referido
  INSERT INTO public.referral_rewards (user_id, referral_id, reward_type, amount, expires_at)
  VALUES (
    referral_record.referred_id,
    referral_id_param,
    'discount',
    reward_amount * 0.5,
    now() + interval '90 days'
  );
END;
$$;