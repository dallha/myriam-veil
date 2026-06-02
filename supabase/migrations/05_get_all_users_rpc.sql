-- ==============================================================================
-- MIGRATION: 05_get_all_users_rpc.sql
-- PURPOSE: 
--   Créer une fonction RPC get_all_users() qui permet aux super admins
--   de lister les utilisateurs auth.users depuis la console d'administration.
--
-- ⚠️ SÉCURITÉ :
--   Cette fonction est SECURITY DEFINER (s'exécute avec les droits du créateur)
--   et vérifie que l'appelant est bien un super_admin avant de retourner les données.
-- ==============================================================================

-- Fonction RPC pour lister tous les utilisateurs auth.users
-- Accessible uniquement aux super admins
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    -- Vérifier que l'utilisateur appelant est un super_admin
    SELECT role INTO caller_role
    FROM public.admin_roles
    WHERE user_id = auth.uid();

    IF caller_role IS NULL OR caller_role != 'super_admin' THEN
        RAISE EXCEPTION 'Accès refusé. Seuls les super admins peuvent lister les utilisateurs.';
    END IF;

    -- Retourner les utilisateurs de auth.users
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        u.last_sign_in_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- Donner les droits d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;

-- ==============================================================================
-- NOTE POUR L'ADMIN :
--   Après avoir exécuté cette migration dans l'éditeur SQL de Supabase,
--   la console d'administration pourra lister tous les utilisateurs.
-- ==============================================================================
