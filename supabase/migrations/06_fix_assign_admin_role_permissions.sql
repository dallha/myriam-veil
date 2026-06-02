-- ==============================================================================
-- MIGRATION: 06_fix_assign_admin_role_permissions.sql
-- PURPOSE:
--   Corriger les permissions de la fonction assign_admin_role pour qu'elle
--   soit accessible depuis le client Supabase (via RPC).
--
--   Problème : La fonction assign_admin_role était SECURITY DEFINER mais sans
--   GRANT EXECUTE, ce qui empêchait le client de l'appeler.
--
--   Solution : Ajouter GRANT EXECUTE et s'assurer que la fonction vérifie
--   correctement que l'appelant est un super_admin.
-- ==============================================================================

-- Recréer la fonction avec les bonnes permissions
CREATE OR REPLACE FUNCTION public.assign_admin_role(
    target_email TEXT,
    target_role TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_role TEXT;
    target_user_id UUID;
BEGIN
    -- Vérifier que l'utilisateur appelant est un super_admin
    SELECT role INTO caller_role
    FROM public.admin_roles
    WHERE user_id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'super_admin' THEN
        RAISE EXCEPTION 'Accès refusé. Seuls les super admins peuvent assigner des rôles.';
    END IF;

    -- Vérifier que le rôle cible est valide
    IF target_role NOT IN ('super_admin', 'editor', 'logistician') THEN
        RAISE EXCEPTION 'Rôle invalide : %. Les rôles valides sont : super_admin, editor, logistician', target_role;
    END IF;

    -- Récupérer l'ID de l'utilisateur cible
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Aucun utilisateur trouvé avec l''email : %', target_email;
    END IF;

    -- Upsert : insérer ou mettre à jour le rôle
    INSERT INTO public.admin_roles (user_id, role)
    VALUES (target_user_id, target_role)
    ON CONFLICT (user_id)
    DO UPDATE SET role = EXCLUDED.role, approved_at = NOW();

    RETURN 'SUCCÈS: Rôle ' || target_role || ' assigné à ' || target_email || '.';
END;
$$;

-- Donner les droits d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.assign_admin_role(TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- NOTE POUR L'ADMIN :
--   Exécutez ce script dans l'éditeur SQL de Supabase pour corriger les
--   permissions de la fonction assign_admin_role.
-- ==============================================================================
