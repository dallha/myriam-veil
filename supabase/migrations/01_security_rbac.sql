-- ==============================================================================
-- MIGRATION: 01_security_rbac.sql
-- PURPOSE: Setup Custom Claims (RBAC), Row Level Security, and pg_cron
-- ==============================================================================

-- 1. Create Granular Roles Table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor', 'logistician')),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 2. Trigger Function for Custom Claims
CREATE OR REPLACE FUNCTION public.handle_admin_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Inject the custom claim "user_role" into raw_app_meta_data
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('user_role', NEW.role)
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Remove the custom claim if the role is removed
        UPDATE auth.users
        SET raw_app_meta_data = raw_app_meta_data - 'user_role'
        WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on admin_roles
DROP TRIGGER IF EXISTS on_admin_role_change ON public.admin_roles;
CREATE TRIGGER on_admin_role_change
AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
FOR EACH ROW EXECUTE FUNCTION public.handle_admin_role_change();

-- 3. Impersonation & Realtime on Orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for Orders
-- Policy: User can read/write their own orders
CREATE POLICY "Users can manage their own orders" ON public.orders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Super Admin & Logistician can read/write all orders
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'logistician')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'logistician')
);

-- 4. Enable RLS on Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read products
CREATE POLICY "Products are publicly visible" ON public.products
FOR SELECT USING (true);

-- Policy: Super Admin & Editor can modify products
CREATE POLICY "Admins can modify products" ON public.products
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
);

-- 5. Realtime Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 6. pg_cron Automated Cleanup of Anonymous Accounts
-- This requires pg_cron extension to be enabled in Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove anonymous users who haven't logged in for 30 days
SELECT cron.schedule(
    'cleanup-guest-accounts',
    '0 3 * * *', -- Every day at 3 AM
    $$
    DELETE FROM auth.users
    WHERE is_anonymous = true
      AND last_sign_in_at < NOW() - INTERVAL '30 days';
    $$
);
