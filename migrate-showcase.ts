import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();

async function migrate() {
  console.log('Migrating showcase selections to products...');
  
  // 1. Get settings
  const settingsSnap = await db.collection("site_settings").get();
  const settings: Record<string, string> = {};
  settingsSnap.docs.forEach(doc => {
    settings[doc.data().key] = doc.data().value;
  });

  const showcaseSele: number[] = JSON.parse(settings.showcase_sele || '[]');
  const showcaseVites: number[] = JSON.parse(settings.showcase_vites || '[]');

  console.log('Current showcase_sele:', showcaseSele);
  console.log('Current showcase_vites:', showcaseVites);

  // 2. Set all products is_showcase to false initially just in case
  const productsSnap = await db.collection('products').get();
  const batch1 = db.batch();
  productsSnap.docs.forEach(doc => {
    batch1.update(doc.ref, { 
       is_showcase: false, 
       showcase_order: 1 
    });
  });
  await batch1.commit();
  console.log('Reset all products showcase flags.');

  // 3. Update products in showcaseSele
  const batch2 = db.batch();
  for (let i = 0; i < showcaseSele.length; i++) {
    const id = showcaseSele[i];
    if (id) {
       const docRef = db.collection('products').doc(id.toString());
       batch2.update(docRef, {
          is_showcase: true,
          showcase_order: i + 1
       });
       console.log(`Sele product ${id} set to showcase pos ${i+1}`);
    }
  }

  // 4. Update products in showcaseVites
  for (let i = 0; i < showcaseVites.length; i++) {
    const id = showcaseVites[i];
    if (id) {
       const docRef = db.collection('products').doc(id.toString());
       batch2.update(docRef, {
          is_showcase: true,
          showcase_order: i + 1
       });
       console.log(`Vites product ${id} set to showcase pos ${i+1}`);
    }
  }

  await batch2.commit();
  console.log('Migration complete!');
}

migrate().catch(console.error);
