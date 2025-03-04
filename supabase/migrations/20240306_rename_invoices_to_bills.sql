-- Rename invoices table to bills
ALTER TABLE IF EXISTS public.invoices RENAME TO bills;

-- Update references in actions table
ALTER TABLE public.actions RENAME COLUMN invoice_id TO bill_id;

-- Rename invoice_number column to bill_number
ALTER TABLE public.bills RENAME COLUMN invoice_number TO bill_number;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.bills;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.bills;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.bills;

-- Create new policies
CREATE POLICY "Users can view their own bills"
    ON public.bills
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills"
    ON public.bills
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
    ON public.bills
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Update indexes
ALTER INDEX IF EXISTS invoices_user_id_idx RENAME TO bills_user_id_idx;
ALTER INDEX IF EXISTS invoices_status_idx RENAME TO bills_status_idx; 