'use client';

import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Settings, FileText,
  LogOut, Plus, Pencil, Trash2, Save, Upload, X,
  Package, Eye, ChevronRight, TrendingUp
} from 'lucide-react';
import Image from 'next/image';

/* ===== Types ===== */
interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand_id: number | null;
  brand_name: string;
  image_url: string;
  extra_images: string | null;
  badge: string;
  badge_type: string | null;
  shopier_link: string;
  trendyol_link: string;
  is_active: number;
  sort_order: number;
}

interface SeoItem {
  id: number;
  title: string;
  content: string;
  sort_order: number;
  is_active: number;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_active: number;
  sort_order: number;
  product_count?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  sort_order: number;
  product_count?: number;
}

type Tab = 'overview' | 'products' | 'seo' | 'settings' | 'catalog';

/* ===== CSS Variables (inline) ===== */
const C = {
  bg: '#0a0a0c',
  bg2: '#111115',
  bg3: '#18181f',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(230,51,41,0.3)',
  text: '#f0f0f0',
  muted: '#888',
  red: '#e63329',
  redGlow: 'rgba(230,51,41,0.25)',
  blue: '#00b4f0',
  green: '#22c55e',
  purple: '#a855f7',
};

/* ===== Toast ===== */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
      padding: '0.875rem 1.5rem',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: 500,
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      background: type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      color: type === 'success' ? '#4ade80' : '#f87171',
      animation: 'toastSlide 0.4s cubic-bezier(0.25,1,0.5,1) forwards',
    }}>
      {message}
    </div>
  );
}

/* ===== Main Dashboard ===== */
export default function AdminDashboard({ username }: { username: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [seoContent, setSeoContent] = useState<SeoItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, seoRes, settingsRes, brandsRes, catsRes] = await Promise.all([
        fetch('/api/products?admin=true'),
        fetch('/api/seo-content?admin=true'),
        fetch('/api/settings'),
        fetch('/api/brands?admin=true'),
        fetch('/api/categories?admin=true'),
      ]);
      setProducts(await productsRes.json());
      setSeoContent(await seoRes.json());
      setSettings(await settingsRes.json());
      setBrands(await brandsRes.json());
      setCategories(await catsRes.json());
    } catch {
      showToast('Veriler yüklenemedi.', 'error');
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin');
    router.refresh();
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Ürünler', icon: <ShoppingBag size={18} /> },
    { id: 'catalog', label: 'Marka & Kategori', icon: <Package size={18} /> },
    { id: 'seo', label: 'SEO İçerik', icon: <FileText size={18} /> },
    { id: 'settings', label: 'Ayarlar', icon: <Settings size={18} /> },
  ];

  const tabLabels: Record<Tab, string> = {
    overview: 'Genel Bakış',
    products: 'Ürünler',
    catalog: 'Marka & Kategori',
    seo: 'SEO İçerik',
    settings: 'Ayarlar',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', fontFamily: '"Inter", sans-serif', color: C.text }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none', // controlled via responsive CSS below
          position: 'fixed', top: '1rem', left: '1rem', zIndex: 100,
          padding: '0.5rem', background: C.bg2,
          border: `1px solid ${C.border}`, borderRadius: '8px', cursor: 'pointer',
          color: C.text,
        }}
        className="admin-mobile-toggle"
      >
        {sidebarOpen ? <X size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: '260px',
        minWidth: '260px',
        background: C.bg2,
        borderRight: `1px solid ${C.border}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.75rem 1.5rem', borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 900,
            fontSize: '1.25rem',
            background: `linear-gradient(to right, #fff, ${C.red})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.25rem',
          }}>
            UTKU GİYİM
          </div>
          <p style={{ color: C.muted, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: `1px solid ${isActive ? 'rgba(230,51,41,0.25)' : 'transparent'}`,
                  background: isActive ? 'rgba(230,51,41,0.1)' : 'transparent',
                  color: isActive ? C.red : C.muted,
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    (e.currentTarget as HTMLButtonElement).style.background = C.surface;
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = C.muted;
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div style={{ padding: '1rem 0.75rem', borderTop: `1px solid ${C.border}` }}>
          <div style={{ padding: '0.75rem 1rem', background: C.surface, borderRadius: '10px', marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '0.125rem' }}>{username}</p>
            <p style={{ fontSize: '0.7rem', color: C.muted }}>Yönetici</p>
          </div>
          <SideLink icon={<LogOut size={15} />} label="Çıkış Yap" onClick={handleLogout} danger />
          <SideLink icon={<Eye size={15} />} label="Siteyi Görüntüle" href="/" />
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main style={{ flex: 1, minHeight: '100vh', padding: '2.5rem 2.5rem', overflowY: 'auto', background: C.bg }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem' }}>
            {tabLabels[activeTab]}
          </h2>
          <p style={{ color: C.muted, fontSize: '0.875rem' }}>Utku Giyim yönetim paneline hoş geldiniz.</p>
        </div>

        {activeTab === 'overview' && <OverviewTab products={products} seoContent={seoContent} />}
        {activeTab === 'products' && <ProductsTab products={products} brands={brands} categories={categories} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'catalog' && <CatalogTab brands={brands} categories={categories} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'seo' && <SeoTab seoContent={seoContent} onRefresh={fetchData} showToast={showToast} />}
        {activeTab === 'settings' && <SettingsTab settings={settings} onRefresh={fetchData} showToast={showToast} products={products} />}
      </main>
    </div>
  );
}

/* ===== Sidebar Link ===== */
function SideLink({ icon, label, onClick, href, danger }: { icon: React.ReactNode; label: string; onClick?: () => void; href?: string; danger?: boolean }) {
  const style: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    background: 'transparent',
    border: '1px solid transparent',
    color: danger ? '#f87171' : C.muted,
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    marginBottom: '0.25rem',
    fontFamily: '"Inter", sans-serif',
  };

  const hoverIn = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(239,68,68,0.08)' : C.surface;
    (e.currentTarget as HTMLElement).style.borderColor = danger ? 'rgba(239,68,68,0.2)' : C.border;
    (e.currentTarget as HTMLElement).style.color = danger ? '#f87171' : '#fff';
  };
  const hoverOut = (e: React.MouseEvent) => {
    (e.currentTarget as HTMLElement).style.background = 'transparent';
    (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
    (e.currentTarget as HTMLElement).style.color = danger ? '#f87171' : C.muted;
  };

  if (href) {
    return (
      <a href={href} target="_blank" style={style} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
        {icon}{label}
      </a>
    );
  }
  return (
    <button onClick={onClick} style={style} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {icon}{label}
    </button>
  );
}

