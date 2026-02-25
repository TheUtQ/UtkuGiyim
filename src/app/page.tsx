/**
 * Utku Giyim — Premium Landing Page (Server Component)
 * Fetches data from DB and passes to client sections
 */
import { getAllProducts, getAllSettings, getAllSeoContent } from '@/lib/db';
import LandingClient from '@/components/LandingClient';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getAllProducts() as Array<{
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
    badge: string;
    badge_type: string | null;
    shopier_link: string;
    trendyol_link: string;
  }>;
  const settings = getAllSettings();
  const seoContent = getAllSeoContent() as Array<{
    id: number;
    title: string;
    content: string;
  }>;

  const seleProducts = products.filter(p => p.category === 'sele-kilifi');
  const vitesProducts = products.filter(p => p.category === 'vites-sweatshirt');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Utku Giyim",
    "description": "Premium motosiklet sele kılıfları ve vites sweatshirtleri",
    "url": "https://utkugiyim.com",
    "telephone": settings.phone,
    "email": settings.email,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": settings.address
    },
    "sameAs": [settings.instagram, settings.tiktok, settings.facebook].filter(Boolean),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Ürünler",
      "itemListElement": products.map(p => ({
        "@type": "Product",
        "name": p.title,
        "description": p.description,
        "image": p.image_url,
        "offers": {
          "@type": "Offer",
          "price": p.price,
          "priceCurrency": "TRY"
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingClient
        settings={settings}
        seleProducts={seleProducts}
        vitesProducts={vitesProducts}
        seoContent={seoContent}
      />
    </>
  );
}
