/* Migration for Trust Platform Foundation */

/* 1. Update Profiles Table */
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'identity_submitted', 'under_review', 'verified', 'premium', 'featured')),
ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_at timestamptz,
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS agreement_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS agreement_version text,
ADD COLUMN IF NOT EXISTS agreement_accepted_at timestamptz;

/* 2. Create Legal Documents Table */
CREATE TABLE IF NOT EXISTS legal_documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    document_type text NOT NULL CHECK (document_type IN ('artist_agreement', 'terms_conditions', 'privacy_policy', 'shipping_policy', 'return_policy')),
    version text NOT NULL,
    content text NOT NULL,
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE (document_type, version)
);

ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legal documents are viewable by everyone" 
ON legal_documents FOR SELECT USING (true);

CREATE POLICY "Only admins can insert legal documents" 
ON legal_documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Only admins can update legal documents" 
ON legal_documents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

/* 3. Create Certificates Table */
CREATE TABLE IF NOT EXISTS certificates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_number text NOT NULL UNIQUE,
    artwork_id uuid NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    artist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    collector_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pdf_url text NOT NULL,
    qr_code text,
    issued_at timestamptz DEFAULT now(),
    verification_url text,
    certificate_status text DEFAULT 'active' CHECK (certificate_status IN ('active', 'revoked', 'pending')),
    hash text,
    version text DEFAULT '1.0',
    created_by text DEFAULT 'system'
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Certificates are viewable by collector, artist, and admin" 
ON certificates FOR SELECT USING (
  auth.uid() = collector_id OR 
  auth.uid() = artist_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

/* For verification route, we might need a public policy if the QR code points to a public verification page.
   Since the verification page is public, we should allow public select on certificates.
*/
CREATE POLICY "Certificates are verifiable publicly"
ON certificates FOR SELECT USING (true);

CREATE POLICY "Only system/admins can insert certificates" 
ON certificates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  -- Note: The Edge Function using service role key will bypass RLS.
);

/* 4. Storage Buckets (if inserted via SQL) */
-- Insert buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity_documents', 'identity_documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

/* Storage Policies for identity_documents */
-- Artists can upload their own docs
CREATE POLICY "Allow artists to upload identity documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'identity_documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Artists can view their own docs
CREATE POLICY "Allow artists to view their identity documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'identity_documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all identity docs
CREATE POLICY "Allow admins to view all identity documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'identity_documents' 
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

/* Storage Policies for certificates */
-- Certificates are publicly accessible for downloading / verification
CREATE POLICY "Allow public read access to certificates"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'certificates');

-- Only system/admins (or edge function with service key) can insert
CREATE POLICY "Allow admins to insert certificates"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'certificates'
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
