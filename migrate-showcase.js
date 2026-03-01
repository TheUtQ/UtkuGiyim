const admin = require('firebase-admin');
const fs = require('fs');

const envLocal = fs.readFileSync('/Users/utku/Desktop/utkugiyimseo2/.env.local', 'utf-8');
const env = {};
envLocal.split('\n').filter(Boolean).forEach(line => {
  const i = line.indexOf('=');
  let key = line.slice(0, i);
  let val = line.slice(i + 1);
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  env[key] = val;
});

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});
const db = admin.firestore();

async function migrate() {
  console.log('Migrating showcase selections to products...');
  
  const settingsSnap = await db.collection("site_settings").get();
  const settings = {};
  settingsSnap.docs.forEach(doc => {
    settings[doc.data().key] = doc.data().value;
  });

  const showcaseSele = JSON.parse(settings.showcase_sele || '[]');
  const showcaseVites = JSON.parse(settings.showcase_vites || '[]');

  console.log('Current showcase_sele:', showcaseSele);
  console.log('Current showcase_vites:', showcaseVites);

  const productsSnap = await db.collection('products').get();
  
  // Create an update array for sequential writes
  const updates = [];
  
  productsSnap.docs.forEach(doc => {
    updates.push(doc.ref.update({ is_showcase: false, showcase_order: 1 }));
  });
  
  await Promise.all(updates);
  console.log('Reset all products showcase flags.');
  
  const showcaseUpdates = [];
  for (let i = 0; i < showcaseSele.length; i++) {
    const id = showcaseSele[i];
    if (id) {
       showcaseUpdates.push(db.collection('products').doc(id.toString()).update({
          is_showcase: true,
          showcase_order: i + 1
       }));
       console.log(`Sele product ${id} set to showcase pos ${i+1}`);
    }
  }

  for (let i = 0; i < showcaseVites.length; i++) {
    const id = showcaseVites[i];
    if (id) {
       showcaseUpdates.push(db.collection('products').doc(id.toString()).update({
          is_showcase: true,
          showcase_order: i + 1
       }));
       console.log(`Vites product ${id} set to showcase pos ${i+1}`);
    }
  }

  await Promise.all(showcaseUpdates);
  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
