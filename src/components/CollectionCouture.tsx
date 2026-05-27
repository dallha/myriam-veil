/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Product, CartItem } from "../types";
import { ChevronDown, Plus, Minus, ArrowLeft, Grid, Sparkles, Pencil, Trash2 } from "lucide-react";

interface CollectionCoutureProps {
  products: Product[];
  onAddToCart: (product: Product, selectedSize?: string) => void;
  isAdminMode: boolean;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (collectionId: "couture") => void;
}

export default function CollectionCouture({ 
  products, 
  onAddToCart,
  isAdminMode,
  onEditProduct,
  onDeleteProduct,
  onAddProduct
}: CollectionCoutureProps) {
  // Navigation states: 'grid' or 'detail'
  const [viewState, setViewState] = useState<"grid" | "detail">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Detail View Configs
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("36");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    composition: false,
    entretien: false,
    livraison: false,
  });

  // Filter state for the Catalog (Screen 6)
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Filter chips in screen 6
  const coutureFilters = ["ALL", "MANTEAUX", "ROBES", "ACCESSOIRES"];

  const filteredProducts = products.filter((p) => {
    if (selectedFilter === "ALL") return true;
    return p.category?.toUpperCase() === selectedFilter;
  });

  const toggleAccordion = (section: string) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setViewState("detail");
  };

  const handleAddWithFeedback = (prod: Product) => {
    onAddToCart(prod, selectedSize);
    
    // Alert or confirmation trigger
    const initialTextOnBtn = document.getElementById("add-btn-text");
    if (initialTextOnBtn) {
      initialTextOnBtn.innerText = "ARTiCLE AJOUTÉ";
      setTimeout(() => {
        if (initialTextOnBtn) initialTextOnBtn.innerText = "AJOUTER AU PANIER";
      }, 1500);
    }
  };
  return (
    <div className="w-full bg-transparent min-h-screen text-slate-300">
      {viewState === "grid" ? (
        /* --- HIGH DESIGN GRID CATALOG (Screen 6) --- */
        <div className="w-full">
          {/* Subheader and Filters Menu */}
          <div className="border-b border-white/10 flex justify-between items-center px-6 py-4 bg-black/10 backdrop-blur-md">
            <button
              id="filtref-btn"
              onClick={() => setSelectedFilter("ALL")}
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-transparent hover:text-blue-400 hover:border-blue-400 transition-all text-slate-300"
            >
              FILTRES + {selectedFilter !== "ALL" && `(${selectedFilter})`}
            </button>
            <span className="text-xs uppercase tracking-[0.2em] font-mono text-slate-400">
              HAUTE COUTURE
            </span>
            <button
              id="trier-btn"
              className="text-xs font-bold uppercase tracking-wider hover:text-indigo-400 transition-colors text-slate-300"
            >
              TRIER
            </button>
          </div>

          {/* Sticking Filter Chips */}
          <div className="flex justify-between items-center px-6 py-4 bg-black/5 border-b border-white/5 gap-4">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {coutureFilters.map((flt) => (
                <button
                  key={flt}
                  onClick={() => setSelectedFilter(flt)}
                  className={`px-4 py-2 rounded-sm text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border ${
                    selectedFilter === flt
                      ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                      : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {flt === "ALL" ? "TOUT VOIR" : flt}
                </button>
              ))}
            </div>
            {isAdminMode && (
              <button
                onClick={() => onAddProduct("couture")}
                className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold tracking-widest uppercase rounded-sm cursor-pointer shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
              >
                + Ajouter une pièce
              </button>
            )}
          </div>

          {/* Staggered Asymmetric Grid Layout */}
          <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-12">
              {/* Product cards rendering */}
              {filteredProducts.map((prod, index) => {
                const isRightColStaggered = index % 2 === 1;
                return (
                  <article
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className={`flex flex-col group cursor-pointer transition-transform duration-500 hover:-translate-y-1 ${
                      isRightColStaggered ? "translate-y-6 md:translate-y-12" : ""
                    }`}
                  >
                    {/* Image Layer */}
                    <div className="relative aspect-[3/4] bg-slate-950 overflow-hidden rounded-md mb-4 border border-white/10 shadow-lg">
                      <img
                        alt={prod.name}
                        loading="lazy"
                        className="w-full h-full object-cover grayscale contrast-110 transform transition-transform duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                        src={prod.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
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

                    {/* Meta details */}
                    <div className="flex justify-between items-start gap-2 px-1">
                      <div>
                        <h3 className="text-xs md:text-sm font-semibold tracking-wider leading-tight text-white group-hover:text-blue-400 transition-colors uppercase">
                          {prod.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-widest font-mono">
                          {prod.category}
                        </p>
                      </div>
                      <span className="text-xs md:text-sm font-semibold text-blue-400 shrink-0 font-mono">
                        {prod.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination Button */}
            <div className="w-full flex justify-center mt-16 md:mt-24 mb-12">
              <button
                id="couture-load-more"
                onClick={() => alert("La collection complète est en ligne. De nouvelles archives arrivent bientôt.")}
                className="px-8 py-4 border border-white/10 bg-white/5 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 rounded-sm active:scale-95 cursor-pointer"
              >
                CHARGER LA SUITE
              </button>
            </div>
          </main>
        </div>
      ) : (
        /* --- PREMIUM OVERSZIED DETAIL PRODUCT VIEW (Screen 1) --- */
        selectedProduct && (
          <div className="w-full max-w-lg mx-auto pb-32">
            {/* Minimal Sub-header */}
            <div className="flex items-center justify-between p-4 bg-transparent border-b border-white/5">
              <button
                onClick={() => setViewState("grid")}
                className="size-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                title="Retour au catalogue"
              >
                <ArrowLeft className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400">
                {selectedProduct.category}
              </span>
              <span className="w-8"></span>
            </div>

            {/* Oversized Gallery Carousel */}
            <section className="relative w-full overflow-hidden bg-slate-950">
              {/* Main Carousel Screen */}
              <div className="w-full aspect-[4/5] relative">
                <img
                  alt={selectedProduct.name}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale contrast-110 transition-all duration-700 hover:grayscale-0"
                  src={
                    selectedProduct.additionalImages
                      ? selectedProduct.additionalImages[activeImageIndex]
                      : selectedProduct.imageUrl
                  }
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Progress Slider Dots */}
              {selectedProduct.additionalImages && selectedProduct.additionalImages.length > 1 && (
                <div className="w-full px-6 mt-3">
                  <div className="h-[2px] bg-slate-800 relative w-full rounded-full">
                    <div
                      className="h-[4px] bg-gradient-to-r from-blue-500 to-fuchsia-500 absolute top-[-1px] rounded-full transition-all duration-500"
                      style={{
                        width: `${100 / selectedProduct.additionalImages.length}%`,
                        marginLeft: `${(activeImageIndex / selectedProduct.additionalImages.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Manual thumbnail select strip */}
                  <div className="flex gap-2.5 justify-center mt-3">
                    {selectedProduct.additionalImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImageIndex(i)}
                        className={`size-12 rounded-sm overflow-hidden border transition-all ${
                          activeImageIndex === i ? "border-blue-500" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          alt="Thumbnail preview"
                          loading="lazy"
                          className="w-full h-full object-cover grayscale"
                          src={img}
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Product description & Interactive Panel */}
            <section className="px-6 py-8">
              <div className="flex justify-between items-start gap-4 mb-6">
                <h2 className="text-2xl font-bold uppercase tracking-tight leading-none text-white w-2/3">
                  {selectedProduct.name}
                </h2>
                <p className="text-xl font-bold text-fuchsia-400 font-mono whitespace-nowrap">
                  {selectedProduct.price.toLocaleString('fr-FR')} FCFA
                </p>
              </div>

              <p className="text-xs md:text-sm leading-relaxed text-justify mb-8 tracking-wide font-light text-slate-300">
                {selectedProduct.description}
              </p>

              {/* Size Selector */}
              {selectedProduct.sizes && (
                <div className="mb-10">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                      TAILLE DISPONIBLE
                    </span>
                    <button
                      onClick={() => alert("Consultez notre guide de patronage unique.")}
                      className="text-[10px] font-bold uppercase tracking-wider underline underline-offset-4 decoration-white/25 hover:decoration-white hover:text-white transition-colors"
                    >
                      GUIDE DES TAILLES
                    </button>
                  </div>
                  <div className="flex gap-3">
                    {selectedProduct.sizes.map((sz) => {
                      const isOutOfStock = sz === "40"; // Out of stock on screen 1 is "40"
                      return (
                        <button
                          key={sz}
                          id={`size-btn-${sz}`}
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(sz)}
                          className={`size-11 border rounded-sm flex items-center justify-center text-xs font-bold transition-all relative overflow-hidden active:scale-95 ${
                            isOutOfStock
                              ? "text-slate-600 border-white/5 cursor-not-allowed bg-black/40 line-through"
                              : selectedSize === sz
                              ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                              : "bg-transparent text-slate-200 border-white/10 hover:bg-white/5 hover:border-white/30"
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accordions */}
              <div className="border-t border-white/10 divide-y divide-white/5">
                {/* COMPOSITION Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion("composition")}
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-200"
                  >
                    <span>COMPOSITION</span>
                    <Plus className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ${openAccordions.composition ? "rotate-45 text-white" : ""}`} />
                  </button>
                  {openAccordions.composition && (
                    <div className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed font-light whitespace-pre-line animate-fade-in">
                      {selectedProduct.composition || "Extérieur : 85% Laine fine de mérinos recyclée, 15% cachemire de soutien.\nDoublure : 100% Satin de viscose fluide."}
                    </div>
                  )}
                </div>

                {/* ENTRETIEN Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion("entretien")}
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-200"
                  >
                    <span>ENTRETIEN</span>
                    <Plus className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ${openAccordions.entretien ? "rotate-45 text-white" : ""}`} />
                  </button>
                  {openAccordions.entretien && (
                    <div className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed font-light whitespace-pre-line animate-fade-in">
                      {selectedProduct.entretien || "Nettoyage à sec spécialisé à basse température. Repassage doux sur l'envers."}
                    </div>
                  )}
                </div>

                {/* LIVRAISON & RETOURS Accordion */}
                <div className="py-4">
                  <button
                    onClick={() => toggleAccordion("livraison")}
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-200"
                  >
                    <span>LIVRAISON & RETOURS</span>
                    <Plus className={`w-4 h-4 text-slate-400 transform transition-transform duration-300 ${openAccordions.livraison ? "rotate-45 text-white" : ""}`} />
                  </button>
                  {openAccordions.livraison && (
                    <div className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed font-light whitespace-pre-line animate-fade-in">
                      {selectedProduct.livraison || "Livraison express offerte en emballage soigné éco-responsable. Retours sans frais sous 14 jours."}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Fixed Bottom CTA bar */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-black/80 backdrop-blur-md border-t border-white/10 z-30 h-20 flex items-center justify-center">
              <button
                id="add-to-cart-detail-btn"
                onClick={() => handleAddWithFeedback(selectedProduct)}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-sm font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
              >
                <span id="add-btn-text">AJOUTER AU PANIER</span>
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
