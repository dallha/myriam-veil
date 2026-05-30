-- ==============================================================================
-- SCRIPT COMPLET: supabase_setup_complete.sql
-- PURPOSE: Setup initial schema, Custom Claims (RBAC), Row Level Security, and pg_cron
-- ==============================================================================

-- 1. Création de la table des Produits
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    "collectionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "additionalImages" JSONB,
    description TEXT,
    category TEXT,
    sizes JSONB,
    composition TEXT,
    entretien TEXT,
    livraison TEXT,
    related_product_ids JSONB
);

-- 2. Création de la table des Commandes
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "deliveryOption" TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. Création de la table des Rôles Administrateurs
CREATE TABLE IF NOT EXISTS public.admin_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'editor', 'logistician')),
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Activer RLS sur les tables
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 5. Trigger PostgreSQL pour les Custom Claims (Injecte le rôle dans le JWT)
CREATE OR REPLACE FUNCTION public.handle_admin_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Inject the custom claim "user_role" into raw_app_meta_data
        UPDATE auth.users
        SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('user_role', NEW.role)
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

DROP TRIGGER IF EXISTS on_admin_role_change ON public.admin_roles;
CREATE TRIGGER on_admin_role_change
AFTER INSERT OR UPDATE OR DELETE ON public.admin_roles
FOR EACH ROW EXECUTE FUNCTION public.handle_admin_role_change();

-- 6. Politiques RLS (Row Level Security)

-- Orders: Les utilisateurs normaux peuvent lire/écrire leurs propres commandes
CREATE POLICY "Users can manage their own orders" ON public.orders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Orders: Les administrateurs peuvent tout voir/modifier
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'logistician')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'logistician')
);

-- Products: Les produits sont visibles par tout le monde
CREATE POLICY "Products are publicly visible" ON public.products
FOR SELECT USING (true);

-- Products: Les administrateurs et éditeurs peuvent modifier les produits
CREATE POLICY "Admins can modify products" ON public.products
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
);

-- 7. Activer le Temps Réel sur les commandes
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 8. Tâche Automatisée pg_cron (Nettoyage des invités de +30 jours)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'cleanup-guest-accounts',
    '0 3 * * *', -- Tous les jours à 3h du matin
    $$
    DELETE FROM auth.users
    WHERE is_anonymous = true
      AND last_sign_in_at < NOW() - INTERVAL '30 days';
    $$
);
