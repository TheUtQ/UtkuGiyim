'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Phone, Mail, MapPin, Instagram, ArrowRight, Menu, X, ShoppingBag, ExternalLink } from 'lucide-react';

/* ===== Types ===== */
interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand_name: string;
  image_url: string;
  badge: string;
  badge_type: string | null;
  shopier_link: string;
  trendyol_link: string;
}

interface SeoItem {
  id: number;
  title: string;
  content: string;
}

interface LandingProps {
  settings: Record<string, string>;
  seleProducts: Product[];
  vitesProducts: Product[];
  seoContent: SeoItem[];
}

interface VisionCard { emoji: string; title: string; desc: string; }
interface VisionLine { text: string; color: string; }
interface ProductSpec { icon: string; text: string; }

const ease = [0.25, 1, 0.5, 1] as const;

/* ===== Mağaza Modal ===== */
function MagazaModal({ settings, onClose }: { settings: Record<string, string>; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9990,
          background: 'rgba(10,10,12,0.75)',
          backdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ duration: 0.4, ease }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'rgba(17,17,21,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
          >
            <X size={20} />
          </button>
          <div>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', color: '#e63329', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
              Mağazalarımız
            </p>
            <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '1.5rem', color: '#fff' }}>
              Alışverişe Başla
            </h3>
            <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.375rem' }}>
              Tercih ettiğiniz platformdan alışveriş yapın
            </p>
          </div>

          {settings.shopier_url && (
            <a
              href={settings.shopier_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.125rem 1.375rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #e63329 0%, #c41f15 100%)',
                color: '#fff', textDecoration: 'none',
                fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem',
                boxShadow: '0 8px 30px rgba(230,51,41,0.35)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { (e.currentTarget).style.transform = 'translateY(-2px)'; (e.currentTarget).style.boxShadow = '0 14px 40px rgba(230,51,41,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget).style.transform = ''; (e.currentTarget).style.boxShadow = '0 8px 30px rgba(230,51,41,0.35)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <ShoppingBag size={20} />
                <div>
                  <div>Shopier</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>Güvenli ödeme</div>
                </div>
              </div>
              <ExternalLink size={16} />
            </a>
          )}

          {settings.trendyol_url && (
            <a
              href={settings.trendyol_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.125rem 1.375rem',
                borderRadius: '14px',
                background: 'rgba(255,140,0,0.08)',
                border: '1px solid rgba(255,140,0,0.35)',
                color: '#ff8c00', textDecoration: 'none',
                fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,140,0,0.14)'; }}
              onMouseLeave={e => { (e.currentTarget).style.background = 'rgba(255,140,0,0.08)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <ShoppingBag size={20} />
                <div>
                  <div>Trendyol</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.8 }}>Hızlı kargo avantajı</div>
                </div>
              </div>
              <ExternalLink size={16} />
            </a>
          )}

          {!settings.shopier_url && !settings.trendyol_url && (
            <p style={{ color: '#555', textAlign: 'center', fontSize: '0.875rem' }}>Mağaza linki henüz eklenmemiş.</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ===== Product Card ===== */
function ProductCard({ product, index, direction }: { product: Product; index: number; direction: 'left' | 'right' }) {
  const [hovered, setHovered] = useState(false);

  const badgeColor = product.badge_type === 'hot'
    ? '#e63329' : product.badge_type === 'new' ? '#00b4f0' : '#a855f7';

  const slideAnim = {
    hidden: { opacity: 0, x: direction === 'left' ? -60 : 60 },
    visible: (i: number) => ({
      opacity: 1, x: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease },
    }),
  };

  return (
    <motion.div
      custom={index}
      variants={slideAnim}
      className="ug-product-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image wrapper */}
      <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', background: '#0a0a0c' }}>
        {product.image_url && (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="ug-card-img"
            style={{ objectFit: 'contain', transition: 'transform 0.5s ease' }}
          />
        )}
        {product.badge && (
          <span style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 10,
            padding: '0.25rem 0.625rem', borderRadius: '5px',
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: badgeColor, color: '#fff',
          }}>
            {product.badge}
          </span>
        )}
        {/* Hover overlay */}
        <Link
          href={`/urunler/${product.slug}`}
          className="ug-card-overlay"
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.5) 50%, transparent 100%)',
            opacity: 0,
            transition: 'opacity 0.4s ease',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: '1rem', zIndex: 10, textDecoration: 'none',
          }}
        >
          <span style={{ color: '#e63329', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            {product.brand_name || 'Utku Giyim'}
          </span>
          <span style={{ color: '#fff', fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            {product.title}
          </span>
          <span style={{ color: '#e63329', fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '1rem' }}>
            ₺{product.price?.toFixed(2)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', marginTop: '0.375rem' }}>
            İncele <ArrowRight size={12} />
          </span>
        </Link>

        {/* Glow */}
        <div className="ug-card-glow" style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: '2.5rem', borderRadius: '50%',
          opacity: 0, filter: 'blur(15px)',
          background: badgeColor,
          transition: 'opacity 0.4s ease',
        }} />
      </div>

      {/* Card info */}
      <div style={{ padding: '0.875rem' }}>
        {product.brand_name && (
          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#e63329', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>
            {product.brand_name}
          </p>
        )}
        <h3 className="font-outfit" style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff', marginBottom: '0.375rem' }}>
          {product.title}
        </h3>
        <span className="font-outfit" style={{ fontWeight: 900, color: '#e63329', fontSize: '1rem' }}>
          ₺{product.price?.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}

/* ===== Main Component ===== */
export default function LandingClient({ settings, seleProducts, vitesProducts, seoContent }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [magazaOpen, setMagazaOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  /* Parse JSON settings safely */
  const visionCards: VisionCard[] = (() => {
    try { return JSON.parse(settings.vision_cards || '[]'); } catch { return [
      { emoji: '🛡️', title: 'Dayanıklılık', desc: 'UV ve su dayanımlı malzemeler' },
      { emoji: '⚡', title: 'Hızlı Kargo', desc: 'Sipariş sonrası aynı gün gönderim' },
      { emoji: '⭐', title: 'Premium Kalite', desc: 'Titizlikle seçilmiş kumaşlar' },
      { emoji: '💧', title: 'Su Geçirmez', desc: 'Yağmurda bile tam koruma' },
    ]; }
  })();

  const visionLines: VisionLine[] = (() => {
    try { return JSON.parse(settings.vision_lines || '[]'); } catch { return [
      { text: 'Premium malzemeler ile üst düzey dayanıklılık', color: 'red' },
      { text: 'Her motosiklet için özel tasarım kılıflar', color: 'blue' },
      { text: 'Otomobil tutkusu vites sweatshirtlerde', color: 'red' },
      { text: 'Hızlı kargo & sorunsuz alışveriş', color: 'blue' },
    ]; }
  })();

  const productSpecs: ProductSpec[] = (() => {
    try { return JSON.parse(settings.product_specs || '[]'); } catch { return [
      { icon: '🛡️', text: 'UV Dayanımlı Kumaş — Solmaya karşı koruma' },
      { icon: '💧', text: 'Su İtici Yüzey — Yağmurda bile kuru kalır' },
      { icon: '🔧', text: 'Kolay Montaj — 30 saniyede takılır' },
      { icon: '✨', text: 'Elastik Yapı — Her seleye mükemmel uyum' },
    ]; }
  })();

  const showSele = settings.show_sele_collection !== '0';
  const showVites = settings.show_vites_collection !== '0';

  // Max 5 products per collection
  const seleSlice = seleProducts.slice(0, 5);
  const vitesSlice = vitesProducts.slice(0, 5);

  /* Custom cursor */
  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = cursorRingRef.current;
    if (!cursor || !ring) return;
    const move = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  /* Navbar scroll */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* Close modal on ESC */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMagazaOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Hero parallax */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const fadeUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8, ease } }),
  };
  const slideInLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.15, duration: 0.9, ease } }),
  };
  const slideInRight = {
    hidden: { opacity: 0, x: 80 },
    visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.15, duration: 0.9, ease } }),
  };
  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="grain-overlay">
      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor" style={{ display: 'none' }} />
      <div ref={cursorRingRef} className="custom-cursor-ring" style={{ display: 'none' }} />

      {/* Mağaza Modal */}
      {magazaOpen && <MagazaModal settings={settings} onClose={() => setMagazaOpen(false)} />}

      {/* ====================== NAV ====================== */}
      <nav id="navbar" className={`ug-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="#" style={{ textDecoration: 'none' }}>
          <span className="font-outfit" style={{
            fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em',
            background: 'linear-gradient(to right, #fff, var(--ug-red))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            UTKU GİYİM
          </span>
        </a>

        {/* Desktop Nav */}
        <ul className="ug-nav-list">
          {[
            ['Ürünler', '/urunler'],
            ['Hakkımızda', '#vision'],
            ['SSS', '#sss'],
            ['İletişim', '#footer'],
          ].map(([label, href]) => (
            <li key={href}>
              <a href={href} className="ug-nav-link">{label}</a>
            </li>
          ))}
        </ul>

        {/* Mağaza Button */}
        <button
          onClick={() => setMagazaOpen(true)}
          className="ug-btn ug-btn-primary ug-btn-sm ug-nav-cta"
          style={{ cursor: 'pointer', border: 'none' }}
        >
          <ShoppingBag size={16} />
          Mağaza
        </button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="ug-hamburger"
          aria-label="Menü"
        >
          {mobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(10,10,12,0.97)', backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem',
            }}
          >
            {[
              ['Ürünler', '/urunler'],
              ['Hakkımızda', '#vision'],
              ['SSS', '#sss'],
              ['İletişim', '#footer'],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-outfit"
                style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', textDecoration: 'none', transition: 'color 0.3s' }}
              >
                {label}
              </a>
            ))}
            <button
              onClick={() => { setMagazaOpen(true); setMobileMenuOpen(false); }}
              className="ug-btn ug-btn-primary"
              style={{ marginTop: '1rem', fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}
            >
              Mağazalarımız
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================== HERO ====================== */}
      <section ref={heroRef} id="hero" style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <motion.div style={{ scale: heroScale, position: 'absolute', inset: 0, willChange: 'transform' }}>
          <Image
            src="/images/hero/hero_moto_bg_1771774801552.png"
            alt="Utku Giyim Premium Motosiklet Aksesuarları"
            fill priority
            style={{ objectFit: 'cover' }}
          />
        </motion.div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,12,0.8) 0%, rgba(10,10,12,0.4) 50%, rgba(10,10,12,0.85) 100%)' }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '56rem', padding: '0 1.5rem', width: '100%' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease }}>
            <span className="ug-hero-badge">{settings.hero_badge || 'PREMIUM KALİTE'}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease }}
            className="ug-hero-title"
            style={{ marginBottom: '1.5rem', color: '#fff' }}
            dangerouslySetInnerHTML={{
              __html: (settings.hero_title || 'Sürüşünüze <span>Premium</span> Dokunuş').replace(
                /<span>/g, '<span style="color:var(--ug-red)">'
              ),
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease }}
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', fontWeight: 300, maxWidth: '36rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}
          >
            {settings.hero_subtitle || 'Özel tasarım motosiklet sele kılıfları ve vites sweatshirtleri ile farkınızı ortaya koyun.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8, ease }}
            className="ug-btn-group"
          >
            {/* Ürünleri Keşfet → /urunler */}
            <Link href="/urunler" className="ug-btn ug-btn-primary glow-pulse">
              Ürünleri Keşfet
              <ArrowRight size={18} />
            </Link>

            {/* Mağazalarımız → blur modal */}
            <button
              onClick={() => setMagazaOpen(true)}
              className="ug-btn ug-btn-outline"
              style={{ border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ShoppingBag size={18} />
              Mağazalarımız
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.8 }}
          style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
        >
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ug-muted)' }}>Keşfet</span>
          <div className="scroll-line-anim" style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, var(--ug-red), transparent)' }} />
        </motion.div>
      </section>

      {/* ====================== STATS BAR ====================== */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}
        variants={staggerContainer}
        className="ug-stats-bar"
      >
        {[
          ['5000+', 'Mutlu Müşteri'],
          ['50+', 'Ürün Çeşidi'],
          ['%100', 'Memnuniyet'],
          ['24 Saat', 'Hızlı Kargo'],
        ].map(([num, label], i) => (
          <motion.div key={label} custom={i} variants={fadeUp} style={{ textAlign: 'center' }}>
            <span className="font-outfit" style={{ fontWeight: 900, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--ug-red)', display: 'block', lineHeight: 1 }}>{num}</span>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ug-muted)', marginTop: '0.375rem', display: 'block' }}>{label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ====================== VISION / ABOUT ====================== */}
      <section id="vision" className="ug-section ug-section-bg2">
        <div className="ug-container">
          <div className="ug-vision-grid">
            {/* Left — Manifesto */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}
            >
              <motion.span custom={0} variants={fadeUp} className="ug-label">Vizyonumuz</motion.span>
              <motion.h2 custom={1} variants={fadeUp} className="ug-section-title" style={{ marginBottom: '2rem', color: '#fff' }}>
                Kalite, Tutku <br /><span style={{ color: 'var(--ug-red)' }}>&</span> Stil
              </motion.h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {visionLines.map((line, i) => (
                  <motion.div
                    key={i} custom={i} variants={slideInLeft}
                    className="ug-manifesto-item font-outfit"
                    style={{ borderLeft: `3px solid ${line.color === 'red' ? 'var(--ug-red)' : 'var(--ug-blue)'}` }}
                  >
                    {line.text}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — Feature Cards (from settings) */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="ug-feature-grid"
            >
              {visionCards.map((card, i) => (
                <motion.div key={i} custom={i} variants={fadeUp} className="ug-feature-card">
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem', lineHeight: 1 }}>{card.emoji}</div>
                  <h3 className="font-outfit" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: '#fff' }}>{card.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--ug-muted)', lineHeight: 1.6 }}>{card.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {settings.about_text && (
            <motion.div
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8, ease }}
              style={{ maxWidth: '48rem', margin: '4rem auto 0', textAlign: 'center' }}
            >
              <p style={{ color: 'var(--ug-muted)', fontSize: '1rem', lineHeight: 1.9 }}>{settings.about_text}</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ====================== SELE KILIFI SECTION ====================== */}
      {showSele && (
        <section id="sele" className="ug-section ug-section-bg">
          <div className="ug-container">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer} className="ug-section-header"
            >
              <motion.span custom={0} variants={fadeUp} className="ug-label">Koleksiyon</motion.span>
              <motion.h2 custom={1} variants={fadeUp} className="ug-section-title-center" style={{ marginBottom: '1rem', color: '#fff' }}>
                Motosiklet Sele Kılıfları
              </motion.h2>
              <motion.p custom={2} variants={fadeUp} style={{ color: 'var(--ug-muted)', fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>
                Her motosiklete uygun, UV dayanımlı, su geçirmez premium sele kılıfları.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer} className="ug-product-grid"
            >
              {seleSlice.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} direction="left" />
              ))}
            </motion.div>

            {/* Specs — from settings */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer} className="ug-specs-grid"
            >
              <motion.div custom={0} variants={slideInLeft}>
                <h3 className="font-outfit" style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff' }}>Neden Utku Sele Kılıfı?</h3>
                <p style={{ color: 'var(--ug-muted)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  Her ürün özenle seçilmiş spandex kumaşlardan üretilir. UV ışınlarına, yağmura ve tozlanmaya karşı selenizi korur.
                </p>
                <button
                  onClick={() => setMagazaOpen(true)}
                  className="ug-btn ug-btn-primary ug-btn-sm"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <ShoppingBag size={16} />
                  Hemen Satın Al
                </button>
              </motion.div>

              <motion.div custom={1} variants={slideInRight}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
                  {productSpecs.map((spec, i) => (
                    <motion.li key={i} custom={i} variants={fadeUp} className="ug-spec-item">
                      <span style={{ fontSize: '1.125rem' }}>{spec.icon}</span>
                      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>{spec.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ====================== VİTES SWEATSHIRT SECTION ====================== */}
      {showVites && (
        <section id="vites" className="ug-section ug-section-bg2">
          <div className="ug-container">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer} className="ug-section-header"
            >
              <motion.span custom={0} variants={fadeUp} className="ug-label-blue">Yeni Koleksiyon</motion.span>
              <motion.h2 custom={1} variants={fadeUp} className="ug-section-title-center" style={{ marginBottom: '1rem', color: '#fff' }}>
                Vites Sweatshirtleri
              </motion.h2>
              <motion.p custom={2} variants={fadeUp} style={{ color: 'var(--ug-muted)', fontSize: '1rem', maxWidth: '32rem', margin: '0 auto' }}>
                Otomobil tutkunları için tasarlanmış, marka logolu premium vites sweatshirtler.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer} className="ug-product-grid"
            >
              {vitesSlice.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} direction="right" />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ====================== SEO ACCORDION ====================== */}
      {seoContent.length > 0 && (
        <section id="sss" className="ug-section ug-section-bg">
          <div className="ug-container-lg">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer} className="ug-section-header"
            >
              <motion.span custom={0} variants={fadeUp} className="ug-label">Sıkça Sorulan Sorular</motion.span>
              <motion.h2 custom={1} variants={fadeUp} className="ug-section-title-center" style={{ color: '#fff' }}>
                Merak Edilenler
              </motion.h2>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              {seoContent.map((item, i) => (
                <motion.article key={item.id} custom={i} variants={fadeUp}>
                  <button
                    onClick={() => setActiveAccordion(activeAccordion === item.id ? null : item.id)}
                    className="ug-accordion-btn"
                  >
                    <h3 className="font-outfit" style={{ fontWeight: 700, fontSize: '1rem', paddingRight: '1rem', color: '#fff' }}>{item.title}</h3>
                    <ChevronDown
                      size={20}
                      style={{
                        color: activeAccordion === item.id ? 'var(--ug-red)' : 'var(--ug-muted)',
                        transform: activeAccordion === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease, color 0.3s ease',
                        flexShrink: 0,
                      }}
                    />
                  </button>
                  <div className={`accordion-content${activeAccordion === item.id ? ' open' : ''}`}>
                    <p style={{ padding: '0.75rem 1.25rem 1.25rem', color: 'var(--ug-muted)', lineHeight: 1.8, fontSize: '0.9rem' }}>
                      {item.content}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ====================== CTA SECTION ====================== */}
      <section className="ug-cta-section">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: 'rgba(230,51,41,0.08)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          style={{ position: 'relative', zIndex: 10, maxWidth: '48rem', margin: '0 auto' }}
        >
          <h2 className="ug-section-title-center font-outfit" style={{ marginBottom: '1.5rem', color: '#fff' }}>
            Sürüşünüze <span style={{ color: 'var(--ug-red)' }}>Premium</span> Dokunuş <br /> Katmaya Hazır mısınız?
          </h2>
          <p style={{ color: 'var(--ug-muted)', fontSize: '1rem', marginBottom: '2.5rem', maxWidth: '32rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Şimdi alışveriş yapın, aynı gün kargoda. Tüm ürünlerde iade garantisi.
          </p>
          <div className="ug-btn-group">
            <button
              onClick={() => setMagazaOpen(true)}
              className="ug-btn ug-btn-primary"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <ShoppingBag size={18} />
              Mağazalarımız
              <ArrowRight size={16} />
            </button>
            <a
              href={`https://wa.me/${settings.whatsapp || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ug-btn ug-btn-whatsapp"
            >
              WhatsApp
            </a>
          </div>
        </motion.div>
      </section>

      {/* ====================== FOOTER ====================== */}
      <footer id="footer" className="ug-section ug-section-bg ug-border-t">
        <div className="ug-container">
          <div className="ug-footer-grid">
            <div>
              <h3 className="font-outfit" style={{
                fontWeight: 900, fontSize: '1.5rem',
                background: 'linear-gradient(to right, #fff, var(--ug-red))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                marginBottom: '1rem',
              }}>
                UTKU GİYİM
              </h3>
              <p style={{ color: 'var(--ug-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                Premium motosiklet aksesuarları. Özel tasarım sele kılıfları ve vites sweatshirtleri.
              </p>
            </div>

            <div>
              <h4 className="font-outfit" style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: '#fff' }}>
                Hızlı Bağlantılar
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  ['Sele Kılıfları', '#sele'],
                  ['Vites Sweatshirtleri', '#vites'],
                  ['Hakkımızda', '#vision'],
                  ['SSS', '#sss'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a href={href} style={{ color: 'var(--ug-muted)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ug-muted)')}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-outfit" style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: '#fff' }}>
                İletişim
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {settings.phone && (
                  <a href={`tel:${settings.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ug-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
                    <Phone size={14} /> {settings.phone}
                  </a>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ug-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
                    <Mail size={14} /> {settings.email}
                  </a>
                )}
                {settings.address && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ug-muted)', fontSize: '0.875rem' }}>
                    <MapPin size={14} /> {settings.address}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-outfit" style={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: '#fff' }}>
                Sosyal Medya
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {settings.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noopener noreferrer"
                    style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ug-muted)', textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(230,51,41,0.4)'; (e.currentTarget).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget).style.color = 'var(--ug-muted)'; }}
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {settings.trendyol_url && (
                  <a href={settings.trendyol_url} target="_blank" rel="noopener noreferrer"
                    style={{ padding: '0 0.75rem', height: '40px', borderRadius: '10px', border: '1px solid rgba(255,140,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#ff8c00', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(255,140,0,0.08)'; }}
                    onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
                  >
                    <ShoppingBag size={14} /> Trendyol
                  </a>
                )}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '3rem', paddingTop: '2rem', textAlign: 'center', color: 'var(--ug-muted)', fontSize: '0.775rem' }}>
            {settings.footer_text || '© 2024 Utku Giyim. Tüm hakları saklıdır.'}
          </div>
        </div>
      </footer>
    </div>
  );
}
