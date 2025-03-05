-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own business details" ON public.business_details;
DROP POLICY IF EXISTS "Users can insert their own business details" ON public.business_details;
DROP POLICY IF EXISTS "Users can update their own business details" ON public.business_details;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_business_details_updated_at ON public.business_details;

-- Create business_details table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.business_details (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    business_name text NOT NULL,
    registration_number text NOT NULL,
    tax_id text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL,
    contact_name text NOT NULL,
    contact_email text NOT NULL,
    contact_phone text NOT NULL,
    kyb_status text NOT NULL DEFAULT 'PENDING',
    kyb_submitted_at timestamptz DEFAULT now(),
    kyb_completed_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT valid_kyb_status CHECK (kyb_status IN ('PENDING', 'PASSED', 'FAILED'))
);

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.business_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own business details"
    ON public.business_details
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business details"
    ON public.business_details
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business details"
    ON public.business_details
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS business_details_user_id_idx;
DROP INDEX IF EXISTS business_details_kyb_status_idx;

-- Create indexes
CREATE INDEX IF NOT EXISTS business_details_user_id_idx ON public.business_details(user_id);
CREATE INDEX IF NOT EXISTS business_details_kyb_status_idx ON public.business_details(kyb_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_business_details_updated_at
    BEFORE UPDATE ON public.business_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 