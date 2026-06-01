/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * AIChat.tsx — Assistant virtuel IA flottant (remplace WhatsApp)
 *
 * Chatbot contextuel pour la Maison Myriam Veil.
 * Répond aux questions sur les produits, la livraison, etc.
 */

import { useState, useRef, useEffect } from "react";
import { X, MessageCircle, Send, Sparkles, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "✨ Bienvenue à la Maison Myriam Veil ! Je suis votre conseillère virtuelle. Comment puis-je vous aider aujourd'hui ? Découvrez nos collections Haute Couture, Écrin de Soie ou L'Héritage.",
};

const FAQ_RESPONSES: Record<string, string> = {
  livraison: "🚚 Nous livrons partout au Sénégal. **Dakar** : livraison gratuite sous 24-48h. **Hors Dakar** : 3 000 FCFA, livraison sous 3-5 jours ouvrés.",
  paiement: "💳 Nous acceptons : **Wave**, **Orange Money**, **Carte bancaire** (paiement en ligne sécurisé via PayTech) et **espèces à la livraison**.",
  retour: "🔄 Vous disposez de **7 jours** pour retourner un article. L'article doit être dans son état d'origine, non porté. Contactez-nous pour initier le retour.",
  taille: "📏 Nos tailles vont du **34 au 46** pour la Haute Couture. Les bijoux de l'Écrin de Soie sont ajustables. Les abayas de L'Héritage sont en taille unique avec ceinture ajustable.",
  contact: "📞 Vous pouvez nous joindre par téléphone au **+221 77 319 42 79** ou nous rendre visite à notre atelier à Dakar.",
  commande: "📋 Pour passer commande, ajoutez vos articles au panier, remplissez vos coordonnées de livraison et choisissez votre mode de paiement. Vous recevrez une confirmation immédiate.",
  délai: "⏱️ Les commandes sont préparées sous **24-48h**. Livraison Dakar : 24-48h. Hors Dakar : 3-5 jours ouvrés.",
  couture: "👗 La collection **Haute Couture** propose des manteaux architectes, vestes taillées et robes géométriques. Des pièces uniques taillées sur mesure pour la femme moderne et élégante.",
  ecrin: "💍 **L'Écrin de Soie** est notre collection de joaillerie fine : alliances de perles du Pacifique, chaînages en vermeil d'or, bagues et bracelets d'exception.",
  heritage: "🕌 **L'Héritage** rend hommage à Marieme Fall. Abayas de soie, voiles drapés et pièces de modest apparel d'une élégance intemporelle.",
};

function getBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  // Check for keywords
  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (msg.includes(key)) {
      return response;
    }
  }

  // Greetings
  if (msg.includes("bonjour") || msg.includes("salut") || msg.includes("bonsoir")) {
    return "👋 Bonjour et bienvenue chez Myriam Veil ! Je suis là pour vous guider. Que cherchez-vous aujourd'hui ? Une collection particulière, des informations sur la livraison, ou besoin d'aide pour une commande ?";
  }

  if (msg.includes("merci") || msg.includes("merci beaucoup")) {
    return "🌟 Avec plaisir ! C'est un honneur de vous servir. N'hésitez pas si vous avez d'autres questions. Que la beauté vous accompagne !";
  }

  // Default response
  return "🤗 Merci pour votre message ! Je peux vous renseigner sur :\n\n• **Nos collections** : Haute Couture, Écrin de Soie, L'Héritage\n• **Livraison et délais**\n• **Moyens de paiement**\n• **Tailles et retours**\n• **Contact direct**\n\nQue souhaitez-vous savoir ?";
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: getBotResponse(userMsg.content),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:brightness-110 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-all duration-300 active:scale-[0.95] flex items-center justify-center hover:-translate-y-0.5"
        title="Assistant virtuel Myriam Veil"
        id="ai-chat-floating-btn"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-[#02040a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Header */}
            <header className="flex-shrink-0 bg-gradient-to-r from-blue-600/20 to-fuchsia-600/20 border-b border-white/10 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-fuchsia-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Conseillère Virtuelle</h3>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    En ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white rounded-br-md"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-md"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {msg.role === "assistant" ? (
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white/70" />
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">
                        {msg.role === "assistant" ? "Myriam Veil" : "Vous"}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-[13px]">{msg.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <footer className="flex-shrink-0 border-t border-white/10 p-4 bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none placeholder:text-slate-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2.5 bg-gradient-to-r from-blue-600 to-fuchsia-600 hover:brightness-110 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[8px] text-slate-500 text-center mt-2 uppercase tracking-widest font-mono">
                Assistant virtuel · Réponses automatiques
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
