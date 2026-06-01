/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import SEO from "./components/SEO";
import { authService } from "./authService";
import { dataService } from "./dataService";
import { supabase } from "./lib/supabase";
import { emailService } from "./lib/emailService";
import { analytics } from "./lib/analytics";
import AIChat from "./components/AIChat";

import { useCartStore } from "./store/useCartStore";
import { useAppStore } from "./store/useAppStore";

// Lazy-loaded components for code splitting
const CollectionCouture = lazy(() => import("./components/CollectionCouture"));
const CollectionEcrin = lazy(() => import("./components/CollectionEcrin"));
const CollectionHeritage = lazy(() => import("./components/CollectionHeritage"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const AdminPage = lazy(() => import("./components/AdminPage"));
const JournalHome = lazy(() => import("./components/JournalHome"));
const JournalArticle = lazy(() => import("./components/JournalArticle"));

// Loading fallback component
const CollectionFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-slate-500 uppercase tracking-widest">Chargement...</p>
    </div>
  </div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setIsMenuOpen(false);
        if (isAdminMode) {
          navigate("/admin");
        } else {
          setIsPasswordModalOpen(prev => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdminMode, navigate]);

  // Navigate to /admin when URL is /admin or /administration
  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/administration") {
      if (!isAdminMode) {
        setIsPasswordModalOpen(true);
      }
    }
  }, [location.pathname, isAdminMode]);

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

  const handleSaveAll = async () => {
    await dataService.saveProducts(products);
    await dataService.saveHomepageContent(homepageContent);
    await dataService.saveOrders(orders);
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
    
    // Track analytics
    analytics.track("order_placed", {
      orderId: newOrder.id,
      total: newOrder.total,
      itemCount: newOrder.items.length,
    });

    // Send confirmation email (async, non-blocking)
    emailService.sendOrderConfirmation(newOrder).then((result) => {
      if (result.success) {
        console.log(`[Email] Confirmation envoyée pour la commande #${newOrder.id}`);
      } else {
        console.warn(`[Email] Échec d'envoi de confirmation pour #${newOrder.id}:`, result.error);
      }
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    setHasUnsavedChanges(true);

    // Track analytics
    analytics.track("order_status_update", { orderId, status });

    // Send status update email (async, non-blocking)
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      emailService.sendOrderStatusUpdate({ ...order, status }).then((result) => {
        if (result.success) {
          console.log(`[Email] Mise à jour de statut envoyée pour #${orderId} → ${status}`);
        } else {
          console.warn(`[Email] Échec d'envoi de mise à jour pour #${orderId}:`, result.error);
        }
      });
    }
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
    <Routes>
      {/* Admin Route — Full page admin dashboard */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={
            <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 uppercase tracking-widest">Chargement du portail admin...</p>
              </div>
            </div>
          }>
            <AdminPage
              products={products}
              orders={orders}
              homepageContent={homepageContent}
              onUpdateHomepageContent={(newContent) => {
                setHomepageContent(newContent);
                setHasUnsavedChanges(true);
              }}
              onAddProduct={handleOpenAddProduct}
              onEditProduct={handleOpenEditProduct}
              onDuplicateProduct={handleDuplicateProduct}
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
              isAdminMode={isAdminMode}
            />
          </Suspense>
        }
      />

      {/* Main Site Route */}
      <Route
        path="*"
        element={
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
                    <Suspense fallback={<CollectionFallback />}>
                      {currentArticleSlug ? <JournalArticle /> : <JournalHome />}
                    </Suspense>
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

                    <Suspense fallback={<CollectionFallback />}>
                      {currentCollection === "couture" && (
                        <CollectionCouture
                          products={products.filter((p) => p.collectionId === "couture")}
                          onAddToCart={handleAddToCart}
                          isAdminMode={isAdminMode}
                          onEditProduct={handleOpenEditProduct}
                          onDeleteProduct={handleDeleteProduct}
                          onAddProduct={handleOpenAddProduct}
                          onProductDetailToggle={(isOpen) => setIsProductDetailOpen(isOpen)}
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
                          onProductDetailToggle={(isOpen) => setIsProductDetailOpen(isOpen)}
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
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        }
      />
    </Routes>
  );
}
