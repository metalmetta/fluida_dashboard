-- Add KYB-related columns if they don't exist
DO $$ 
BEGIN 
    -- Add kyb_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'kyb_status') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN kyb_status text NOT NULL DEFAULT 'PENDING';
    END IF;

    -- Add kyb_submitted_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'kyb_submitted_at') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN kyb_submitted_at timestamptz DEFAULT now();
    END IF;

    -- Add kyb_completed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'kyb_completed_at') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN kyb_completed_at timestamptz;
    END IF;
END $$;

-- Add constraint for kyb_status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_schema = 'public' 
        AND table_name = 'business_details' 
        AND constraint_name = 'valid_kyb_status'
    ) THEN
        ALTER TABLE public.business_details
        ADD CONSTRAINT valid_kyb_status 
        CHECK (kyb_status IN ('PENDING', 'PASSED', 'FAILED'));
    END IF;
END $$;

-- Create or replace the index for kyb_status
DROP INDEX IF EXISTS business_details_kyb_status_idx;
CREATE INDEX business_details_kyb_status_idx ON public.business_details(kyb_status);

-- Update existing rows to have a default kyb_status if needed
UPDATE public.business_details 
SET kyb_status = 'PENDING' 
WHERE kyb_status IS NULL; 