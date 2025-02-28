-- Create enum for top-up status
CREATE TYPE top_up_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create top_ups table
CREATE TABLE IF NOT EXISTS top_ups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    bank_account_id UUID REFERENCES bank_accounts(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    status top_up_status DEFAULT 'pending',
    transaction_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Add indexes for better query performance
CREATE INDEX idx_top_ups_user_id ON top_ups(user_id);
CREATE INDEX idx_top_ups_status ON top_ups(status);
CREATE INDEX idx_top_ups_created_at ON top_ups(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE top_ups ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own top-ups
CREATE POLICY "Users can view their own top-ups"
    ON top_ups FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to create their own top-ups
CREATE POLICY "Users can create their own top-ups"
    ON top_ups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own top-ups
CREATE POLICY "Users can update their own top-ups"
    ON top_ups FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to call the update_updated_at_column function
CREATE TRIGGER update_top_ups_updated_at
    BEFORE UPDATE ON top_ups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 