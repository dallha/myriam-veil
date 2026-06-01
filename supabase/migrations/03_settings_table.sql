-- ==============================================================================
-- MIGRATION: 03_settings_table.sql
-- PURPOSE: Ajouter la table settings pour le contenu de la page d'accueil
-- ==============================================================================

-- 1. Création de la table 'settings'
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS sur settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les settings (contenu public)
DROP POLICY IF EXISTS "Settings are publicly readable" ON public.settings;
CREATE POLICY "Settings are publicly readable" ON public.settings
FOR SELECT USING (true);

-- Policy: Les admins peuvent modifier les settings
DROP POLICY IF EXISTS "Admins can modify settings" ON public.settings;
CREATE POLICY "Admins can modify settings" ON public.settings
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
);

-- 3. Insérer la ligne par défaut pour la page d'accueil
INSERT INTO public.settings (id, content)
VALUES ('homepage', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
