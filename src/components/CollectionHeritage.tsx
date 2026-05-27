/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, MouseEvent } from "react";
import { Product } from "../types";
import { ArrowLeft, Menu, ShoppingBag, Pencil, Trash2 } from "lucide-react";

interface CollectionHeritageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isAdminMode: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (collectionId: "heritage") => void;
}

export default function CollectionHeritage({ 
  products, 
  onAddToCart,
  isAdminMode,
  onEditProduct,
  onDeleteProduct,
  onAddProduct
}: CollectionHeritageProps) {
  // Navigation stages: 'home' (Screen 2) | 'story' (Screen 11) | 'catalog' (Screen 10)
  const [stage, setStage] = useState<"home" | "story" | "catalog">("home");

  // Selected filter inside catalog (Abaya, Meulfeu, Sets)
  const [subCategory, setSubCategory] = useState<string>("ABAYA");
  const subCategoriesList = ["ABAYA", "MEULFEU", "SETS"];

  const filteredProducts = products.filter((p) => {
    return p.category?.toUpperCase() === subCategory;
  });

  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const handleAddWithFeedback = (prod: Product, e: MouseEvent) => {
    e.stopPropagation();
    onAddToCart(prod);
    setFeedbackText(`"${prod.name}" ajoutée ✓`);
    setTimeout(() => setFeedbackText(null), 2500);
  };

  return (
    <div className="w-full bg-[#f8f6f6] min-h-screen text-[#2C2825] font-sans selection:bg-[#EAE6DF]">
      {/* 1. HERITAGE INTRO BLOCK (Screen 2) */}
      {stage === "home" && (
        <div className="animate-fade-in">
          {/* Dynamic Hero banner */}
          <header className="relative h-[90vh] w-full overflow-hidden bg-emerald-950">
            <div className="absolute inset-0 z-0">
              <div
                className="w-full h-full bg-cover bg-center animate-slow-zoom"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBFOlIuYt5f98f4GYv3aZBxwHZpyduq-pnW7VjY5qDfc1x75SsmOUo-rhyKs53tA2IPocnQ2eoz10gf0bxx8au9EOHESgYg09kBvAUJUAYRN50YdoPV1eM8OfFO8FhRGKOXkxcH_Rz0Anx3vqOBKFfvZ7zUbh3CeCYY2dJvdE74z-mYvn_NkB3vzjiTveNpbUTd8WoulcUY0NyoteMHEMJO0ICqf-s1we9TaLDXtu-eRb_BNJImwEtZSZmfVs-WxecLaeP4LaHRfIEr')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10"></div>
            </div>
            <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-20">
              <p className="text-white/80 text-xs tracking-[0.25em] uppercase mb-2">New Collection</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.1] text-white font-medium tracking-tight max-w-[90%] uppercase">
                THE ELEGANCE OF MODESTY
              </h2>
            </div>
          </header>

          {/* Heritage Dedication Block (Marieme Fall) */}
          <section className="py-20 px-6 flex flex-col items-center justify-center text-center bg-[#F5F2EB]">
            <p className="text-[#A8A39D] text-[10px] tracking-[0.2em] uppercase mb-8 font-semibold">
              In Honor of Marieme Fall
            </p>
            <div className="max-w-md mx-auto relative mb-12">
              <h3 className="font-serif text-2xl md:text-3xl leading-snug font-medium italic text-[#2C2825]">
                "True elegance is inherited, not acquired."
              </h3>
            </div>

            {/* Frame archival photo */}
            <div className="w-full h-72 md:h-96 relative overflow-hidden rounded-sm mb-12 shadow-sm">
              <img
                alt="Heritage illustration"
                loading="lazy"
                className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWr5p_GHXVKRZtuPcCaM-dz2W2dHRpe8gfS8d4TVvAgaofjvLpK1R0-7zvSOmkibADOcod0OrYzV-vJgsPGejvsnQeTk4P0JeIqi43q1iByrovrIMhIura4YmyZtw0Xl9X1F17nZSgGUanL8fkFFbEaNm2R_Yw7eBPwsByfMxUYeYCP_DhvbCpzz826E_0-JeRcA_GEzzGkKBX-5NQ-PviIQDYnmkCvaWvP0-3xlyfkfOdHKb5aoKIaXi2H33PhZrls3Iych_Ds3Gr"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Under quotes prose */}
            <p className="text-sm leading-relaxed text-[#4A4540]/90 mb-8 max-w-sm">
              Discover pieces that weave maternal legacy with contemporary modest design. Crafted from the finest materials to stand the test of time.
            </p>

            <button
              id="explore-heritage-btn"
              onClick={() => setStage("story")}
              className="inline-block bg-[#b84b14] text-white text-[12px] tracking-[0.18em] uppercase py-4 px-10 rounded-sm hover:bg-[#9a3e0f] transition-all duration-300 transform active:scale-95 shadow-md font-semibold cursor-pointer"
            >
              Explore The Story
            </button>
          </section>

          {/* Bottom universal directory mapping categories */}
          <section className="px-4 py-12 bg-[#F5F2EB]" id="explore-directories">
            <div className="grid grid-cols-2 gap-2 bg-[#EAE6DF] border border-[#EAE6DF]/40 max-w-lg mx-auto">
              <button
                onClick={() => { setStage("catalog"); setSubCategory("ABAYA"); }}
                className="group relative aspect-square block overflow-hidden bg-white text-left focus:outline-none"
              >
                <img
                  alt="Women segment"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_zKT3-6s-JPk3CSfPGbjZIOU7OhqStcz4St7bPrlzozCYauJaXBjYwdawbKqnYMKt51Z3CsxN_H911zHscYEllDEWK5Sz_eJg09QnnTKwbHD-LAVUObIW3o_bd2Rmw-gfVm7ZO7-2mX6zusni4CfhEeNvbS5l4ViKH5edXI0OPUkZYyoJ_PEk3oD4FeDszCqLwy5JLMhpHMtCK0KjkMLl7TxEHokkfduuz1uClt-i7DSDDaFw1RuhFvB-HuD7aVJwYWjO5Fkq6lPr"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                <div className="absolute bottom-4 left-4">
                  <h4 className="font-serif text-lg text-white tracking-wide uppercase">ABAYAS</h4>
                </div>
              </button>

              <button
                onClick={() => { setStage("catalog"); setSubCategory("MEULFEU"); }}
                className="group relative aspect-square block overflow-hidden bg-white text-left focus:outline-none"
              >
                <img
                  alt="Accessories segment"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-CLRC_MZ3v0wDnm_9AHwnbqSf9UZQC--9BdRVV6JuUbxKCc762ybW_lDEVbhfPAImSYsXn-bW2TcBHJJqLQqb1ZWZCTRT8eK8cUuYX3gNKtnJKxUVvb_QS75UR8XXfqG1X_UeCRAZkYDhWJDyuyDl_JFdKvV1f3TYEdof2KmpmRPFgZt2Vc_8ToJODybmIYM38bQttOxQa4kQW9YZ0lgYVM2JoAV2bBXxR_UEePz4jBkpfDWjqvwxrrMZhFcBJnP8gRyB10fgby6j"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                <div className="absolute bottom-4 left-4">
                  <h4 className="font-serif text-lg text-white tracking-wide uppercase">MEULFEUS</h4>
                </div>
              </button>

              <button
                onClick={() => { setStage("catalog"); setSubCategory("SETS"); }}
                className="group relative h-40 col-span-2 block overflow-hidden bg-white text-center focus:outline-none"
              >
                <img
                  alt="Men segment"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZeMLwiuEo6_UupCfR0tEEpyaTbbRBvSNaaEV_lqDxperFI-HO8HlqgarHgvFsw05zUzYvvBsHTxM1gQAPz3b9qvTcR33LV_wcZDMLoM3_BmDf4soUWV_bWf42NT5M6HBDzf222R0vKJw_jDuiDzSUEY-cQ5cuq0JVbOpSUyAhVfrANkntrm4wTg5iu25I2jp9Bs7SysbdY9ZRZkLd0bCCPz2416y2TtoGUv15gw6y6m3xBdN9JjS2bFVw7SjdmaOX319EaDvS9RwC"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h4 className="font-serif text-2xl text-white tracking-widest uppercase">ENSEMBLES / SETS</h4>
                </div>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 2. PROSE L'HÉRITAGE DEDICATION PROSE (Screen 11) */}
      {stage === "story" && (
        <div className="animate-fade-in bg-[#F5F2EB] py-16">
          {/* Controls bar */}
          <div className="px-6 pb-6 flex items-center justify-start max-w-xl mx-auto">
            <button
              onClick={() => setStage("home")}
              className="text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-[#b84b14] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
          </div>

          <article className="max-w-xl mx-auto px-6">
            <section className="text-center mb-16">
              <h1 className="font-display font-medium text-4xl text-[#2C2825] tracking-tight mb-3">L'Héritage</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#A8A39D] font-bold">In Honor Of Marieme Fall</p>
            </section>

            {/* Archival fabric preview with captions */}
            <div className="relative w-full mb-16 overflow-hidden pr-8 flex justify-end">
              <div className="w-[85%] aspect-[3/4] rounded-sm overflow-hidden bg-[#EAE6DF] relative shadow-sm">
                <img
                  alt="Dakar Archives"
                  loading="lazy"
                  className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv9pibJF-dvW9PzRaa6vcwbAzJYXXs7lLLB9hVhNnyrOJO-WmtvBxATYiZFPE6U5_t3M_ghjdS255cG_Q8ZseEaLs8xd1nqLk3LKRmHuX8HbLOEMNg6r-nKCEW3SJUhpMCTN2ECo2M9vIcRoDIJjl-FIjGt92Wef97A_3DohLWLbBU_kpNnD1ZhcLfsbWHFCMIKhDyiDiJAK5llSa9mW0yio5ywKTIIk-_kaW9qToWpobObEBnL9rHpbUoiE96GiL5mQCTrvTWSOTy"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Vertical side banner text */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 rotate-95 origin-center transform translate-x-2">
                <p className="text-[10px] italic text-[#b84b14] font-medium tracking-widest whitespace-nowrap">
                  Archives, Dakar 1988
                </p>
              </div>
            </div>

            {/* Rich editorial text block */}
            <div className="border-l border-[#A8A39D]/30 pl-5 pr-1 py-1 text-[#2C2825]/90">
              <p className="text-sm leading-[1.85] text-justify mb-8 font-light">
                <span className="float-left text-5xl font-serif text-[#b84b14] leading-none pr-3 pt-1">T</span>
                rue elegance is rarely learned; it is inherited. It lives in the quiet moments of observation, watching a mother drape her meulfeu with a practiced, almost unconscious grace. Every fold tells a story of dignity, resilience, and an understated power that requires no volume to be heard.
              </p>
              <p className="text-sm leading-[1.85] text-justify mb-8 font-light">
                Myriam Veil was born not from a desire to create fashion, but from a necessity to preserve a feeling. The feeling of being enveloped in history, of wearing one’s values as a second skin. Marieme Fall, my mother, was the architect of this sentiment. Her approach to modesty was never restrictive; it was her most profound expression of freedom and self-respect.
              </p>
              <p className="text-sm leading-[1.85] text-justify mb-12 font-light">
                We design with these memories woven into every thread. We favor the raw honesty of natural fibers, the architecture of asymmetric cuts, and the earthy palettes of the landscapes that shaped her. This is not mere clothing. It is an editorial translation of legacy—a wearable archive for the modern woman who understands that the most compelling statement is often a whisper.
              </p>
            </div>

            {/* Story prose catalog entryway */}
            <div className="text-center mt-12 mb-16">
              <button
                id="view-prose-collection"
                onClick={() => setStage("catalog")}
                className="inline-block text-[11px] font-bold uppercase tracking-[2.5px] text-[#2C2825] border-b border-[#2C2825] pb-1 hover:text-[#b84b14] hover:border-[#b84b14] transition-all duration-300 cursor-pointer text-center"
              >
                Explorer la collection
              </button>
            </div>
          </article>
        </div>
      )}

      {/* 3. COUTURE DIRECTORY CATEGORY BROADCAST (Screen 10) */}
      {stage === "catalog" && (
        <div className="animate-fade-in bg-[#f8f6f6]">
          {/* Page metadata bar */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#EAE6DF] bg-[#F5F2EB]/40">
            <button
              onClick={() => setStage("home")}
              className="text-[#2C2825] text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-[#b84b14]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <span className="font-serif italic text-base lg:text-lg">Collections</span>
            <div className="w-10"></div>
          </div>

          <h2 className="text-[#2C2825] text-3xl font-serif text-center pt-8 pb-4 tracking-widest uppercase">
            WOMEN
          </h2>

          {/* Sticky filter tab categories bar */}
          <div className="sticky top-16 z-20 bg-[#F5F2EB]/95 border-b border-[#EAE6DF] py-3 flex justify-between items-center px-6 gap-4">
            <div className="flex gap-4">
              {subCategoriesList.map((catStr) => (
                <button
                  key={catStr}
                  onClick={() => setSubCategory(catStr)}
                  className={`py-2 px-6 text-xs uppercase tracking-[2px] font-bold transition-all border-b-2 ${
                    subCategory === catStr
                      ? "border-[#2C2825] text-[#2C2825]"
                      : "border-transparent text-[#A8A39D] hover:text-[#2C2825]"
                  }`}
                >
                  {catStr}
                </button>
              ))}
            </div>
            {isAdminMode && (
              <button
                onClick={() => onAddProduct("heritage")}
                className="shrink-0 px-4 py-2 bg-[#b84b14] hover:bg-[#9a3e0f] text-white text-[10px] font-bold tracking-widest uppercase rounded-sm cursor-pointer shadow-md active:scale-95 transition-transform border-none"
              >
                + Ajouter une pièce
              </button>
            )}
          </div>

          {/* Feedback toast notification */}
          {feedbackText && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#2C2825] text-white px-6 py-3 rounded-sm shadow-lg text-xs font-bold uppercase tracking-widest animate-fade-in border border-[#b84b14]/30">
              {feedbackText}
            </div>
          )}

          {/* Render listed heritage items */}
          <main className="max-w-xl mx-auto px-4 py-8">
            <div className="flex flex-col gap-12">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-xs uppercase tracking-widest text-[#A8A39D] font-bold">
                    AUCUNE PIÈCE N'EST ARCHIVÉE ICI POUR L'INSTANT.
                  </p>
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div key={prod.id} className="w-full bg-white shadow-sm border border-[#EAE6DF] rounded-sm group overflow-hidden">
                    {/* Item Image */}
                    <div className="w-full aspect-[4/5] overflow-hidden bg-[#EAE6DF] relative">
                      <img
                        alt={prod.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale contrast-125"
                        src={prod.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                      {isAdminMode && (
                        <div className="absolute top-2.5 right-2.5 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProduct(prod);
                            }}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer border-none"
                            title="Modifier cette pièce"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Voulez-vous vraiment supprimer "${prod.name}" ?`)) {
                                onDeleteProduct(prod.id);
                              }
                            }}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md cursor-pointer border-none"
                            title="Supprimer cette pièce"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata specs card */}
                    <div className="p-6">
                      <div className="flex justify-between items-baseline mb-3">
                        <h4 className="font-serif text-xl text-[#2C2825] font-semibold">{prod.name}</h4>
                        <span className="text-base font-semibold text-[#b84b14]">{prod.price.toLocaleString('fr-FR')} FCFA</span>
                      </div>

                      <p className="text-xs text-[#4A4540]/80 leading-relaxed font-light mb-6">
                        {prod.description}
                      </p>

                      <button
                        onClick={(e) => handleAddWithFeedback(prod, e)}
                        className="w-full bg-[#2C2825] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#b84b14] hover:text-white transition-all duration-300 rounded-none cursor-pointer"
                      >
                        Acquérir cette pièce
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
