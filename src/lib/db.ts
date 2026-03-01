/**
 * Database Layer - Firebase Firestore
 * Handles all database operations for Utku Giyim
 */
import * as admin from "firebase-admin";
import bcryptjs from "bcryptjs";

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // 1. Remove all quotes
    privateKey = privateKey.replace(/"/g, '');
    
    // 2. Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // 3. Fix potential spacing issues (if newlines were replaced by spaces during copy-paste)
    const header = '-----BEGIN PRIVATE KEY-----';
    const footer = '-----END PRIVATE KEY-----';
    if (privateKey.includes(header) && privateKey.includes(footer)) {
      let core = privateKey.substring(privateKey.indexOf(header) + header.length, privateKey.indexOf(footer));
      core = core.replace(/\s+/g, '\n'); // all spaces to newlines
      // ensure exactly one newline after header and before footer
      privateKey = `${header}\n${core.trim()}\n${footer}`;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error) {
    console.error("Firebase initialization error", error);
  }
}

const db = admin.firestore();

// Helper to get auto-increment IDs
const getNextId = async (collectionName: string): Promise<number> => {
  const ref = db.collection("counters").doc(collectionName);
  return db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const nextId = (doc.exists ? doc.data()?.last_id || 0 : 0) + 1;
    t.set(ref, { last_id: nextId }, { merge: true });
    return nextId;
  });
};

// Helper to serialize Firestore Timestamps
function serializeDoc(data: any) {
  if (!data) return data;
  const res = { ...data };
  if (res.created_at && typeof res.created_at.toDate === 'function') res.created_at = res.created_at.toDate().toISOString();
  if (res.updated_at && typeof res.updated_at.toDate === 'function') res.updated_at = res.updated_at.toDate().toISOString();
  return res;
}

