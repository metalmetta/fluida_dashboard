-- First, drop the existing foreign key constraints if they exist
ALTER TABLE actions 
DROP CONSTRAINT IF EXISTS actions_reference_id_fkey,
DROP CONSTRAINT IF EXISTS actions_reference_id_invoices_fkey;

-- Drop the existing reference_id column
ALTER TABLE actions 
DROP COLUMN IF EXISTS reference_id;

-- Add separate columns for different reference types
ALTER TABLE actions 
ADD COLUMN top_up_id UUID REFERENCES top_ups(id) ON DELETE SET NULL,
ADD COLUMN invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

-- Add a check constraint to ensure only one reference is set
ALTER TABLE actions
ADD CONSTRAINT action_single_reference CHECK (
    (CASE WHEN top_up_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN invoice_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
); 