/* ===== OVERVIEW TAB ===== */
function OverviewTab({ products, seoContent }: { products: Product[]; seoContent: SeoItem[] }) {
  const seleCount = products.filter(p => p.category === 'sele-kilifi').length;
  const vitesCount = products.filter(p => p.category === 'vites-sweatshirt').length;

  const stats = [
    { label: 'Toplam Ürün', value: products.length, icon: <Package size={22} />, color: C.red, bg: 'rgba(230,51,41,0.12)' },
    { label: 'Sele Kılıfı', value: seleCount, icon: <ShoppingBag size={22} />, color: C.blue, bg: 'rgba(0,180,240,0.12)' },
    { label: 'Vites Sweatshirt', value: vitesCount, icon: <TrendingUp size={22} />, color: C.purple, bg: 'rgba(168,85,247,0.12)' },
    { label: 'SEO İçerik', value: seoContent.length, icon: <FileText size={22} />, color: C.green, bg: 'rgba(34,197,94,0.12)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: C.bg2,
            border: `1px solid ${C.border}`,
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = stat.color + '44')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 900, fontSize: '1.875rem', color: '#fff', lineHeight: 1 }}>{stat.value}</p>
              <p style={{ color: C.muted, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '1.25rem' }}>
          Son Eklenen Ürünler
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {products.slice(0, 5).map(p => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.875rem 1rem',
              background: C.surface,
              borderRadius: '12px',
              border: `1px solid ${C.border}`,
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(230,51,41,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: C.bg, overflow: 'hidden', position: 'relative', flexShrink: 0, border: `1px solid ${C.border}` }}>
                {p.image_url && <Image src={p.image_url} alt={p.title} fill style={{ objectFit: 'contain' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: '0.125rem' }}>{p.category === 'sele-kilifi' ? 'Sele Kılıfı' : 'Vites Sweatshirt'}</p>
              </div>
              <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: C.red, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>₺{p.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== PRODUCTS TAB ===== */
function ProductsTab({
  products, brands, categories, onRefresh, showToast,
}: {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setEditProduct(prev => prev ? { ...prev, image_url: data.url } : null);
        showToast('Görsel yüklendi!');
      }
    } catch {
      showToast('Görsel yüklenemedi.', 'error');
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!editProduct?.title || !editProduct?.slug || !editProduct?.category) {
      showToast('Başlık, slug ve kategori zorunludur.', 'error');
      return;
    }
    if (!editProduct?.brand_id) {
      showToast('Marka bilgisi zorunludur.', 'error');
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? '/api/products' : `/api/products/${editProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      if (res.ok) {
        showToast(isNew ? 'Ürün eklendi!' : 'Ürün güncellendi!');
        setEditProduct(null);
        setIsNew(false);
        onRefresh();
      } else {
        const data = await res.json();
        showToast(data.error || 'İşlem başarısız.', 'error');
      }
    } catch {
      showToast('Sunucu hatası.', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('Ürün silindi.'); onRefresh(); }
    } catch {
      showToast('Silme işlemi başarısız.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: C.muted, fontSize: '0.875rem' }}>{products.length} ürün listeleniyor</p>
        <AdminBtn
          onClick={() => {
            setEditProduct({ title: '', slug: '', description: '', price: 0, category: categories[0]?.slug || 'sele-kilifi', brand_id: brands[0]?.id || null, image_url: '', badge: '', badge_type: null, shopier_link: '', trendyol_link: '', sort_order: 0, is_active: 1 });
            setIsNew(true);
          }}
          icon={<Plus size={16} />}
          label="Yeni Ürün"
        />
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <Modal title={isNew ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'} onClose={() => { setEditProduct(null); setIsNew(false); }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Başlık *">
              <AdminInput value={editProduct.title || ''} onChange={v => setEditProduct({ ...editProduct, title: v })} placeholder="Ürün başlığı" />
            </FormField>
            <FormField label="Slug *">
              <AdminInput value={editProduct.slug || ''} onChange={v => setEditProduct({ ...editProduct, slug: v })} placeholder="urun-slug" />
            </FormField>
          </div>
          <FormField label="Açıklama">
            <AdminInput value={editProduct.description || ''} onChange={v => setEditProduct({ ...editProduct, description: v })} placeholder="Açıklama" multiline />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <FormField label="Fiyat (₺)">
              <AdminInput value={String(editProduct.price || 0)} onChange={v => setEditProduct({ ...editProduct, price: parseFloat(v) })} type="number" />
            </FormField>
            <FormField label="Marka *">
              <AdminSelect
                value={String(editProduct.brand_id || '')}
                onChange={v => setEditProduct({ ...editProduct, brand_id: parseInt(v) || null })}
                options={[{ value: '', label: '-- Marka Seç --' }, ...brands.map(b => ({ value: String(b.id), label: b.name }))]}
              />
            </FormField>
            <FormField label="Kategori *">
              <AdminSelect
                value={editProduct.category || 'sele-kilifi'}
                onChange={v => setEditProduct({ ...editProduct, category: v })}
                options={categories.length > 0
                  ? categories.map(c => ({ value: c.slug, label: c.name }))
                  : [{ value: 'sele-kilifi', label: 'Sele Kılıfı' }, { value: 'vites-sweatshirt', label: 'Vites Sweatshirt' }]
                }
              />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <FormField label="Etiket">
              <AdminInput value={editProduct.badge || ''} onChange={v => setEditProduct({ ...editProduct, badge: v })} placeholder="ÇOK SATAN" />
            </FormField>
            <FormField label="Etiket Tipi">
              <AdminSelect value={editProduct.badge_type || ''} onChange={v => setEditProduct({ ...editProduct, badge_type: v || null })} options={[{ value: '', label: 'Yok' }, { value: 'hot', label: 'Hot (Kırmızı)' }, { value: 'new', label: 'New (Mavi)' }, { value: 'special', label: 'Special (Mor)' }]} />
            </FormField>
            <FormField label="Durum">
              <AdminSelect value={String(editProduct.is_active ?? 1)} onChange={v => setEditProduct({ ...editProduct, is_active: parseInt(v) })} options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Pasif' }]} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Shopier Link">
              <AdminInput value={editProduct.shopier_link || ''} onChange={v => setEditProduct({ ...editProduct, shopier_link: v })} placeholder="https://shopier.com/..." />
            </FormField>
            <FormField label="Trendyol Link">
              <AdminInput value={editProduct.trendyol_link || ''} onChange={v => setEditProduct({ ...editProduct, trendyol_link: v })} placeholder="https://trendyol.com/..." />
            </FormField>
          </div>
          {/* Image Upload */}
          <FormField label="Ürün Görseli">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {editProduct.image_url && (
                <div style={{ width: '72px', height: '72px', borderRadius: '12px', background: C.bg, border: `1px solid ${C.border}`, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  <Image src={editProduct.image_url} alt="Önizleme" fill style={{ objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <AdminInput value={editProduct.image_url || ''} onChange={v => setEditProduct({ ...editProduct, image_url: v })} placeholder="/images/products/..." />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <Upload size={14} />
                  {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
              </div>
            </div>
          </FormField>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.border}`, marginTop: '0.5rem' }}>
            <AdminBtn onClick={handleSave} icon={<Save size={15} />} label={saving ? 'Kaydediliyor...' : 'Kaydet'} disabled={saving} />
            <AdminBtn onClick={() => { setEditProduct(null); setIsNew(false); }} label="İptal" secondary />
          </div>
        </Modal>
      )}

      {/* Products List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {products.map(product => (
          <div key={product.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '1rem 1.25rem',
            background: C.bg2,
            border: `1px solid ${C.border}`,
            borderRadius: '14px',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(230,51,41,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: C.bg, overflow: 'hidden', position: 'relative', flexShrink: 0, border: `1px solid ${C.border}` }}>
              {product.image_url && <Image src={product.image_url} alt={product.title} fill style={{ objectFit: 'contain' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.375rem' }}>
                <span style={{ fontSize: '0.72rem', color: C.muted }}>{product.category === 'sele-kilifi' ? 'Sele Kılıfı' : 'Vites Sweatshirt'}</span>
                <span style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, color: C.red, fontSize: '0.85rem' }}>₺{product.price.toFixed(2)}</span>
                {product.badge && <Badge label={product.badge} />}
                {!product.is_active && <Badge label="Pasif" danger />}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <IconBtn icon={<Pencil size={15} />} onClick={() => { setEditProduct(product); setIsNew(false); }} title="Düzenle" />
              <IconBtn icon={<Trash2 size={15} />} onClick={() => handleDelete(product.id)} title="Sil" danger />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== CATALOG TAB (Marka & Kategori) ===== */
function CatalogTab({
  brands, categories, onRefresh, showToast,
}: {
  brands: Brand[];
  categories: Category[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [editBrand, setEditBrand] = useState<Partial<Brand> | null>(null);
  const [isNewBrand, setIsNewBrand] = useState(false);
  const [editCat, setEditCat] = useState<Partial<Category> | null>(null);
  const [isNewCat, setIsNewCat] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveBrand = async () => {
    if (!editBrand?.name || !editBrand?.slug) { showToast('İsim ve slug zorunlu.', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/brands', {
        method: isNewBrand ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editBrand),
      });
      if (res.ok) { showToast(isNewBrand ? 'Marka eklendi!' : 'Marka güncellendi!'); setEditBrand(null); setIsNewBrand(false); onRefresh(); }
      else showToast('İşlem başarısız.', 'error');
    } catch { showToast('Sunucu hatası.', 'error'); }
    setSaving(false);
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz? Markaya bağlı ürünler markasız kalacak.')) return;
    await fetch(`/api/brands?id=${id}`, { method: 'DELETE' });
    showToast('Marka silindi.'); onRefresh();
  };

  const handleSaveCat = async () => {
    if (!editCat?.name || !editCat?.slug) { showToast('İsim ve slug zorunlu.', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/categories', {
        method: isNewCat ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCat),
      });
      if (res.ok) { showToast(isNewCat ? 'Kategori eklendi!' : 'Kategori güncellendi!'); setEditCat(null); setIsNewCat(false); onRefresh(); }
      else showToast('İşlem başarısız.', 'error');
    } catch { showToast('Sunucu hatası.', 'error'); }
    setSaving(false);
  };

  const handleDeleteCat = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
    showToast('Kategori silindi.'); onRefresh();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
      {/* ===== BRANDS ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Markalar</h3>
          <AdminBtn onClick={() => { setEditBrand({ name: '', slug: '', description: '', sort_order: 0 }); setIsNewBrand(true); }} icon={<Plus size={15} />} label="Yeni Marka" />
        </div>

        {editBrand && (
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{isNewBrand ? '+ Yeni Marka' : 'Markayı Düzenle'}</p>
            <FormField label="Marka Adı *"><AdminInput value={editBrand.name || ''} onChange={v => setEditBrand({ ...editBrand, name: v })} placeholder="Utku Giyim" /></FormField>
            <FormField label="Slug *"><AdminInput value={editBrand.slug || ''} onChange={v => setEditBrand({ ...editBrand, slug: v })} placeholder="utku-giyim" /></FormField>
            <FormField label="Açıklama"><AdminInput value={editBrand.description || ''} onChange={v => setEditBrand({ ...editBrand, description: v })} placeholder="Kısa açıklama" multiline rows={2} /></FormField>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <AdminBtn onClick={handleSaveBrand} icon={<Save size={14} />} label={saving ? '...' : 'Kaydet'} disabled={saving} />
              <AdminBtn onClick={() => { setEditBrand(null); setIsNewBrand(false); }} label="İptal" secondary />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {brands.map(brand => (
            <div key={brand.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '12px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(230,51,41,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>{brand.name}</p>
                <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '2px' }}>
                  <span style={{ fontFamily: 'monospace', color: '#555' }}>{brand.slug}</span>
                  {brand.product_count !== undefined && (
                    <span style={{ marginLeft: '0.5rem', color: C.red }}>{brand.product_count} ürün</span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <IconBtn icon={<Pencil size={14} />} onClick={() => { setEditBrand(brand); setIsNewBrand(false); }} title="Düzenle" />
                <IconBtn icon={<Trash2 size={14} />} onClick={() => handleDeleteBrand(brand.id)} title="Sil" danger />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CATEGORIES ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Kategoriler</h3>
          <AdminBtn onClick={() => { setEditCat({ name: '', slug: '', description: '', sort_order: 0 }); setIsNewCat(true); }} icon={<Plus size={15} />} label="Yeni Kategori" />
        </div>

        {editCat && (
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <p style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{isNewCat ? '+ Yeni Kategori' : 'Kategoriyi Düzenle'}</p>
            <FormField label="Kategori Adı *"><AdminInput value={editCat.name || ''} onChange={v => setEditCat({ ...editCat, name: v })} placeholder="Sele Kılıfı" /></FormField>
            <FormField label="Slug *"><AdminInput value={editCat.slug || ''} onChange={v => setEditCat({ ...editCat, slug: v })} placeholder="sele-kilifi" /></FormField>
            <FormField label="Açıklama"><AdminInput value={editCat.description || ''} onChange={v => setEditCat({ ...editCat, description: v })} placeholder="Kısa açıklama" multiline rows={2} /></FormField>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <AdminBtn onClick={handleSaveCat} icon={<Save size={14} />} label={saving ? '...' : 'Kaydet'} disabled={saving} />
              <AdminBtn onClick={() => { setEditCat(null); setIsNewCat(false); }} label="İptal" secondary />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '12px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,180,240,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>{cat.name}</p>
                <p style={{ fontSize: '0.7rem', color: C.muted, marginTop: '2px' }}>
                  <span style={{ fontFamily: 'monospace', color: '#555' }}>{cat.slug}</span>
                  {cat.product_count !== undefined && (
                    <span style={{ marginLeft: '0.5rem', color: C.blue }}>{cat.product_count} ürün</span>
                  )}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <IconBtn icon={<Pencil size={14} />} onClick={() => { setEditCat(cat); setIsNewCat(false); }} title="Düzenle" />
                <IconBtn icon={<Trash2 size={14} />} onClick={() => handleDeleteCat(cat.id)} title="Sil" danger />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== SEO TAB ===== */
function SeoTab({
  seoContent, onRefresh, showToast,
}: {
  seoContent: SeoItem[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [editItem, setEditItem] = useState<Partial<SeoItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editItem?.title || !editItem?.content) {
      showToast('Başlık ve içerik zorunludur.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/seo-content', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItem),
      });
      if (res.ok) {
        showToast(isNew ? 'İçerik eklendi!' : 'İçerik güncellendi!');
        setEditItem(null);
        setIsNew(false);
        onRefresh();
      } else {
        showToast('İşlem başarısız.', 'error');
      }
    } catch {
      showToast('Sunucu hatası.', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/seo-content?id=${id}`, { method: 'DELETE' });
      if (res.ok) { showToast('İçerik silindi.'); onRefresh(); }
    } catch {
      showToast('Silme başarısız.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: C.muted, fontSize: '0.875rem' }}>{seoContent.length} içerik</p>
        <AdminBtn onClick={() => { setEditItem({ title: '', content: '', sort_order: 0, is_active: 1 }); setIsNew(true); }} icon={<Plus size={16} />} label="Yeni İçerik" />
      </div>

      {editItem && (
        <Modal title={isNew ? 'Yeni SEO İçerik' : 'İçeriği Düzenle'} onClose={() => { setEditItem(null); setIsNew(false); }}>
          <FormField label="Başlık *">
            <AdminInput value={editItem.title || ''} onChange={v => setEditItem({ ...editItem, title: v })} placeholder="SSS başlığı" />
          </FormField>
          <FormField label="İçerik *">
            <AdminInput value={editItem.content || ''} onChange={v => setEditItem({ ...editItem, content: v })} placeholder="İçerik metni" multiline rows={5} />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField label="Sıralama">
              <AdminInput value={String(editItem.sort_order || 0)} onChange={v => setEditItem({ ...editItem, sort_order: parseInt(v) })} type="number" />
            </FormField>
            <FormField label="Durum">
              <AdminSelect value={String(editItem.is_active ?? 1)} onChange={v => setEditItem({ ...editItem, is_active: parseInt(v) })} options={[{ value: '1', label: 'Aktif' }, { value: '0', label: 'Pasif' }]} />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1.25rem', borderTop: `1px solid ${C.border}` }}>
            <AdminBtn onClick={handleSave} icon={<Save size={15} />} label={saving ? 'Kaydediliyor...' : 'Kaydet'} disabled={saving} />
            <AdminBtn onClick={() => { setEditItem(null); setIsNew(false); }} label="İptal" secondary />
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {seoContent.map(item => (
          <div key={item.id} style={{
            padding: '1.25rem', background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '14px', transition: 'border-color 0.2s',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(230,51,41,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
          >
            <div style={{ flex: 1 }}>
              <h4 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.375rem' }}>{item.title}</h4>
              <p style={{ color: C.muted, fontSize: '0.8rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.content}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
                <Badge label={`Sıra: ${item.sort_order}`} />
                {!item.is_active && <Badge label="Pasif" danger />}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
              <IconBtn icon={<Pencil size={15} />} onClick={() => { setEditItem(item); setIsNew(false); }} title="Düzenle" />
              <IconBtn icon={<Trash2 size={15} />} onClick={() => handleDelete(item.id)} title="Sil" danger />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== SETTINGS TAB ===== */
function SettingsTab({
  settings, onRefresh, showToast, products
}: {
  settings: Record<string, string>;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  products: Product[];
}) {
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);

  // JSON-based state
  const parseJson = <T,>(key: string, fallback: T): T => {
    try { return JSON.parse(formData[key] || '[]'); } catch { return fallback; }
  };

  const [visionCards, setVisionCards] = useState<{ emoji: string; title: string; desc: string }[]>(
    () => parseJson('vision_cards', [{ emoji: '🛡️', title: 'Dayanıklılık', desc: 'UV ve su dayanımlı malzemeler' }])
  );
  const [visionLines, setVisionLines] = useState<{ text: string; color: string }[]>(
    () => parseJson('vision_lines', [{ text: 'Premium malzemeler', color: 'red' }])
  );
  const [specs, setSpecs] = useState<{ icon: string; text: string }[]>(
    () => parseJson('product_specs', [{ icon: '🛡️', text: 'UV Dayanımlı Kumaş' }])
  );
  const [showcaseSele, setShowcaseSele] = useState<number[]>(
    () => parseJson('showcase_sele', [])
  );
  const [showcaseVites, setShowcaseVites] = useState<number[]>(
    () => parseJson('showcase_vites', [])
  );

  useEffect(() => {
    setFormData(settings);
    try { setVisionCards(JSON.parse(settings.vision_cards || '[]')); } catch { /* no-op */ }
    try { setVisionLines(JSON.parse(settings.vision_lines || '[]')); } catch { /* no-op */ }
    try { setSpecs(JSON.parse(settings.product_specs || '[]')); } catch { /* no-op */ }
    try { setShowcaseSele(JSON.parse(settings.showcase_sele || '[]')); } catch { /* no-op */ }
    try { setShowcaseVites(JSON.parse(settings.showcase_vites || '[]')); } catch { /* no-op */ }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...formData,
      vision_cards: JSON.stringify(visionCards),
      vision_lines: JSON.stringify(visionLines),
      product_specs: JSON.stringify(specs),
      showcase_sele: JSON.stringify(showcaseSele.filter(Boolean)),
      showcase_vites: JSON.stringify(showcaseVites.filter(Boolean)),
    };
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) { showToast('Ayarlar güncellendi!'); onRefresh(); }
      else showToast('Güncelleme başarısız.', 'error');
    } catch { showToast('Sunucu hatası.', 'error'); }
    setSaving(false);
  };

  const settingGroups = [
    { title: 'Hero Bölümü', fields: [
      { key: 'hero_badge', label: 'Badge Metni', placeholder: 'PREMIUM KALİTE' },
      { key: 'hero_title', label: 'Başlık (HTML — <span> kırmızı olur)', placeholder: 'Sürüşünüze <span>Premium</span> Dokunuş', multiline: true },
      { key: 'hero_subtitle', label: 'Alt Başlık', placeholder: 'Özel tasarım...', multiline: true },
    ]},
    { title: 'Hakkımızda', fields: [
      { key: 'about_text', label: 'Hakkımızda Metni', placeholder: 'Utku Giyim olarak...', multiline: true },
    ]},
    { title: 'İletişim Bilgileri', fields: [
      { key: 'phone', label: 'Telefon', placeholder: '+90 555 123 4567' },
      { key: 'email', label: 'E-posta', placeholder: 'info@utkugiyim.com' },
      { key: 'address', label: 'Adres', placeholder: 'İstanbul, Türkiye' },
      { key: 'whatsapp', label: 'WhatsApp (sadece rakam)', placeholder: '905551234567' },
    ]},
    { title: 'Sosyal Medya', fields: [
      { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
      { key: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/...' },
      { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
    ]},
    { title: 'Mağaza Linkleri', fields: [
      { key: 'shopier_url', label: 'Shopier URL', placeholder: 'https://shopier.com/...' },
      { key: 'trendyol_url', label: 'Trendyol URL', placeholder: 'https://trendyol.com/...' },
    ]},
    { title: 'Footer', fields: [{ key: 'footer_text', label: 'Footer Metni', placeholder: '© 2024 Utku Giyim...' }]},
  ];

  return (
    <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ===== Koleksiyon Görünürlüğü ===== */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${C.border}` }}>
          🗂️ Koleksiyon Görünürlüğü
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { key: 'show_sele_collection', label: 'Sele Kılıfı Koleksiyonu', desc: 'Ana sayfada sele kılıfı bölümü gösterilsin' },
            { key: 'show_vites_collection', label: 'Vites Sweatshirt Koleksiyonu', desc: 'Ana sayfada vites sweatshirt bölümü gösterilsin' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: C.surface, borderRadius: '10px', border: `1px solid ${C.border}` }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>{item.label}</p>
                <p style={{ fontSize: '0.72rem', color: C.muted, marginTop: '2px' }}>{item.desc}</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, [item.key]: formData[item.key] === '0' ? '1' : '0' })}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                  background: formData[item.key] !== '0' ? C.red : '#333',
                  position: 'relative', transition: 'background 0.25s',
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: formData[item.key] !== '0' ? '25px' : '3px',
                  width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                  transition: 'left 0.25s',
                }} />
              </button>
            </div>
          ))}

          {/* Showcase Multi-Select for Sele Kılıfı */}
          {formData.show_sele_collection !== '0' && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.75rem', fontWeight: 600 }}>Sele Kılıfı Vitrin Ürünleri (Maks. 5)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <AdminSelect
                    key={index}
                    value={String(showcaseSele[index] || '')}
                    onChange={(v) => {
                      const newArr = [...showcaseSele];
                      newArr[index] = v ? Number(v) : 0;
                      setShowcaseSele(newArr);
                    }}
                    options={[
                      { value: '', label: 'Seçili Değil' },
                      ...products.filter(p => p.category === 'sele-kilifi').map(p => ({ value: String(p.id), label: p.title }))
                    ]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Showcase Multi-Select for Vites Sweatshirt */}
          {formData.show_vites_collection !== '0' && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '0.75rem', fontWeight: 600 }}>Vites Sweatshirt Vitrin Ürünleri (Maks. 5)</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <AdminSelect
                    key={index}
                    value={String(showcaseVites[index] || '')}
                    onChange={(v) => {
                      const newArr = [...showcaseVites];
                      newArr[index] = v ? Number(v) : 0;
                      setShowcaseVites(newArr);
                    }}
                    options={[
                      { value: '', label: 'Seçili Değil' },
                      ...products.filter(p => p.category === 'vites-sweatshirt').map(p => ({ value: String(p.id), label: p.title }))
                    ]}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ===== Vizyonumuz Kartları ===== */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            ✨ Vizyonumuz — Özellik Kartları
          </h3>
          <AdminBtn
            onClick={() => setVisionCards([...visionCards, { emoji: '🌟', title: 'Yeni Özellik', desc: 'Açıklama' }])}
            icon={<Plus size={14} />} label="Ekle"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visionCards.map((card, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', padding: '0.625rem', background: C.surface, borderRadius: '10px', border: `1px solid ${C.border}` }}>
              <AdminInput value={card.emoji} onChange={v => { const c = [...visionCards]; c[i] = { ...c[i], emoji: v }; setVisionCards(c); }} placeholder="🛡️" />
              <AdminInput value={card.title} onChange={v => { const c = [...visionCards]; c[i] = { ...c[i], title: v }; setVisionCards(c); }} placeholder="Başlık" />
              <AdminInput value={card.desc} onChange={v => { const c = [...visionCards]; c[i] = { ...c[i], desc: v }; setVisionCards(c); }} placeholder="Açıklama" />
              <IconBtn icon={<Trash2 size={14} />} onClick={() => setVisionCards(visionCards.filter((_, j) => j !== i))} title="Sil" danger />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Vizyonumuz Manifesto Satırları ===== */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            📋 Vizyonumuz — Manifesto Satırları
          </h3>
          <AdminBtn
            onClick={() => setVisionLines([...visionLines, { text: 'Yeni satır', color: 'red' }])}
            icon={<Plus size={14} />} label="Ekle"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visionLines.map((line, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '0.5rem', alignItems: 'center', padding: '0.625rem', background: C.surface, borderRadius: '10px', border: `1px solid ${C.border}` }}>
              <AdminInput value={line.text} onChange={v => { const l = [...visionLines]; l[i] = { ...l[i], text: v }; setVisionLines(l); }} placeholder="Satır metni" />
              <AdminSelect
                value={line.color}
                onChange={v => { const l = [...visionLines]; l[i] = { ...l[i], color: v }; setVisionLines(l); }}
                options={[{ value: 'red', label: '🔴 Kırmızı' }, { value: 'blue', label: '🔵 Mavi' }]}
              />
              <IconBtn icon={<Trash2 size={14} />} onClick={() => setVisionLines(visionLines.filter((_, j) => j !== i))} title="Sil" danger />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Ürün Özellikleri (Specs) ===== */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
            🧾 Ürün Özellikleri Listesi
          </h3>
          <AdminBtn
            onClick={() => setSpecs([...specs, { icon: '✨', text: 'Yeni özellik' }])}
            icon={<Plus size={14} />} label="Ekle"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {specs.map((spec, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: '0.5rem', alignItems: 'center', padding: '0.625rem', background: C.surface, borderRadius: '10px', border: `1px solid ${C.border}` }}>
              <AdminInput value={spec.icon} onChange={v => { const s = [...specs]; s[i] = { ...s[i], icon: v }; setSpecs(s); }} placeholder="🛡️" />
              <AdminInput value={spec.text} onChange={v => { const s = [...specs]; s[i] = { ...s[i], text: v }; setSpecs(s); }} placeholder="UV Dayanımlı Kumaş — Solmaya karşı koruma" />
              <IconBtn icon={<Trash2 size={14} />} onClick={() => setSpecs(specs.filter((_, j) => j !== i))} title="Sil" danger />
            </div>
          ))}
        </div>
      </div>

      {/* ===== Standard Settings ===== */}
      {settingGroups.map(group => (
        <div key={group.title} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: `1px solid ${C.border}` }}>
            {group.title}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {group.fields.map(field => (
              <FormField key={field.key} label={field.label}>
                {field.multiline ? (
                  <AdminInput value={formData[field.key] || ''} onChange={v => setFormData({ ...formData, [field.key]: v })} placeholder={field.placeholder} multiline rows={3} />
                ) : (
                  <AdminInput value={formData[field.key] || ''} onChange={v => setFormData({ ...formData, [field.key]: v })} placeholder={field.placeholder} />
                )}
              </FormField>
            ))}
          </div>
        </div>
      ))}

      <AdminBtn onClick={handleSave} icon={<Save size={16} />} label={saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'} disabled={saving} />

      {/* ===== Hesap Güvenliği ===== */}
      <AccountSecuritySection showToast={showToast} />
    </div>
  );
}

