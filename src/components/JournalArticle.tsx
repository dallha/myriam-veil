import { useState, useEffect } from "react";
import { BlogPost } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";
import { ArrowLeft } from "lucide-react";
import SEO from "./SEO";

export default function JournalArticle() {
  const { currentArticleSlug, setCurrentArticleSlug } = useAppStore();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!currentArticleSlug) return;
      
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", currentArticleSlug)
            .single();
          if (!error && data) {
            setPost(data as BlogPost);
          }
        } catch (e) {
          console.warn("Failed to load blog post from Supabase", e);
        }
      } else {
        // Fallback local
        try {
          const stored = localStorage.getItem("myriam_veil_journal");
          if (stored) {
            const parsed = JSON.parse(stored) as BlogPost[];
            const found = parsed.find(p => p.slug === currentArticleSlug);
            if (found) setPost(found);
          }
        } catch {}
      }
      setLoading(false);
    }
    loadPost();
  }, [currentArticleSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-[#b84b14] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col justify-center items-center px-6">
        <h1 className="font-serif text-3xl mb-4">Article introuvable</h1>
        <button 
          onClick={() => setCurrentArticleSlug(null)}
          className="text-xs font-bold uppercase tracking-widest text-[#b84b14] flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" /> Retour au journal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2C2825] font-sans selection:bg-[#b84b14] selection:text-white pb-24">
      {/* Simulation basique de SEO pour l'article */}
      <SEO product={{ 
        id: post.id, 
        name: post.title, 
        price: 0, 
        collectionId: 'origins', 
        imageUrl: post.imageUrl, 
        description: post.summary 
      }} />

      {/* Hero Banner */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={post.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80'} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-6 text-center">
          <span className="text-[#F5F2EB] text-xs md:text-sm font-bold uppercase tracking-widest mb-6">
            {post.date}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif max-w-4xl drop-shadow-xl leading-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-3xl mx-auto px-6 -mt-16 md:-mt-32 relative z-30">
        <button 
          onClick={() => setCurrentArticleSlug(null)}
          className="bg-white text-[#2C2825] p-3 rounded-full shadow-xl hover:text-[#b84b14] transition-colors mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="bg-white p-8 md:p-16 shadow-2xl border border-[#2C2825]/5">
          <p className="text-xl md:text-2xl font-light text-[#b84b14] leading-relaxed mb-12 text-center italic">
            {post.summary}
          </p>

          <div 
            className="prose prose-stone prose-lg max-w-none 
                       prose-headings:font-serif prose-headings:font-normal prose-headings:text-[#2C2825]
                       prose-p:font-light prose-p:text-[#4A4540]/90 prose-p:leading-relaxed
                       prose-a:text-[#b84b14] hover:prose-a:text-[#2C2825] prose-a:transition-colors
                       prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>
      </div>
    </div>
  );
}
