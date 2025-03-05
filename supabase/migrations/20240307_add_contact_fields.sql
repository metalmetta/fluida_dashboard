-- Add contact fields and state to business_details table
DO $$ 
BEGIN 
    -- Add contact_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'contact_name') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN contact_name text;
    END IF;

    -- Add contact_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'contact_email') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN contact_email text;
    END IF;

    -- Add contact_phone column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'contact_phone') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN contact_phone text;
    END IF;

    -- Add state column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'state') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN state text;
    END IF;
END $$; 