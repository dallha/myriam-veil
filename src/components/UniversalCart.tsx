/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, ArrowRight, Minus, Plus, Trash2, ShoppingBag, MapPin, Phone, User, Check, ArrowLeft } from "lucide-react";
import { CartItem, Order } from "../types";
import { useState } from "react";

interface UniversalCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  onRemoveItem: (productId: string, selectedSize?: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
}

export default function UniversalCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder
}: UniversalCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"dakar" | "hors-dakar">("dakar");
  const [paymentMethod, setPaymentMethod] = useState<"delivery" | "online">("online");
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");

  if (!isOpen) return null;

  // Computations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryOption === "dakar" ? 0 : 3000;
  const total = subtotal + deliveryFee;
  const taxesInc = Math.round(total * 0.18); // 18% Senegalese TVA
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Handle Checkout submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Veuillez renseigner toutes vos coordonnées de livraison.");
      return;
    }

    setIsCheckingOut(true);
    
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    const newOrderNumber = `MV-${new Date().getFullYear()}-${randomNum}`;
    setPlacedOrderNumber(newOrderNumber);

    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newOrder: Order = {
      id: newOrderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      deliveryOption,
      items: [...cartItems],
      subtotal,
      total,
      date: dateStr,
      status: "Nouvelle",
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "Échoué" : "À la livraison"
    };

    if (paymentMethod === "online") {
      try {
        // Enregistrer temporairement dans le localStorage pour restauration au retour
        localStorage.setItem("mv_pending_checkout", JSON.stringify(newOrder));

        const response = await fetch("/api/paytech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            orderId: newOrderNumber,
            total,
            customerName: customerName.trim()
          })
        });

        const resData = await response.json();
        
        if (response.ok && resData.redirect_url) {
          // Redirection vers l'interface de paiement sécurisé PayTech
          window.location.href = resData.redirect_url;
        } else {
          alert(resData.error || "Impossible d'initier le paiement en ligne. Veuillez réessayer.");
          setIsCheckingOut(false);
        }
      } catch (err) {
        console.error("Erreur d'initialisation de paiement:", err);
        alert("Une erreur est survenue lors de la connexion au service de paiement.");
        setIsCheckingOut(false);
      }
    } else {
      // Paiement à la livraison classique
      setTimeout(() => {
        onPlaceOrder(newOrder);
        setIsCheckingOut(false);
        setOrderPlaced(true);
        
        setTimeout(() => {
          onClearCart();
          setOrderPlaced(false);
          setShowCheckoutForm(false);
          setCustomerName("");
          setCustomerPhone("");
          setCustomerAddress("");
          setDeliveryOption("dakar");
          onClose();
        }, 4000);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Main Drawer Shell (Immersive Glass) */}
      <div 
        id="cart-drawer-container"
        className="absolute inset-y-0 right-0 max-w-[480px] w-full bg-[#02040a]/90 backdrop-blur-lg flex flex-col shadow-2xl border-l border-white/10 animate-fade-in-right transform transition-transform duration-300 h-full text-slate-300"
      >
        {/* Success / Checkout screen */}
        {orderPlaced ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-950 via-black to-fuchsia-950/30">
            <span className="text-5xl font-serif italic bg-gradient-to-r from-blue-400 to-fuchsia-400 bg-clip-text text-transparent mb-6 animate-pulse">L'Élégance</span>
            <div className="w-16 h-[1px] bg-white/20 mb-6"></div>
            <h3 className="font-display font-bold uppercase tracking-[0.2em] text-lg text-white mb-2">
              Merci pour votre commande
            </h3>
            <p className="text-xs font-light text-slate-400 tracking-wide max-w-xs uppercase mb-6">
              Votre commande est enregistrée dans nos ateliers de couture.
            </p>
            <div className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-3">
              N° DE COMMANDE: {placedOrderNumber}
            </div>
            <p className="text-[10px] text-slate-500 italic max-w-xs leading-relaxed">
              Un couturier de la Maison Myriam Veil prendra contact avec vous au numéro {customerPhone} sous peu.
            </p>
          </div>
        ) : showCheckoutForm ? (
          /* ======================================================== */
          /* ================ FORMULAIRE DE LIVRAISON =============== */
          /* ======================================================== */
          <div className="flex-1 flex flex-col h-full">
            <header className="flex-shrink-0 border-b border-white/10 bg-[#02040a]/40 px-6 py-6 flex items-center gap-4">
              <button 
                onClick={() => setShowCheckoutForm(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 flex items-center justify-center cursor-pointer"
                title="Retour au Panier"
              >
                <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
              </button>
              <div>
                <h2 className="font-display font-bold text-xl md:text-2xl tracking-tight uppercase leading-none text-white">
                  Livraison
                </h2>
                <p className="text-[#C6A962] text-[10px] tracking-widest uppercase font-serif italic mt-1">
                  Maison Dakaroise · Sénégal
                </p>
              </div>
            </header>

            <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 p-6 overflow-y-auto space-y-5 text-sm font-light">
                
                {/* 1. Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" /> Prénom & Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="Ex: Mariama Sy"
                  />
                </div>

                {/* 2. Phone */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> Numéro de Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-sm font-semibold tracking-wide"
                    placeholder="Ex: +221 77 123 45 67"
                  />
                </div>

                {/* 3. Address */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Adresse de Livraison
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white focus:border-blue-500 focus:outline-none text-sm font-light leading-relaxed"
                    placeholder="Ex: Liberté 6 Extension, Villa 41, Dakar, Sénégal"
                  />
                </div>

                {/* 4. Delivery Option Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Option d'expédition
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption("dakar")}
                      className={`p-4 border rounded-xl flex flex-col text-left transition-all cursor-pointer ${
                        deliveryOption === "dakar"
                          ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase text-white">Dakar Express</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-light">Gratuit · 24 à 48h</span>
                      {deliveryOption === "dakar" && <Check className="w-4 h-4 text-blue-400 mt-2 self-end" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryOption("hors-dakar")}
                      className={`p-4 border rounded-xl flex flex-col text-left transition-all cursor-pointer ${
                        deliveryOption === "hors-dakar"
                          ? "bg-fuchsia-600/10 border-fuchsia-500 shadow-md shadow-fuchsia-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase text-white">Hors Dakar</span>
                      <span className="text-[10px] text-slate-400 mt-1 font-light">3 000 FCFA · Régions</span>
                      {deliveryOption === "hors-dakar" && <Check className="w-4 h-4 text-fuchsia-400 mt-2 self-end" />}
                    </button>
                  </div>
                </div>

                {/* 5. Payment Method Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    Méthode de paiement
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("delivery")}
                      className={`p-4 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        paymentMethod === "delivery"
                          ? "bg-blue-600/10 border-blue-500 shadow-md shadow-blue-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-left">
                        <span className="text-xs font-bold uppercase text-white">💵 Paiement à la livraison</span>
                        <span className="block text-[10px] text-slate-400 mt-1 font-light">Payez en espèces lors de la livraison</span>
                      </div>
                      {paymentMethod === "delivery" && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`p-4 border rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                        paymentMethod === "online"
                          ? "bg-fuchsia-600/10 border-fuchsia-500 shadow-md shadow-fuchsia-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-left">
                        <span className="text-xs font-bold uppercase text-white">💳 Paiement en ligne sécurisé</span>
                        <span className="block text-[10px] text-slate-400 mt-1 font-light">Wave, Orange Money, Carte Bancaire (PayTech)</span>
                      </div>
                      {paymentMethod === "online" && <Check className="w-4 h-4 text-fuchsia-400 shrink-0" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <footer className="flex-shrink-0 bg-[#02040a]/90 border-t border-white/10 flex flex-col">
                <div className="px-6 py-5 border-b border-white/5 space-y-2.5 text-xs text-slate-400 uppercase tracking-wider font-sans">
                  <div className="flex justify-between items-center">
                    <span>Articles ({totalItemCount})</span>
                    <span className="font-medium text-white">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Livraison</span>
                    <span className="font-medium text-white">
                      {deliveryFee === 0 ? "Gratuite" : "+ 3 000 FCFA"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxes (TVA 18% incl.)</span>
                    <span className="font-medium text-white">{taxesInc.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <div className="px-6 py-6 flex justify-between items-end bg-[#02040a]/40">
                  <span className="font-display font-medium uppercase text-xs tracking-[0.2em] text-slate-400">Total Final</span>
                  <span className="font-display font-semibold text-3xl md:text-4xl text-fuchsia-400 leading-none">
                    {total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white py-5 px-6 font-display font-bold text-sm md:text-base uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center justify-between cursor-pointer disabled:opacity-50"
                >
                  <span>{isCheckingOut ? "Enregistrement..." : "Confirmer la commande"}</span>
                  <ArrowRight className="w-5 h-5 ml-1 animate-pulse" />
                </button>
              </footer>
            </form>
          </div>
        ) : (
          /* ======================================================== */
          /* ==================== VUE PANIER STANDARD ================ */
          /* ======================================================== */
          <>
            {/* Drawer Header */}
            <header className="flex-shrink-0 border-b border-white/10 bg-[#02040a]/40 px-6 py-6 flex justify-between items-start">
              <div>
                <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight uppercase leading-none text-white">
                  Le Panier
                </h2>
                <p className="text-slate-400 text-sm tracking-widest uppercase font-serif italic mt-1 pb-1">
                  [{totalItemCount} {totalItemCount > 1 ? "pièces" : "pièce"}]
                </p>
              </div>
              <button
                id="close-cart-drawer-btn"
                aria-label="Fermer"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-7 h-7 stroke-[1.5]" />
              </button>
            </header>

            {/* Cart Items List */}
            <section className="flex-1 overflow-y-auto divide-y divide-white/5 no-scrollbar bg-black/20">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <ShoppingBag className="w-12 h-12 mb-6 text-slate-500 stroke-[1.2]" />
                  <p className="font-display font-medium uppercase tracking-widest text-base text-white mb-2">
                    Votre panier est vide.
                  </p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    L'élégance vous attend.
                  </p>
                  <button
                    id="cart-shop-now-btn"
                    onClick={onClose}
                    className="mt-8 border border-white/10 bg-white/5 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 rounded-sm"
                  >
                    Découvrir les pièces
                  </button>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <article
                    key={`${item.product.id}-${item.selectedSize || index}`}
                    className="p-6 flex gap-6 relative group bg-white/[0.01] transition-colors hover:bg-white/[0.03]"
                  >
                    {/* Product Image preview */}
                    <div className="w-[90px] h-[115px] md:w-[100px] md:h-[130px] shrink-0 bg-slate-900 relative overflow-hidden rounded-sm border border-white/10">
                      <img
                        alt={item.product.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-700"
                        src={item.product.imageUrl}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Product Metadata & Action */}
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-display font-medium text-sm md:text-base tracking-wide uppercase text-white">
                            {item.product.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-1">
                          {item.selectedSize ? `T.${item.selectedSize}` : "Unique"} // {item.product.category || "Couture"}
                        </p>
                      </div>

                      {/* Controls and prices */}
                      <div className="flex items-end justify-between w-full mt-4">
                        {/* Utilitarian controls */}
                        <div className="flex items-center border border-white/10 rounded-sm overflow-hidden bg-black/30">
                          <button
                            id={`decrease-qty-${item.product.id}`}
                            aria-label="Diminuer"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                            className="w-8 h-8 flex items-center justify-center text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 h-8 flex items-center justify-center text-xs font-semibold border-x border-white/10 text-white">
                            {item.quantity}
                          </span>
                          <button
                            id={`increase-qty-${item.product.id}`}
                            aria-label="Augmenter"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                            className="w-8 h-8 flex items-center justify-center text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Cost */}
                        <div className="font-display font-medium text-base md:text-lg text-white">
                          {(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>

                    {/* Absolute Trash Trigger */}
                    <button
                      id={`remove-item-${item.product.id}`}
                      onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                      className="absolute top-6 right-6 text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Retirer l'article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </article>
                ))
              )}
            </section>

            {/* Receipt checkout specifications */}
            {cartItems.length > 0 && (
              <footer className="flex-shrink-0 bg-[#02040a]/90 border-t border-white/10 flex flex-col">
                {/* Micro receipt details */}
                <div className="px-6 py-5 border-b border-white/5 space-y-2.5 text-xs text-slate-400 uppercase tracking-wider font-sans">
                  <div className="flex justify-between items-center">
                    <span>Sous-total</span>
                    <span className="font-medium text-white">{subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Livraison</span>
                    <span className="italic font-serif text-slate-400 tracking-normal text-[11px]">
                      Dakar Express (Gratuit) / Hors Dakar (3 000 FCFA)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxes (TVA 18% incl.)</span>
                    <span className="font-medium text-white">{taxesInc.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                {/* Majestic total */}
                <div className="px-6 py-6 flex justify-between items-end bg-[#02040a]/40">
                  <span className="font-display font-medium uppercase text-xs tracking-[0.2em] text-slate-400">
                    Total
                  </span>
                  <span className="font-display font-semibold text-3xl md:text-4xl text-fuchsia-400 leading-none">
                    {subtotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                {/* Massive CTA */}
                <button
                  id="checkout-confirm-btn"
                  onClick={() => setShowCheckoutForm(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white py-5 px-6 font-display font-bold text-sm md:text-base uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all duration-300 flex items-center justify-between cursor-pointer"
                >
                  <span>Valider la commande</span>
                  <ArrowRight className="w-5 h-5 ml-1 animate-pulse" />
                </button>
              </footer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
