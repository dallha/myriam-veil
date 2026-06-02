/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Product, Order, HomepageContent } from "../types";
import { 
  X, LayoutDashboard, ShoppingBag, Package, Database, 
  TrendingUp, CheckCircle, Clock, Truck, Trash2, Plus, 
  Edit, Save, Download, Upload, RotateCcw, ArrowRight, Eye, RefreshCw, Lock, Copy, FileText, BookOpen, Menu, ShieldCheck, AlertCircle, Settings, Users, UserPlus, UserX, Shield, ShieldAlert, Mail, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminRealtimeToast from "./AdminRealtimeToast";
import InvoicePrintView from "./InvoicePrintView";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { authService } from "../authService";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  homepageContent: HomepageContent;
  onUpdateHomepageContent: (content: HomepageContent) => void;
  onAddProduct: (collectionId: "couture" | "ecrin" | "heritage") => void;
  onEditProduct: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onUpdateProductVisibility: (productId: string, visible: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onDeleteOrder: (orderId: string) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onLogout: () => void;
  hasUnsavedChanges: boolean;
}

export default function AdminDashboard({
  isOpen,
  onClose,
  products,
  orders,
  homepageContent,
  onUpdateHomepageContent,
  onAddProduct,
  onEditProduct,
  onDuplicateProduct,
  onUpdateProductVisibility,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onSave,
  onExport,
  onImport,
  onReset,
  onLogout,
  hasUnsavedChanges
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "catalog" | "database" | "journal" | "factures" | "security" | "settings" | "users">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Double Authentification (MFA)
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoadingMfa, setIsLoadingMfa] = useState(false);
  const [mfaError, setMfaError] = useState("");
  const [mfaSuccess, setMfaSuccess] = useState("");
  const [mfaEnrollData, setMfaEnrollData] = useState<any | null>(null);
  const [enrollVerificationCode, setEnrollVerificationCode] = useState("");
  const [userEmail, setUserEmail] = useState("Directeur");

  // Formulaire Paramètres Site
  const [settingsForm, setSettingsForm] = useState<HomepageContent>(homepageContent);
  useEffect(() => {
    if (homepageContent) {
      setSettingsForm(homepageContent);
    }
  }, [homepageContent]);

  const refreshMfaStatus = async () => {
    if (!isSupabaseConfigured()) return;
    setIsLoadingMfa(true);
    setMfaError("");
    try {
      const active = await authService.isMfaActive();
      setMfaEnabled(active);
    } catch (err: any) {
      setMfaError(err.message || "Erreur de chargement MFA.");
    } finally {
      setIsLoadingMfa(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "security") {
      refreshMfaStatus();
      
      const fetchUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.email) {
            setUserEmail(user.email);
          }
        } catch {}
      };
      fetchUser();
    }
  }, [isOpen, activeTab]);

  const handleStartMfaEnroll = async () => {
    setIsLoadingMfa(true);
    setMfaError("");
    setMfaSuccess("");
    try {
      const data = await authService.enrollMfa(userEmail);
      setMfaEnrollData(data); // Contient { id, totp: { qr_code, secret, uri } }
    } catch (err: any) {
      setMfaError(err.message || "Impossible de démarrer l'enrôlement MFA.");
    } finally {
      setIsLoadingMfa(false);
    }
  };

  const handleVerifyMfaEnroll = async () => {
    if (!enrollVerificationCode || enrollVerificationCode.length !== 6) {
      setMfaError("Veuillez saisir un code à 6 chiffres.");
      return;
    }
    setIsLoadingMfa(true);
    setMfaError("");
    setMfaSuccess("");
    try {
      await authService.verifyMfaEnrollment(mfaEnrollData.id, enrollVerificationCode);
      setMfaSuccess("✓ Double authentification activée avec succès !");
      setMfaEnrollData(null);
      setEnrollVerificationCode("");
      await refreshMfaStatus();
    } catch (err: any) {
      setMfaError(err.message || "Code incorrect. Veuillez réessayer.");
    } finally {
      setIsLoadingMfa(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir désactiver la double authentification ? Votre compte sera moins sécurisé.")) {
      return;
    }
    setIsLoadingMfa(true);
    setMfaError("");
    setMfaSuccess("");
    try {
      await authService.unenrollMfa();
      setMfaSuccess("✓ Double authentification désactivée.");
      await refreshMfaStatus();
    } catch (err: any) {
      setMfaError(err.message || "Impossible de désactiver la MFA.");
    } finally {
      setIsLoadingMfa(false);
    }
  };

  const [isMfaVerified, setIsMfaVerified] = useState(false);
  const [checkingMfa, setCheckingMfa] = useState(true);

  useEffect(() => {
    async function checkMfa() {
      if (!isSupabaseConfigured() || !isOpen) {
        setIsMfaVerified(true);
        setCheckingMfa(false);
        return;
      }
      setCheckingMfa(true);
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error || data?.currentLevel !== data?.nextLevel) {
        setIsMfaVerified(false);
      } else {
        setIsMfaVerified(true);
      }
      setCheckingMfa(false);
    }
    checkMfa();
  }, [isOpen]);

  if (!isOpen) return null;

  if (checkingMfa) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <p className="text-white font-mono text-xs animate-pulse tracking-widest">Vérification de sécurité...</p>
      </div>
    );
  }

  if (!isMfaVerified) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md font-sans">
        <div className="bg-[#02040a] p-8 border border-white/10 rounded-2xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-[50px]"></div>
          <Lock className="w-12 h-12 text-red-500 mx-auto mb-4 stroke-[1.5]" />
          <h2 className="text-white font-display font-semibold text-lg mb-2">Sécurité Renforcée (MFA)</h2>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed">
            L'accès à la console de gestion nécessite une authentification à deux facteurs. Veuillez valider votre accès via l'application.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
              Fermer
            </button>
            <button onClick={onLogout} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-red-500/20 cursor-pointer">
              Se Connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (printingOrder) {
    return <InvoicePrintView order={printingOrder} onClose={() => setPrintingOrder(null)} />;
  }

  const handleExportOrdersCSV = () => {
    if (orders.length === 0) return;
    const header = "ID,Client,Telephone,Montant,Statut,Date,ModePaiement,StatutReglement\n";
    const rows = orders.map(o => `${o.id},"${o.customerName}","${o.customerPhone}",${o.total},"${o.status}","${o.date}","${o.paymentMethod === 'online' ? 'En ligne' : 'A la livraison'}","${o.paymentStatus || 'Non payé'}"`).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `commandes_myriam_veil_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpdateOrderStatus = (status: Order["status"]) => {
    selectedOrderIds.forEach(id => {
      onUpdateOrderStatus(id, status);
      console.log(`[Resend API Simulation] E-mail automatique envoyé au client pour la commande ${id} : Statut changé en ${status}`);
    });
    setSelectedOrderIds([]);
  };

  const handleUpdateOrderStatusWithEmail = (orderId: string, status: Order["status"]) => {
    onUpdateOrderStatus(orderId, status);
    console.log(`[Resend API Simulation] E-mail automatique envoyé au client pour la commande ${orderId} : Statut changé en ${status}`);
  };

  const handleBulkToggleVisibility = (visible: boolean) => {
    selectedProductIds.forEach(id => {
      onUpdateProductVisibility(id, visible);
    });
    setSelectedProductIds([]);
  };

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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-0 bg-black/60 backdrop-blur-2xl font-sans"
      >
        <AdminRealtimeToast />
        <div className="bg-[#02040a]/80 text-slate-300 w-full h-full border-white/5 shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Background Glowing Ambient lights */}
          <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[50rem] h-[50rem] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
          <div className="absolute top-[40%] left-[30%] w-[30rem] h-[30rem] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

          {/* 1. HEADER SECTION */}
          <header className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-md relative z-10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden size-9 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
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
          <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col absolute md:relative z-20 w-full md:w-64 h-full md:h-auto border-b md:border-b-0 md:border-r border-white/10 bg-[#02040a] md:bg-white/[0.005] p-4 justify-between overflow-y-auto shrink-0 gap-2`}>
            <nav className="flex flex-col gap-2 w-full">
              {[
                { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard, color: "blue" },
                { id: "orders", label: "Commandes", icon: ShoppingBag, color: "fuchsia", badge: orders.filter(o => o.status === "Nouvelle").length },
                { id: "catalog", label: "Catalogue Pièces", icon: Package, color: "violet" },
                { id: "database", label: "Base de données", icon: Database, color: "amber" },
                { id: "journal", label: "Journal SEO", icon: BookOpen, color: "orange" },
                { id: "factures", label: "Factures", icon: FileText, color: "emerald" },
                { id: "users", label: "Utilisateurs", icon: Users, color: "cyan" },
                { id: "security", label: "Sécurité (MFA)", icon: ShieldCheck, color: "rose" },
                { id: "settings", label: "Paramètres Site", icon: Settings, color: "blue" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                const colorClasses: Record<string, { bg: string, border: string, text: string, shadow: string }> = {
                  blue: { bg: "bg-blue-600/15", border: "border-blue-500/30", text: "text-blue-400", shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]" },
                  fuchsia: { bg: "bg-fuchsia-600/15", border: "border-fuchsia-500/30", text: "text-fuchsia-400", shadow: "shadow-[0_0_15px_rgba(217,70,239,0.1)]" },
                  violet: { bg: "bg-violet-600/15", border: "border-violet-500/30", text: "text-violet-400", shadow: "shadow-[0_0_15px_rgba(139,92,246,0.1)]" },
                  amber: { bg: "bg-amber-600/15", border: "border-amber-500/30", text: "text-amber-400", shadow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]" },
                  orange: { bg: "bg-orange-600/15", border: "border-orange-500/30", text: "text-orange-400", shadow: "shadow-[0_0_15px_rgba(249,115,22,0.1)]" },
                  emerald: { bg: "bg-emerald-600/15", border: "border-emerald-500/30", text: "text-emerald-400", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]" },
                  rose: { bg: "bg-rose-600/15", border: "border-rose-500/30", text: "text-rose-400", shadow: "shadow-[0_0_15px_rgba(244,63,94,0.1)]" },
                  cyan: { bg: "bg-cyan-600/15", border: "border-cyan-500/30", text: "text-cyan-400", shadow: "shadow-[0_0_15px_rgba(6,182,212,0.1)]" }
                };
                
                const style = colorClasses[tab.color];

                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all text-left w-full cursor-pointer z-10 ${
                      isActive
                        ? `${style.text} ${style.shadow}`
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className={`absolute inset-0 rounded-lg ${style.bg} border ${style.border} -z-10`}
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 shrink-0 relative z-10" />
                    <span className="flex-1 relative z-10">{tab.label}</span>
                    {tab.badge && tab.badge > 0 ? (
                      <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full leading-none relative z-10 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors w-full cursor-pointer text-left font-sans"
              >
                <Lock className="w-4 h-4 shrink-0 relative z-10" />
                <span className="flex-1 relative z-10 font-bold uppercase tracking-widest">Déconnexion</span>
              </button>
            </div>

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
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] transition-all relative overflow-hidden group shadow-[0_0_0_rgba(59,130,246,0)] hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] hover:border-blue-500/30 backdrop-blur-sm"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px] group-hover:bg-blue-500/20 transition-colors"></div>
                    <TrendingUp className="w-5 h-5 text-blue-400 absolute top-5 right-5 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Chiffre d'Affaires Brut</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {totalRevenue.toLocaleString('fr-FR')} FCFA
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">Ventes réelles enregistrées</p>
                  </motion.div>

                  {/* Orders Widget */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] transition-all relative overflow-hidden group shadow-[0_0_0_rgba(217,70,239,0)] hover:shadow-[0_10px_40px_rgba(217,70,239,0.15)] hover:border-fuchsia-500/30 backdrop-blur-sm"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-[30px] group-hover:bg-fuchsia-500/20 transition-colors"></div>
                    <ShoppingBag className="w-5 h-5 text-fuchsia-400 absolute top-5 right-5 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Commandes</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {orders.length}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">
                      {pendingOrders} en attente · {shippedOrders} expédiées
                    </p>
                  </motion.div>

                  {/* Avg Cart Widget */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] transition-all relative overflow-hidden group shadow-[0_0_0_rgba(16,185,129,0)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 backdrop-blur-sm"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-colors"></div>
                    <CheckCircle className="w-5 h-5 text-emerald-400 absolute top-5 right-5 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Panier Moyen</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {orders.length > 0 
                        ? Math.round(totalRevenue / orders.length).toLocaleString('fr-FR')
                        : "0"
                      } FCFA
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">Moyenne par panier client</p>
                  </motion.div>

                  {/* Catalog size Widget */}
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="p-5 border border-white/10 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] transition-all relative overflow-hidden group shadow-[0_0_0_rgba(139,92,246,0)] hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)] hover:border-violet-500/30 backdrop-blur-sm"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-[30px] group-hover:bg-violet-500/20 transition-colors"></div>
                    <Package className="w-5 h-5 text-violet-400 absolute top-5 right-5 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Articles Actifs</span>
                    <span className="font-display font-semibold text-2xl text-white tracking-wide">
                      {products.length}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase">Abayas, Manteaux, Vermeils</p>
                  </motion.div>
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
                  <div className="flex items-center gap-2">
                    {selectedOrderIds.length > 0 && (
                      <select
                        onChange={(e) => handleBulkUpdateOrderStatus(e.target.value as Order["status"])}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-white/10 text-white border border-white/20 focus:outline-none cursor-pointer"
                        value=""
                      >
                        <option value="" disabled className="bg-[#02040a] text-slate-400">Modifier {selectedOrderIds.length} statuts</option>
                        <option value="Nouvelle" className="bg-[#02040a] text-white">Nouvelle</option>
                        <option value="En préparation" className="bg-[#02040a] text-white">En préparation</option>
                        <option value="Expédiée" className="bg-[#02040a] text-white">Expédiée</option>
                        <option value="Livrée" className="bg-[#02040a] text-white">Livrée</option>
                      </select>
                    )}
                    <button
                      onClick={handleExportOrdersCSV}
                      className="px-3 py-1 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded text-[10px] text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <span className="px-3 py-1 border border-white/10 rounded-full text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      {orders.length} Commande{orders.length > 1 ? "s" : ""}
                    </span>
                  </div>
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
                    <div className="flex items-center gap-2 px-5 py-2">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length === orders.length && orders.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOrderIds(orders.map(o => o.id));
                          else setSelectedOrderIds([]);
                        }}
                        className="w-4 h-4 rounded border-white/10 cursor-pointer accent-blue-500"
                      />
                      <span className="text-[10px] uppercase font-bold text-slate-400">Sélectionner tout</span>
                    </div>
                    {orders.map((order, index) => {
                      const isExpanded = expandedOrderId === order.id;
                      return (
                        <motion.div 
                          key={order.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="border border-white/10 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-md transition-all overflow-hidden flex flex-col font-sans hover:border-white/20 hover:shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                        >
                          {/* Order Header Summary */}
                          <header className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.005]">
                            <div className="flex flex-wrap items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedOrderIds.includes(order.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, order.id]);
                                  else setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.id));
                                }}
                                className="w-4 h-4 rounded border-white/10 cursor-pointer accent-blue-500"
                              />
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
                                onChange={(e) => handleUpdateOrderStatusWithEmail(order.id, e.target.value as Order["status"])}
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
                                onClick={() => setPrintingOrder(order)}
                                className="px-3 py-1.5 border border-white/10 hover:border-white/20 text-[10px] text-slate-300 font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" /> Facture
                              </button>

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
                                    <span className="text-slate-500 font-bold uppercase w-24">Expédition :</span>
                                    <span className={`font-bold ${order.deliveryOption === "dakar" ? "text-blue-400" : "text-fuchsia-400"}`}>
                                      {order.deliveryOption === "dakar" ? "Dakar Express (Gratuit)" : "Hors Dakar (+3 000 FCFA)"}
                                    </span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-24">Paiement :</span>
                                    <span className="font-semibold text-slate-300">
                                      {order.paymentMethod === "online" ? "💳 En ligne (Wave/OM/Carte)" : "💵 À la livraison"}
                                    </span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-24">Règlement :</span>
                                    <span className={`font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider ${
                                      order.paymentStatus === "Payé"
                                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                        : order.paymentStatus === "À la livraison"
                                        ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                                        : "bg-red-500/10 border border-red-500/20 text-red-400"
                                    }`}>
                                      {order.paymentStatus || "À la livraison"}
                                    </span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-24">Sous-total :</span>
                                    <span className="font-mono text-white font-semibold">{order.subtotal.toLocaleString('fr-FR')} FCFA</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <span className="text-slate-500 font-bold uppercase w-24">TVA (18% incl.) :</span>
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
                        </motion.div>
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

                    {selectedProductIds.length > 0 && (
                      <select
                        onChange={(e) => handleBulkToggleVisibility(e.target.value === "true")}
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 focus:outline-none cursor-pointer"
                        value=""
                      >
                        <option value="" disabled className="bg-[#02040a] text-slate-400">Modifier {selectedProductIds.length} statuts</option>
                        <option value="true" className="bg-[#02040a] text-emerald-400">Rendre Visible</option>
                        <option value="false" className="bg-[#02040a] text-slate-400">Cacher</option>
                      </select>
                    )}

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
                          <th className="px-5 py-3 w-10">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedProductIds(filteredProducts.map(p => p.id));
                                else setSelectedProductIds([]);
                              }}
                              className="w-4 h-4 rounded border-white/10 cursor-pointer accent-blue-500"
                            />
                          </th>
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
                            <td colSpan={6} className="px-5 py-12 text-center text-slate-500 uppercase font-semibold">
                              Aucun article ne correspond à votre recherche.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((product, index) => (
                            <motion.tr 
                              key={product.id} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03, duration: 0.3 }}
                              className={`hover:bg-white/[0.02] backdrop-blur-sm transition-all group ${product.visible === false ? 'opacity-50 grayscale' : ''}`}
                            >
                              <td className="px-5 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedProductIds.includes(product.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedProductIds([...selectedProductIds, product.id]);
                                    else setSelectedProductIds(selectedProductIds.filter(id => id !== product.id));
                                  }}
                                  className="w-4 h-4 rounded border-white/10 cursor-pointer accent-blue-500"
                                />
                              </td>
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
                              <td className="px-5 py-3 text-right font-mono font-bold">
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                  <div className="text-[10px] text-slate-500 line-through font-normal mb-0.5 leading-none">
                                    {product.compareAtPrice.toLocaleString('fr-FR')} FCFA
                                  </div>
                                )}
                                <div className="text-white leading-none">
                                  {product.price.toLocaleString('fr-FR')} FCFA
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex justify-center items-center gap-2">
                                  <button
                                    onClick={() => onUpdateProductVisibility(product.id, product.visible === false ? true : false)}
                                    className="px-2 py-1.5 border border-white/10 hover:border-white/20 text-slate-400 rounded transition-colors flex items-center justify-center cursor-pointer"
                                    title={product.visible === false ? "Rendre visible" : "Cacher"}
                                  >
                                    {product.visible === false ? <Eye className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                                  </button>
                                  <button
                                    onClick={() => onDuplicateProduct(product)}
                                    className="px-2.5 py-1.5 border border-white/10 hover:border-white/20 text-slate-300 rounded transition-colors flex items-center gap-1 cursor-pointer font-bold uppercase text-[9px]"
                                    title="Dupliquer"
                                  >
                                    <Copy className="w-3 h-3" /> Copier
                                  </button>
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
                            </motion.tr>
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

            {/* ======================================================== */}
            {/* =================== TAB 5: FACTURES ==================== */}
            {/* ======================================================== */}
            {activeTab === "factures" && (
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Gestion des Factures</h3>
                  <p className="text-[10px] text-slate-400">Générez et imprimez les factures pour toutes les commandes traitées.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.length === 0 ? (
                    <div className="col-span-full p-8 border border-white/10 rounded-xl text-center">
                      <p className="text-xs text-slate-500 uppercase">Aucune facture disponible.</p>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="p-5 border border-white/10 bg-white/[0.01] rounded-xl flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold font-mono text-emerald-400">FACTURE {order.id}</span>
                            <span className="text-[10px] text-slate-500">{order.date}</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{order.customerName}</p>
                          <p className="text-xs text-slate-400 font-mono mt-1">{order.total.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <button
                          onClick={() => setPrintingOrder(order)}
                          className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" /> Voir Facture
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* =================== TAB 6: JOURNAL ===================== */}
            {/* ======================================================== */}
            {activeTab === "journal" && (
              <div className="space-y-6 max-w-xl mx-auto py-4">
                <div className="text-center p-8 border border-white/10 bg-white/[0.01] rounded-2xl flex flex-col items-center justify-center">
                  <BookOpen className="w-12 h-12 text-orange-400 mb-4 stroke-[1.5]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Module Journal SEO (Actif)</h3>
                  <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
                    Le module Journal de Bord (Blog SEO) est accessible directement depuis l'interface client. Pour rédiger, publier ou supprimer des articles, rendez-vous sur la page Journal de la boutique en tant qu'administrateur.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Aller au Journal
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* =================== TAB 7: SECURITE (MFA) ============== */}
            {/* ======================================================== */}
            {activeTab === "security" && (
              <div className="space-y-6 max-w-xl mx-auto py-4 font-sans text-slate-300">
                {/* Header title */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Double Authentification (MFA)</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-1">
                    Sécurité Cryptographique de la Console
                  </p>
                </div>

                {/* Notifications Alert */}
                {mfaError && (
                  <div className="flex items-center gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{mfaError}</span>
                  </div>
                )}
                {mfaSuccess && (
                  <div className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-3 px-4 rounded-xl">
                    <CheckCircle className="w-4 h-4 shrink-0 animate-pulse" />
                    <span>{mfaSuccess}</span>
                  </div>
                )}

                {isLoadingMfa ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <span className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></span>
                    <span className="text-xs uppercase font-mono tracking-widest text-slate-500">Traitement sécurisé...</span>
                  </div>
                ) : mfaEnrollData ? (
                  // ENROLLING PROCESS
                  <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 space-y-6 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-full blur-[40px]"></div>
                    
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">1. Scannez le QR Code</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Ouvrez votre application d'authentification (Google Authenticator, Authy, Microsoft Authenticator...) et scannez ce code.
                      </p>
                      <div className="bg-white p-3.5 rounded-2xl w-44 h-44 flex items-center justify-center mx-auto shadow-2xl border border-white/15 my-4">
                        <img 
                          src={mfaEnrollData.totp.qr_code} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">2. Clé Secrète Alternative</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Si vous ne pouvez pas scanner, saisissez manuellement cette clé secrète dans votre application :
                      </p>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-xl font-mono text-xs select-all mt-2">
                        <span className="text-slate-300 font-bold uppercase tracking-widest flex-1 truncate">{mfaEnrollData.totp.secret}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(mfaEnrollData.totp.secret);
                            setMfaSuccess("✓ Clé de sécurité copiée !");
                            setTimeout(() => setMfaSuccess(""), 3000);
                          }} 
                          className="text-slate-400 hover:text-white cursor-pointer transition-colors p-1"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-white/5 pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">3. Validation</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Saisissez le code à 6 chiffres généré par votre application pour valider l'activation :
                      </p>
                      <div className="flex gap-3 mt-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Code"
                          value={enrollVerificationCode}
                          onChange={(e) => setEnrollVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                          onKeyDown={(e) => e.key === "Enter" && handleVerifyMfaEnroll()}
                          className="w-32 text-center font-bold tracking-[0.2em] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-rose-500 focus:outline-none text-sm text-white"
                        />
                        <button
                          onClick={handleVerifyMfaEnroll}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                        >
                          Activer la MFA
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setMfaEnrollData(null);
                          setEnrollVerificationCode("");
                          setMfaError("");
                        }}
                        className="w-full text-center text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest mt-2 cursor-pointer font-bold block"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : mfaEnabled ? (
                  // MFA IS ACTIVE
                  <div className="border border-emerald-500/20 bg-emerald-500/[0.02] rounded-2xl p-6 text-center space-y-6 backdrop-blur-md relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.05)]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-[40px]"></div>
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto stroke-[1.2] drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse" />
                    
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>Compte Hautement Sécurisé</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">Double Authentification Activée</h4>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Chaque connexion à la console Myriam Veil nécessite désormais la validation par code TOTP cryptographique depuis votre appareil mobile.
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-5 max-w-xs mx-auto">
                      <button
                        onClick={handleDisableMfa}
                        className="w-full py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 border border-white/10 hover:border-red-500/25 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Désactiver la MFA
                      </button>
                    </div>
                  </div>
                ) : (
                  // MFA IS INACTIVE
                  <div className="border border-white/10 bg-white/[0.01] rounded-2xl p-6 text-center space-y-6 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full blur-[40px]"></div>
                    <Lock className="w-12 h-12 text-rose-500 mx-auto stroke-[1.2] drop-shadow-[0_0_15px_rgba(244,63,94,0.15)]" />
                    
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono tracking-widest text-amber-400 uppercase">
                        <span>Sécurité Standard</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">La MFA n'est pas activée</h4>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                        Renforcez instantanément la sécurité de vos données de catalogue, commandes et blog en activant l'authentification à double facteur (TOTP).
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-5 max-w-xs mx-auto">
                      <button
                        onClick={handleStartMfaEnroll}
                        className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-fuchsia-600 hover:brightness-110 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
                      >
                        Configurer la MFA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* =================== TAB 8: PARAMETRES SITE ============= */}
            {/* ======================================================== */}
            {activeTab === "settings" && (
              <div className="space-y-8 max-w-4xl mx-auto py-4 font-sans text-slate-300">
                {/* Header title */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Paramètres Généraux de la Boutique</h3>
                      <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                        Personnalisation Éditoriale, Contacts, Réseaux Sociaux & SEO
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateHomepageContent(settingsForm);
                      alert("✓ Paramètres de la boutique mis à jour localement ! N'oubliez pas de cliquer sur SAUVEGARDER en haut à droite pour les enregistrer définitivement.");
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:brightness-110 hover:-translate-y-0.5 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-500/10 cursor-pointer active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" /> Mettre à jour
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SECTION 1: ACCUEIL & HERO */}
                  <div className="p-6 border border-white/15 bg-white/[0.01] rounded-2xl space-y-4 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-[30px]"></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-blue-400" /> Accueil & Hero
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nom / Texte Logo</label>
                        <input
                          type="text"
                          value={settingsForm.logoText || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="MYRIAM VEIL"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Badge d'en-tête Héro</label>
                        <input
                          type="text"
                          value={settingsForm.heroBadge || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Titre Principal Héro</label>
                        <textarea
                          rows={2}
                          value={settingsForm.heroTitle || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sous-titre Héro</label>
                        <textarea
                          rows={2}
                          value={settingsForm.heroSubtitle || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Bouton CTA</label>
                          <input
                            type="text"
                            value={settingsForm.heroCtaText || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, heroCtaText: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                            placeholder="Découvrir"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Arrière-plan URL</label>
                          <input
                            type="text"
                            value={settingsForm.heroBgUrl || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, heroBgUrl: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: COORDONNEES & CONTACT */}
                  <div className="p-6 border border-white/15 bg-white/[0.01] rounded-2xl space-y-4 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-[30px]"></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" /> Contacts & WhatsApp
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Téléphone Principal</label>
                          <input
                            type="text"
                            value={settingsForm.contactPhone || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Téléphone Secours</label>
                          <input
                            type="text"
                            value={settingsForm.contactSecPhone || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, contactSecPhone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email de Contact</label>
                        <input
                          type="email"
                          value={settingsForm.contactEmail || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Adresse Physique</label>
                        <input
                          type="text"
                          value={settingsForm.contactAddress || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactAddress: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Numéro WhatsApp</label>
                          <input
                            type="text"
                            value={settingsForm.whatsappNumber || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                            placeholder="Ex: 221773194279"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Message d'intro</label>
                          <input
                            type="text"
                            value={settingsForm.whatsappMessage || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappMessage: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: RESEAUX SOCIAUX */}
                  <div className="p-6 border border-white/15 bg-white/[0.01] rounded-2xl space-y-4 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/5 rounded-full blur-[30px]"></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-400" /> Réseaux Sociaux
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Lien Instagram</label>
                        <input
                          type="text"
                          value={settingsForm.instagramUrl || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="https://www.instagram.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Lien Facebook</label>
                        <input
                          type="text"
                          value={settingsForm.facebookUrl || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="https://www.facebook.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Lien TikTok</label>
                        <input
                          type="text"
                          value={settingsForm.tiktokUrl || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="https://www.tiktok.com/@..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: NOTRE HISTOIRE */}
                  <div className="p-6 border border-white/15 bg-white/[0.01] rounded-2xl space-y-4 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-[30px]"></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-orange-400" /> Notre Histoire
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Titre de la Section</label>
                        <input
                          type="text"
                          value={settingsForm.historyTitle || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, historyTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Hommage / Sous-titre</label>
                        <input
                          type="text"
                          value={settingsForm.historySubtitle || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, historySubtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Texte Principal de l'Histoire</label>
                        <textarea
                          rows={4}
                          value={settingsForm.historyText || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, historyText: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: REASSURANCE & CONFIANCE */}
                  <div className="p-6 border border-white/15 bg-white/[0.01] rounded-2xl space-y-4 backdrop-blur-md relative overflow-hidden md:col-span-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full blur-[40px]"></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber-400" /> Réassurance & Confiance
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Chiffre Clients</label>
                            <input
                              type="text"
                              value={settingsForm.statsClients || ""}
                              onChange={(e) => setSettingsForm({ ...settingsForm, statsClients: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                              placeholder="2 500+"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Note Moyenne</label>
                            <input
                              type="text"
                              value={settingsForm.statsRating || ""}
                              onChange={(e) => setSettingsForm({ ...settingsForm, statsRating: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                              placeholder="4.9/5"
                            />
                          </div>
                        </div>
                        
                        <div className="p-3 border border-white/5 bg-white/[0.005] rounded-xl space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Avantage 01 (Livraison)</span>
                          <input
                            type="text"
                            value={settingsForm.reassurance1?.title || ""}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              reassurance1: { ...settingsForm.reassurance1!, title: e.target.value }
                            })}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] focus:border-blue-500 focus:outline-none"
                            placeholder="Titre"
                          />
                          <textarea
                            rows={2}
                            value={settingsForm.reassurance1?.desc || ""}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              reassurance1: { ...settingsForm.reassurance1!, desc: e.target.value }
                            })}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] focus:border-blue-500 focus:outline-none"
                            placeholder="Description"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-3 border border-white/5 bg-white/[0.005] rounded-xl space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Avantage 02 (Paiement)</span>
                          <input
                            type="text"
                            value={settingsForm.reassurance2?.title || ""}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              reassurance2: { ...settingsForm.reassurance2!, title: e.target.value }
                            })}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] focus:border-blue-500 focus:outline-none"
                            placeholder="Titre"
                          />
                          <textarea
                            rows={2}
                            value={settingsForm.reassurance2?.desc || ""}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              reassurance2: { ...settingsForm.reassurance2!, desc: e.target.value }
                            })}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] focus:border-blue-500 focus:outline-none"
                            placeholder="Description"
                          />
                        </div>

                        <div className="p-3 border border-white/5 bg-white/[0.005] rounded-xl space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Avantage 03 (Support)</span>
                          <input
                            type="text"
                            value={settingsForm.reassurance3?.title || ""}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              reassurance3: { ...settingsForm.reassurance3!, title: e.target.value }
                            })}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] focus:border-blue-500 focus:outline-none"
                            placeholder="Titre"
                          />
                          <textarea
                            rows={2}
                            value={settingsForm.reassurance3?.desc || ""}
                            onChange={(e) => setSettingsForm({
                              ...settingsForm,
                              reassurance3: { ...settingsForm.reassurance3!, desc: e.target.value }
                            })}
                            className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-[11px] focus:border-blue-500 focus:outline-none"
                            placeholder="Description"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 6: SEO & REFERENCEMENT */}
                  <div className="p-6 border border-white/15 bg-white/[0.01] rounded-2xl space-y-4 backdrop-blur-md relative overflow-hidden md:col-span-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-600/5 rounded-full blur-[40px]"></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-fuchsia-400" /> SEO & Référencement Google
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Balise Titre (SEO Title)</label>
                        <input
                          type="text"
                          value={settingsForm.seoTitle || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, seoTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="Maison Myriam Veil | L'Élégance de la Pudeur"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Description Méta (Meta Description)</label>
                        <textarea
                          rows={3}
                          value={settingsForm.seoDescription || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, seoDescription: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:border-blue-500 focus:outline-none"
                          placeholder="Saisissez la description de la boutique qui apparaîtra dans les résultats de recherche de Google..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom submit block */}
                <div className="pt-6 border-t border-white/10 flex justify-end">
                  <button
                    onClick={() => {
                      onUpdateHomepageContent(settingsForm);
                      alert("✓ Paramètres mis à jour avec succès ! Pensez à cliquer sur SAUVEGARDER en haut de la console pour figer vos modifications.");
                    }}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-fuchsia-600 border border-white/10 hover:brightness-110 hover:-translate-y-0.5 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-pointer active:scale-[0.98]"
                  >
                    <Save className="w-4 h-4 animate-pulse" /> Enregistrer les Paramètres
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* =================== TAB 9: UTILISATEURS ================ */}
            {/* ======================================================== */}
            {activeTab === "users" && (
              <UsersTabContent />
            )}
          </main>
        </div>

        {/* 3. FOOTER */}
        <footer className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex justify-between items-center text-[10px] tracking-wider text-slate-500 uppercase relative z-10 shrink-0 font-sans backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <span>Console locale active</span>
          </div>
          <span>Maison Myriam Veil · Dakar, Sénégal</span>
        </footer>
      </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ================================================================
// USERS TAB COMPONENT — Gestion des utilisateurs et rôles admin
// ================================================================
function UsersTabContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Assign role modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] = useState<"super_admin" | "editor" | "logistician">("editor");
  const [assigning, setAssigning] = useState(false);

  const fetchUsers = async () => {
    if (!isSupabaseConfigured()) {
      setError("Supabase n'est pas configuré. Impossible de gérer les utilisateurs.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Récupérer les utilisateurs depuis la table admin_roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('admin_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Récupérer les utilisateurs depuis auth.users via la fonction RPC
      const { data: authUsers, error: usersError } = await supabase.rpc('get_all_users');

      if (usersError) {
        // Fallback: on utilise seulement les données de admin_roles
        setUsers(adminRoles || []);
      } else {
        // Fusionner les données
        const merged = (authUsers || []).map((au: any) => {
          const role = (adminRoles || []).find((r: any) => r.user_id === au.id);
          return {
            id: au.id,
            email: au.email,
            created_at: au.created_at,
            last_sign_in_at: au.last_sign_in_at,
            role: role?.role || null,
            approved_at: role?.approved_at || null,
          };
        });
        setUsers(merged);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssignRole = async () => {
    if (!assignEmail.trim()) {
      setError("Veuillez saisir une adresse email.");
      return;
    }
    setAssigning(true);
    setError("");
    setSuccess("");
    try {
      const { data, error } = await supabase.rpc('assign_admin_role', {
        target_email: assignEmail.trim(),
        target_role: assignRole,
      });
      if (error) throw error;
      setSuccess(`✓ ${data || "Rôle assigné avec succès !"}`);
      setAssignEmail("");
      setAssignModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'assignation du rôle.");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (userId: string, email: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer le rôle admin de ${email} ?`)) return;
    setError("");
    setSuccess("");
    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
      setSuccess(`✓ Rôle retiré pour ${email}`);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors du retrait du rôle.");
    }
  };

  const handleChangeRole = async (userId: string, email: string, newRole: string) => {
    setError("");
    setSuccess("");
    try {
      const { data, error } = await supabase.rpc('assign_admin_role', {
        target_email: email,
        target_role: newRole,
      });
      if (error) throw error;
      setSuccess(`✓ Rôle de ${email} mis à jour en ${newRole}`);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors du changement de rôle.");
    }
  };

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleBadge = (role: string | null) => {
    if (!role) return null;
    const styles: Record<string, string> = {
      super_admin: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      editor: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      logistician: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    };
    const labels: Record<string, string> = {
      super_admin: "Super Admin",
      editor: "Éditeur",
      logistician: "Logisticien",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${styles[role] || "bg-slate-500/10 border-slate-500/30 text-slate-400"}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4 font-sans text-slate-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gestion des Utilisateurs</h3>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
              Gérez les rôles et accès à la console d'administration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher un email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs text-white focus:border-cyan-500 focus:outline-none placeholder:text-slate-500 w-48"
            />
          </div>
          <button
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" /> Assigner un rôle
          </button>
          <button
            onClick={fetchUsers}
            className="p-2 border border-white/10 hover:border-white/20 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-3 px-4 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0 animate-pulse" />
          <span>{success}</span>
        </div>
      )}

      {/* Assign Role Modal */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#02040a] text-slate-300 max-w-sm w-full rounded-2xl shadow-2xl border border-white/10 p-6 relative flex flex-col font-sans">
            <button
              onClick={() => setAssignModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mt-3 mb-5">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 mb-3">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-[0.15em] text-white">Assigner un Rôle Admin</h3>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                Donnez l'accès à la console d'administration à un utilisateur existant.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email de l'utilisateur</label>
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAssignRole()}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-cyan-500 focus:outline-none text-xs"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rôle</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-cyan-500 focus:outline-none text-xs cursor-pointer"
                >
                  <option value="editor" className="bg-[#02040a]">Éditeur (Gestion catalogue & commandes)</option>
                  <option value="logistician" className="bg-[#02040a]">Logisticien (Gestion commandes uniquement)</option>
                  <option value="super_admin" className="bg-[#02040a]">Super Admin (Accès complet)</option>
                </select>
              </div>
              <button
                onClick={handleAssignRole}
                disabled={assigning}
                className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white rounded-lg font-bold text-xs uppercase tracking-[0.15em] cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {assigning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Assignation...</span>
                  </>
                ) : (
                  "Assigner le Rôle"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></span>
          <span className="text-xs uppercase font-mono tracking-widest text-slate-500">Chargement des utilisateurs...</span>
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Rôle Actuel</th>
                  <th className="px-5 py-3">Inscrit le</th>
                  <th className="px-5 py-3">Dernière Connexion</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-light font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 uppercase font-semibold">
                      {searchQuery ? "Aucun utilisateur trouvé." : "Aucun utilisateur chargé."}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                      className="hover:bg-white/[0.02] backdrop-blur-sm transition-all"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-semibold text-white">{user.email || "Inconnu"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {user.role ? (
                          roleBadge(user.role)
                        ) : (
                          <span className="text-slate-500 text-[10px] uppercase tracking-wider">Aucun rôle</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-[10px]">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : "---"}
                      </td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-[10px]">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : "Jamais"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center items-center gap-2">
                          {user.role ? (
                            <>
                              <select
                                value={user.role}
                                onChange={(e) => handleChangeRole(user.id, user.email, e.target.value)}
                                className="text-[9px] font-bold uppercase tracking-wider px-2 py-1.5 rounded bg-white/5 border border-white/10 text-slate-300 focus:outline-none cursor-pointer"
                              >
                                <option value="editor" className="bg-[#02040a]">Éditeur</option>
                                <option value="logistician" className="bg-[#02040a]">Logisticien</option>
                                <option value="super_admin" className="bg-[#02040a]">Super Admin</option>
                              </select>
                              <button
                                onClick={() => handleRemoveRole(user.id, user.email)}
                                className="size-7 border border-white/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center rounded transition-colors cursor-pointer"
                                title="Retirer le rôle"
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setAssignEmail(user.email);
                                setAssignModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 border border-white/10 hover:border-cyan-500/30 hover:text-cyan-400 text-slate-400 rounded transition-colors flex items-center gap-1 cursor-pointer font-bold uppercase text-[9px]"
                            >
                              <Shield className="w-3 h-3" /> Attribuer
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="p-4 border border-white/5 bg-white/[0.005] rounded-xl text-[10px] text-slate-500 leading-relaxed">
        <p className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            Les rôles sont stockés dans la table <code className="text-cyan-400 font-mono">admin_roles</code> de Supabase.
            Les utilisateurs doivent se déconnecter et se reconnecter pour que leur nouveau rôle soit pris en compte dans le JWT.
          </span>
        </p>
      </div>
    </div>
  );
}
