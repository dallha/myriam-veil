/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { CollectionId, HomepageContent } from "../types";
import { 
  ArrowRight, Feather, Gem, Leaf, Scale, Star, Quote, ChevronDown, Pencil, X 
} from "lucide-react";

interface LandingPageProps {
  onEnterCollection: () => void;
  content: HomepageContent;
  isAdminMode: boolean;
  onUpdateContent: (newContent: HomepageContent) => void;
}

export default function LandingPage({ 
  onEnterCollection, 
  content, 
  isAdminMode, 
  onUpdateContent 
}: LandingPageProps) {
  
  // Local edit states
  const [editingSection, setEditingSection] = useState<"hero" | "histoire" | "valeurs" | "temoignages" | null>(null);
  
  // Buffers for form editing
  const [heroForm, setHeroForm] = useState({
    heroBadge: content.heroBadge,
    heroTitle: content.heroTitle,
    heroSubtitle: content.heroSubtitle
  });

  const [histoireForm, setHistoireForm] = useState({
    historyTitle: content.historyTitle,
    historySubtitle: content.historySubtitle,
    historyText: content.historyText
  });

  const [valeursForm, setValeursForm] = useState(content.valeurs.map(v => ({ ...v })));
  const [testimonialsForm, setTestimonialsForm] = useState(content.testimonials.map(t => ({ ...t })));

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getValeurIcon = (iconName?: string) => {
    switch (iconName) {
      case "Feather": return Feather;
      case "Leaf": return Leaf;
      case "Gem": return Gem;
      case "Scale": return Scale;
      default: return Feather;
    }
  };

  // Save triggers
  const handleSaveHero = () => {
    onUpdateContent({
      ...content,
      heroBadge: heroForm.heroBadge,
      heroTitle: heroForm.heroTitle,
      heroSubtitle: heroForm.heroSubtitle
    });
    setEditingSection(null);
  };

  const handleSaveHistoire = () => {
    onUpdateContent({
      ...content,
      historyTitle: histoireForm.historyTitle,
      historySubtitle: histoireForm.historySubtitle,
      historyText: histoireForm.historyText
    });
    setEditingSection(null);
  };

  const handleSaveValeurs = () => {
    onUpdateContent({
      ...content,
      valeurs: valeursForm
    });
    setEditingSection(null);
  };

  const handleSaveTestimonials = () => {
    onUpdateContent({
      ...content,
      testimonials: testimonialsForm
    });
    setEditingSection(null);
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-[#222222] overflow-x-hidden font-sans relative">
      
      {/* ===== 1. HERO ===== */}
      <section className="relative h-screen flex flex-col justify-center items-start text-left px-[10%] overflow-hidden group/hero">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to right, rgba(250,248,245,0.95) 40%, rgba(250,248,245,0.4)), url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat",
          }}
        />
        
        {/* Floating edit button for Hero */}
        {isAdminMode && (
          <button
            onClick={() => {
              setHeroForm({
                heroBadge: content.heroBadge,
                heroTitle: content.heroTitle,
                heroSubtitle: content.heroSubtitle
              });
              setEditingSection("hero");
            }}
            className="absolute top-24 right-10 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            title="Modifier le Hero"
          >
            <Pencil className="w-4 h-4" /> Modifier le Hero
          </button>
        )}

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#C6A962] border border-[#C6A962]/30 rounded-full px-4 py-2 bg-white/50 backdrop-blur-sm mb-8">
            <span className="w-1.5 h-1.5 bg-[#C6A962] rounded-full" />
            {content.heroBadge}
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-8 max-w-[750px] leading-[1.1] text-[#222222] whitespace-pre-line">
            {content.heroTitle}
          </h1>
          
          <p className="text-base md:text-lg max-w-[500px] mb-12 italic text-[#555555]">
            {content.heroSubtitle}
          </p>
          
          <button
            onClick={onEnterCollection}
            className="inline-block px-14 py-4 bg-[#222222] text-[#FAF8F5] tracking-[3px] text-xs uppercase border border-[#222222] transition-all duration-500 hover:bg-transparent hover:text-[#222222] cursor-pointer font-bold rounded-sm shadow-md"
          >
            Découvrir
          </button>
        </div>
        
        <button
          onClick={() => scrollToSection("landing-histoire")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#C6A962] animate-bounce cursor-pointer"
          title="Faire défiler"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      {/* ===== 2. HISTOIRE ===== */}
      <section id="landing-histoire" className="relative py-28 px-[10%] bg-[#222222] text-center text-white group/histoire">
        
        {/* Floating edit button for Histoire */}
        {isAdminMode && (
          <button
            onClick={() => {
              setHistoireForm({
                historyTitle: content.historyTitle,
                historySubtitle: content.historySubtitle,
                historyText: content.historyText
              });
              setEditingSection("histoire");
            }}
            className="absolute top-10 right-10 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            title="Modifier l'Histoire"
          >
            <Pencil className="w-4 h-4" /> Modifier l'Histoire
          </button>
        )}

        <div className="text-[80px] text-[#C6A962] font-serif leading-none mb-4 opacity-50">"</div>
        <h2 className="font-serif text-3xl md:text-4xl mb-4 text-white">
          {content.historyTitle}
        </h2>
        <p className="italic text-[#C6A962] mb-12 text-sm md:text-base">
          {content.historySubtitle}
        </p>
        <p className="max-w-3xl mx-auto text-sm md:text-lg leading-[2] text-[#cccccc] whitespace-pre-line text-justify md:text-center font-light">
          {content.historyText}
        </p>
      </section>

      {/* ===== 3. VALEURS ===== */}
      <section id="landing-valeurs" className="relative py-28 px-[10%] group/valeurs">
        
        {/* Floating edit button for Valeurs */}
        {isAdminMode && (
          <button
            onClick={() => {
              setValeursForm(content.valeurs.map(v => ({ ...v })));
              setEditingSection("valeurs");
            }}
            className="absolute top-10 right-10 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            title="Modifier les Valeurs"
          >
            <Pencil className="w-4 h-4" /> Modifier les Valeurs
          </button>
        )}

        <h2 className="font-serif text-3xl md:text-4xl mb-4">L'anatomie de la pudeur</h2>
        <p className="italic text-[#C6A962] mb-16 text-sm md:text-base">MYRIAM VEIL ne suit pas les tendances. Elle s'inscrit dans des principes.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.valeurs.map((val, idx) => {
            const Icon = getValeurIcon(val.iconName);
            return (
              <div key={idx} className="pt-10 px-5 border-t border-[#F2F0ED] transition-all duration-500 hover:border-[#C6A962] group">
                <Icon className="w-6 h-6 text-[#C6A962] mb-6" />
                <h3 className="font-serif text-xl mb-5 text-[#222222]">{val.title}</h3>
                <p className="text-[#555555] font-light leading-relaxed text-sm md:text-base">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 4. TÉMOIGNAGES ===== */}
      <section className="relative py-28 px-[10%] bg-[#F2F0ED] group/testimonials">
        
        {/* Floating edit button for Testimonials */}
        {isAdminMode && (
          <button
            onClick={() => {
              setTestimonialsForm(content.testimonials.map(t => ({ ...t })));
              setEditingSection("temoignages");
            }}
            className="absolute top-10 right-10 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            title="Modifier les Avis"
          >
            <Pencil className="w-4 h-4" /> Modifier les Avis
          </button>
        )}

        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">Ce qu'ils disent</h2>
          <p className="italic text-[#C6A962] text-sm md:text-base">Des clients qui portent nos valeurs</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {content.testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-8 md:p-10 rounded-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)]">
              <Quote className="w-8 h-8 text-[#C6A962] opacity-40 mb-5" />
              <p className="italic text-[#555555] leading-relaxed mb-6 text-sm">{t.text}</p>
              <div className="flex items-center gap-3 pt-5 border-t border-[#F2F0ED]">
                <div className="w-10 h-10 rounded-full bg-[#F2F0ED] flex items-center justify-center text-[#C6A962]">
                  <span className="text-sm font-semibold">{t.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#222222]">{t.name}</p>
                  <p className="text-xs text-[#555555]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 5. NEWSLETTER ===== */}
      <section className="py-24 px-[10%] bg-[#222222] text-center">
        <h2 className="font-serif text-3xl md:text-4xl mb-4 text-white">Restez inspiré</h2>
        <p className="text-[#aaaaaa] mb-10 text-sm md:text-base">Recevez nos actualités, nouvelles collections et histoires en avant-première.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).querySelector("input") as HTMLInputElement;
            if (input?.value) {
              alert("✓ Merci de votre inscription !");
              input.value = "";
            }
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="votre@email.com"
            required
            className="flex-1 px-6 py-4 rounded-full border border-white/15 bg-white/10 text-white text-sm outline-none transition-all duration-300 focus:border-[#C6A962] focus:bg-white/15 placeholder:text-white/40"
          />
          <button
            type="submit"
            className="px-8 py-4 rounded-full bg-[#C6A962] text-[#222222] text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-[#b89a52] hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
          >
            S'abonner
          </button>
        </form>
      </section>

      {/* ===== 6. CTA FINAL ===== */}
      <section className="py-28 px-[10%] text-center bg-white">
        <h2 className="font-serif text-3xl md:text-4xl mb-6">Prêt à découvrir l'élégance ?</h2>
        <p className="text-[#555555] mb-10 max-w-lg mx-auto text-sm md:text-base font-light">
          Explorez nos collections pensées pour celles et ceux qui cherchent une élégance authentique et mesurée.
        </p>
        <button
          onClick={onEnterCollection}
          className="inline-block px-14 py-4 bg-[#222222] text-[#FAF8F5] tracking-[3px] text-xs uppercase border border-[#222222] transition-all duration-500 hover:bg-transparent hover:text-[#222222] cursor-pointer font-bold rounded-sm shadow-md"
        >
          Entrer dans l'univers
        </button>
      </section>

      {/* ===== 7. FOOTER ===== */}
      <footer className="bg-[#222222] text-white px-[10%] py-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-serif text-2xl mb-5">MYRIAM VEIL</h3>
            <p className="text-[#888888] leading-relaxed text-xs md:text-sm font-light">
              L'Élégance de la Pudeur, l'Héritage d'une Mère. Une invitation à se tenir avec intention et à incarner une élégance digne.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: "📷", url: "https://www.instagram.com/mintymarieme" },
                { icon: "👍", url: "https://www.facebook.com/mintymarieme" },
                { icon: "🎵", url: "https://www.tiktok.com/@mintymarieme" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 border border-[#444444] rounded-full flex items-center justify-center text-white transition-all duration-300 hover:border-[#C6A962] hover:text-[#C6A962] hover:-translate-y-1"
                >
                  <span className="text-base">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[#C6A962] text-xs tracking-widest mb-5 uppercase font-semibold">Contact</h4>
            <div className="space-y-3 text-xs md:text-sm text-[#cccccc] font-light">
              <p>📍 Dakar, Sénégal</p>
              <p>📞 +221 77 319 42 79</p>
              <p>✉️ <a href="mailto:mintymarieme817@gmail.com" className="text-[#C6A962] hover:underline">mintymarieme817@gmail.com</a></p>
            </div>
          </div>
          <div>
            <h4 className="text-[#C6A962] text-xs tracking-widest mb-5 uppercase font-semibold">Suivez-nous</h4>
            <p className="text-xs md:text-sm text-[#cccccc] mb-4 font-light">Rejoignez l'aventure sur nos réseaux :</p>
            <div className="flex gap-3">
              {[
                { icon: "📷", url: "https://www.instagram.com/mintymarieme" },
                { icon: "👍", url: "https://www.facebook.com/mintymarieme" },
                { icon: "🎵", url: "https://www.tiktok.com/@mintymarieme" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 border border-[#444444] rounded-full flex items-center justify-center text-white transition-all duration-300 hover:border-[#C6A962] hover:text-[#C6A962] hover:-translate-y-1"
                >
                  <span className="text-base">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center border-t border-[#333333] pt-8 text-[#555555] text-xs">
          &copy; {new Date().getFullYear()} MYRIAM VEIL. Tous droits réservés.
        </div>
      </footer>

      {/* ======================================================== */}
      {/* ==================== EDITORS MODALS ==================== */}
      {/* ======================================================== */}

      {/* 1. HERO EDIT MODAL */}
      {editingSection === "hero" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] text-[#222222] max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh]">
            <header className="px-6 py-4 bg-[#222222] text-white flex justify-between items-center">
              <span className="font-serif text-lg tracking-wider">Modifier le Hero</span>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#555555] mb-1">Badge Hero</label>
                <input
                  type="text"
                  value={heroForm.heroBadge}
                  onChange={(e) => setHeroForm({ ...heroForm, heroBadge: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#555555] mb-1">Titre Hero</label>
                <textarea
                  rows={3}
                  value={heroForm.heroTitle}
                  onChange={(e) => setHeroForm({ ...heroForm, heroTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#555555] mb-1">Sous-titre Hero</label>
                <textarea
                  rows={2}
                  value={heroForm.heroSubtitle}
                  onChange={(e) => setHeroForm({ ...heroForm, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                />
              </div>
            </div>
            <footer className="px-6 py-4 bg-[#F2F0ED] border-t border-[#EAE6DF] flex justify-end gap-3">
              <button onClick={() => setEditingSection(null)} className="px-6 py-2.5 rounded-sm border border-[#222222] text-[#222222] text-xs font-bold uppercase tracking-widest hover:bg-black/5 cursor-pointer">Annuler</button>
              <button onClick={handleSaveHero} className="px-6 py-2.5 rounded-sm bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 cursor-pointer">Enregistrer</button>
            </footer>
          </div>
        </div>
      )}

      {/* 2. HISTOIRE EDIT MODAL */}
      {editingSection === "histoire" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] text-[#222222] max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh]">
            <header className="px-6 py-4 bg-[#222222] text-white flex justify-between items-center">
              <span className="font-serif text-lg tracking-wider">Modifier la Transmission</span>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#555555] mb-1">Titre de la Section</label>
                <input
                  type="text"
                  value={histoireForm.historyTitle}
                  onChange={(e) => setHistoireForm({ ...histoireForm, historyTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#555555] mb-1">Sous-titre (Hommage)</label>
                <input
                  type="text"
                  value={histoireForm.historySubtitle}
                  onChange={(e) => setHistoireForm({ ...histoireForm, historySubtitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#555555] mb-1">Texte de l'Histoire</label>
                <textarea
                  rows={8}
                  value={histoireForm.historyText}
                  onChange={(e) => setHistoireForm({ ...histoireForm, historyText: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                />
              </div>
            </div>
            <footer className="px-6 py-4 bg-[#F2F0ED] border-t border-[#EAE6DF] flex justify-end gap-3">
              <button onClick={() => setEditingSection(null)} className="px-6 py-2.5 rounded-sm border border-[#222222] text-[#222222] text-xs font-bold uppercase tracking-widest hover:bg-black/5 cursor-pointer">Annuler</button>
              <button onClick={handleSaveHistoire} className="px-6 py-2.5 rounded-sm bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 cursor-pointer">Enregistrer</button>
            </footer>
          </div>
        </div>
      )}

      {/* 3. VALEURS EDIT MODAL */}
      {editingSection === "valeurs" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] text-[#222222] max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh]">
            <header className="px-6 py-4 bg-[#222222] text-white flex justify-between items-center">
              <span className="font-serif text-lg tracking-wider">Modifier les Valeurs</span>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {valeursForm.map((val, idx) => (
                <div key={idx} className="p-4 border border-[#EAE6DF] rounded-xl bg-[#F2F0ED]/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#C6A962]">Valeur 0{idx + 1} ({val.iconName})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555555] mb-1">Titre</label>
                      <input
                        type="text"
                        value={val.title}
                        onChange={(e) => {
                          const updated = [...valeursForm];
                          updated[idx].title = e.target.value;
                          setValeursForm(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555555] mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={val.desc}
                        onChange={(e) => {
                          const updated = [...valeursForm];
                          updated[idx].desc = e.target.value;
                          setValeursForm(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <footer className="px-6 py-4 bg-[#F2F0ED] border-t border-[#EAE6DF] flex justify-end gap-3">
              <button onClick={() => setEditingSection(null)} className="px-6 py-2.5 rounded-sm border border-[#222222] text-[#222222] text-xs font-bold uppercase tracking-widest hover:bg-black/5 cursor-pointer">Annuler</button>
              <button onClick={handleSaveValeurs} className="px-6 py-2.5 rounded-sm bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 cursor-pointer">Enregistrer</button>
            </footer>
          </div>
        </div>
      )}

      {/* 4. TESTIMONIALS EDIT MODAL */}
      {editingSection === "temoignages" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#FAF8F5] text-[#222222] max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden border border-black/10 flex flex-col max-h-[90vh]">
            <header className="px-6 py-4 bg-[#222222] text-white flex justify-between items-center">
              <span className="font-serif text-lg tracking-wider">Modifier les Avis Clients</span>
              <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </header>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {testimonialsForm.map((t, idx) => (
                <div key={idx} className="p-4 border border-[#EAE6DF] rounded-xl bg-[#F2F0ED]/30 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#C6A962]">Avis 0{idx + 1}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555555] mb-1">Nom du client</label>
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => {
                          const updated = [...testimonialsForm];
                          updated[idx].name = e.target.value;
                          setTestimonialsForm(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555555] mb-1">Ville / Pays</label>
                      <input
                        type="text"
                        value={t.role}
                        onChange={(e) => {
                          const updated = [...testimonialsForm];
                          updated[idx].role = e.target.value;
                          setTestimonialsForm(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#555555] mb-1">Avis / Témoignage</label>
                    <textarea
                      rows={3}
                      value={t.text}
                      onChange={(e) => {
                        const updated = [...testimonialsForm];
                        updated[idx].text = e.target.value;
                        setTestimonialsForm(updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[#EAE6DF] focus:border-blue-500 focus:outline-none bg-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <footer className="px-6 py-4 bg-[#F2F0ED] border-t border-[#EAE6DF] flex justify-end gap-3">
              <button onClick={() => setEditingSection(null)} className="px-6 py-2.5 rounded-sm border border-[#222222] text-[#222222] text-xs font-bold uppercase tracking-widest hover:bg-black/5 cursor-pointer">Annuler</button>
              <button onClick={handleSaveTestimonials} className="px-6 py-2.5 rounded-sm bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 cursor-pointer">Enregistrer</button>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}
