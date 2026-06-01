-- ==============================================================================
-- MIGRATION: 04_auto_assign_admin_role.sql
-- PURPOSE: 
--   1. Auto-assigner le rôle super_admin au premier utilisateur qui se connecte
--   2. Fournir une fonction pour assigner manuellement un rôle à un utilisateur
--   3. Ajouter une politique RLS de fallback pour les utilisateurs authentifiés
--
-- ⚠️ COMMENT RÉPARER UN COMPTE EXISTANT SANS RÔLE :
--    Allez dans l'éditeur SQL de Supabase et exécutez :
--    
--    SELECT public.assign_admin_role('email@exemple.com', 'super_admin');
--    
--    Cela va :
--    1. Ajouter l'utilisateur dans la table admin_roles
--    2. Le trigger handle_admin_role_change va injecter le rôle dans le JWT
--    3. L'utilisateur devra se déconnecter/reconnecter pour que le JWT soit mis à jour
-- ==============================================================================

-- ============================================================
-- PARTIE 1: Fonction pour assigner un rôle admin à un utilisateur
-- ============================================================

-- Fonction utilitaire pour assigner un rôle à un utilisateur par email
-- Utile pour les admins qui veulent donner des droits à d'autres comptes
CREATE OR REPLACE FUNCTION public.assign_admin_role(
    target_email TEXT,
    target_role TEXT DEFAULT 'editor'
)
RETURNS TEXT AS $$
DECLARE
    target_user_id UUID;
    existing_role TEXT;
BEGIN
    -- Vérifier que le rôle est valide
    IF target_role NOT IN ('super_admin', 'editor', 'logistician') THEN
        RETURN 'ERREUR: Rôle invalide. Utilisez super_admin, editor, ou logistician.';
    END IF;

    -- Récupérer l'ID de l'utilisateur par email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RETURN 'ERREUR: Aucun utilisateur trouvé avec cet email.';
    END IF;

    -- Vérifier si l'utilisateur a déjà un rôle
    SELECT role INTO existing_role
    FROM public.admin_roles
    WHERE user_id = target_user_id;

    IF existing_role IS NOT NULL THEN
        -- Mettre à jour le rôle existant
        UPDATE public.admin_roles
        SET role = target_role,
            approved_at = NOW()
        WHERE user_id = target_user_id;
        RETURN 'SUCCÈS: Rôle de ' || target_email || ' mis à jour en ' || target_role || '.';
    ELSE
        -- Insérer un nouveau rôle
        INSERT INTO public.admin_roles (user_id, role)
        VALUES (target_user_id, target_role);
        RETURN 'SUCCÈS: Rôle ' || target_role || ' assigné à ' || target_email || '.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- PARTIE 2: Trigger pour auto-assigner super_admin au 1er user
-- ============================================================

-- Fonction trigger: quand un nouvel utilisateur est créé dans auth.users,
-- si c'est le premier utilisateur OU si son email est dans une liste d'admins,
-- on lui assigne automatiquement le rôle super_admin
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
    admin_emails TEXT[] := ARRAY[]::TEXT[]; -- Liste d'emails admin (optionnel)
BEGIN
    -- Vérifier si des admins existent déjà
    SELECT COUNT(*) INTO admin_count FROM public.admin_roles;
    
    -- Condition 1: Si c'est le premier admin (aucun admin existant)
    -- Condition 2: Si l'email est dans la liste prédéfinie (optionnel)
    IF admin_count = 0 THEN
        -- Premier utilisateur = super_admin automatiquement
        INSERT INTO public.admin_roles (user_id, role)
        VALUES (NEW.id, 'super_admin');
        
        RAISE LOG 'Auto-admin: Premier utilisateur % promu super_admin', NEW.email;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur auth.users (après INSERT)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_auto_admin();

-- ============================================================
-- PARTIE 3: Politique RLS de fallback pour les admins
-- ============================================================

-- S'assurer que les admins peuvent lire la table admin_roles
DROP POLICY IF EXISTS "Admins can view admin_roles" ON public.admin_roles;
CREATE POLICY "Admins can view admin_roles" ON public.admin_roles
FOR SELECT
USING (
    auth.uid() = user_id OR
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor', 'logistician')
);

-- ============================================================
-- PARTIE 4: Appliquer le trigger aux utilisateurs EXISTANTS
-- ============================================================

-- Si aucun admin n'existe, promouvoir le premier utilisateur trouvé
DO $$
DECLARE
    admin_count INTEGER;
    first_user RECORD;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.admin_roles;
    
    IF admin_count = 0 THEN
        -- Prendre le premier utilisateur créé
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
