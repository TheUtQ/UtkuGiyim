'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SlidersHorizontal, X, ShoppingBag, ArrowRight, Home, ChevronRight } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand_id: number;
  brand_name: string;
  brand_slug: string;
  image_url: string;
  badge: string;
  badge_type: string | null;
  shopier_link: string;
  trendyol_link: string;
  is_active: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const C = {
  bg: '#0a0a0c',
  bg2: '#111115',
  bg3: '#18181f',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.07)',
  text: '#f0f0f0',
  muted: '#666',
  red: '#e63329',
  redGlow: 'rgba(230,51,41,0.15)',
};

export default function ProductsClient({
  products,
  brands,
  categories,
}: {
  products: Product[];
  brands: Brand[];
  categories: Category[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const catMatch = !selectedCategory || p.category === selectedCategory;
      const brandMatch = !selectedBrand || p.brand_slug === selectedBrand;
      return catMatch && brandMatch;
    });
  }, [products, selectedCategory, selectedBrand]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
  };

  const hasFilters = selectedCategory || selectedBrand;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", sans-serif', color: C.text }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,12,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 2rem', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '1.375rem',
            background: 'linear-gradient(to right, #fff, #e63329)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            UTKU GİYİM
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: C.muted, fontSize: '0.85rem' }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Home size={14} /> Ana Sayfa
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: '#fff' }}>Ürünler</span>
        </div>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* ======= SIDEBAR ======= */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'none' }}
            className="mobile-sidebar-overlay"
          />
        )}

        <aside style={{
          width: '260px', minWidth: '260px',
          background: C.bg2,
          borderRight: `1px solid ${C.border}`,
          padding: '2rem 1.25rem',
          position: 'sticky', top: '64px', height: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }}>
          {/* Filter header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SlidersHorizontal size={16} color={C.red} />
              <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                Filtreler
              </span>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{ background: 'none', border: 'none', color: C.red, fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '4px 8px', borderRadius: '6px', fontFamily: '"Inter", sans-serif' }}
              >
                <X size={12} /> Temizle
              </button>
            )}
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
              Kategori
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <FilterBtn
                label="Tümü"
                count={products.length}
                active={!selectedCategory}
                onClick={() => setSelectedCategory(null)}
              />
              {categories.map(cat => (
                <FilterBtn
                  key={cat.id}
                  label={cat.name}
                  count={products.filter(p => p.category === cat.slug).length}
                  active={selectedCategory === cat.slug}
                  onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                />
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
              Marka
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <FilterBtn
                label="Tüm Markalar"
                count={products.length}
                active={!selectedBrand}
                onClick={() => setSelectedBrand(null)}
              />
              {brands.map(brand => (
                <FilterBtn
                  key={brand.id}
                  label={brand.name}
                  count={products.filter(p => p.brand_slug === brand.slug).length}
                  active={selectedBrand === brand.slug}
                  onClick={() => setSelectedBrand(selectedBrand === brand.slug ? null : brand.slug)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* ======= MAIN CONTENT ======= */}
        <main style={{ flex: 1, padding: '2rem 2.5rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem' }}>
                {selectedCategory
                  ? categories.find(c => c.slug === selectedCategory)?.name
                  : selectedBrand
                    ? brands.find(b => b.slug === selectedBrand)?.name
                    : 'Tüm Ürünler'}
              </h1>
              <p style={{ color: C.muted, fontSize: '0.85rem' }}>
                {filtered.length} ürün bulundu
              </p>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'none',
                padding: '0.625rem 1rem', borderRadius: '10px', cursor: 'pointer',
                background: C.surface, border: `1px solid ${C.border}`, color: '#fff',
                fontSize: '0.85rem', gap: '0.5rem', alignItems: 'center',
                fontFamily: '"Inter", sans-serif',
              }}
              className="mobile-filter-btn"
            >
              <SlidersHorizontal size={16} /> Filtrele
            </button>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {selectedCategory && (
                <FilterChip
                  label={categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                  onRemove={() => setSelectedCategory(null)}
                />
              )}
              {selectedBrand && (
                <FilterChip
                  label={brands.find(b => b.slug === selectedBrand)?.name || selectedBrand}
                  onRemove={() => setSelectedBrand(null)}
                />
              )}
            </div>
          )}

          {/* Products Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: C.muted }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1rem' }}>Bu filtre için ürün bulunamadı.</p>
              <button onClick={clearFilters} style={{ marginTop: '1rem', background: 'none', border: `1px solid ${C.border}`, color: C.red, padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ===== Filter Button ===== */
function FilterBtn({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
        background: active ? 'rgba(230,51,41,0.1)' : 'transparent',
        border: `1px solid ${active ? 'rgba(230,51,41,0.3)' : 'transparent'}`,
        color: active ? '#e63329' : '#888',
        fontSize: '0.85rem', textAlign: 'left', fontFamily: '"Inter", sans-serif',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget).style.color = '#fff'; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = '#888'; } }}
    >
      <span>{label}</span>
      <span style={{
        fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px',
        background: active ? 'rgba(230,51,41,0.2)' : 'rgba(255,255,255,0.06)',
        color: active ? '#e63329' : '#555',
        fontWeight: 600,
      }}>
        {count}
      </span>
    </button>
  );
}

/* ===== Filter Chip ===== */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.375rem 0.75rem', borderRadius: '20px',
      background: 'rgba(230,51,41,0.1)', border: '1px solid rgba(230,51,41,0.25)',
      color: '#e63329', fontSize: '0.78rem', fontWeight: 500,
    }}>
      {label}
      <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', lineHeight: 1 }}>
        <X size={12} />
      </button>
    </span>
  );
}

/* ===== Product Card ===== */
function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);

  const badgeColor = product.badge_type === 'hot'
    ? '#e63329'
    : product.badge_type === 'new'
    ? '#00b4f0'
    : '#a855f7';

  return (
    <Link
      href={`/urunler/${product.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: C.bg2,
        border: `1px solid ${hovered ? 'rgba(230,51,41,0.35)' : C.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'none',
        boxShadow: hovered ? '0 20px 50px rgba(0,0,0,0.5)' : 'none',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '100%', background: C.bg }}>
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              style={{ objectFit: 'contain', padding: '0.75rem', transition: 'transform 0.4s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            />
          )}
          {product.badge && (
            <span style={{
              position: 'absolute', top: '0.625rem', left: '0.625rem', zIndex: 10,
              padding: '0.2rem 0.5rem', borderRadius: '5px', fontSize: '0.6rem',
              fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              background: badgeColor, color: '#fff',
            }}>
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '1rem' }}>
          {/* Brand */}
          {product.brand_name && (
            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
              {product.brand_name}
            </p>
          )}
          {/* Title */}
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#fff', marginBottom: '0.625rem', lineHeight: 1.3 }}>
            {product.title}
          </h3>
          {/* Price + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '1.125rem', color: C.red }}>
              ₺{product.price.toFixed(2)}
            </span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.72rem', color: hovered ? C.red : C.muted,
              transition: 'color 0.2s', fontWeight: 500,
            }}>
              İncele <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
