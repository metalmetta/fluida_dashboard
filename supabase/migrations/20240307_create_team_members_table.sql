-- Create team_members table
CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email text NOT NULL,
    role text NOT NULL DEFAULT 'member',
    status text NOT NULL DEFAULT 'pending',
    invited_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'member')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'pending', 'inactive'))
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team members can view team members in their organization"
    ON public.team_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.user_id = auth.uid()
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Admins can insert new team members"
    ON public.team_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.user_id = auth.uid()
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

CREATE POLICY "Admins can update team members"
    ON public.team_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.user_id = auth.uid()
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.user_id = auth.uid()
            AND tm.role = 'admin'
            AND tm.status = 'active'
        )
    );

-- Create indexes for better query performance
CREATE INDEX team_members_user_id_idx ON public.team_members(user_id);
CREATE INDEX team_members_email_idx ON public.team_members(email);
CREATE INDEX team_members_role_status_idx ON public.team_members(role, status);

-- Create updated_at trigger
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 