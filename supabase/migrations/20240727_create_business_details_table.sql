
-- Create business_details table to store business information
CREATE TABLE IF NOT EXISTS public.business_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  tax_id TEXT,
  description TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  documents_uploaded BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending_onboarding',
  column_entity_id TEXT,
  column_bank_account_id TEXT,
  column_routing_number TEXT,
  column_account_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.business_details ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own business details
CREATE POLICY "Users can view their own business details"
  ON public.business_details
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own business details
CREATE POLICY "Users can create their own business details"
  ON public.business_details
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own business details
CREATE POLICY "Users can update their own business details"
  ON public.business_details
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create RLS index to speed up policy filtering
CREATE INDEX business_details_user_id_idx ON public.business_details (user_id);

-- Create storage bucket for KYB documents
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyb_documents',
  'kyb_documents',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow users to read their own documents
CREATE POLICY "Users can read their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyb_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policy to allow users to upload their own documents
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyb_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
