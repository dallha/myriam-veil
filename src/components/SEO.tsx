import { useEffect } from 'react';
import { Product } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  product?: Product;
}

export default function SEO({ title, description, product }: SEOProps) {
  useEffect(() => {
    // Set Page Title
    if (title) {
      document.title = `${title} | MYRIAM VEIL`;
    }

    // Set Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // Inject JSON-LD for E-commerce Product
    if (product) {
      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [product.imageUrl, ...(product.additionalImages || [])],
        "description": product.description || description,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "XOF",
          "price": product.price,
          "availability": "https://schema.org/InStock",
          "url": window.location.href,
        }
      };

      const scriptId = `json-ld-${product.id}`;
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      
      // Sanitization to prevent XSS (as requested in strategy document)
      const sanitizedJSON = JSON.stringify(jsonLd).replace(/</g, '\\u003c');
      script.text = sanitizedJSON;

      return () => {
        // Cleanup on unmount
        if (script && document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [title, description, product]);

  return null;
}