/* ===== Account Security (ayrı mini bileşen) ===== */
function AccountSecuritySection({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (!currentPassword || !newUsername || !newPassword) {
      showToast('Tüm alanları doldurun.', 'error'); return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Yeni şifreler eşleşmiyor.', 'error'); return;
    }
    if (newPassword.length < 6) {
      showToast('Şifre en az 6 karakter olmalı.', 'error'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Hesap bilgileri güncellendi! Tekrar giriş yapın.');
        setCurrentPassword(''); setNewUsername(''); setNewPassword(''); setConfirmPassword('');
        // Otomatik logout — yeni şifreyle giriş gereksin
        setTimeout(async () => {
          await fetch('/api/auth', { method: 'DELETE' });
          window.location.href = '/admin';
        }, 2000);
      } else {
        showToast(data.error || 'Güncelleme başarısız.', 'error');
      }
    } catch { showToast('Sunucu hatası.', 'error'); }
    setSaving(false);
  };

  return (
    <div style={{ background: 'rgba(230,51,41,0.05)', border: '1px solid rgba(230,51,41,0.2)', borderRadius: '16px', padding: '1.5rem' }}>
      <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(230,51,41,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🔐 Hesap Güvenliği
      </h3>
      <p style={{ fontSize: '0.78rem', color: '#666', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        Kullanıcı adı veya şifrenizi değiştirmek için önce mevcut şifrenizi girin. Değişiklik sonrası yeniden giriş yapmanız gerekecek.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <FormField label="Mevcut Şifre *">
          <AdminInput value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" type="password" />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Yeni Kullanıcı Adı *">
            <AdminInput value={newUsername} onChange={setNewUsername} placeholder="admin" />
          </FormField>
          <div />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Yeni Şifre *">
            <AdminInput value={newPassword} onChange={setNewPassword} placeholder="En az 6 karakter" type="password" />
          </FormField>
          <FormField label="Yeni Şifre (Tekrar) *">
            <AdminInput value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" type="password" />
          </FormField>
        </div>
        <div>
          <AdminBtn onClick={handleUpdate} icon={<Save size={14} />} label={saving ? 'Güncelleniyor...' : 'Hesabı Güncelle'} disabled={saving} />
        </div>
      </div>
    </div>
  );
}




/* ===== UI PRIMITIVES ===== */

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <h3 style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#fff' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</label>
      {children}
    </div>
  );
}

function AdminInput({ value, onChange, placeholder, type, multiline, rows }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const style: CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    color: C.text,
    fontSize: '0.875rem',
    fontFamily: '"Inter", sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    resize: multiline ? 'vertical' : 'none',
    minHeight: multiline ? (rows ? `${rows * 1.5 + 1.25}rem` : '5rem') : undefined,
  };
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = C.red;
    e.currentTarget.style.boxShadow = `0 0 0 3px ${C.redGlow}`;
  };
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = C.border;
    e.currentTarget.style.boxShadow = 'none';
  };

  if (multiline) {
    return <textarea style={style} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onFocus={focus} onBlur={blur} />;
  }
  return <input style={style} type={type || 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onFocus={focus} onBlur={blur} />;
}

function AdminSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '0.625rem 0.875rem',
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: '8px',
        color: C.text, fontSize: '0.875rem', fontFamily: '"Inter", sans-serif',
        outline: 'none', cursor: 'pointer',
      }}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function AdminBtn({ onClick, icon, label, secondary, disabled }: { onClick?: () => void; icon?: React.ReactNode; label: string; secondary?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1.25rem', borderRadius: '10px',
        fontFamily: '"Outfit", sans-serif', fontWeight: 600, fontSize: '0.85rem',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s ease',
        background: secondary ? 'transparent' : C.red,
        color: secondary ? C.text : '#fff',
        border: secondary ? `1px solid ${C.border}` : 'none',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          if (secondary) {
            (e.currentTarget).style.borderColor = C.red;
            (e.currentTarget).style.color = C.red;
          } else {
            (e.currentTarget).style.transform = 'translateY(-2px)';
            (e.currentTarget).style.boxShadow = `0 8px 25px ${C.redGlow}`;
          }
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget).style.transform = '';
        (e.currentTarget).style.boxShadow = '';
        if (secondary) {
          (e.currentTarget).style.borderColor = C.border;
          (e.currentTarget).style.color = C.text;
        }
      }}
    >
      {icon}{label}
    </button>
  );
}

function IconBtn({ icon, onClick, title, danger }: { icon: React.ReactNode; onClick: () => void; title?: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
        background: 'transparent', border: 'none', color: C.muted, transition: 'all 0.2s', display: 'flex', alignItems: 'center',
      }}
      onMouseEnter={e => {
        (e.currentTarget).style.background = danger ? 'rgba(239,68,68,0.1)' : C.surface;
        (e.currentTarget).style.color = danger ? '#f87171' : '#fff';
      }}
      onMouseLeave={e => {
        (e.currentTarget).style.background = 'transparent';
        (e.currentTarget).style.color = C.muted;
      }}
    >
      {icon}
    </button>
  );
}

function Badge({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <span style={{
      fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '4px',
      background: danger ? 'rgba(239,68,68,0.1)' : C.surface,
      border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : C.border}`,
      color: danger ? '#f87171' : C.muted,
    }}>
      {label}
    </span>
  );
}
