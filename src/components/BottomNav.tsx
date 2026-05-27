/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Grid, ShoppingBag } from "lucide-react";
import { CollectionId } from "../types";

interface BottomNavProps {
  currentCollection: CollectionId;
  onSetCollection: (collectionId: CollectionId) => void;
  onToggleCart: () => void;
  cartCount: number;
}

export default function BottomNav({
  currentCollection,
  onSetCollection,
  onToggleCart,
  cartCount
}: BottomNavProps) {
  // Only display bottom floating navigation if not in "origins" entry screen
  if (currentCollection === "origins") return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[240px] h-[56px] bg-[#02040a]/70 backdrop-blur-[16px] rounded-full shadow-[0_20px_50px_rgba(3,7,18,0.7)] border border-white/10 flex justify-between items-center px-6 z-30 transition-all duration-500">
      {/* Home / Universal Entry */}
      <button
        id="bottom-home-btn"
        onClick={() => onSetCollection("origins")}
        className="flex items-center justify-center p-2 text-slate-400 hover:text-white hover:scale-110 active:scale-90 transition-all cursor-pointer"
        title="Retour à l'Origine"
      >
        <Home className="w-5 h-5 stroke-[1.5]" />
      </button>

      {/* Grid view of Active Line */}
      <button
        id="bottom-grid-btn"
        className="flex items-center justify-center p-2 text-white active:scale-95 transition-all relative cursor-pointer"
        title="Galerie et Collection"
      >
        <Grid className="w-5 h-5 stroke-[1.5]" />
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
      </button>

      {/* Bag / Cart status */}
      <button
        id="bottom-cart-btn"
        onClick={onToggleCart}
        className="flex items-center justify-center p-2 text-slate-400 hover:text-white hover:scale-110 active:scale-90 transition-all relative cursor-pointer"
        title="Voir mon Panier"
      >
        <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-fuchsia-500 rounded-full border border-[#02040a]"></span>
        )}
      </button>
    </nav>
  );
}
