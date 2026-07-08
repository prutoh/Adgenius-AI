-- ============================================
-- AdGenius AI: Required Tables for Plan Features
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. BRANDING TABLE (for Unlimited plan - Custom Branding feature)
CREATE TABLE IF NOT EXISTS public.branding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  brand_name TEXT NOT NULL DEFAULT '',
  brand_tagline TEXT DEFAULT '',
  brand_website TEXT DEFAULT '',
  brand_cta TEXT DEFAULT 'Contact us today',
  brand_voice TEXT DEFAULT 'professional',
  include_branding BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own branding" ON public.branding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own branding" ON public.branding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own branding" ON public.branding
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. SUPPORT TICKETS TABLE (for Pro/Unlimited - Priority Support feature)
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. INVOICES TABLE (for PayPal & Lemon Squeezy billing)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  plan_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  interval TEXT DEFAULT 'monthly',
  status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  pdf_url TEXT,
  paypal_order_id TEXT,
  lemon_squeezy_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);