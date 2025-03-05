-- Add address_line2 column to business_details table if it doesn't exist
DO $$ 
BEGIN 
    -- Add address_line2 column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'business_details' 
                  AND column_name = 'address_line2') THEN
        ALTER TABLE public.business_details 
        ADD COLUMN address_line2 text;
    END IF;
END $$; 