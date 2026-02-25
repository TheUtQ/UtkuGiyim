'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Home, ChevronRight, ShoppingBag, ExternalLink, Tag, Package, ArrowLeft, Star, Shield, Zap, Droplets, Share2 } from 'lucide-react';

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
  extra_images: string | null;
  badge: string;
  badge_type: string | null;
  shopier_link: string;
  trendyol_link: string;
  sort_order: number;
  created_at: string;
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
  blue: '#00b4f0',
};

export default function ProductDetailClient({ product }: { product: Product }) {
  const extraImages: string[] = product.extra_images
    ? JSON.parse(product.extra_images)
    : [];

  const allImages = [product.image_url, ...extraImages].filter(Boolean);
  const [activeImg, setActiveImg] = useState(0);

  const badgeColor = product.badge_type === 'hot' ? '#e63329' : product.badge_type === 'new' ? '#00b4f0' : '#a855f7';

  const categoryLabel = product.category === 'sele-kilifi' ? 'Sele Kılıfı' : product.category === 'vites-sweatshirt' ? 'Vites Sweatshirt' : product.category;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: '"Inter", sans-serif', color: C.text }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,12,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 2.5rem', height: '64px',
        display: 'flex', alignItems: 'center', gap: '1rem',
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
        <div style={{ flex: 1 }} />
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: C.muted, fontSize: '0.8rem' }}>
          <Link href="/" style={{ color: C.muted, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Home size={13} />
          </Link>
          <ChevronRight size={11} />
          <Link href="/urunler" style={{ color: C.muted, textDecoration: 'none' }}>Ürünler</Link>
          <ChevronRight size={11} />
          <span style={{ color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</span>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Back link */}
        <Link
          href="/urunler"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: C.muted, textDecoration: 'none', fontSize: '0.85rem', marginBottom: '2.5rem', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >
          <ArrowLeft size={16} /> Ürünlere Geri Dön
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          {/* ======= LEFT: Image Gallery ======= */}
          <div>
            {/* Main image */}
            <div style={{
              position: 'relative',
              aspectRatio: '1/1',
              borderRadius: '20px',
              overflow: 'hidden',
              background: C.bg2,
              border: `1px solid ${C.border}`,
              marginBottom: '1rem',
            }}>
              {allImages[activeImg] && (
                <Image
                  src={allImages[activeImg]}
                  alt={product.title}
                  fill
                  priority
                  style={{ objectFit: 'contain', padding: '1.5rem' }}
                />
              )}
              {product.badge && (
                <span style={{
                  position: 'absolute', top: '1rem', left: '1rem',
                  padding: '0.3rem 0.75rem', borderRadius: '6px',
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: badgeColor, color: '#fff',
                }}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: '70px', height: '70px', borderRadius: '10px',
                      overflow: 'hidden', position: 'relative',
                      border: `2px solid ${activeImg === i ? C.red : C.border}`,
                      background: C.bg, cursor: 'pointer', flexShrink: 0,
                      transition: 'border-color 0.2s',
                      padding: 0,
                    }}
                  >
                    <Image src={img} alt={`Görsel ${i + 1}`} fill style={{ objectFit: 'contain', padding: '4px' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ======= RIGHT: Product Info ======= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Brand + Category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {product.brand_name && (
                <span style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: C.red,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  background: 'rgba(230,51,41,0.1)',
                  border: '1px solid rgba(230,51,41,0.25)',
                }}>
                  {product.brand_name}
                </span>
              )}
              <span style={{
                fontSize: '0.72rem', color: C.muted,
                padding: '0.25rem 0.75rem', borderRadius: '20px',
                background: C.surface, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: '0.375rem',
              }}>
                <Tag size={11} /> {categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#fff',
              lineHeight: 1.2,
            }}>
              {product.title}
            </h1>

            {/* Price */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(230,51,41,0.07)',
              border: '1px solid rgba(230,51,41,0.15)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: C.muted, marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fiyat</p>
                <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '2.25rem', color: C.red, lineHeight: 1 }}>
                  ₺{product.price.toFixed(2)}
                </span>
              </div>
              <Package size={32} color="rgba(230,51,41,0.3)" />
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.625rem' }}>
                  Açıklama
                </p>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.8 }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
              {[
                { icon: <Shield size={15} />, text: 'UV Dayanımlı' },
                { icon: <Droplets size={15} />, text: 'Su Geçirmez' },
                { icon: <Zap size={15} />, text: 'Kolay Montaj' },
                { icon: <Star size={15} />, text: 'Premium Kalite' },
              ].map((feat, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 0.875rem', borderRadius: '10px',
                  background: C.surface, border: `1px solid ${C.border}`,
                  fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)',
                }}>
                  <span style={{ color: C.red }}>{feat.icon}</span>
                  {feat.text}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {product.shopier_link && (
                <a
                  href={product.shopier_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                    padding: '1rem', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #e63329 0%, #c41f15 100%)',
                    color: '#fff', textDecoration: 'none',
                    fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '0.95rem',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    boxShadow: '0 8px 30px rgba(230,51,41,0.35)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.transform = 'translateY(-2px)'; (e.currentTarget).style.boxShadow = '0 14px 40px rgba(230,51,41,0.5)'; }}
                  onMouseLeave={e => { (e.currentTarget).style.transform = ''; (e.currentTarget).style.boxShadow = '0 8px 30px rgba(230,51,41,0.35)'; }}
                >
                  <ShoppingBag size={18} /> Shopier'dan Satın Al <ExternalLink size={14} />
                </a>
              )}
              {product.trendyol_link && (
                <a
                  href={product.trendyol_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                    padding: '0.875rem', borderRadius: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,140,0,0.4)',
                    color: '#ff8c00', textDecoration: 'none',
                    fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '0.875rem',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,140,0,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
                >
                  <ExternalLink size={16} /> Trendyol'da Görüntüle
                </a>
              )}
              <button
                onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', borderRadius: '12px', cursor: 'pointer',
                  background: C.surface, border: `1px solid ${C.border}`,
                  color: C.muted, fontSize: '0.8rem', fontFamily: '"Inter", sans-serif',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = C.border; (e.currentTarget).style.color = C.muted; }}
              >
                <Share2 size={15} /> Paylaş
              </button>
            </div>

            {/* Meta info */}
            <div style={{
              padding: '1rem 1.25rem',
              background: C.surface,
              borderRadius: '12px',
              border: `1px solid ${C.border}`,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
              fontSize: '0.78rem',
            }}>
              {product.brand_name && (
                <div>
                  <p style={{ color: C.muted, marginBottom: '0.125rem', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Marka</p>
                  <p style={{ color: '#fff', fontWeight: 700 }}>{product.brand_name}</p>
                </div>
              )}
              <div>
                <p style={{ color: C.muted, marginBottom: '0.125rem', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Kategori</p>
                <p style={{ color: '#fff', fontWeight: 700 }}>{categoryLabel}</p>
              </div>
              {product.badge && (
                <div>
                  <p style={{ color: C.muted, marginBottom: '0.125rem', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Etiket</p>
                  <p style={{ color: badgeColor, fontWeight: 700 }}>{product.badge}</p>
                </div>
              )}
              <div>
                <p style={{ color: C.muted, marginBottom: '0.125rem', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.1em' }}>Stok Durumu</p>
                <p style={{ color: '#22c55e', fontWeight: 700 }}>✓ Stokta Var</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer simple */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: '2rem', textAlign: 'center', color: C.muted, fontSize: '0.78rem' }}>
        © 2024 Utku Giyim. Tüm hakları saklıdır.
      </div>
    </div>
  );
}
