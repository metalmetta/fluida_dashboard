-- Add reference_id column to actions table
ALTER TABLE actions ADD COLUMN reference_id UUID;

-- Add foreign key constraint to top_ups table
ALTER TABLE actions 
ADD CONSTRAINT actions_reference_id_fkey 
FOREIGN KEY (reference_id) 
REFERENCES top_ups(id)
ON DELETE SET NULL; 