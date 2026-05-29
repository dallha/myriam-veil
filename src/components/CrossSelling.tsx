import { useEffect, useState } from 'react';
import { Product } from '../types';
import { dataService } from '../dataService';

interface CrossSellingProps {
  relatedIds?: string[];
  onProductClick?: (product: Product) => void;
}

export default function CrossSelling({ relatedIds, onProductClick }: CrossSellingProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!relatedIds || relatedIds.length === 0) return;
    dataService.getProducts().then(all => {
      const found = all.filter(p => relatedIds.includes(p.id));
      setRelatedProducts(found);
    });
  }, [relatedIds]);

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="mt-12 mb-8 pt-8 border-t border-white/10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 text-center">
        Complétez votre expérience
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar justify-center">
        {relatedProducts.map(prod => (
          <article 
            key={prod.id} 
            className="shrink-0 w-[140px] flex flex-col gap-2 group cursor-pointer"
            onClick={() => onProductClick && onProductClick(prod)}
          >
            <div className="aspect-[3/4] bg-slate-900 rounded-md overflow-hidden relative border border-white/10">
              <img 
                src={prod.imageUrl} 
                alt={prod.name} 
                className="w-full h-full object-cover grayscale contrast-110 group-hover:grayscale-0 transition-all duration-500" 
              />
            </div>
            <div className="text-center">
              <h4 className="text-[10px] font-bold text-white uppercase truncate">{prod.name}</h4>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{prod.price.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
