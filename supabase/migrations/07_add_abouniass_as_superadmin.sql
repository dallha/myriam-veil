-- ==============================================================================
-- MIGRATION: 07_add_abouniass_as_superadmin.sql
-- PURPOSE:
--   Ajouter l'utilisateur abouniass@hotmail.com comme super_admin dans Supabase.
--
--   Exécutez ce script dans l'éditeur SQL de Supabase (https://supabase.com)
--   après vous être connecté avec votre compte admin.
-- ==============================================================================

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur cible
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'abouniass@hotmail.com';

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur abouniass@hotmail.com introuvable dans auth.users. 
        
Vérifiez que :
1. Le compte a bien été créé depuis l''interface de connexion Supabase
2. L''email est correct (abouniass@hotmail.com)
3. L''utilisateur a confirmé son email (si la confirmation est activée)';
    END IF;

    -- Insérer ou mettre à jour le rôle super_admin
    INSERT INTO public.admin_roles (user_id, role)
    VALUES (target_user_id, 'super_admin')
    ON CONFLICT (user_id)
    DO UPDATE SET role = 'super_admin', approved_at = NOW();

    RAISE NOTICE '✓ Utilisateur abouniass@hotmail.com promu super_admin avec succès !';
END;
$$;

-- ==============================================================================
-- NOTE :
--   Après exécution, l'utilisateur abouniass@hotmail.com aura accès complet
--   à la console d'administration.
--   Il devra se déconnecter et se reconnecter pour que le rôle soit pris en compte.
-- ==============================================================================
