import { Order } from "../types";
import { Printer, X } from "lucide-react";

interface InvoicePrintViewProps {
  order: Order;
  onClose: () => void;
}

export default function InvoicePrintView({ order, onClose }: InvoicePrintViewProps) {
  const tvaRate = 0.18; // 18% TVA
  const tvaAmount = order.total * tvaRate;
  const htAmount = order.total - tvaAmount;

  return (
    <div className="fixed inset-0 z-[200] bg-white overflow-y-auto text-black font-sans">
      {/* Barre d'outils (Non imprimée) */}
      <div className="print:hidden sticky top-0 w-full bg-[#02040a] text-white p-4 flex justify-between items-center shadow-md">
        <div>
          <span className="font-bold uppercase tracking-widest text-xs text-slate-400">Facture N°</span>
          <span className="ml-2 font-mono text-blue-400">{order.id}</span>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
          >
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
          >
            <X className="w-4 h-4" /> Fermer
          </button>
        </div>
      </div>

      {/* Contenu de la facture (Format A4) */}
      <div className="max-w-[210mm] mx-auto bg-white p-12 md:p-20 shadow-none print:p-0 print:shadow-none min-h-[297mm]">
        
        {/* Header Facture */}
        <header className="flex justify-between items-start mb-16 border-b pb-8 border-gray-200">
          <div>
            <h1 className="font-serif text-3xl font-bold uppercase tracking-widest mb-2">Myriam Veil</h1>
            <p className="text-sm text-gray-500">Maison de Couture & Parfumerie</p>
            <p className="text-sm text-gray-500">Dakar, Sénégal</p>
            <p className="text-sm text-gray-500">contact@myriam-veil.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">FACTURE</h2>
            <p className="text-sm text-gray-600"><span className="font-bold">N° :</span> {order.id.split('-')[0].toUpperCase()}</p>
            <p className="text-sm text-gray-600"><span className="font-bold">Date :</span> {order.date}</p>
          </div>
        </header>

        {/* Info Client */}
        <div className="mb-12">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-2">Facturé à</h3>
          <p className="font-bold text-lg">{order.customerName}</p>
          <p className="text-gray-600">{order.customerAddress}</p>
          <p className="text-gray-600">Tél : {order.customerPhone}</p>
        </div>

        {/* Détails Table */}
        <table className="w-full mb-12 text-sm text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
              <th className="py-3 px-4 font-bold border-b border-gray-200 rounded-tl-lg">Description</th>
              <th className="py-3 px-4 font-bold border-b border-gray-200 text-center">Qté</th>
              <th className="py-3 px-4 font-bold border-b border-gray-200 text-right">Prix Unitaire</th>
              <th className="py-3 px-4 font-bold border-b border-gray-200 text-right rounded-tr-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-4 px-4">
                  <p className="font-bold">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Taille : {item.selectedSize || 'Standard'}</p>
                </td>
                <td className="py-4 px-4 text-center font-bold">{item.quantity}</td>
                <td className="py-4 px-4 text-right">{item.product.price.toLocaleString('fr-FR')} FCFA</td>
                <td className="py-4 px-4 text-right font-bold">{(item.product.price * item.quantity).toLocaleString('fr-FR')} FCFA</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="flex justify-end mb-16">
          <div className="w-64 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total HT</span>
              <span>{Math.round(htAmount).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA (18%)</span>
              <span>{Math.round(tvaAmount).toLocaleString('fr-FR')} FCFA</span>
            </div>
            {order.deliveryOption === 'hors-dakar' && (
              <div className="flex justify-between text-gray-600">
                <span>Frais Livraison</span>
                <span>3 000 FCFA</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
              <span>Total TTC</span>
              <span>{order.total.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>

        {/* Footer Facture */}
        <footer className="text-center text-xs text-gray-400 mt-20 border-t border-gray-100 pt-8">
          <p>Merci pour votre confiance. Myriam Veil - L'Excellence & L'Héritage.</p>
          <p>RC : SN-DKR-2023-B-XXXX | NINEA : XXXXXXX</p>
        </footer>

      </div>
    </div>
  );
}
