-- ==============================================================================
-- MIGRATION: 02_blog_and_visibility.sql
-- PURPOSE: Ajouter la visibilité des produits et la table pour le Journal (Blog)
-- ==============================================================================

-- 1. Ajout de la colonne 'visible' à 'products'
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- 2. Création de la table 'blog_posts'
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

-- 3. Activer RLS sur blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Les articles visibles sont publics
DROP POLICY IF EXISTS "Visible blog posts are public" ON public.blog_posts;
CREATE POLICY "Visible blog posts are public" ON public.blog_posts
FOR SELECT USING (visible = true);

-- Policy: Les admins peuvent tout voir et modifier
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
FOR ALL
USING (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
)
WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'user_role') IN ('super_admin', 'editor')
);
