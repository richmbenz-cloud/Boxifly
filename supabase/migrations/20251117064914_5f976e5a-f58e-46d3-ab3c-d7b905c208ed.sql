-- Create role enum for user types
CREATE TYPE public.user_role AS ENUM ('customer', 'warehouse', 'admin', 'b2b');

-- Create package status enum
CREATE TYPE public.package_status AS ENUM (
  'prealerted',
  'received_warehouse',
  'ready_consolidation',
  'consolidated',
  'ready_international',
  'in_transit',
  'arrived_peru',
  'ready_delivery',
  'delivered'
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Peru',
  warehouse_code TEXT,
  b2b_discount DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create packages table
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tracking_number TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  external_tracking TEXT,
  estimated_value DECIMAL(10,2),
  estimated_weight DECIMAL(10,2),
  actual_weight DECIMAL(10,2),
  dimensions TEXT,
  current_status package_status DEFAULT 'prealerted',
  final_cost DECIMAL(10,2),
  is_consolidated BOOLEAN DEFAULT FALSE,
  consolidation_group UUID,
  international_tracking TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Create package_timeline table for status history
CREATE TABLE public.package_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  status package_status NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.package_timeline ENABLE ROW LEVEL SECURITY;

-- Create package_files table for photos and documents
CREATE TABLE public.package_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.package_files ENABLE ROW LEVEL SECURITY;

-- Create warehouse_logs table
CREATE TABLE public.warehouse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  logged_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.warehouse_logs ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create b2b_rates table for special pricing
CREATE TABLE public.b2b_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight_min DECIMAL(10,2) NOT NULL,
  weight_max DECIMAL(10,2) NOT NULL,
  rate_per_kg DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.b2b_rates ENABLE ROW LEVEL SECURITY;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-add timeline entry when package status changes
CREATE OR REPLACE FUNCTION public.track_package_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.current_status IS DISTINCT FROM NEW.current_status) THEN
    INSERT INTO public.package_timeline (package_id, status, updated_by)
    VALUES (NEW.id, NEW.current_status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER track_package_status
  AFTER UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.track_package_status_change();

-- RLS POLICIES

-- Profiles: Users can read their own, admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles: Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Packages: Complex permissions based on role
CREATE POLICY "Users can view own packages"
  ON public.packages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own packages"
  ON public.packages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Warehouse can view all packages"
  ON public.packages FOR SELECT
  USING (public.has_role(auth.uid(), 'warehouse') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Warehouse can update packages"
  ON public.packages FOR UPDATE
  USING (public.has_role(auth.uid(), 'warehouse') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all packages"
  ON public.packages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Package timeline: Users can view their package timeline
CREATE POLICY "Users can view own package timeline"
  ON public.package_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.packages
      WHERE packages.id = package_timeline.package_id
      AND packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Warehouse and admins can view all timelines"
  ON public.package_timeline FOR SELECT
  USING (public.has_role(auth.uid(), 'warehouse') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Warehouse and admins can insert timeline"
  ON public.package_timeline FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'warehouse') OR public.has_role(auth.uid(), 'admin'));

-- Package files: Similar to packages
CREATE POLICY "Users can view own package files"
  ON public.package_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.packages
      WHERE packages.id = package_files.package_id
      AND packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Warehouse and admins can manage files"
  ON public.package_files FOR ALL
  USING (public.has_role(auth.uid(), 'warehouse') OR public.has_role(auth.uid(), 'admin'));

-- Warehouse logs: Only warehouse and admin
CREATE POLICY "Warehouse can create logs"
  ON public.warehouse_logs FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'warehouse') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Warehouse and admins can view logs"
  ON public.warehouse_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'warehouse') OR public.has_role(auth.uid(), 'admin'));

-- Payments: Users can view own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Notifications: Users can view and update own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'warehouse'));

-- B2B rates
CREATE POLICY "B2B users can view own rates"
  ON public.b2b_rates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage B2B rates"
  ON public.b2b_rates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));