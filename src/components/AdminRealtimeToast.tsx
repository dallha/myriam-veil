import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Package } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function AdminRealtimeToast() {
  const [newOrder, setNewOrder] = useState<any>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setNewOrder(payload.new);
          // Hide toast after 5 seconds
          setTimeout(() => setNewOrder(null), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AnimatePresence>
      {newOrder && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-[100] bg-blue-600/90 backdrop-blur-md border border-blue-400 text-white p-4 rounded-xl shadow-2xl shadow-blue-500/20 flex items-start gap-4 max-w-sm"
        >
          <div className="bg-white/10 p-2 rounded-full">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-1">Nouvelle Commande !</h4>
            <p className="text-[10px] font-light leading-relaxed">
              <span className="font-bold">{newOrder.customerName || 'Client'}</span> vient de passer une commande de <span className="font-mono font-bold text-fuchsia-200">{newOrder.total?.toLocaleString('fr-FR')} FCFA</span>.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
