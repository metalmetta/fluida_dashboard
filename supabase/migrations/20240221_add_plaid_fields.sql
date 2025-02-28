-- Add Plaid-related fields to bank_accounts table
ALTER TABLE bank_accounts
ADD COLUMN plaid_access_token TEXT,
ADD COLUMN plaid_account_id TEXT,
ADD COLUMN last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups
CREATE INDEX idx_bank_accounts_plaid_account_id ON bank_accounts(plaid_account_id);

-- Add RLS policy to protect sensitive Plaid data
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own bank accounts"
ON bank_accounts
FOR ALL
USING (auth.uid() = user_id);

-- Function to update last_synced_at timestamp
CREATE OR REPLACE FUNCTION update_bank_account_last_synced()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_synced_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_synced_at
CREATE TRIGGER update_bank_account_sync_timestamp
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_bank_account_last_synced(); 