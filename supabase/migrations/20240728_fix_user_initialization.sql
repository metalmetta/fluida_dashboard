
-- Fix the initialize_user_data function to use bills table instead of invoices
CREATE OR REPLACE FUNCTION public.initialize_user_data()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
    -- Insert demo bank accounts
    INSERT INTO public.bank_accounts (user_id, name, account_number, balance, currency)
    VALUES 
        (NEW.id, 'Chase Bank', '4589', 45230.00, 'USD'),
        (NEW.id, 'Bank of America', '7823', 12845.50, 'USD'),
        (NEW.id, 'Wells Fargo', '1234', 28670.25, 'USD');

    -- Insert demo vendors
    INSERT INTO public.vendors (
        user_id, name, email, address, country, 
        bank_name, bank_account_number, bank_routing_number, bank_holder_name, 
        status, last_payment_date
    )
    VALUES 
        (NEW.id, 'Acme Corp', 'billing@acme.com', '123 Business Ave, New York, NY 10001', 'US',
         'Chase Bank', '****4567', '***1234', 'Acme Corp', 'Active', NOW() - INTERVAL '5 days'),
        (NEW.id, 'Tech Solutions Inc', 'accounts@techsolutions.com', '456 Tech Park, San Francisco, CA 94105', 'US',
         'Bank of America', '****7890', '***5678', 'Tech Solutions Inc', 'Active', NOW() - INTERVAL '10 days'),
        (NEW.id, 'Global Services Ltd', 'finance@globalservices.com', '789 Global Tower, London, UK SW1A 1AA', 'UK',
         'Barclays', '****2345', '***9012', 'Global Services Ltd', 'Active', NOW() - INTERVAL '15 days');

    -- Insert demo actions
    INSERT INTO public.actions (user_id, type, amount, status, approvals_received)
    VALUES 
        (NEW.id, 'Contractor Payout', 244.00, 'pending', 2),
        (NEW.id, 'Withdraw to Bank', 1500.00, 'pending', 0);

    -- Insert demo bills for each vendor (changed from invoices)
    INSERT INTO public.bills (
        user_id, vendor_id, amount, status, date, 
        due_date, bill_number, description
    )
    SELECT 
        NEW.id,
        v.id,
        3450.00,
        'paid',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '28 days',
        'BILL-001',
        'Professional Services'
    FROM public.vendors v
    WHERE v.user_id = NEW.id
    LIMIT 1;

    RETURN NEW;
END;
$$;
