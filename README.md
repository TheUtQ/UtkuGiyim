# Utku Giyim 🏍️

Premium motosiklet sele kılıfları ve vites sweatshirtleri için e-ticaret + içerik yönetim sistemi.

## 🚀 Teknoloji Stack

- **Framework**: Next.js 15 (App Router)
- **Veritabanı**: SQLite (`better-sqlite3`)
- **Stil**: Vanilla CSS + CSS Variables (dark mode)
- **Animasyonlar**: Framer Motion
- **Dil**: TypeScript

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacak.

## 🗂️ Proje Yapısı

```
src/
├── app/
│   ├── page.tsx                  # Ana sayfa
│   ├── urunler/                  # Ürün listesi ve detay sayfaları
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── admin/                    # Admin paneli
│   │   ├── page.tsx
│   │   └── dashboard/page.tsx
│   └── api/                      # REST API rotaları
│       ├── products/
│       ├── brands/
│       ├── categories/
│       ├── settings/
│       ├── seo-content/
│       ├── auth/
│       └── upload/
├── components/
│   ├── LandingClient.tsx         # Ana sayfa istemci bileşeni
│   ├── ProductsClient.tsx        # Ürün listesi (filtreleme)
│   ├── ProductDetailClient.tsx   # Ürün detay sayfası
│   └── admin/
│       ├── AdminDashboard.tsx    # Admin paneli
│       └── LoginForm.tsx
└── lib/
    ├── db.ts                     # Veritabanı katmanı
    └── auth.ts                   # Kimlik doğrulama
```

## ✨ Özellikler

### 🌐 Ana Sayfa

- Parallax hero bölümü
- **Mağazalarımız** modal → Shopier & Trendyol butonları (blur overlay)
- Vizyonumuz bölümü (admin'den yönetilebilir)
- Sele Kılıfı ve Vites Sweatshirt koleksiyonları (max 5 ürün)
- Ürün özellikleri listesi (admin'den ekle/sil/düzenle)
- SEO içerik accordion (SSS)

### 🛍️ Ürünler

- `/urunler` — kategori ve marka filtrelemeli ürün listesi
- `/urunler/[slug]` — detaylı ürün sayfası
- Her ürün: marka rozeti, fiyat, Shopier/Trendyol satın al butonları

### 🔧 Admin Paneli (`/admin/dashboard`)

- **Ürünler**: CRUD — görsel yükleme, marka seçimi (zorunlu), Shopier/Trendyol linkleri
- **Marka & Kategori**: Tam yönetim — ekle, düzenle, sil
- **SEO İçerik**: SSS ve içerik yönetimi
- **Ayarlar**:
  - Koleksiyon göster/gizle toggle'ları
  - Vizyonumuz kartları (emoji + başlık + açıklama)
  - Manifesto satırları (renk seçimi: kırmızı/mavi)
  - Ürün özellikleri listesi
  - Hero, iletişim, sosyal medya, mağaza linkleri

### 🗄️ Veritabanı

- `products` — ürünler (brand_id FK, extra_images)
- `brands` — markalar
- `categories` — kategoriler
- `site_settings` — key-value ayarlar
- `seo_content` — SSS içerikleri
- `admin_users` — yönetici hesapları

## 🔐 Varsayılan Admin Girişi

```
Kullanıcı adı: ***********
Şifre: ****************
```

> ⚠️ Production'a almadan önce şifreyi değiştirin!

## 📝 Commit Kuralları

Her değişiklik ayrı commit olarak eklenir. Format:

```
feat: yeni özellik açıklaması
fix: hata düzeltme açıklaması
style: görsel değişiklik açıklaması
refactor: kod yeniden yapılandırması
```

---

© 2024 Utku Giyim — Tüm hakları saklıdır.
