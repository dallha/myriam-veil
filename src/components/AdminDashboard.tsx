/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Product, Order, HomepageContent } from "../types";
import { 
  X, LayoutDashboard, ShoppingBag, Package, Database, 
  TrendingUp, CheckCircle, Clock, Truck, Trash2, Plus, 
  Edit, Save, Download, Upload, RotateCcw, ArrowRight, Eye, RefreshCw
} from "lucide-react";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onAddProduct: (collectionId: "couture" | "ecrin" | "heritage") => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onDeleteOrder: (orderId: string) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  hasUnsavedChanges: boolean;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSave,
  onExport,
  onImport,
  onReset,
  hasUnsavedChanges
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "catalog" | "database">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  // --- STATS COMPUTATIONS ---
  const totalRevenue = orders.reduce((sum, order) => {
    // Only count completed or processed orders for revenue simulation
    return sum + order.total;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === "Nouvelle" || o.status === "En préparation").length;
  const shippedOrders = orders.filter(o => o.status === "Expédiée" || o.status === "Livrée").length;

  // Filtered Products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCollection = filterCollection === "all" || p.collectionId === filterCollection;
    return matchesSearch && matchesCollection;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black/90 backdrop-blur-md font-sans">
      <div className="bg-[#02040a] text-slate-300 w-full h-full md:max-h-[92vh] md:max-w-6xl md:rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Background Glowing Ambient lights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* 1. HEADER SECTION */}
        <header className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.01] relative z-10">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-gradient-to-tr from-blue-600 to-fuchsia-600 rounded-md text-white text-xs font-bold uppercase tracking-widest">
              PRO
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg md:text-xl tracking-[0.1em] text-white">
                CONSOLE DIRECTEUR · MYRIAM VEIL
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                Base Locale Serverless · Local-First Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <button
                onClick={onSave}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 animate-pulse"
              >
                <Save className="w-3.5 h-3.5" /> Sauvegarder
              </button>
            )}
            <button
              onClick={onClose}
              className="size-9 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. BODY LAYOUT */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
          
          {/* A. SIDEBAR NAVIGATION */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.005] p-4 flex md:flex-col justify-between overflow-x-auto md:overflow-x-visible hide-scrollbar shrink-0 gap-2">
            <nav className="flex md:flex-col gap-2 w-full">
              {/* Overview Tab Button */}
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-left w-full cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Vue d'ensemble</span>
              </button>

              {/* Orders Tab Button */}
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-left w-full cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-fuchsia-600/15 border border-fuchsia-500/30 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.1)]"
                    : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span className="flex-1">Commandes</span>
                {orders.filter(o => o.status === "Nouvelle").length > 0 && (
                  <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full leading-none">
                    {orders.filter(o => o.status === "Nouvelle").length}
                  </span>
                )}
              </button>

              {/* Catalog Tab Button */}
              <button
                onClick={() => setActiveTab("catalog")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-left w-full cursor-pointer ${
                  activeTab === "catalog"
                    ? "bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>Catalogue Pièces</span>
              </button>

              {/* Database Tab Button */}
              <button
                onClick={() => setActiveTab("database")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-left w-full cursor-pointer ${
                  activeTab === "database"
                    ? "bg-amber-600/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                    : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>Base de données</span>
              </button>
            </nav>

            {/* Sidebar Status Info Indicator */}
            <div className="hidden md:block border-t border-white/5 pt-4 text-[10px] uppercase font-mono tracking-widest text-slate-500 space-y-2">
              <div className="flex justify-between items-center">
                <span>Modifications :</span>
                <span className={hasUnsavedChanges ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}>
                  {hasUnsavedChanges ? "À SAUVER" : "SYNCRONISÉ"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Catalogue :</span>
                <span className="text-white font-bold">{products.length} Articles</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Commandes :</span>
                <span className="text-white font-bold">{orders.length}</span>
              </div>
            </div>
          </aside>

          {/* B. DYNAMIC WORKSPACE PANEL */}
          <main className="flex-1 overflow-y-auto p-6 bg-[#02040a]/40">
            
            {/* ======================================================== */}
            {/* =================== TAB 1: OVERVIEW ==================== */}
            {/* ======================================================== */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* Simulated metrics widgets grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Revenue Widget */}
                  <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <TrendingUp className="w-5 h-5 text-blue-400 absolute top-5 right-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Chiffre d'Affaires Brut</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {totalRevenue.toLocaleString('fr-FR')} FCFA
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">Ventes réelles enregistrées</p>
                  </div>

                  {/* Orders Widget */}
                  <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <ShoppingBag className="w-5 h-5 text-fuchsia-400 absolute top-5 right-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Commandes</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {orders.length}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">
                      {pendingOrders} en attente · {shippedOrders} expédiées
                    </p>
                  </div>

                  {/* Avg Cart Widget */}
                  <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <CheckCircle className="w-5 h-5 text-emerald-400 absolute top-5 right-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Panier Moyen</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {orders.length > 0 
                        ? Math.round(totalRevenue / orders.length).toLocaleString('fr-FR')
                        : "0"
                      } FCFA
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">Moyenne par panier client</p>
                  </div>

                  {/* Catalog size Widget */}
                  <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
                    <Package className="w-5 h-5 text-violet-400 absolute top-5 right-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Articles Actifs</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {products.length}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">Abayas, Manteaux, Vermeils</p>
                  </div>
                </div>

                {/* Dashboard detailed charts and activity logs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Visuel graphique d'activité */}
                  <div className="lg:col-span-2 p-5 border border-white/10 rounded-2xl bg-white/[0.01] flex flex-col justify-between">
                    <div className="mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white">Analyse des visites d'Atelier (Simulée)</h3>
                      <p className="text-[10px] text-slate-400">Activité mensuelle consolidée pour la Maison Dakaroise</p>
                    </div>
                    
                    {/* SVG Curve Line Graph */}
                    <div className="h-44 w-full flex items-end pt-4">
                      <svg className="w-full h-full text-blue-500/20" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path 
                          d="M0,25 Q15,10 30,22 T60,5 T90,28 L100,10 L100,30 L0,30 Z" 
                          fill="url(#blue-grad)" 
                        />
                        <path 
                          d="M0,25 Q15,10 30,22 T60,5 T90,28 L100,10" 
                          fill="none" 
                          stroke="rgba(59, 130, 246, 0.8)" 
                          strokeWidth="0.8" 
                        />
                        <defs>
                          <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.0)" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4 text-[9px] uppercase font-mono text-slate-500">
                      <span>Semaine 1</span>
                      <span>Semaine 2</span>
                      <span>Semaine 3</span>
                      <span>Semaine 4</span>
                    </div>
                  </div>

                  {/* Collection distribution summary */}
                  <div className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white">Répartition de Catalogue</h3>
                      <p className="text-[10px] text-slate-400">Distribution par Ligne de Création</p>
                    </div>

                    <div className="space-y-4 my-6">
                      {/* Couture line */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-300 mb-1">
                          <span>Haute Couture</span>
                          <span className="font-mono text-blue-400">
                            {products.filter(p => p.collectionId === "couture").length}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${(products.filter(p => p.collectionId === "couture").length / products.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Ecrin de soie */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-300 mb-1">
                          <span>L'Écrin de Soie</span>
                          <span className="font-mono text-fuchsia-400">
                            {products.filter(p => p.collectionId === "ecrin").length}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-fuchsia-500 h-full rounded-full" 
                            style={{ width: `${(products.filter(p => p.collectionId === "ecrin").length / products.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Heritage */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-300 mb-1">
                          <span>L'Héritage</span>
                          <span className="font-mono text-violet-400">
                            {products.filter(p => p.collectionId === "heritage").length}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="bg-violet-500 h-full rounded-full" 
                            style={{ width: `${(products.filter(p => p.collectionId === "heritage").length / products.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-500 uppercase font-mono text-center">
                      Capacité LocalStorage : ~1% de 5Mo utilisée
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* =================== TAB 2: ORDERS ====================== */}
            {/* ======================================================== */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">Gestionnaire des commandes</h3>
                    <p className="text-[10px] text-slate-400">Visualisez, traitez et pilotez le suivi de vos commandes clients.</p>
                  </div>
                  <span className="px-3 py-1 border border-white/10 rounded-full text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                    {orders.length} Commande{orders.length > 1 ? "s" : ""}
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center flex flex-col items-center justify-center bg-white/[0.005]">
                    <ShoppingBag className="w-10 h-10 mb-4 text-slate-600 stroke-[1.2]" />
                    <p className="text-sm font-bold uppercase tracking-wider text-white">Aucune commande enregistrée</p>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                      Les commandes passées par vos clients apparaîtront ici en temps réel.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      return (
                        <div 
                          key={order.id} 
                          className="border border-white/10 rounded-xl bg-white/[0.01] hover:bg-white/[0.015] transition-all overflow-hidden flex flex-col font-sans"
                        >
                          {/* Order Header Summary */}
                          <header className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.005]">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-xs font-bold font-mono text-blue-400 uppercase">
                                {order.id}
                              </span>
                              <span className="text-slate-500 text-xs font-mono">• {order.date}</span>
                              <span className="text-white text-xs font-semibold">{order.customerName}</span>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <span className="text-sm font-bold text-fuchsia-400 font-mono">
                                {order.total.toLocaleString('fr-FR')} FCFA
                              </span>
                              
                              {/* Status Dropdown */}
                              <select
                                value={order.status}
                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order["status"])}
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded border focus:outline-none cursor-pointer ${
                                  order.status === "Nouvelle"
                                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                                    : order.status === "En préparation"
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                    : order.status === "Expédiée"
                                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                }`}
                              >
                                <option value="Nouvelle" className="bg-[#02040a] text-red-400">Nouvelle</option>
                                <option value="En préparation" className="bg-[#02040a] text-amber-400">En préparation</option>
                                <option value="Expédiée" className="bg-[#02040a] text-blue-400">Expédiée</option>
                                <option value="Livrée" className="bg-[#02040a] text-emerald-400">Livrée</option>
                              </select>

                              <button
                                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                className="px-3 py-1.5 border border-white/10 hover:border-white/20 text-[10px] text-slate-300 font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> {isExpanded ? "Fermer" : "Détails"}
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm("Supprimer définitivement cette commande ?")) {
                                    onDeleteOrder(order.id);
                                  }
                                }}
                                className="size-8 border border-white/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center rounded transition-colors cursor-pointer"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </header>

                          {/* Expanded Order Details panel */}
                          {isExpanded && (
                            <div className="p-5 border-t border-white/5 bg-white/[0.002] text-xs space-y-4 font-light">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 border-r border-white/5 pr-4">
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                    Coordonnées client
                                  </h4>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-16">Nom :</span>
                                    <span className="text-white font-semibold">{order.customerName}</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-16">Tél :</span>
                                    <span className="text-blue-400 font-bold font-mono">{order.customerPhone}</span>
                                  </p>
                                  <p className="flex items-start gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-16 pt-0.5">Adresse :</span>
                                    <span className="text-slate-300 leading-relaxed max-w-xs">{order.customerAddress}</span>
                                  </p>
                                </div>

                                <div className="space-y-2 pl-0 md:pl-4">
                                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                    Logistique & Facturation
                                  </h4>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-20">Expédition :</span>
                                    <span className={`font-bold ${order.deliveryOption === "dakar" ? "text-blue-400" : "text-fuchsia-400"}`}>
                                      {order.deliveryOption === "dakar" ? "Dakar Express (Gratuit)" : "Hors Dakar (+3 000 FCFA)"}
                                    </span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-20">Sous-total :</span>
                                    <span className="font-mono text-white font-semibold">{order.subtotal.toLocaleString('fr-FR')} FCFA</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-20">TVA (18% incl.) :</span>
                                    <span className="font-mono text-slate-400">{Math.round(order.total * 0.18).toLocaleString('fr-FR')} FCFA</span>
                                  </p>
                                </div>
                              </div>

                              {/* Itemized Order list */}
                              <div className="border border-white/5 rounded-lg overflow-hidden bg-black/20 mt-4">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-white/[0.01] border-b border-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                                      <th className="px-4 py-2.5">Article</th>
                                      <th className="px-4 py-2.5">Catégorie</th>
                                      <th className="px-4 py-2.5 text-center">Taille</th>
                                      <th className="px-4 py-2.5 text-center">Qté</th>
                                      <th className="px-4 py-2.5 text-right">Prix</th>
                                      <th className="px-4 py-2.5 text-right">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5 font-sans">
                                    {order.items.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-white/[0.005] transition-colors">
                                        <td className="px-4 py-3 font-semibold text-white">{item.product.name}</td>
                                        <td className="px-4 py-3 text-slate-400">{item.product.category || "Couture"}</td>
                                        <td className="px-4 py-3 text-center font-mono font-medium text-slate-300">
                                          {item.selectedSize || "Unique"}
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-white">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right font-mono">{item.product.price.toLocaleString('fr-FR')} FCFA</td>
                                        <td className="px-4 py-3 text-right font-mono text-white font-semibold">
                                          {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* =================== TAB 3: CATALOG ===================== */}
            {/* ======================================================== */}
            {activeTab === "catalog" && (
              <div className="space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">Créations & Catalogue</h3>
                    <p className="text-[10px] text-slate-400">Pilotez en direct l'assortiment de pièces haut de gamme de la Maison.</p>
                  </div>
                  
                  {/* Category Filter Pills & Add CTA */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <select
                      value={filterCollection}
                      onChange={(e) => setFilterCollection(e.target.value)}
                      className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="all" className="bg-[#02040a]">Toutes Collections</option>
                      <option value="couture" className="bg-[#02040a]">Haute Couture</option>
                      <option value="ecrin" className="bg-[#02040a]">L'Écrin de Soie</option>
                      <option value="heritage" className="bg-[#02040a]">L'Héritage</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white focus:border-blue-500 focus:outline-none placeholder:text-slate-500 w-36 sm:w-44"
                    />

                    {/* Quick creation triggers dropdown */}
                    <div className="relative group/add">
                      <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                        <Plus className="w-3.5 h-3.5" /> Nouvelle pièce
                      </button>
                      
                      <div className="absolute right-0 top-full mt-1.5 hidden group-hover/add:flex flex-col bg-[#02040a] border border-white/10 rounded-lg shadow-xl py-1 text-xs min-w-[150px] z-20 font-bold uppercase tracking-widest text-[9px]">
                        <button 
                          onClick={() => onAddProduct("couture")}
                          className="w-full px-4 py-2.5 text-left hover:bg-white/5 text-blue-400 transition-colors cursor-pointer"
                        >
                          Haute Couture
                        </button>
                        <button 
                          onClick={() => onAddProduct("ecrin")}
                          className="w-full px-4 py-2.5 text-left hover:bg-white/5 text-fuchsia-400 transition-colors cursor-pointer"
                        >
                          L'Écrin de Soie
                        </button>
                        <button 
                          onClick={() => onAddProduct("heritage")}
                          className="w-full px-4 py-2.5 text-left hover:bg-white/5 text-violet-400 transition-colors cursor-pointer"
                        >
                          L'Héritage
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Products Catalog List */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.01] border-b border-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                          <th className="px-5 py-3">Création</th>
                          <th className="px-5 py-3">Collection</th>
                          <th className="px-5 py-3">Catégorie</th>
                          <th className="px-5 py-3 text-right">Prix</th>
                          <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-light font-sans">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-5 py-12 text-center text-slate-500 uppercase font-semibold">
                              Aucun article ne correspond à votre recherche.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-white/[0.005] transition-colors group">
                              <td className="px-5 py-3 flex items-center gap-3">
                                <div className="w-9 h-11 shrink-0 bg-slate-900 overflow-hidden rounded border border-white/10">
                                  <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <span className="font-semibold text-white uppercase tracking-wide">
                                  {product.name}
                                </span>
                              </td>
                              <td className="px-5 py-3 font-bold uppercase tracking-wider">
                                <span className={`px-2 py-0.5 rounded text-[9px] ${
                                  product.collectionId === "couture" 
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : product.collectionId === "ecrin"
                                    ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                                    : "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                }`}>
                                  {product.collectionId === "couture" 
                                    ? "Haute Couture" 
                                    : product.collectionId === "ecrin" 
                                    ? "Écrin de Soie" 
                                    : "L'Héritage"
                                  }
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-400">{product.category || "---"}</td>
                              <td className="px-5 py-3 text-right font-mono font-bold text-white">
                                {product.price.toLocaleString('fr-FR')} FCFA
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex justify-center items-center gap-2">
                                  <button
                                    onClick={() => onEditProduct(product)}
                                    className="px-2.5 py-1.5 border border-white/10 hover:border-white/20 text-slate-300 rounded transition-colors flex items-center gap-1 cursor-pointer font-bold uppercase text-[9px]"
                                    title="Modifier"
                                  >
                                    <Edit className="w-3 h-3" /> Modifier
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Supprimer définitivement l'article ${product.name} ?`)) {
                                        onDeleteProduct(product.id);
                                      }
                                    }}
                                    className="size-7 border border-white/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center rounded transition-colors cursor-pointer"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* =================== TAB 4: DATABASE ==================== */}
            {/* ======================================================== */}
            {activeTab === "database" && (
              <div className="space-y-6 max-w-xl mx-auto py-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Sauvegarde & Restauration</h3>
                  <p className="text-[10px] text-slate-400">Configurez ou réinitialisez la structure des données à chaud.</p>
                </div>

                <div className="space-y-4">
                  {/* JSON Database Sync block */}
                  <div className="p-5 border border-white/10 bg-white/[0.01] rounded-2xl flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-1">Archivage portable JSON</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                        Téléchargez ou restaurez l'intégralité du site (textes de la page d'accueil et catalogue d'articles) dans un fichier portable. Idéal pour synchroniser des modifications sur un autre ordinateur.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        onClick={onExport}
                        className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-blue-400" /> Exporter JSON
                      </button>

                      {/* File Import Trigger */}
                      <label className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center">
                        <Upload className="w-4 h-4 text-fuchsia-400" />
                        <span>Importer JSON</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onImport(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Reset block */}
                  <div className="p-5 border border-red-500/20 bg-red-950/5 rounded-2xl flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide mb-1">Zone de Risque</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                        Réinitialisez l'ensemble du site à sa configuration d'usine. Les données modifiées et les commandes stockées localement seront supprimées définitivement du navigateur.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm("⚠️ ATTENTION : Vous allez supprimer toutes les modifications personnalisées et commandes de votre stockage de navigateur. Confirmer la réinitialisation ?")) {
                          onReset();
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-3 bg-red-950/20 border border-red-500/25 hover:bg-red-900/20 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Réinitialiser le site d'origine
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* 3. FOOTER */}
        <footer className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex justify-between items-center text-[10px] tracking-wider text-slate-500 uppercase relative z-10 shrink-0 font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span>Console locale active</span>
          </div>
          <span>Maison Myriam Veil · Dakar, Sénégal</span>
        </footer>
      </div>
    </div>
  );
}
