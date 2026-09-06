-- Migration: 20260906_policy_system.sql
-- Additive fields for legal_documents table and new legal_acceptances table

-- 1. Add fields to legal_documents
ALTER TABLE public.legal_documents
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS effective_at TIMESTAMP WITH TIME ZONE;

-- 1.1 Update existing check constraint for document_type to allow new policies
ALTER TABLE public.legal_documents DROP CONSTRAINT IF EXISTS legal_documents_document_type_check;
ALTER TABLE public.legal_documents ADD CONSTRAINT legal_documents_document_type_check 
  CHECK (document_type IN ('artist_agreement', 'terms_conditions', 'privacy_policy', 'shipping_policy', 'return_policy', 'buyer_terms', 'cookie_policy'));

-- 2. Create legal_acceptances table
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acceptance_context TEXT,
  
  -- Prevent exact duplicate acceptances for the same version
  UNIQUE(user_id, document_type, document_version)
);

-- 3. RLS for legal_acceptances
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own acceptances" 
ON public.legal_acceptances FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acceptances" 
ON public.legal_acceptances FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all acceptances
CREATE POLICY "Admins can view all acceptances"
ON public.legal_acceptances FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. RLS update for legal_documents (ensure public can only read 'published')
-- We should drop and recreate the select policy for legal_documents if it exists, 
-- or create a new one restricting public to published, and admins to all.
-- Note: Assuming existing table might have open access or no RLS. Let's enable RLS and add strict policies.

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safeguard)
DROP POLICY IF EXISTS "Public can view legal documents" ON public.legal_documents;
DROP POLICY IF EXISTS "Admins can manage legal documents" ON public.legal_documents;
DROP POLICY IF EXISTS "Anyone can read published legal documents" ON public.legal_documents;

-- Public can only view published documents
CREATE POLICY "Anyone can read published legal documents"
ON public.legal_documents FOR SELECT
USING (status = 'published');

-- Admins can view all documents
CREATE POLICY "Admins can view all legal documents"
ON public.legal_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Admins can manage all documents
CREATE POLICY "Admins can manage legal documents"
ON public.legal_documents FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
