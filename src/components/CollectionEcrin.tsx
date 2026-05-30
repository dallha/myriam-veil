/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Product } from "../types";
import { ArrowLeft, ChevronDown, Heart, Plus, ShoppingBag, Pencil, Trash2 } from "lucide-react";
import SEO from "./SEO";
import CrossSelling from "./CrossSelling";

interface CollectionEcrinProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isAdminMode: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (collectionId: "ecrin") => void;
  onProductDetailToggle?: (isOpen: boolean) => void;
}

export default function CollectionEcrin({ 
  products, 
  onAddToCart,
  isAdminMode,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  onProductDetailToggle
}: CollectionEcrinProps) {
  // Navigation: 'home' (Screen 3) | 'catalog' (Screen 8) | 'detail' (Screen 9)
  const [stage, setStage] = useState<"home" | "catalog" | "detail">("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (onProductDetailToggle) {
      onProductDetailToggle(stage === "detail");
    }
    return () => {
      if (onProductDetailToggle) onProductDetailToggle(false);
    };
  }, [stage, onProductDetailToggle]);

  // Filter criteria for L'Écrin
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes les pièces");
  const categoriesList = ["Toutes les pièces", "Bagues", "Colliers", "Boucles d'oreilles"];

  // Heart state toggle representation
  const [isWished, setIsWished] = useState(false);

  // Detail View configurations
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "Toutes les pièces") return true;
    return p.category === selectedCategory || (p.category === "Boucles d'oreilles" && selectedCategory === "Boucles d'oreilles");
  });

  const handleProductSelect = (prod: Product) => {
    setSelectedProduct(prod);
    setActiveImgIndex(0);
    setStage("detail");
  };

  const handleAddWithFeedback = (prod: Product) => {
    onAddToCart(prod);
    const textSpan = document.getElementById("add-ecrin-text");
    if (textSpan) {
      textSpan.innerText = "AJOUTÉ À L'ÉCRiN";
      setTimeout(() => {
        if (textSpan) textSpan.innerText = "Ajouter à l'écrin";
      }, 1500);
    }
  };

  return (
    <div className="w-full bg-transparent min-h-screen text-slate-300 font-sans">
      {/* 1. L'ÉCRIN HOME SCREEN (Screen 3) */}
      {stage === "home" && (
        <div className="page-enter select-none w-full bg-transparent">
          {/* Hero Section Container */}
          <header className="relative w-full h-[80vh] flex flex-col justify-end items-center pb-24">
            {/* Ambient gold/rose background banner */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[15000ms] scale-110 animate-slow-zoom"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGTaNWNRJwSBRA-fNaWvRzqGDGwktA1IVjav_7aqS92iRqp2-2tK6EZmbVUn4wSb9Iffs5pERFgWcRvK0-vt6alUAfExiMMnX6NfKDtMFZEmZH_eQ39eGQpIXYdG82wWmNva9oU-bJUk7cg9u21qrSWJZijkYuuoYfYJ2V8pG9_UhMj68pXloucahWitskcIzmaQPtBrzj8sZ1duG4j__OvlqfkpOdKhq0y5ZNvTkeSO3qRuUyJ3Q51JnI5vhpC3UDMbTJ8RHIV4rP')`,
              }}
            />
            {/* Dark elegant Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#02040a] via-black/30 to-black/40" />

            {/* Central Callout Area */}
            <div className="relative z-20 text-center px-6 w-full flex flex-col items-center gap-6">
              <p className="text-white font-serif italic text-xl tracking-wide font-light drop-shadow-sm">
                La nouvelle collection joaillerie fine
              </p>
              <button
                id="discover-ecrin-btn"
                onClick={() => setStage("catalog")}
                className="bg-gradient-to-tr from-blue-600 to-fuchsia-600 border border-blue-500 font-bold text-white uppercase text-xs tracking-[2px] py-4 px-10 rounded-full hover:brightness-110 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 shadow-xl cursor-pointer font-semibold"
              >
                Découvrir
              </button>
            </div>
          </header>

          {/* Quick Collection Preview slider */}
          <section className="py-16 bg-[#02040a]/85 backdrop-blur-lg w-full rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5 relative z-10 -mt-8">
            <div className="px-6 mb-8 flex justify-between items-end">
              <h2 className="font-serif text-2xl text-white italic">L'Essence</h2>
              <button
                onClick={() => setStage("catalog")}
                className="text-slate-400 text-[10px] uppercase tracking-widest hover:text-white border-b border-white/10 pb-0.5 transition-colors cursor-pointer"
              >
                Voir tout
              </button>
            </div>

            {/* Carousel slider cards */}
            <div className="w-full overflow-x-auto hide-scrollbar pl-6 pr-6 pb-4">
              <div className="flex gap-6 w-max">
                {products.slice(0, 3).map((prod) => (
                  <article
                    key={prod.id}
                    onClick={() => handleProductSelect(prod)}
                    className="w-[70vw] max-w-[260px] flex flex-col gap-4 group cursor-pointer"
                  >
                    <div className="w-full aspect-[4/5] bg-slate-900 overflow-hidden relative shadow-lg rounded-2xl border border-white/10">
                      <img
                        alt={prod.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 transition-transform duration-700 group-hover:grayscale-0 group-hover:scale-105"
                        src={prod.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col items-center text-center px-1">
                      <h3 className="font-serif text-base text-white group-hover:text-fuchsia-400 transition-colors">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-fuchsia-300 mt-0.5 font-mono">
                        {prod.price.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 2. L'ÉCRIN CATALOG DIRECTORY VIEW (Screen 8) */}
      {stage === "catalog" && (
        <div className="page-enter w-full bg-transparent">
          {/* Breadcrumb row & collection headers */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/10 backdrop-blur-md">
            <button
              onClick={() => setStage("home")}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-fuchsia-400 transition-colors text-slate-300 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Accueil
            </button>
            <span className="font-serif italic text-lg text-white">Le Catalogue d'Exception</span>
            <div className="w-12"></div>
          </div>

          {/* Luxury Filter tabs */}
          <div className="flex justify-between items-center px-6 py-4 bg-black/20 border-b border-white/5 sticky top-16 z-20 gap-4 backdrop-blur-md">
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-[11px] font-medium uppercase tracking-widest transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-fuchsia-600 border border-fuchsia-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.4)]"
                      : "bg-white/5 border border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {isAdminMode && (
              <button
                onClick={() => onAddProduct("ecrin")}
                className="shrink-0 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-[10px] font-bold tracking-widest uppercase rounded-full cursor-pointer shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-transform"
              >
                + Ajouter un bijou
              </button>
            )}
          </div>

          {/* Staggered Masonry Design Grid (Screen 8 style) */}
          <main className="px-4 py-8 max-w-lg mx-auto bg-transparent">
            <div className="masonry-grid">
              {/* Left Column (staggered down via top-margin) */}
              <div className="masonry-col-1">
                {filteredProducts
                  .filter((_, idx) => idx % 2 === 0)
                  .map((prod) => (
                    <article
                      key={prod.id}
                      onClick={() => handleProductSelect(prod)}
                      className="group block cursor-pointer"
                    >
                      <div className="relative overflow-hidden img-asymmetric mb-3 bg-slate-900 aspect-[4/5] shadow-sm border border-white/10">
                        <img
                          alt={prod.name}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale contrast-110 transition-transform duration-700 group-hover:grayscale-0 group-hover:scale-105"
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
                              title="Modifier ce bijou"
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
                              title="Supprimer ce bijou"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 px-1">
                        <h3 className="font-serif text-base text-white group-hover:text-fuchsia-400 transition-colors leading-tight">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-fuchsia-400 font-mono">
                          {prod.price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </article>
                  ))}
              </div>

              {/* Right Column */}
              <div className="masonry-col-2">
                {filteredProducts
                  .filter((_, idx) => idx % 2 === 1)
                  .map((prod) => (
                    <article
                      key={prod.id}
                      onClick={() => handleProductSelect(prod)}
                      className="group block cursor-pointer"
                    >
                      <div className="relative overflow-hidden img-asymmetric mb-3 bg-slate-900 aspect-[3/4] shadow-sm border border-white/10">
                        <img
                          alt={prod.name}
                          loading="lazy"
                          className="w-full h-full object-cover grayscale contrast-110 transition-transform duration-700 group-hover:grayscale-0 group-hover:scale-105"
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
                              title="Modifier ce bijou"
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
                              title="Supprimer ce bijou"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 px-1">
                        <h3 className="font-serif text-base text-white group-hover:text-fuchsia-400 transition-colors leading-tight">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-fuchsia-400 font-mono">
                          {prod.price.toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                    </article>
                  ))}
              </div>
            </div>

            {/* Collection update note */}
            <div className="mt-20 text-center pb-12">
              <p className="font-serif italic text-slate-500 text-base">La collection se renouvelle...</p>
              <div className="h-px w-10 bg-white/10 mx-auto mt-4" />
            </div>
          </main>
        </div>
      )}

      {/* 3. L'ÉCRIN HIGH END PRODUCT DETAIL (Screen 9) */}
      {stage === "detail" && selectedProduct && (
        <div className="page-enter w-full max-w-lg mx-auto bg-transparent pb-32 relative">
          {/* Header overrides */}
          <header className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-4">
            <button
              onClick={() => setStage("catalog")}
              className="size-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/15 transition-all shadow-sm cursor-pointer"
              title="Retour aux bijoux"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsWished(!isWished)}
              className="size-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-fuchsia-400 hover:bg-white/15 transition-all shadow-sm cursor-pointer"
              title="Ajouter aux souhaits"
            >
              <Heart className={`w-5 h-5 ${isWished ? "fill-fuchsia-500 text-fuchsia-500" : ""}`} />
            </button>
          </header>

          {/* Large imagery carousel */}
          <div className="relative w-full h-[480px] md:h-[530px] bg-slate-950 overflow-hidden shadow-inner">
            <img
              alt={selectedProduct.name}
              loading="lazy"
              className="w-full h-full object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-750"
              src={
                selectedProduct.additionalImages
                  ? selectedProduct.additionalImages[activeImgIndex]
                  : selectedProduct.imageUrl
              }
              referrerPolicy="no-referrer"
            />

            {/* Swiper index indicator dots */}
            {selectedProduct.additionalImages && selectedProduct.additionalImages.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2.5 z-10 bg-black/40 border border-white/5 max-w-[120px] mx-auto py-1.5 px-3 rounded-full backdrop-blur-sm">
                {selectedProduct.additionalImages.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveImgIndex(dotIdx)}
                    className={`size-2 rounded-full transition-all duration-300 ${
                      activeImgIndex === dotIdx ? "bg-fuchsia-500 w-4" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product main presentation content card */}
          <main className="px-6 py-8 bg-[#02040a]/80 backdrop-blur-lg rounded-t-3xl -mt-6 relative z-10 shadow-2xl border-t border-white/10 text-slate-300">
            <div className="flex justify-between items-start gap-3 mb-6">
              <h1 className="font-display font-medium text-[28px] md:text-[32px] leading-tight text-white w-2/3">
                {selectedProduct.name}
              </h1>
              <span className="font-mono text-xl md:text-2xl text-fuchsia-400 mt-1">
                {selectedProduct.price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            {/* Mineral material luxury badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-4 py-1.5 bg-white/5 text-fuchsia-300 text-[10px] uppercase tracking-[1px] rounded-full border border-white/10 font-mono font-medium shadow-sm">
                Or Vermeil
              </span>
              <span className="px-4 py-1.5 bg-white/5 text-fuchsia-300 text-[10px] uppercase tracking-[1px] rounded-full border border-white/10 font-mono font-medium shadow-sm">
                Perle d'eau douce
              </span>
            </div>

            {/* Text story descriptions */}
            <div className="space-y-6 text-sm font-light leading-[1.65] text-slate-300 text-justify">
              <p>
                Comme la première lumière frôlant la surface de l'océan. Le Collier de l'Aube capture l'essence d'un matin tranquille, alliant la chaleur de l'or vermeil à l'éclat lunaire d'une perle délicatement sélectionnée.
              </p>
              <p>
                Chaque perle est unique, glissant silencieusement le long d'une chaîne fine qui épouse les contours de votre peau. Une pièce pensée pour être ressentie autant que vue, offrant une présence douce et lumineuse tout au long de votre journée.
              </p>
            </div>

            {/* Disclosures accordions */}
            <div className="mt-10 border-t border-white/10">
              <details className="group py-4 border-b border-white/5">
                <summary className="flex justify-between items-center font-serif text-lg text-white cursor-pointer list-none focus:outline-none hover:text-fuchsia-400">
                  <span>Détails & Entretien</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="mt-3 text-xs md:text-sm text-slate-400 space-y-2 pb-2 leading-relaxed whitespace-pre-line font-light">
                  <p>• Longueur du support en maille : 40cm + 5cm de rallonge</p>
                  <p>• Calibre de la perle : 6-7mm diamanté</p>
                  <p>• Éviter le contact direct avec l'eau de mer, les produits ménagers corrosifs, ou les lotions parfumées.</p>
                </div>
              </details>

              <details className="group py-4 border-b border-white/5">
                <summary className="flex justify-between items-center font-serif text-lg text-white cursor-pointer list-none focus:outline-none hover:text-fuchsia-400">
                  <span>Livraison & Retours</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="mt-3 text-xs md:text-sm text-slate-400 space-y-2 pb-2 leading-relaxed whitespace-pre-line font-light">
                  <p>• Option de livraison standard offerte à domicile.</p>
                  <p>• Expédition rapide sous 24h ouvrées.</p>
                  <p>• Délai de rétraction exceptionnel de 30 jours.</p>
                </div>
              </details>
            </div>
            
            <CrossSelling relatedIds={selectedProduct.related_product_ids} />
            <SEO product={selectedProduct} />
          </main>

          {/* Sticky CTA bar for L'Écrin */}
          <div className="fixed bottom-0 left-0 w-full p-4 pb-6 bg-black/85 backdrop-blur-md z-30 border-t border-white/10 shadow-lg">
            <button
              id="ecrin-add-btn"
              onClick={() => handleAddWithFeedback(selectedProduct)}
              className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-serif text-lg py-4 rounded-lg shadow-xl cursor-pointer hover:brightness-110 active:scale-95 transition-all duration-300 flex justify-center items-center gap-3 shadow-blue-500/10"
            >
              <span id="add-ecrin-text">Ajouter à l'écrin</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
