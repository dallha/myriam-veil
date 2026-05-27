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

import TopAppBar from "./components/TopAppBar";
import BottomNav from "./components/BottomNav";
import UniversalCart from "./components/UniversalCart";
import LandingPage from "./components/LandingPage";
import OrigineEntry from "./components/OrigineEntry";
import CollectionCouture from "./components/CollectionCouture";
import CollectionEcrin from "./components/CollectionEcrin";
import CollectionHeritage from "./components/CollectionHeritage";
import AdminDashboard from "./components/AdminDashboard";
import { authService, LOCAL_ADMIN_EMAIL, LOCAL_ADMIN_PASSWORD } from "./authService";

export default function App() {
  // App stage: "landing" (hero page) | collections
  const [appStage, setAppStage] = useState<"landing" | "collections">("landing");
  
  // Collection lines selection: "origins" (Default Entry split) | "couture" | "ecrin" | "heritage"
  const [currentCollection, setCurrentCollection] = useState<CollectionId>("origins");

  // --- Admin Mode Database States ---
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem("myriam_veil_products");
      if (!stored) return PRODUCTS;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return PRODUCTS;
      return parsed;
    } catch {
      return PRODUCTS;
    }
  });

  const [homepageContent, setHomepageContent] = useState<HomepageContent>(() => {
    try {
      const stored = localStorage.getItem("myriam_veil_homepage");
      if (!stored) return DEFAULT_HOMEPAGE_CONTENT;
      return JSON.parse(stored);
    } catch {
      return DEFAULT_HOMEPAGE_CONTENT;
    }
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Placed Orders database state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem("myriam_veil_orders");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  });

  // Sync orders state to client-side localStorage
  useEffect(() => {
    localStorage.setItem("myriam_veil_orders", JSON.stringify(orders));
  }, [orders]);

  // Modals UI & Auth
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Shopping Cart items state (hydrating from localStorage if present)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("myriam_veil_cart");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      // Validate that parsed data is an array of CartItem-like objects
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item: unknown): item is CartItem =>
          typeof item === "object" &&
          item !== null &&
          "product" in item &&
          "quantity" in item &&
          typeof (item as Record<string, unknown>).quantity === "number"
      );
    } catch {
      return [];
    }
  });

  // UI state overlays
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync cart items to client-side localStorage
  useEffect(() => {
    localStorage.setItem("myriam_veil_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Compute total cart quantity items in checkout
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Cart operations
  const handleAddToCart = (product: Product, selectedSize?: string) => {
    setCartItems((prevItems) => {
      // Find matching item by ID and optionally selected size
      const existingIdx = prevItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [...prevItems, { product, quantity: 1, selectedSize }];
      }
    });

    // Momentary slight pop on basket to catch attention
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    if (quantity < 1) {
      handleRemoveItem(productId, selectedSize);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string, selectedSize?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.selectedSize === selectedSize)
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const selectCollectionLine = (lineId: CollectionId) => {
    setAppStage("collections");
    setCurrentCollection(lineId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle entering the collections from the landing page
  const handleEnterCollection = () => {
    setAppStage("collections");
    setCurrentCollection("origins");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      await authService.login(adminEmailInput.trim(), adminPasswordInput);
      setIsAdminMode(true);
      setIsAdminDashboardOpen(true); // Open full console
      setIsPasswordModalOpen(false);
      
      // Clear credentials from RAM
      setAdminEmailInput("");
      setAdminPasswordInput("");
    } catch (err: any) {
      setPasswordError(true);
      setLoginErrorMessage(err.message || "Erreur de connexion.");
    } finally {
      setIsLoggingIn(false);
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
        brandTitleOverride={appStage === "landing" ? "MYRIAM VEIL" : undefined}
      />

      {/* 2. ADAPTIVE LINE VIEWPORT ROUTING */}
      <main className="flex-1 w-full z-10">
        {appStage === "landing" ? (
          <LandingPage 
            onEnterCollection={handleEnterCollection} 
            content={homepageContent}
            isAdminMode={isAdminMode}
            onUpdateContent={(newContent) => {
              setHomepageContent(newContent);
              setHasUnsavedChanges(true);
            }}
          />
        ) : (
          <>
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
          </>
        )}
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
              </div>

              {/* Sidebar footer block Info & Admin entrance */}
              <div className="border-t border-white/10 pt-6 text-[10px] tracking-widest text-[#9C8B89] uppercase font-semibold flex flex-col gap-3 bg-transparent">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></span>
                  <span className="text-slate-400">Maison Dakaroise · Ateliers au Sénégal</span>
                </div>
                <div className="text-[9px] text-slate-500 font-light normal-case">
                  © {new Date().getFullYear()} @ Maison Myriam Veil. Tous droits réservés.
                </div>
                
                {/* PORTAIL ADMIN Discret Button */}
                <button
                  id="menu-admin-portal-btn"
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (isAdminMode) {
                      setIsAdminMode(false);
                    } else {
                      setIsPasswordModalOpen(true);
                    }
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 border border-dashed border-white/10 hover:border-blue-500/50 hover:text-blue-400 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 transition-colors rounded-sm cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isAdminMode ? "Quitter le Portail" : "Portail Maison"}
                </button>
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
            onAddProduct={(col) => {
              handleOpenAddProduct(col);
              setIsAdminDashboardOpen(false); // Close full console to edit in-place
            }}
            onEditProduct={(prod) => {
              handleOpenEditProduct(prod);
              setIsAdminDashboardOpen(false); // Close full console to edit in-place
            }}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onSave={handleSaveAll}
            onExport={handleExportDb}
            onImport={handleImportDb}
            onReset={handleResetSite}
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
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center text-center mt-3 mb-5">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-blue-400 mb-3 animate-pulse">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-[0.15em] text-white">Connexion Directeur</h3>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] leading-relaxed">
                Connectez-vous à la console d'administration de la Maison.
              </p>
            </div>
            
            <div className="space-y-4">
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

              {/* Status & Error Display */}
              {passwordError && (
                <div className="flex items-center gap-1.5 text-red-400 text-[10px] justify-center font-semibold bg-red-500/10 border border-red-500/20 py-1.5 px-3 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginErrorMessage}</span>
                </div>
              )}

              {/* Submit trigger button */}
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

              {/* Micro diagnostic tag showing active backend connection */}
              <div className="border-t border-white/5 pt-3 text-[8.5px] uppercase font-mono text-center flex flex-col gap-1 text-slate-500">
                <div className="flex justify-center items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${authService.isConfigured() ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`}></span>
                  <span>
                    Backend : {authService.isConfigured() ? "Supabase Cloud" : "Émulateur local"}
                  </span>
                </div>
                {!authService.isConfigured() && import.meta.env.DEV && (
                  <div className="normal-case italic text-[9px] text-[#C6A962] font-light max-w-[250px] mx-auto leading-normal pt-1 bg-white/[0.01] p-1.5 border border-white/5 rounded">
                    Test démo : <span className="font-mono font-bold">{LOCAL_ADMIN_EMAIL}</span> / mot de passe : <span className="font-mono font-bold">{LOCAL_ADMIN_PASSWORD}</span>
                  </div>
                )}
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
    </div>
  );
}
