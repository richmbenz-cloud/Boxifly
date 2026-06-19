-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_by UUID NOT NULL,
  dispute_type TEXT NOT NULL CHECK (dispute_type IN ('weight_discrepancy', 'damage', 'missing_items', 'cost_dispute', 'delivery_issue', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  description TEXT NOT NULL,
  resolution_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_disputes_package_id ON public.disputes(package_id);
CREATE INDEX idx_disputes_user_id ON public.disputes(user_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_created_at ON public.disputes(created_at DESC);

-- Enable RLS
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own disputes"
  ON public.disputes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own disputes"
  ON public.disputes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all disputes"
  ON public.disputes
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all disputes"
  ON public.disputes
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Warehouse can view all disputes"
  ON public.disputes
  FOR SELECT
  USING (has_role(auth.uid(), 'warehouse'));

-- Create trigger for updated_at
CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create dispute_history table for audit trail
CREATE TABLE IF NOT EXISTS public.dispute_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for dispute history
CREATE INDEX idx_dispute_history_dispute_id ON public.dispute_history(dispute_id);
CREATE INDEX idx_dispute_history_created_at ON public.dispute_history(created_at DESC);

-- Enable RLS for dispute history
ALTER TABLE public.dispute_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dispute history
CREATE POLICY "Admins can view dispute history"
  ON public.dispute_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'));

CREATE POLICY "Admins can insert dispute history"
  ON public.dispute_history
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'warehouse'));