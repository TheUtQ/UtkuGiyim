/**
 * Database Layer - SQLite with better-sqlite3
 * Handles all database operations for Utku Giyim
 */
import Database from "better-sqlite3";
import path from "path";
import bcryptjs from "bcryptjs";

// Vercel serverless ortamında sadece /tmp dizini yazılabilirdir
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const DB_PATH = isVercel
  ? path.join("/tmp", "utkugiyim.db")
  : path.join(process.cwd(), "data", "utkugiyim.db");

import fs from "fs";
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}


let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  const database = db;

  // Admin users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Brands table
  database.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table - with brand_id, extra_images
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
      image_url TEXT,
      extra_images TEXT,
      badge TEXT,
      badge_type TEXT CHECK(badge_type IN ('hot', 'new', 'special', NULL)),
      shopier_link TEXT,
      trendyol_link TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Site settings table
  database.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // SEO content
  database.exec(`
    CREATE TABLE IF NOT EXISTS seo_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add brand_id column to products if it doesn't exist (migration)
  try {
    database.exec(`ALTER TABLE products ADD COLUMN brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL`);
  } catch { /* column already exists */ }

  // Add extra_images column to products if it doesn't exist (migration)
  try {
    database.exec(`ALTER TABLE products ADD COLUMN extra_images TEXT`);
  } catch { /* column already exists */ }

  // Seed default admin
  const adminExists = database
    .prepare("SELECT COUNT(*) as count FROM admin_users")
    .get() as { count: number };
  if (adminExists.count === 0) {
    const hash = bcryptjs.hashSync("admin123", 10);
    database
      .prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)")
      .run("admin", hash);
  }

  // Seed default brand "Utku Giyim"
  const brandsExist = database
    .prepare("SELECT COUNT(*) as count FROM brands")
    .get() as { count: number };
  if (brandsExist.count === 0) {
    database
      .prepare("INSERT INTO brands (name, slug, description, sort_order) VALUES (?, ?, ?, ?)")
      .run("Utku Giyim", "utku-giyim", "Premium motosiklet aksesuarları ve vites sweatshirtleri.", 1);
  }

  // Seed default categories
  const categoriesExist = database
    .prepare("SELECT COUNT(*) as count FROM categories")
    .get() as { count: number };
  if (categoriesExist.count === 0) {
    const cats = [
      { name: "Sele Kılıfı", slug: "sele-kilifi", description: "Motosiklet sele kılıfları", sort_order: 1 },
      { name: "Vites Sweatshirt", slug: "vites-sweatshirt", description: "Otomobil tutkunları için vites sweatshirtleri", sort_order: 2 },
    ];
    const stmt = database.prepare("INSERT INTO brands (name, slug, description, sort_order) VALUES (?, ?, ?, ?)");
    const catStmt = database.prepare("INSERT INTO categories (name, slug, description, sort_order) VALUES (@name, @slug, @description, @sort_order)");
    for (const cat of cats) catStmt.run(cat);
    void stmt;
  }

  // Assign default brand to existing products that have no brand_id
  const defaultBrand = database
    .prepare("SELECT id FROM brands WHERE slug = 'utku-giyim'")
    .get() as { id: number } | undefined;

  if (defaultBrand) {
    database
      .prepare("UPDATE products SET brand_id = ? WHERE brand_id IS NULL")
      .run(defaultBrand.id);
  }

  // Seed site settings
  const settingsExist = database
    .prepare("SELECT COUNT(*) as count FROM site_settings")
    .get() as { count: number };
  if (settingsExist.count === 0) {
    const defaultSettings = [
      ["hero_title", "Sürüşünüze <span>Premium</span> Dokunuş"],
      ["hero_subtitle", "Özel tasarım motosiklet sele kılıfları ve vites sweatshirtleri ile farkınızı ortaya koyun."],
      ["hero_badge", "PREMIUM KALİTE"],
      ["about_text", "Utku Giyim olarak, motosiklet tutkunlarına özel, premium kalitede aksesuarlar üretiyoruz. Her ürünümüz dayanıklılık, konfor ve şıklık ön planda tutularak tasarlanmıştır."],
      ["phone", "+90 555 123 4567"],
      ["email", "info@utkugiyim.com"],
      ["address", "İstanbul, Türkiye"],
      ["instagram", "https://instagram.com/utkugiyim"],
      ["tiktok", "https://tiktok.com/@utkugiyim"],
      ["facebook", ""],
      ["whatsapp", "905551234567"],
      ["footer_text", "© 2024 Utku Giyim. Tüm hakları saklıdır."],
      ["shopier_url", "https://www.shopier.com/utkugiyim"],
      ["trendyol_url", ""],
      // Vizyon section cards
      ["vision_cards", JSON.stringify([
        { emoji: "🛡️", title: "Dayanıklılık", desc: "UV ve su dayanımlı malzemeler" },
        { emoji: "⚡", title: "Hızlı Kargo", desc: "Sipariş sonrası aynı gün gönderim" },
        { emoji: "⭐", title: "Premium Kalite", desc: "Titizlikle seçilmiş kumaşlar" },
        { emoji: "💧", title: "Su Geçirmez", desc: "Yağmurda bile tam koruma" },
      ])],
      // Vizyon manifesto lines
      ["vision_lines", JSON.stringify([
        { text: "Premium malzemeler ile üst düzey dayanıklılık", color: "red" },
        { text: "Her motosiklet için özel tasarım kılıflar", color: "blue" },
        { text: "Otomobil tutkusu vites sweatshirtlerde", color: "red" },
        { text: "Hızlı kargo & sorunsuz alışveriş", color: "blue" },
      ])],
      // Product specs (bottom of sele section)
      ["product_specs", JSON.stringify([
        { icon: "🛡️", text: "UV Dayanımlı Kumaş — Solmaya karşı koruma" },
        { icon: "💧", text: "Su İtici Yüzey — Yağmurda bile kuru kalır" },
        { icon: "🔧", text: "Kolay Montaj — 30 saniyede takılır" },
        { icon: "✨", text: "Elastik Yapı — Her seleye mükemmel uyum" },
      ])],
      // Collection visibility
      ["show_sele_collection", "1"],
      ["show_vites_collection", "1"],
    ];
    const stmt = database.prepare("INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)");
    for (const [key, value] of defaultSettings) stmt.run(key, value);
  }

  // Also insert new settings keys for existing installs (INSERT OR IGNORE)
  const newSettings: [string, string][] = [
    ["vision_cards", JSON.stringify([
      { emoji: "🛡️", title: "Dayanıklılık", desc: "UV ve su dayanımlı malzemeler" },
      { emoji: "⚡", title: "Hızlı Kargo", desc: "Sipariş sonrası aynı gün gönderim" },
      { emoji: "⭐", title: "Premium Kalite", desc: "Titizlikle seçilmiş kumaşlar" },
      { emoji: "💧", title: "Su Geçirmez", desc: "Yağmurda bile tam koruma" },
    ])],
    ["vision_lines", JSON.stringify([
      { text: "Premium malzemeler ile üst düzey dayanıklılık", color: "red" },
      { text: "Her motosiklet için özel tasarım kılıflar", color: "blue" },
      { text: "Otomobil tutkusu vites sweatshirtlerde", color: "red" },
      { text: "Hızlı kargo & sorunsuz alışveriş", color: "blue" },
    ])],
    ["product_specs", JSON.stringify([
      { icon: "🛡️", text: "UV Dayanımlı Kumaş — Solmaya karşı koruma" },
      { icon: "💧", text: "Su İtici Yüzey — Yağmurda bile kuru kalır" },
      { icon: "🔧", text: "Kolay Montaj — 30 saniyede takılır" },
      { icon: "✨", text: "Elastik Yapı — Her seleye mükemmel uyum" },
    ])],
    ["show_sele_collection", "1"],
    ["show_vites_collection", "1"],
    ["trendyol_url", ""],
  ];
  const insertStmt = database.prepare("INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)");
  for (const [k, v] of newSettings) insertStmt.run(k, v);


  // Seed sample products
  const productsExist = database
    .prepare("SELECT COUNT(*) as count FROM products")
    .get() as { count: number };
  if (productsExist.count === 0) {
    const brand = database.prepare("SELECT id FROM brands LIMIT 1").get() as { id: number };
    const brandId = brand?.id || 1;

    const sampleProducts = [
      { title: "Honda Mavi Sele Kılıfı", slug: "honda-mavi-sele-kilifi", description: "Honda motosikletler için özel tasarım, su geçirmez premium sele kılıfı.", price: 249.9, category: "sele-kilifi", image_url: "/images/products/sele-honda-mavi.png", badge: "ÇOK SATAN", badge_type: "hot", sort_order: 1, brand_id: brandId },
      { title: "Hello Kitty Mor Sele Kılıfı", slug: "hello-kitty-mor-sele-kilifi", description: "Hello Kitty temalı sevimli mor motosiklet sele kılıfı.", price: 229.9, category: "sele-kilifi", image_url: "/images/products/sele-hello-kitty-mor.png", badge: "YENİ", badge_type: "new", sort_order: 2, brand_id: brandId },
      { title: "Louis Vuitton Mavi Sele Kılıfı", slug: "louis-vuitton-mavi-sele-kilifi", description: "Lüks tasarımlı mavi motosiklet sele kılıfı.", price: 279.9, category: "sele-kilifi", image_url: "/images/products/sele-louis-vuitton-mavi.png", badge: "ÖZEL", badge_type: "special", sort_order: 3, brand_id: brandId },
      { title: "Minnie Mouse Fuşya Sele Kılıfı", slug: "minnie-mouse-fusya-sele-kilifi", description: "Minnie Mouse temalı fuşya motosiklet sele kılıfı.", price: 229.9, category: "sele-kilifi", image_url: "/images/products/sele-minnie-mouse-fusya.png", badge: "", badge_type: null, sort_order: 4, brand_id: brandId },
      { title: "Minnie Mouse Pembe Sele Kılıfı", slug: "minnie-mouse-pembe-sele-kilifi", description: "Minnie Mouse temalı pembe motosiklet sele kılıfı.", price: 229.9, category: "sele-kilifi", image_url: "/images/products/sele-minnie-mouse-pembe.png", badge: "", badge_type: null, sort_order: 5, brand_id: brandId },
      { title: "BMW Vites Sweatshirt", slug: "bmw-vites-sweatshirt", description: "BMW logolu premium vites sweatshirt.", price: 399.9, category: "vites-sweatshirt", image_url: "/images/products/vites-bmw.png", badge: "ÇOK SATAN", badge_type: "hot", sort_order: 1, brand_id: brandId },
      { title: "Fiat Vites Sweatshirt", slug: "fiat-vites-sweatshirt", description: "Fiat logolu premium vites sweatshirt.", price: 379.9, category: "vites-sweatshirt", image_url: "/images/products/vites-fiat.png", badge: "", badge_type: null, sort_order: 2, brand_id: brandId },
      { title: "Honda Vites Sweatshirt", slug: "honda-vites-sweatshirt", description: "Honda logolu premium vites sweatshirt.", price: 389.9, category: "vites-sweatshirt", image_url: "/images/products/vites-honda.png", badge: "YENİ", badge_type: "new", sort_order: 3, brand_id: brandId },
      { title: "Toyota Vites Sweatshirt", slug: "toyota-vites-sweatshirt", description: "Toyota logolu premium vites sweatshirt.", price: 389.9, category: "vites-sweatshirt", image_url: "/images/products/vites-toyota.png", badge: "", badge_type: null, sort_order: 4, brand_id: brandId },
      { title: "Volkswagen Vites Sweatshirt", slug: "vw-vites-sweatshirt", description: "Volkswagen logolu premium vites sweatshirt.", price: 399.9, category: "vites-sweatshirt", image_url: "/images/products/vites-vw.png", badge: "ÖZEL", badge_type: "special", sort_order: 5, brand_id: brandId },
    ];

    const stmt = database.prepare(`
      INSERT INTO products (title, slug, description, price, category, image_url, badge, badge_type, sort_order, brand_id)
      VALUES (@title, @slug, @description, @price, @category, @image_url, @badge, @badge_type, @sort_order, @brand_id)
    `);
    for (const p of sampleProducts) stmt.run(p);
  }

  // Seed SEO content
  const seoExists = database
    .prepare("SELECT COUNT(*) as count FROM seo_content")
    .get() as { count: number };
  if (seoExists.count === 0) {
    const seoContent = [
      { title: "Motosiklet Sele Kılıfı Nedir?", content: "Motosiklet sele kılıfı, motosikletinizin selesi üzerine geçirilen koruyucu bir örtüdür. UV ışınlarına, yağmura ve toza karşı selenizi korur.", sort_order: 1 },
      { title: "Vites Sweatshirt Nedir?", content: "Vites sweatshirtleri, otomobil tutkunları için tasarlanmış, vites topuzu desenleriyle öne çıkan premium sweatshirtlerdir.", sort_order: 2 },
      { title: "Neden Utku Giyim?", content: "Utku Giyim, her ürünü titizlikle seçilmiş kumaşlardan üretir. Hızlı kargo ve müşteri memnuniyeti garantisi ile alışveriş deneyiminizi kusursuz hale getiriyoruz.", sort_order: 3 },
    ];
    const stmt = database.prepare("INSERT INTO seo_content (title, content, sort_order) VALUES (@title, @content, @sort_order)");
    for (const item of seoContent) stmt.run(item);
  }
}

// ===== PRODUCT FUNCTIONS =====

export function getAllProducts() {
  return getDb()
    .prepare(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_active = 1
      ORDER BY p.sort_order ASC
    `)
    .all();
}

