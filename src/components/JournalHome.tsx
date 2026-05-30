import { useState, useEffect } from "react";
import { BlogPost } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";
import { ArrowRight, BookOpen } from "lucide-react";

export default function JournalHome() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCurrentArticleSlug } = useAppStore();

  useEffect(() => {
    async function loadPosts() {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("visible", true)
            .order("date", { ascending: false });
          if (!error && data) {
            setPosts(data as BlogPost[]);
          }
        } catch (e) {
          console.warn("Failed to load blog posts from Supabase", e);
        }
      } else {
        // Fallback pour le dev local sans supabase
        try {
          const stored = localStorage.getItem("myriam_veil_journal");
          if (stored) {
            const parsed = JSON.parse(stored) as BlogPost[];
            setPosts(parsed.filter((p) => p.visible));
          }
        } catch {}
      }
      setLoading(false);
    }
    loadPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2C2825] pt-32 pb-24 px-6 md:px-12 font-sans selection:bg-[#b84b14] selection:text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-[#2C2825] mb-6">Le Journal</h1>
          <p className="text-[#4A4540]/80 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
            Plongez dans l'univers de Myriam Veil. Découvrez nos inspirations, l'histoire de la parfumerie, et les secrets derrière nos créations.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-2 border-[#b84b14] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 border border-[#2C2825]/10 rounded-xl bg-white/50">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#2C2825]/30 stroke-[1.5]" />
            <p className="text-[#2C2825]/50 uppercase tracking-widest text-xs font-bold">Le journal est actuellement vide.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article 
                key={post.id} 
                onClick={() => setCurrentArticleSlug(post.slug)}
                className="group cursor-pointer flex flex-col bg-white border border-[#2C2825]/10 hover:border-[#b84b14]/30 transition-all duration-500 overflow-hidden"
              >
                <div className="h-64 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[#2C2825]/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                  <img 
                    src={post.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80'} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <span className="text-[#b84b14] text-[10px] font-bold uppercase tracking-widest mb-3">
                    {post.date}
                  </span>
                  <h2 className="text-xl font-serif mb-4 line-clamp-2 group-hover:text-[#b84b14] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#4A4540]/80 text-sm font-light leading-relaxed mb-6 line-clamp-3 flex-1">
                    {post.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#2C2825] group-hover:text-[#b84b14] transition-colors mt-auto">
                    Lire l'article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
