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
DROP POLICY IF EXISTS "Users can manage their own orders" ON public.orders;
CREATE POLICY "Users can manage their own orders" ON public.orders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Orders: Les administrateurs peuvent tout voir/modifier
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'logistician')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'logistician')
);

-- Products: Les produits sont visibles par tout le monde
DROP POLICY IF EXISTS "Products are publicly visible" ON public.products;
CREATE POLICY "Products are publicly visible" ON public.products
FOR SELECT USING (true);

-- Products: Les administrateurs et éditeurs peuvent modifier les produits
DROP POLICY IF EXISTS "Admins can modify products" ON public.products;
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

-- ==============================================================================
-- 9. Auto-assignation du rôle admin au premier utilisateur
-- ==============================================================================

-- Fonction utilitaire pour assigner un rôle à un utilisateur par email
CREATE OR REPLACE FUNCTION public.assign_admin_role(
    target_email TEXT,
    target_role TEXT DEFAULT 'editor'
)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
    existing_role TEXT;
BEGIN
    IF target_role NOT IN ('super_admin', 'editor', 'logistician') THEN
        RETURN 'ERREUR: Rôle invalide. Utilisez super_admin, editor, ou logistician.';
    END IF;

    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RETURN 'ERREUR: Aucun utilisateur trouvé avec cet email.';
    END IF;

    SELECT role INTO existing_role
    FROM public.admin_roles
    WHERE user_id = target_user_id;

    IF existing_role IS NOT NULL THEN
        UPDATE public.admin_roles
        SET role = target_role, approved_at = NOW()
        WHERE user_id = target_user_id;
        RETURN 'SUCCÈS: Rôle de ' || target_email || ' mis à jour en ' || target_role || '.';
    ELSE
        INSERT INTO public.admin_roles (user_id, role)
        VALUES (target_user_id, target_role);
        RETURN 'SUCCÈS: Rôle ' || target_role || ' assigné à ' || target_email || '.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: quand un nouvel utilisateur est créé, si c'est le premier, il devient super_admin
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.admin_roles;
    
    IF admin_count = 0 THEN
        INSERT INTO public.admin_roles (user_id, role)
        VALUES (NEW.id, 'super_admin');
        RAISE LOG 'Auto-admin: Premier utilisateur % promu super_admin', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_auto_admin();

-- Politique RLS pour que les admins puissent voir admin_roles
DROP POLICY IF EXISTS "Admins can view admin_roles" ON public.admin_roles;
CREATE POLICY "Admins can view admin_roles" ON public.admin_roles
FOR SELECT
USING (
    auth.uid() = user_id OR
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor', 'logistician')
);

-- Backfill: promouvoir le premier utilisateur existant si aucun admin n'existe
DO $$
DECLARE
    admin_count INTEGER;
    first_user RECORD;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.admin_roles;
    
    IF admin_count = 0 THEN
        SELECT id, email INTO first_user
        FROM auth.users
        ORDER BY created_at ASC
        LIMIT 1;
        
        IF first_user.id IS NOT NULL THEN
            INSERT INTO public.admin_roles (user_id, role)
            VALUES (first_user.id, 'super_admin');
            RAISE LOG 'Auto-admin: Utilisateur existant % promu super_admin', first_user.email;
        END IF;
    END IF;
END;
$$;
