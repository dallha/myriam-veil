/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CollectionId } from "../types";

interface OrigineEntryProps {
  onSelectCollection: (collectionId: CollectionId) => void;
}

export default function OrigineEntry({ onSelectCollection }: OrigineEntryProps) {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#02040a] select-none font-sans relative">
      {/* Ambient background glow points specifically on the entry points */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Split screen content structure - account for TopAppBar (64px) + marquee (40px) */}
      <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-64px-40px)] z-10">
        {/* Women's Couture / Haute Line Block (Top 50%) - Immersive Glass Style */}
        <div
          onClick={() => onSelectCollection("couture")}
          className="group relative h-1/2 w-full block overflow-hidden border-b border-white/10 cursor-pointer"
        >
          {/* Cover image backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBEHnnYyisBwmj9RB6-VnPibFQ79b0Js4t-NpzmRLIOcC-iedNgFifm81BAbG2_gU4T36OhyUuFfOD6Lgstc4xrTO9jQQLnaaklQVlFfIQ1VCwU-s4HCOHacez7HdshXXFn8XkLeIx_nb3Fk86SikbYGvEfBkgFxZedPtVbwCmBFDmMAqZYLbtkJiiJfR3eO-ZgabiJuQqarbwkXV1cNPNxdX900M1ldEXsqL0AAv_2OV0jM4P4rAwniMhKNCUADejMF-kikKov_U-J')`,
            }}
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-black/40 to-transparent transition-colors group-hover:bg-gradient-to-t group-hover:from-blue-950/35 group-hover:via-black/25" />

          {/* Texts overlay */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end items-start z-10">
            <h2 className="font-display font-bold uppercase text-white text-3xl md:text-4xl tracking-tight leading-none mb-3">
              LA LIGNE<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">FEMME</span>
            </h2>
            <div className="self-end mt-auto transform group-hover:translate-x-1 transition-transform duration-300">
              <span className="inline-flex items-center justify-center px-6 py-2.5 border border-white/20 text-white font-medium text-xs uppercase tracking-[0.15em] bg-white/5 backdrop-blur-md group-hover:bg-blue-600 group-hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all rounded-sm">
                DÉCOUVRIR
              </span>
            </div>
          </div>
        </div>

        {/* L'Écrin Fine Jewelry Block (Bottom 50%) - Immersive Glass Style */}
        <div
          onClick={() => onSelectCollection("ecrin")}
          className="group relative h-1/2 w-full block overflow-hidden bg-[#02040a] cursor-pointer"
        >
          {/* Cover image backdrop with offset container */}
          <div className="absolute inset-4 rounded-md overflow-hidden bg-[#02040a]/40 border border-white/10 shadow-inner">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-80 grayscale contrast-125 saturate-50"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDywck-XM7fe1EwErRv_67DkPxdyZzcWDoueVO-PTKNzbalSjCjwK8WU2s85Pwcbek1Bm_NFluKUeDzhwbeqVtsay7AfpkneuoYBSZUkZWmBI_86qyTu0FNvofwSWyOnz7awD7ObLx2j4wn18iwpCLfsFxJEj-1RyrUGhmiYPp--4f7el_ecW07XXc-5kBWzGAupNFZ7oSX03ZyUkNnwZTdvZA5FCsWreBu1024-PtHdkm1iAneBiKIN8-fgh4ctaTUKNdwkCSv-ZGL')`,
              }}
            />
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:bg-fuchsia-950/20 transition-colors duration-500" />

            {/* Texts */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <h2 className="font-display font-bold uppercase text-white text-xl md:text-2xl tracking-tight leading-none max-w-[65%]">
                L'ÉCRIN DE{" "}
                <span className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">SOIE</span>
              </h2>

              <div className="self-end mt-auto transform group-hover:translate-x-1 transition-transform duration-300">
                <span className="inline-flex items-center justify-center px-6 py-2 border border-white/20 text-white font-medium text-[10px] uppercase tracking-[0.15em] bg-white/5 backdrop-blur-md group-hover:bg-fuchsia-600 group-hover:border-fuchsia-500 hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all rounded-sm">
                  ENTRER
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Endless Scroll Marquee element - bottom (Immersive UI Marquee text line) */}
      <footer className="h-10 shrink-0 bg-gradient-to-r from-blue-950/25 via-[#02040a] to-fuchsia-950/25 w-full overflow-hidden flex items-center border-t border-white/10 relative z-20">
        <div className="flex whitespace-nowrap animate-marquee font-mono text-slate-400 text-[10px] uppercase tracking-[0.2em] relative py-1">
          <span className="px-6 text-white">[MAISON MYRIAM VEIL]</span>
          <span className="px-6">NOUVELLE ARCHIVE // COUTURE SCULPTÉE //</span>
          <span className="px-6 text-blue-400">STATUS: RECHERCHE SOUVERAINE //</span>
          <span className="px-6">HAUTE JOAILLERIE D'AFRIQUE //</span>
          <span className="px-6 text-fuchsia-400">L'ÉCRIN DE SOIE //</span>
          <span className="px-6">HERITAGE MARIEME FALL //</span>
          
          {/* Double content segment for continuous illusion */}
          <span className="px-6 text-white">[MAISON MYRIAM VEIL]</span>
          <span className="px-6">NOUVELLE ARCHIVE // COUTURE SCULPTÉE //</span>
          <span className="px-6 text-blue-400">STATUS: RECHERCHE SOUVERAINE //</span>
          <span className="px-6">HAUTE JOAILLERIE D'AFRIQUE //</span>
          <span className="px-6 text-fuchsia-400">L'ÉCRIN DE SOIE //</span>
          <span className="px-6">HERITAGE MARIEME FALL //</span>
        </div>
      </footer>
    </div>
  );
}