export function getAllProductsAdmin() {
  return getDb()
    .prepare(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.category, p.sort_order ASC
    `)
    .all();
}

export function getProductsByCategory(category: string) {
  return getDb()
    .prepare(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.category = ? AND p.is_active = 1
      ORDER BY p.sort_order ASC
    `)
    .all(category);
}

export function getProductsByBrand(brandSlug: string) {
  return getDb()
    .prepare(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE b.slug = ? AND p.is_active = 1
      ORDER BY p.sort_order ASC
    `)
    .all(brandSlug);
}

export function getProductById(id: number) {
  return getDb()
    .prepare(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
    `)
    .get(id);
}

export function getProductBySlug(slug: string) {
  return getDb()
    .prepare(`
      SELECT p.*, b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = ?
    `)
    .get(slug);
}

export function createProduct(data: {
  title: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  brand_id?: number;
  image_url?: string;
  extra_images?: string;
  badge?: string;
  badge_type?: string | null;
  shopier_link?: string;
  trendyol_link?: string;
  sort_order?: number;
}) {
  const stmt = getDb().prepare(`
    INSERT INTO products (title, slug, description, price, category, brand_id, image_url, extra_images, badge, badge_type, shopier_link, trendyol_link, sort_order)
    VALUES (@title, @slug, @description, @price, @category, @brand_id, @image_url, @extra_images, @badge, @badge_type, @shopier_link, @trendyol_link, @sort_order)
  `);
  return stmt.run({
    ...data,
    description: data.description || "",
    brand_id: data.brand_id || null,
    image_url: data.image_url || "",
    extra_images: data.extra_images || null,
    badge: data.badge || "",
    badge_type: data.badge_type || null,
    shopier_link: data.shopier_link || "",
    trendyol_link: data.trendyol_link || "",
    sort_order: data.sort_order || 0,
  });
}

