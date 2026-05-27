/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu, ShoppingBag, X } from "lucide-react";
import { CollectionId } from "../types";

interface TopAppBarProps {
  currentCollection: CollectionId;
  onSetCollection: (collectionId: CollectionId) => void;
  cartCount: number;
  onToggleCart: () => void;
  onOpenMenu: () => void;
  brandTitleOverride?: string;
}

export default function TopAppBar({
  currentCollection,
  onSetCollection,
  cartCount,
  onToggleCart,
  onOpenMenu,
  brandTitleOverride
}: TopAppBarProps) {
  // Get main title depending on line
  const getTitle = () => {
    if (brandTitleOverride) return brandTitleOverride;
    if (currentCollection === "ecrin") return "L'ÉCRIN DE SOIE";
    return "MYRIAM VEIL";
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#02040a]/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between transition-all duration-300">
      {/* Menu Trigger */}
      <button
        id="menu-trigger-btn"
        aria-label="Menu"
        onClick={onOpenMenu}
        className="flex items-center justify-center size-10 rounded-sm hover:bg-white/5 active:scale-95 transition-all text-slate-300"
      >
        <Menu className="w-6 h-6 stroke-[1.5]" />
      </button>

      {/* Center Branding */}
      <button
        id="logo-home-btn"
        onClick={() => onSetCollection("origins")}
        className="flex flex-col items-center justify-center focus:outline-none cursor-pointer group"
      >
        <h1 className="font-display font-medium text-lg md:text-xl tracking-[0.2em] text-white group-hover:text-blue-400 transition-all duration-500 uppercase">
          {getTitle()}
        </h1>
        {currentCollection === "heritage" && (
          <span className="text-[9px] uppercase tracking-[0.15em] text-slate-500 -mt-0.5 group-hover:text-violet-400 transition-colors">
            L'Heritage
          </span>
        )}
      </button>

      {/* Cart & Status Indicator */}
      <button
        id="toggle-cart-btn"
        aria-label="Panier"
        onClick={onToggleCart}
        className="flex items-center justify-center size-10 relative rounded-sm hover:bg-white/5 active:scale-95 transition-all text-slate-300"
      >
        <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
        {cartCount > 0 ? (
          <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-gradient-to-tr from-blue-500 to-fuchsia-500 text-white size-5 flex items-center justify-center rounded-full leading-none transition-transform duration-300 animate-bounce shadow-lg shadow-blue-500/20">
            {cartCount}
          </span>
        ) : (
          <span className="absolute -top-1 -right-1 text-[10px] font-medium border border-white/20 text-xs bg-[#02040a] text-slate-500 size-5 flex items-center justify-center rounded-full leading-none">
            0
          </span>
        )}
      </button>
    </header>
  );
}