// ===== SEEDING =====
// Firestore doesn't need schema creation, but we can seed initial data
export async function ensureSeed() {
  const adminRef = db.collection("admin_users").doc("admin");
  const adminDoc = await adminRef.get();
  if (!adminDoc.exists) {
    const hash = bcryptjs.hashSync("admin123", 10);
    await adminRef.set({
      id: 1,
      username: "admin",
      password_hash: hash,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Seed brands
  const brandsRef = db.collection("brands");
  const brandsSnap = await brandsRef.limit(1).get();
  let defaultBrandId = 1;
  if (brandsSnap.empty) {
    await brandsRef.doc(defaultBrandId.toString()).set({
      id: defaultBrandId,
      name: "Utku Giyim",
      slug: "utku-giyim",
      description: "Premium motosiklet aksesuarları ve vites sweatshirtleri.",
      logo_url: "",
      is_active: 1,
      sort_order: 1,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection("counters").doc("brands").set({ last_id: defaultBrandId });
  } else {
    defaultBrandId = brandsSnap.docs[0].data().id;
  }

  // Seed settings
  const settingsRef = db.collection("site_settings");
  const settingsSnap = await settingsRef.limit(1).get();
  if (settingsSnap.empty) {
    const defaultSettings: Record<string, string> = {
      hero_title: "Sürüşünüze <span>Premium</span> Dokunuş",
      hero_subtitle: "Özel tasarım motosiklet sele kılıfları ve vites sweatshirtleri ile farkınızı ortaya koyun.",
      hero_badge: "PREMIUM KALİTE",
      about_text: "Utku Giyim olarak, motosiklet tutkunlarına özel, premium kalitede aksesuarlar üretiyoruz. Her ürünümüz dayanıklılık, konfor ve şıklık ön planda tutularak tasarlanmıştır.",
      phone: "+90 555 123 4567",
      email: "info@utkugiyim.com",
      address: "İstanbul, Türkiye",
      instagram: "https://instagram.com/utkugiyim",
      tiktok: "https://tiktok.com/@utkugiyim",
      facebook: "",
      whatsapp: "905551234567",
      footer_text: "© 2024 Utku Giyim. Tüm hakları saklıdır.",
      shopier_url: "https://www.shopier.com/utkugiyim",
      trendyol_url: "https://www.trendyol.com/magaza/utku-giyim-m-304694?channelId=1&sst=0",
      show_sele_collection: "1",
      show_vites_collection: "1",
      vision_cards: JSON.stringify([
        { emoji: "🛡️", title: "Dayanıklılık", desc: "UV ve su dayanımlı malzemeler" },
        { emoji: "⚡", title: "Hızlı Kargo", desc: "Sipariş sonrası aynı gün gönderim" },
        { emoji: "⭐", title: "Premium Kalite", desc: "Titizlikle seçilmiş kumaşlar" },
        { emoji: "💧", title: "Su Geçirmez", desc: "Yağmurda bile tam koruma" }
      ]),
      vision_lines: JSON.stringify([
        { text: "Premium malzemeler ile üst düzey dayanıklılık", color: "red" },
        { text: "Her motosiklet için özel tasarım kılıflar", color: "blue" },
        { text: "Otomobil tutkusu vites sweatshirtlerde", color: "red" },
        { text: "Hızlı kargo & sorunsuz alışveriş", color: "blue" }
      ]),
      product_specs: JSON.stringify([
        { icon: "🛡️", text: "UV Dayanımlı Kumaş — Solmaya karşı koruma" },
        { icon: "💧", text: "Su İtici Yüzey — Yağmurda bile kuru kalır" },
        { icon: "🔧", text: "Kolay Montaj — 30 saniyede takılır" },
        { icon: "✨", text: "Elastik Yapı — Her seleye mükemmel uyum" }
      ]),
    };
    
    const batch = db.batch();
    for (const [key, value] of Object.entries(defaultSettings)) {
      batch.set(settingsRef.doc(key), { key, value, updated_at: admin.firestore.FieldValue.serverTimestamp() });
    }
    await batch.commit();
  }
}

// Ensure seed in background when db module loads
ensureSeed().catch(console.error);


// ===== PRODUCT FUNCTIONS =====

export async function getAllProducts() {
  const snap = await db.collection("products").get();
  // In-memory filter and sort to prevent composite index errors
  const docs = snap.docs.map(doc => serializeDoc(doc.data()))
    .filter(p => p.is_active === 1)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const brandsSnap = await db.collection("brands").get();
  const brandsMap = new Map(brandsSnap.docs.map(doc => [doc.data().id, serializeDoc(doc.data())]));

  return docs.map(p => {
    const b = brandsMap.get(p.brand_id);
    return { ...p, brand_name: b?.name, brand_slug: b?.slug };
  });
}

export async function getAllProductsAdmin() {
  const snap = await db.collection("products").get();
  const docs = snap.docs.map(doc => serializeDoc(doc.data()))
    .sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

  const brandsSnap = await db.collection("brands").get();
  const brandsMap = new Map(brandsSnap.docs.map(doc => [doc.data().id, serializeDoc(doc.data())]));

  return docs.map(p => {
    const b = brandsMap.get(p.brand_id);
    return { ...p, brand_name: b?.name, brand_slug: b?.slug };
  });
}

export async function getProductsByCategory(category: string) {
  const snap = await db.collection("products").get();
  const docs = snap.docs.map(doc => serializeDoc(doc.data()))
    .filter(p => p.category === category && p.is_active === 1)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const brandsSnap = await db.collection("brands").get();
  const brandsMap = new Map(brandsSnap.docs.map(doc => [doc.data().id, serializeDoc(doc.data())]));

  return docs.map(p => {
    const b = brandsMap.get(p.brand_id);
    return { ...p, brand_name: b?.name, brand_slug: b?.slug };
  });
}

export async function getProductById(id: number) {
  const snap = await db.collection("products").doc(id.toString()).get();
  if (!snap.exists) return null;
  const p = serializeDoc(snap.data());
  if (!p) return null;
  const bSnap = p.brand_id ? await db.collection("brands").doc(p.brand_id.toString()).get() : null;
  const b = bSnap?.exists ? serializeDoc(bSnap.data()) : null;
  return { ...p, brand_name: b?.name, brand_slug: b?.slug };
}

export async function getProductBySlug(slug: string) {
  const snap = await db.collection("products").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const p = serializeDoc(snap.docs[0].data());
  const bSnap = p.brand_id ? await db.collection("brands").doc(p.brand_id.toString()).get() : null;
  const b = bSnap?.exists ? serializeDoc(bSnap.data()) : null;
  return { ...p, brand_name: b?.name, brand_slug: b?.slug };
}

export async function createProduct(data: {
  title: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  brand_id?: number | null;
  image_url?: string;
  extra_images?: string;
  badge?: string;
  badge_type?: string | null;
  shopier_link?: string;
  trendyol_link?: string;
  sort_order?: number;
  is_showcase?: boolean;
  showcase_order?: number;
  features?: string;
}) {
  const id = await getNextId("products");
  await db.collection("products").doc(id.toString()).set({
    id,
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
    is_showcase: data.is_showcase || false,
    showcase_order: data.showcase_order || 1,
    features: data.features || JSON.stringify([{ icon: 'Shield', text: 'UV Dayanımlı' }, { icon: 'Droplets', text: 'Su Geçirmez' }, { icon: 'Zap', text: 'Kolay Montaj' }, { icon: 'Star', text: 'Premium Kalite' }]),
    is_active: 1,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });
  return id;
}

export async function updateProduct(id: number, data: Record<string, unknown>) {
  await db.collection("products").doc(id.toString()).update({
    ...data,
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });
}

export async function deleteProduct(id: number) {
  await db.collection("products").doc(id.toString()).delete();
}

// ===== BRAND FUNCTIONS =====

export async function getAllBrands() {
  const snap = await db.collection("brands").get();
  return snap.docs.map(doc => serializeDoc(doc.data()))
    .filter(b => b.is_active === 1)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export async function getAllBrandsAdmin() {
  const snap = await db.collection("brands").get();
  const brands = snap.docs.map(doc => serializeDoc(doc.data()))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  
  // get product counts
  const res = await Promise.all(brands.map(async (b) => {
    const productsSnap = await db.collection("products").where("brand_id", "==", b.id).get();
    return { ...b, product_count: productsSnap.size };
  }));
  return res;
}

export async function getBrandBySlug(slug: string) {
  const snap = await db.collection("brands").where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  return serializeDoc(snap.docs[0].data());
}

export async function createBrand(data: {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  sort_order?: number;
}) {
  const id = await getNextId("brands");
  await db.collection("brands").doc(id.toString()).set({
    id,
    description: "", logo_url: "", sort_order: 0,
    is_active: 1,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    ...data
  });
  return id;
}

export async function updateBrand(id: number, data: Record<string, unknown>) {
  await db.collection("brands").doc(id.toString()).update(data);
}

export async function deleteBrand(id: number) {
  const productsSnap = await db.collection("products").where("brand_id", "==", id).get();
  const batch = db.batch();
  productsSnap.docs.forEach(doc => {
    batch.update(doc.ref, { brand_id: null });
  });
  batch.delete(db.collection("brands").doc(id.toString()));
  await batch.commit();
}

// ===== CATEGORY FUNCTIONS =====

export async function getAllCategories() {
  const snap = await db.collection("categories").get();
  return snap.docs.map(doc => serializeDoc(doc.data()))
    .filter(c => c.is_active === 1)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export async function getAllCategoriesAdmin() {
  const snap = await db.collection("categories").get();
  const cats = snap.docs.map(doc => serializeDoc(doc.data()))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const res = await Promise.all(cats.map(async (c) => {
    const productsSnap = await db.collection("products").where("category", "==", c.slug).get();
    return { ...c, product_count: productsSnap.size };
  }));
  return res;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
}) {
  const id = await getNextId("categories");
  await db.collection("categories").doc(id.toString()).set({
    id,
    description: "", sort_order: 0,
    is_active: 1,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    ...data
  });
  return id;
}

export async function updateCategory(id: number, data: Record<string, unknown>) {
  await db.collection("categories").doc(id.toString()).update(data);
}

export async function deleteCategory(id: number) {
  await db.collection("categories").doc(id.toString()).delete();
}

// ===== SETTINGS =====

export async function getAllSettings(): Promise<Record<string, string>> {
  const snap = await db.collection("site_settings").get();
  const settings: Record<string, string> = {};
  snap.docs.forEach(doc => {
    settings[doc.data().key] = doc.data().value;
  });
  return settings;
}

export async function getSetting(key: string): Promise<string | undefined> {
  const snap = await db.collection("site_settings").doc(key).get();
  return snap.exists ? snap.data()?.value : undefined;
}

export async function updateSetting(key: string, value: string) {
  await db.collection("site_settings").doc(key).set({
    key, value, updated_at: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

// ===== SEO CONTENT =====

export async function getAllSeoContent() {
  const snap = await db.collection("seo_content").get();
  return snap.docs.map(doc => serializeDoc(doc.data()))
    .filter(s => s.is_active === 1)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export async function getAllSeoContentAdmin() {
  const snap = await db.collection("seo_content").get();
  return snap.docs.map(doc => serializeDoc(doc.data()))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export async function createSeoContent(data: {
  title: string;
  content: string;
  sort_order?: number;
}) {
  const id = await getNextId("seo_content");
  await db.collection("seo_content").doc(id.toString()).set({
    id,
    sort_order: 0,
    is_active: 1,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    ...data
  });
  return id;
}

export async function updateSeoContent(
  id: number,
  data: { title?: string; content?: string; sort_order?: number; is_active?: number }
) {
  await db.collection("seo_content").doc(id.toString()).update({
    ...data,
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });
}

export async function deleteSeoContent(id: number) {
  await db.collection("seo_content").doc(id.toString()).delete();
}


// ===== ADMIN AUTHENTICATION =====

export async function getAdminByUsername(username: string) {
  const snap = await db.collection("admin_users").where("username", "==", username).limit(1).get();
  if (snap.empty) return null;
  return snap.docs[0].data();
}

export async function validateAdminPassword(username: string, passwordAttempt: string) {
  const adminDoc = await getAdminByUsername(username);
  if (!adminDoc) return false;
  return bcryptjs.compareSync(passwordAttempt, adminDoc.password_hash);
}

export async function updateAdminCredentials(currentUsername: string, newUsername?: string, newPassword?: string) {
  const snap = await db.collection("admin_users").where("username", "==", currentUsername).limit(1).get();
  if (snap.empty) return false;
  const adminId = snap.docs[0].id;
  
  const updates: Record<string, string> = {};
  if (newUsername) updates.username = newUsername;
  if (newPassword) updates.password_hash = bcryptjs.hashSync(newPassword, 10);
  
  if (Object.keys(updates).length > 0) {
    await db.collection("admin_users").doc(adminId).update(updates);
  }
  return true;
}
