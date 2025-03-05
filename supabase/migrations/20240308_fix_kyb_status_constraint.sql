-- Drop existing constraint if it exists
ALTER TABLE public.business_details
DROP CONSTRAINT IF EXISTS valid_kyb_status;

-- Add the constraint back with correct values
ALTER TABLE public.business_details
ADD CONSTRAINT valid_kyb_status 
CHECK (kyb_status IN ('PENDING', 'PASSED', 'FAILED')); 