-- Add document storage fields to business_details table
DO $$ 
BEGIN 
    -- Add business_registration_doc column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'business_registration_doc') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN business_registration_doc text;
    END IF;

    -- Add tax_registration_doc column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'tax_registration_doc') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN tax_registration_doc text;
    END IF;

    -- Add proof_of_address_doc column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'proof_of_address_doc') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN proof_of_address_doc text;
    END IF;
END $$;

-- Create storage bucket for KYB documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyb-documents', 'kyb-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own KYB documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own KYB documents" ON storage.objects;

-- Enable RLS for the storage bucket
CREATE POLICY "Users can upload their own KYB documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'kyb-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own KYB documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'kyb-documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    ); 