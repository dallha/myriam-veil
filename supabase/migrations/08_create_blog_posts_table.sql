-- ==============================================================================
-- MIGRATION: 08_create_blog_posts_table.sql
-- PURPOSE:
--   Créer la table blog_posts si elle n'existe pas encore dans Supabase.
--   Cette migration est une version autonome de la migration 02, au cas où
--   celle-ci n'aurait pas été exécutée.
--
--   Exécutez ce script dans l'éditeur SQL de Supabase (https://supabase.com)
-- ==============================================================================

-- 1. Création de la table 'blog_posts'
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT NOT NULL,
    "imageUrl" TEXT,
    date TEXT NOT NULL,
    visible BOOLEAN DEFAULT true
);

-- 2. Activer RLS sur blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Les articles visibles sont publics (SELECT)
DROP POLICY IF EXISTS "Visible blog posts are public" ON public.blog_posts;
CREATE POLICY "Visible blog posts are public" ON public.blog_posts
FOR SELECT USING (visible = true);

-- 4. Policy: Les admins peuvent tout voir et modifier (ALL)
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
);

-- 5. Accorder les permissions à anon et authenticated
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;

-- ==============================================================================
-- NOTE :
--   Après exécution, la table blog_posts sera disponible.
--   Les articles visibles seront accessibles publiquement.
--   Seuls les super_admin et editor peuvent créer/modifier/supprimer.
-- ==============================================================================