export function updateProduct(id: number, data: Record<string, unknown>) {
  const fields = Object.keys(data)
    .map((k) => `${k} = @${k}`)
    .join(", ");
  const stmt = getDb().prepare(
    `UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`,
  );
  return stmt.run({ ...data, id });
}

export function deleteProduct(id: number) {
  return getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

// ===== BRAND FUNCTIONS =====

export function getAllBrands() {
  return getDb()
    .prepare("SELECT * FROM brands WHERE is_active = 1 ORDER BY sort_order ASC")
    .all();
}

export function getAllBrandsAdmin() {
  return getDb()
    .prepare("SELECT *, (SELECT COUNT(*) FROM products WHERE brand_id = brands.id) as product_count FROM brands ORDER BY sort_order ASC")
    .all();
}

export function getBrandBySlug(slug: string) {
  return getDb().prepare("SELECT * FROM brands WHERE slug = ?").get(slug);
}

export function createBrand(data: { name: string; slug: string; description?: string; logo_url?: string; sort_order?: number }) {
  return getDb()
    .prepare("INSERT INTO brands (name, slug, description, logo_url, sort_order) VALUES (@name, @slug, @description, @logo_url, @sort_order)")
    .run({ description: "", logo_url: "", sort_order: 0, ...data });
}

export function updateBrand(id: number, data: Record<string, unknown>) {
  const fields = Object.keys(data).map((k) => `${k} = @${k}`).join(", ");
  return getDb().prepare(`UPDATE brands SET ${fields} WHERE id = @id`).run({ ...data, id });
}

export function deleteBrand(id: number) {
  // Reassign products to null before deleting
  getDb().prepare("UPDATE products SET brand_id = NULL WHERE brand_id = ?").run(id);
  return getDb().prepare("DELETE FROM brands WHERE id = ?").run(id);
}

// ===== CATEGORY FUNCTIONS =====

export function getAllCategories() {
  return getDb()
    .prepare("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC")
    .all();
}

export function getAllCategoriesAdmin() {
  return getDb()
    .prepare("SELECT *, (SELECT COUNT(*) FROM products WHERE category = categories.slug) as product_count FROM categories ORDER BY sort_order ASC")
    .all();
}

export function createCategory(data: { name: string; slug: string; description?: string; sort_order?: number }) {
  return getDb()
    .prepare("INSERT INTO categories (name, slug, description, sort_order) VALUES (@name, @slug, @description, @sort_order)")
    .run({ description: "", sort_order: 0, ...data });
}

export function updateCategory(id: number, data: Record<string, unknown>) {
  const fields = Object.keys(data).map((k) => `${k} = @${k}`).join(", ");
  return getDb().prepare(`UPDATE categories SET ${fields} WHERE id = @id`).run({ ...data, id });
}

export function deleteCategory(id: number) {
  return getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// ===== SETTINGS =====

export function getAllSettings(): Record<string, string> {
  const rows = getDb()
    .prepare("SELECT key, value FROM site_settings")
    .all() as { key: string; value: string }[];
  const settings: Record<string, string> = {};
  rows.forEach((r) => { settings[r.key] = r.value; });
  return settings;
}

export function getSetting(key: string): string | undefined {
  const row = getDb()
    .prepare("SELECT value FROM site_settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function updateSetting(key: string, value: string) {
  return getDb()
    .prepare("INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)")
    .run(key, value);
}

// ===== SEO CONTENT =====

export function getAllSeoContent() {
  return getDb()
    .prepare("SELECT * FROM seo_content WHERE is_active = 1 ORDER BY sort_order ASC")
    .all();
}

export function getAllSeoContentAdmin() {
  return getDb()
    .prepare("SELECT * FROM seo_content ORDER BY sort_order ASC")
    .all();
}

export function createSeoContent(data: { title: string; content: string; sort_order?: number }) {
  return getDb()
    .prepare("INSERT INTO seo_content (title, content, sort_order) VALUES (@title, @content, @sort_order)")
    .run({ sort_order: 0, ...data });
}

export function updateSeoContent(id: number, data: { title?: string; content?: string; sort_order?: number; is_active?: number }) {
  const fields = Object.keys(data).map((k) => `${k} = @${k}`).join(", ");
  return getDb()
    .prepare(`UPDATE seo_content SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
    .run({ ...data, id });
}

export function deleteSeoContent(id: number) {
  return getDb().prepare("DELETE FROM seo_content WHERE id = ?").run(id);
}

// ===== AUTH =====

export function getAdminByUsername(username: string) {
  return getDb()
    .prepare("SELECT * FROM admin_users WHERE username = ?")
    .get(username) as { id: number; username: string; password_hash: string } | undefined;
}

export function validateAdminPassword(username: string, password: string): boolean {
  const admin = getAdminByUsername(username);
  if (!admin) return false;
  return bcryptjs.compareSync(password, admin.password_hash);
}

export function updateAdminCredentials(
  currentUsername: string,
  newUsername: string,
  newPassword: string
): { success: boolean; error?: string } {
  try {
    const db2 = getDb();
    const hash = bcryptjs.hashSync(newPassword, 10);
    const result = db2
      .prepare(
        "UPDATE admin_users SET username = ?, password_hash = ? WHERE username = ?"
      )
      .run(newUsername, hash, currentUsername);
    if (result.changes === 0) return { success: false, error: "Kullanıcı bulunamadı." };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata.";
    return { success: false, error: msg };
  }
}

