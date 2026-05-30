/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { CollectionId, Product, CartItem, HomepageContent, Order } from "./types";
import { PRODUCTS, DEFAULT_HOMEPAGE_CONTENT } from "./data";
import { 
  X, ArrowRight, Heart, Sparkles, User, Info, HelpCircle, 
  Lock, Key, Pencil, Trash2, Plus, AlertCircle, LayoutDashboard, Eye, EyeOff 
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import TopAppBar from "./components/TopAppBar";
import BottomNav from "./components/BottomNav";
import UniversalCart from "./components/UniversalCart";
import LandingPage from "./components/LandingPage";
import OrigineEntry from "./components/OrigineEntry";
import CollectionCouture from "./components/CollectionCouture";
import CollectionEcrin from "./components/CollectionEcrin";
import CollectionHeritage from "./components/CollectionHeritage";
import AdminDashboard from "./components/AdminDashboard";
import JournalHome from "./components/JournalHome";
import JournalArticle from "./components/JournalArticle";
import SEO from "./components/SEO";
import { authService } from "./authService";
import { dataService } from "./dataService";

import { useCartStore } from "./store/useCartStore";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const {
    appStage,
    currentCollection,
    currentArticleSlug,
    isCartOpen,
    isMenuOpen,
    setAppStage,
    setCurrentCollection,
    setCurrentArticleSlug,
    setIsCartOpen,
    setIsMenuOpen,
    selectCollectionLine,
    handleEnterCollection
  } = useAppStore();

  const {
    cartItems,
    cartCount,
    addToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart
  } = useCartStore();

  const handleAddToCart = (product: Product, selectedSize?: string) => {
    addToCart(product, selectedSize);
    setIsCartOpen(true);
  };

  // --- Admin Mode Database States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentSuccessOrder, setPaymentSuccessOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Initial fetch from Supabase (or local storage fallback)
    dataService.getProducts().then(setProducts);
    dataService.getHomepageContent().then(setHomepageContent);
    dataService.getOrders().then(setOrders);
  }, []);

  // Intercepter le retour de paiement PayTech
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const paymentStatus = queryParams.get("payment");
    const orderId = queryParams.get("orderId");

    if (paymentStatus === "success" && orderId) {
      const pendingStr = localStorage.getItem("mv_pending_checkout");
      if (pendingStr) {
        try {
          const pendingOrder = JSON.parse(pendingStr) as Order;
          if (pendingOrder.id === orderId) {
            // Mettre à jour le statut du paiement
            pendingOrder.paymentStatus = "Payé";
            
            // Ajouter la commande
            handlePlaceOrder(pendingOrder);
            
            // Afficher le modal majestueux
            setPaymentSuccessOrder(pendingOrder);
            
            // Nettoyer le stockage temporaire
            localStorage.removeItem("mv_pending_checkout");
          }
        } catch (e) {
          console.error("Erreur de parsing de la commande en attente:", e);
        }
      }
      
      // Nettoyer les paramètres d'URL
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (paymentStatus === "cancel" && orderId) {
      alert(`Le paiement de votre commande ${orderId} a été annulé ou a échoué. Vous pouvez la valider à nouveau dans votre panier.`);
      
      // Nettoyer les paramètres d'URL
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Sync orders state to client-side localStorage
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("myriam_veil_orders", JSON.stringify(orders));
    }
  }, [orders]);

  // Modals UI & Auth
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Double Authentification (MFA)
  const [loginStep, setLoginStep] = useState<"password" | "mfa">("password");
  const [mfaCode, setMfaCode] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Récupération de la session active Supabase au montage
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!authService.isConfigured()) return;
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return;

        // Vérifier le niveau d'assurance (MFA)
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalError) return;

        if (aalData.nextLevel === "aal2" && aalData.currentLevel === "aal1") {
          // MFA activée mais non vérifiée pour cette session
          setIsPasswordModalOpen(true);
          setLoginStep("mfa");
        } else if (aalData.currentLevel === "aal2" || (aalData.currentLevel === "aal1" && aalData.nextLevel === "aal1")) {
          // Déjà connecté avec succès (MFA validée ou non activée)
          setIsAdminMode(true);
        }
      } catch (err) {
        console.error("Erreur de restauration de la session:", err);
      }
    };
    checkActiveSession();
  }, []);

  // Secret keyboard shortcut to toggle admin portal (Ctrl+Shift+A)
  // AND URL check for /admin or /administration
  useEffect(() => {
    // Check URL
    if (window.location.pathname === "/admin" || window.location.pathname === "/administration") {
      if (!isAdminMode) {
        setIsPasswordModalOpen(true);
      } else {
        setIsAdminDashboardOpen(true);
      }
      // Remove the path from URL to keep it clean (optional, but good for aesthetics)
      window.history.replaceState({}, document.title, "/");
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsMenuOpen(false);
        if (isAdminMode) {
          setIsAdminDashboardOpen(prev => !prev);
        } else {
          setIsPasswordModalOpen(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdminMode]);

  // --- Admin Mode Database Operations ---
  const handleAdminLogin = async () => {
    if (!adminEmailInput.trim() || !adminPasswordInput) {
      setLoginErrorMessage("Veuillez renseigner tous les champs.");
      return;
    }

    setIsLoggingIn(true);
    setLoginErrorMessage("");
    setPasswordError(false);

    try {
      const user = await authService.login(adminEmailInput.trim(), adminPasswordInput);
      
      if (user.mfaRequired) {
        setLoginStep("mfa");
      } else {
        setIsAdminMode(true);
        setIsAdminDashboardOpen(true); // Open full console
        setIsPasswordModalOpen(false);
        setLoginStep("password");
        setAdminEmailInput("");
        setAdminPasswordInput("");
      }
    } catch (err: any) {
      setPasswordError(true);
      setLoginErrorMessage(err.message || "Adresse email ou mot de passe incorrect.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleMfaVerification = async () => {
    if (!mfaCode.trim() || mfaCode.trim().length !== 6) {
      setLoginErrorMessage("Veuillez saisir un code à 6 chiffres.");
      setPasswordError(true);
      return;
    }

    setIsLoggingIn(true);
    setLoginErrorMessage("");
    setPasswordError(false);

    try {
      await authService.verifyMfaLogin(mfaCode.trim());
      setIsAdminMode(true);
      setIsAdminDashboardOpen(true);
      setIsPasswordModalOpen(false);
      
      // Reset State
      setLoginStep("password");
      setMfaCode("");
      setAdminEmailInput("");
      setAdminPasswordInput("");
    } catch (err: any) {
      setPasswordError(true);
      setLoginErrorMessage(err.message || "Code incorrect. Veuillez réessayer.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Erreur de déconnexion:", err);
    } finally {
      setIsAdminMode(false);
      setIsAdminDashboardOpen(false);
    }
  };

  const handleSaveAll = () => {
    localStorage.setItem("myriam_veil_products", JSON.stringify(products));
    localStorage.setItem("myriam_veil_homepage", JSON.stringify(homepageContent));
    localStorage.setItem("myriam_veil_orders", JSON.stringify(orders));
    setHasUnsavedChanges(false);
  };

  const handleExportDb = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ products, homepageContent, orders }, null, 2)
    );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `myriam_veil_db_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDb = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.products && Array.isArray(json.products) && json.homepageContent) {
          setProducts(json.products);
          setHomepageContent(json.homepageContent);
          if (json.orders && Array.isArray(json.orders)) {
            setOrders(json.orders);
          }
          setHasUnsavedChanges(true);
          alert("✓ Base de données importée avec succès ! Pensez à SAUVEGARDER.");
        } else {
          alert("❌ Format de fichier JSON invalide.");
        }
      } catch {
        alert("❌ Erreur lors du décodage du fichier JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetSite = () => {
    localStorage.removeItem("myriam_veil_products");
    localStorage.removeItem("myriam_veil_homepage");
    localStorage.removeItem("myriam_veil_orders");
    setProducts(PRODUCTS);
    setHomepageContent(DEFAULT_HOMEPAGE_CONTENT);
    setOrders([]);
    setHasUnsavedChanges(false);
    setIsAdminDashboardOpen(false);
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    setHasUnsavedChanges(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setHasUnsavedChanges(true);
  };

  // --- Product Editing Operations ---
  const handleOpenAddProduct = (collectionId: "couture" | "ecrin" | "heritage") => {
    setProductForm({
      id: "",
      name: "",
      price: 0,
      collectionId,
      imageUrl: "",
      description: "",
      category: collectionId === "couture" ? "Manteaux" : collectionId === "ecrin" ? "Bagues" : "Abaya",
      sizes: collectionId === "couture" ? ["34", "36", "38"] : collectionId === "heritage" ? ["Taille Unique"] : undefined,
      composition: "",
      entretien: "",
      livraison: ""
    });
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductForm({ ...product });
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setHasUnsavedChanges(true);
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicated = { ...product, id: "", name: `${product.name} (Copie)` };
    setProductForm(duplicated);
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleUpdateProductVisibility = (productId: string, visible: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, visible } : p))
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveProductForm = () => {
    if (!productForm.name || !productForm.price || !productForm.imageUrl) {
      alert("Veuillez remplir le nom, le prix et l'URL de l'image.");
      return;
    }

    if (editingProduct) {
      // Editing existing
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? (productForm as Product) : p))
      );
    } else {
      // Adding new
      const newId = productForm.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);
      const newProduct: Product = {
        ...(productForm as Product),
        id: newId
      };
      setProducts((prev) => [...prev, newProduct]);
    }

    setIsProductModalOpen(false);
    setHasUnsavedChanges(true);
  };

  return (
    <div 
      className="min-h-screen text-slate-300 flex flex-col relative overflow-x-hidden font-sans select-none antialiased"
      style={{
        backgroundColor: "#02040a",
        backgroundImage: "radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.07) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(147, 51, 234, 0.05) 0%, transparent 50%), radial-gradient(circle at 25% 45%, rgba(217, 70, 239, 0.02) 0%, transparent 40%)",
        backgroundAttachment: "fixed"
      }}
    >
      <SEO title={homepageContent.seoTitle} description={homepageContent.seoDescription} />

      {/* 1. BRAND GLOBAL HEADER */}
      <TopAppBar
        currentCollection={currentCollection}
        onSetCollection={(col) => {
          if (col === "origins") {
            setAppStage("landing");
            setCurrentCollection("origins");
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            selectCollectionLine(col);
          }
        }}
        cartCount={cartCount}
        onToggleCart={() => setIsCartOpen(!isCartOpen)}
        onOpenMenu={() => setIsMenuOpen(true)}
        brandTitleOverride={appStage === "landing" ? (homepageContent.logoText || "MYRIAM VEIL") : undefined}
      />

      {/* 2. ADAPTIVE LINE VIEWPORT ROUTING WITH ANIMATIONS */}
      <main className="flex-1 w-full z-10 flex flex-col">
        <AnimatePresence mode="wait">
          {appStage === "landing" ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex-1 w-full"
            >
              <LandingPage 
                onEnterCollection={handleEnterCollection} 
                content={homepageContent}
                isAdminMode={isAdminMode}
                onUpdateContent={(newContent) => {
                  setHomepageContent(newContent);
                  setHasUnsavedChanges(true);
                }}
              />
            </motion.div>
          ) : appStage === "journal" ? (
            <motion.div
              key="journal-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex-1 w-full"
            >
              {currentArticleSlug ? <JournalArticle /> : <JournalHome />}
            </motion.div>
          ) : (
            <motion.div
              key={`collection-${currentCollection}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex-1 w-full"
            >
              {currentCollection === "origins" && (
                <OrigineEntry onSelectCollection={selectCollectionLine} />
              )}

              {currentCollection === "couture" && (
                <CollectionCouture
                  products={products.filter((p) => p.collectionId === "couture")}
                  onAddToCart={handleAddToCart}
                  isAdminMode={isAdminMode}
                  onEditProduct={handleOpenEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddProduct={handleOpenAddProduct}
                />
              )}

              {currentCollection === "ecrin" && (
                <CollectionEcrin
                  products={products.filter((p) => p.collectionId === "ecrin")}
                  onAddToCart={handleAddToCart}
                  isAdminMode={isAdminMode}
                  onEditProduct={handleOpenEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddProduct={handleOpenAddProduct}
                />
              )}

              {currentCollection === "heritage" && (
                <CollectionHeritage
                  products={products.filter((p) => p.collectionId === "heritage")}
                  onAddToCart={handleAddToCart}
                  isAdminMode={isAdminMode}
                  onEditProduct={handleOpenEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddProduct={handleOpenAddProduct}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. UNIVERSAL FLOATING NAV PILL */}
      {appStage === "collections" && (
        <BottomNav
          currentCollection={currentCollection}
          onSetCollection={selectCollectionLine}
          onToggleCart={() => setIsCartOpen(!isCartOpen)}
          cartCount={cartCount}
        />
      )}

      {/* 4. HIGH FIDELITY CART DRAWER */}
      <UniversalCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* 5. EDITORIAL SLIDE-OVER INDEX SELECTIONS DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Menu backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          />

          {/* Sidebar Area Container (Immersive Translucent glass) */}
          <div className="absolute inset-y-0 left-0 max-w-[400px] w-full bg-[#02040a]/85 backdrop-blur-lg shadow-2xl flex flex-col transform transition-transform duration-300 border-r border-white/10 text-slate-300">
            <header className="px-6 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <span className="font-display font-bold tracking-[0.2em] text-white text-sm md:text-base">
                Maison Myriam Veil
              </span>
              <button
                id="close-sidebar-menu-btn"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-400 hover:text-blue-400 transition-colors p-1 cursor-pointer"
              >
                <X className="w-6 h-6 stroke-[1.5]" />
              </button>
            </header>

            {/* List Links segment */}
            <nav className="flex-1 px-8 py-10 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-8">
                {/* L'Origine Entrypoint */}
                <button
                  id="menu-origins-link"
                  onClick={() => selectCollectionLine("origins")}
                  className={`w-full text-left uppercase group block focus:outline-none ${
                    currentCollection === "origins" ? "text-blue-400" : "text-slate-300"
                  }`}
                >
                  <p className="font-display tracking-[0.2em] text-[11px] font-semibold text-slate-500 group-hover:text-blue-400 transition-colors">
                    01 // Entrypoint
                  </p>
                  <h3 className="font-serif italic text-2xl mt-1 tracking-tight text-white group-hover:translate-x-1.5 transition-transform duration-300">
                    L'Origine
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 normal-case font-light">
                    Visualiser le portail d'accueil double division.
                  </p>
                </button>

                {/* Haute Couture */}
                <button
                  id="menu-couture-link"
                  onClick={() => selectCollectionLine("couture")}
                  className={`w-full text-left uppercase group block focus:outline-none ${
                    currentCollection === "couture" ? "text-blue-400" : "text-slate-300"
                  }`}
                >
                  <p className="font-display tracking-[0.2em] text-[11px] font-semibold text-slate-500 group-hover:text-blue-400 transition-colors">
                    02 // Ligne Sculptée
                  </p>
                  <h3 className="font-serif italic text-2xl mt-1 tracking-tight text-white group-hover:translate-x-1.5 transition-transform duration-300">
                    Haute Couture
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 normal-case font-light">
                    Manteau Architecte, vestes taillées et robes géométriques.
                  </p>
                </button>

                {/* L'Ecrin De Soie */}
                <button
                  id="menu-ecrin-link"
                  onClick={() => selectCollectionLine("ecrin")}
                  className={`w-full text-left uppercase group block focus:outline-none ${
                    currentCollection === "ecrin" ? "text-fuchsia-400" : "text-slate-300"
                  }`}
                >
                  <p className="font-display tracking-[0.2em] text-[11px] font-semibold text-slate-500 group-hover:text-fuchsia-400 transition-colors">
                    03 // Joaillerie fine
                  </p>
                  <h3 className="font-serif italic text-2xl mt-1 tracking-tight text-white group-hover:translate-x-1.5 transition-transform duration-300">
                    L'Écrin de Soie
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 normal-case font-light">
                    Alliances de perles de Pacifique et chaînages en vermeil d'or.
                  </p>
                </button>

                {/* L'Héritage */}
                <button
                  id="menu-heritage-link"
                  onClick={() => selectCollectionLine("heritage")}
                  className={`w-full text-left uppercase group block focus:outline-none ${
                    currentCollection === "heritage" ? "text-violet-400" : "text-slate-300"
                  }`}
                >
                  <p className="font-display tracking-[0.2em] text-[11px] font-semibold text-slate-500 group-hover:text-violet-400 transition-colors">
                    04 // Modest Apparel
                  </p>
                  <h3 className="font-serif italic text-2xl mt-1 tracking-tight text-white group-hover:translate-x-1.5 transition-transform duration-300">
                    L'Héritage
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 normal-case font-light">
                    En mémoire de Marieme Fall. Abayas de soie et voiles drapés.
                  </p>
                </button>

                {/* Le Journal */}
                <button
                  id="menu-journal-link"
                  onClick={() => setCurrentArticleSlug(null)}
                  className={`w-full text-left uppercase group block focus:outline-none ${
                    appStage === "journal" ? "text-[#b84b14]" : "text-slate-300"
                  }`}
                >
                  <p className="font-display tracking-[0.2em] text-[11px] font-semibold text-slate-500 group-hover:text-[#b84b14] transition-colors">
                    05 // Le Journal
                  </p>
                  <h3 className="font-serif italic text-2xl mt-1 tracking-tight text-white group-hover:translate-x-1.5 transition-transform duration-300">
                    Journal de Bord
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 normal-case font-light">
                    Histoires et inspirations de la parfumerie.
                  </p>
                </button>
              </div>

              {/* Sidebar footer block Info */}
              <div className="border-t border-white/10 pt-6 text-[10px] tracking-widest text-[#9C8B89] uppercase font-semibold flex flex-col gap-3 bg-transparent">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></span>
                  <span className="text-slate-400">Maison Dakaroise · Ateliers au Sénégal</span>
                </div>
                <div className="text-[9px] text-slate-500 font-light normal-case">
                  © {new Date().getFullYear()} @ Maison Myriam Veil. Tous droits réservés.
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* 6. PERSISTENT ADMIN FLOATING TRIGGER OR DASHBOARD PANEL */}
      {isAdminMode && (
        <>
          {/* Elegant floating pill in bottom-left corner to reopen dashboard */}
          <div className="fixed bottom-6 left-6 z-40 select-none">
            <button
              onClick={() => setIsAdminDashboardOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-fuchsia-600 border border-white/10 hover:brightness-110 hover:-translate-y-0.5 text-white rounded-full shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition-all duration-300 text-xs font-bold uppercase tracking-widest cursor-pointer active:scale-[0.98]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Console Admin</span>
              {orders.filter(o => o.status === "Nouvelle").length > 0 && (
                <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full leading-none">
                  {orders.filter(o => o.status === "Nouvelle").length}
                </span>
              )}
            </button>
          </div>

          <AdminDashboard
            isOpen={isAdminDashboardOpen}
            onClose={() => setIsAdminDashboardOpen(false)}
            products={products}
            orders={orders}
            homepageContent={homepageContent}
            onUpdateHomepageContent={(newContent) => {
              setHomepageContent(newContent);
              setHasUnsavedChanges(true);
            }}
            onAddProduct={(col) => {
              handleOpenAddProduct(col);
              setIsAdminDashboardOpen(false); // Close full console to edit in-place
            }}
            onEditProduct={(prod) => {
              handleOpenEditProduct(prod);
              setIsAdminDashboardOpen(false); // Close full console to edit in-place
            }}
            onDuplicateProduct={(prod) => {
              handleDuplicateProduct(prod);
              setIsAdminDashboardOpen(false);
            }}
            onUpdateProductVisibility={handleUpdateProductVisibility}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSave={handleSaveAll}
            onExport={handleExportDb}
            onImport={handleImportDb}
            onReset={handleResetSite}
            onLogout={handleAdminLogout}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </>
      )}

      {/* ======================================================== */}
      {/* ==================== ADMIN MODALS ====================== */}
      {/* ======================================================== */}

      {/* A. ADMIN PASSCODE LOGIN MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#02040a] text-slate-300 max-w-sm w-full rounded-2xl shadow-2xl border border-white/10 p-6 relative flex flex-col font-sans">
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setLoginErrorMessage("");
                setPasswordError(false);
                setLoginStep("password");
                setMfaCode("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mt-3 mb-5">
              {loginStep === "password" ? (
                <>
                  <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 mb-3 animate-pulse">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-[0.15em] text-white">Connexion Directeur</h3>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                    Connectez-vous à la console d'administration de la Maison.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mb-3 animate-pulse">
                    <Key className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-[0.15em] text-white">Code de Sécurité</h3>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                    Saisissez le code à 6 chiffres généré par votre application d'authentification (Google Authenticator, Authy...).
                  </p>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              {loginStep === "password" ? (
                <>
                  {/* Email Input */}
                  <div>
                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-xs"
                      autoFocus
                    />
                  </div>

                  {/* Password Input with view/hide toggle */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                      className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-xs font-semibold tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* MFA OTP Code Input */}
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Code à 6 chiffres"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleMfaVerification()}
                      className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-center text-sm font-bold tracking-[0.3em]"
                      autoFocus
                    />
                  </div>
                </>
              )}

              {/* Status & Error Display */}
              {passwordError && (
                <div className="flex flex-col gap-2 text-red-400 text-[10px] bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-lg text-left">
                  <div className="flex items-center gap-1.5 font-semibold justify-center">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginErrorMessage.includes("⚠️") ? "Erreur de Connexion" : loginErrorMessage}</span>
                  </div>
                  {loginErrorMessage.includes("⚠️") && (
                    <div className="mt-1 border-t border-red-500/25 pt-2 text-[9.5px] text-stone-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto pr-1">
                      {loginErrorMessage}
                    </div>
                  )}
                </div>
              )}

              {/* Submit trigger button */}
              {loginStep === "password" ? (
                <button
                  onClick={handleAdminLogin}
                  disabled={isLoggingIn}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-bold text-xs uppercase tracking-[0.15em] cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Vérification...</span>
                    </>
                  ) : (
                    "Se Connecter"
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleMfaVerification}
                    disabled={isLoggingIn}
                    className="w-full h-11 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/50 text-white rounded-lg font-bold text-xs uppercase tracking-[0.15em] cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Validation...</span>
                      </>
                    ) : (
                      "Valider le Code"
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setLoginStep("password");
                      setLoginErrorMessage("");
                      setPasswordError(false);
                      setMfaCode("");
                    }}
                    className="w-full text-center text-[10px] text-slate-400 hover:text-white font-bold uppercase tracking-widest mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    <span>Retour</span>
                  </button>
                </>
              )}

              {/* Supabase connection status indicator */}
              <div className="border-t border-white/5 pt-3 flex justify-center items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${authService.isConfigured() ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
                <span className="text-[8.5px] font-mono uppercase text-slate-500">
                  {authService.isConfigured() ? "Connecté · Supabase Auth" : "Non configuré · Variables d'env manquantes"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. PRODUCT ADD/EDIT FORM MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#02040a] text-slate-300 max-w-lg w-full rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh] font-sans my-8">
            <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.01]">
              <span className="font-display font-bold uppercase tracking-wider text-white text-sm md:text-base">
                {editingProduct ? "Modifier la pièce" : "Ajouter une pièce"}
              </span>
              <button 
                onClick={() => setIsProductModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm font-light">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nom de la pièce</label>
                  <input
                    type="text"
                    value={productForm.name || ""}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: abaya de soie"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Prix (en FCFA)</label>
                  <input
                    type="number"
                    value={productForm.price || 0}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={productForm.category || ""}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: Abaya, Bagues, Manteaux"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Tailles (séparées par virgules)</label>
                  <input
                    type="text"
                    value={productForm.sizes ? productForm.sizes.join(",") : ""}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value.split(",").map(s => s.trim()) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Ex: 36,38,40 ou Unique"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">URL de l'image</label>
                <input
                  type="text"
                  value={productForm.imageUrl || ""}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Ex: https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description || ""}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Composition (Optionnel)</label>
                <textarea
                  rows={2}
                  value={productForm.composition || ""}
                  onChange={(e) => setProductForm({ ...productForm, composition: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Entretien (Optionnel)</label>
                  <input
                    type="text"
                    value={productForm.entretien || ""}
                    onChange={(e) => setProductForm({ ...productForm, entretien: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Livraison (Optionnel)</label>
                  <input
                    type="text"
                    value={productForm.livraison || ""}
                    onChange={(e) => setProductForm({ ...productForm, livraison: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <footer className="px-6 py-4 border-t border-white/10 bg-white/[0.01] flex justify-end gap-3 flex-shrink-0">
              <button 
                onClick={() => setIsProductModalOpen(false)} 
                className="px-6 py-2.5 rounded-sm border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveProductForm} 
                className="px-6 py-2.5 rounded-sm bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-500/20"
              >
                Enregistrer
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Floating WhatsApp contact button */}
      {!isAdminMode && (
        <a
          href={`https://wa.me/${(homepageContent.whatsappNumber || "221773194279").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(homepageContent.whatsappMessage || "Bonjour Maison Myriam Veil, je souhaiterais me renseigner sur vos pièces d'exception.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all duration-300 active:scale-[0.95] flex items-center justify-center hover:-translate-y-0.5"
          title="Nous contacter sur WhatsApp"
          id="whatsapp-floating-btn"
        >
          <svg className="w-6 h-6 fill-white" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </a>
      )}

      {/* Majestic Payment Success Modal */}
      {paymentSuccessOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="relative max-w-md w-full bg-gradient-to-br from-slate-950 via-black to-slate-900 border border-[#C6A962]/30 rounded-2xl p-8 text-center shadow-[0_20px_50px_rgba(198,169,98,0.15)] overflow-hidden">
            {/* Elegant glowing background details */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#C6A962]/5 rounded-full blur-[40px]"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#C6A962]/5 rounded-full blur-[40px]"></div>
            
            {/* Brand Logo Text */}
            <span className="text-4xl font-serif italic bg-gradient-to-r from-[#C6A962] to-amber-300 bg-clip-text text-transparent mb-6 block animate-pulse">
              Maison Myriam Veil
            </span>
            <div className="w-12 h-[1px] bg-[#C6A962]/30 mx-auto mb-6"></div>
            
            {/* Elegant Checkmark Circle */}
            <div className="w-16 h-16 bg-[#C6A962]/10 border border-[#C6A962]/40 rounded-full flex items-center justify-center mx-auto mb-6 text-[#C6A962] shadow-[0_0_15px_rgba(198,169,98,0.2)]">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <h3 className="font-display font-bold uppercase tracking-[0.2em] text-lg text-white mb-2">
              Paiement Confirmé
            </h3>
            <p className="text-[11px] font-light text-slate-400 tracking-wide max-w-xs mx-auto uppercase mb-6 leading-relaxed">
              Votre règlement en ligne a été validé avec succès. Notre atelier de couture prépare votre commande d'exception.
            </p>

            <div className="text-xs font-mono text-[#C6A962] bg-[#C6A962]/10 border border-[#C6A962]/20 px-4 py-2.5 rounded-full inline-block mb-6">
              N° DE TRANSACTION : {paymentSuccessOrder.id}
            </div>

            <div className="border-t border-white/5 pt-5 mb-6 text-left space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span>Client</span>
                <span className="text-slate-300 font-medium">{paymentSuccessOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span>Téléphone</span>
                <span className="text-slate-300 font-mono font-medium">{paymentSuccessOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span>Montant Payé</span>
                <span className="text-[#C6A962] font-semibold">{paymentSuccessOrder.total.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <button
              onClick={() => setPaymentSuccessOrder(null)}
              className="w-full bg-gradient-to-r from-amber-600 to-[#C6A962] hover:brightness-110 active:scale-[0.98] text-white py-3 px-6 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-lg shadow-amber-500/10"
            >
              Découvrir de nouvelles pièces
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
