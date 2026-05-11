import bcrypt from 'bcryptjs';
import db from './database.js';

// 3 comptes démo pour la présentation au jury.
// Mot de passe identique pour tous : demo1234
const DEMO_PASSWORD = 'demo1234';

const demoUsers = [
  {
    email: 'lea@demo.fr',
    profile: 'Léa Martin — jeune active (~30 k€)',
    assets: [
      { category: 'Livrets', name: 'Livret A', quantity: 1, purchase_price: 8000, current_value: 8000 },
      { category: 'Livrets', name: 'LDDS', quantity: 1, purchase_price: 5000, current_value: 5000 },
      { category: 'Crypto', name: 'Bitcoin', quantity: 0.05, purchase_price: 2500, current_value: 4500 },
      { category: 'Crypto', name: 'Ethereum', quantity: 1.2, purchase_price: 3000, current_value: 4200 },
      { category: 'Bourse', name: 'TotalEnergies', quantity: 50, purchase_price: 2800, current_value: 3300 },
      { category: 'Bourse', name: 'LVMH', quantity: 5, purchase_price: 3500, current_value: 3800 },
    ],
  },
  {
    email: 'thomas@demo.fr',
    profile: 'Thomas Bernard — cadre (~250 k€)',
    assets: [
      { category: 'Immobilier', name: 'Résidence principale', quantity: 1, purchase_price: 165000, current_value: 180000 },
      { category: 'Livrets', name: 'Livret A', quantity: 1, purchase_price: 22950, current_value: 22950 },
      { category: 'Livrets', name: 'LDDS', quantity: 1, purchase_price: 12000, current_value: 12000 },
      { category: 'Bourse', name: 'PEA - ETF MSCI World', quantity: 1, purchase_price: 18000, current_value: 25000 },
      { category: 'Bourse', name: 'Air Liquide', quantity: 30, purchase_price: 4500, current_value: 5400 },
      { category: 'Crypto', name: 'Bitcoin', quantity: 0.15, purchase_price: 8000, current_value: 13500 },
    ],
  },
  {
    email: 'catherine@demo.fr',
    profile: 'Catherine Dubois — retraitée (~600 k€)',
    assets: [
      { category: 'Immobilier', name: 'Résidence principale', quantity: 1, purchase_price: 250000, current_value: 320000 },
      { category: 'Immobilier', name: 'Locatif Paris 11e', quantity: 1, purchase_price: 150000, current_value: 180000 },
      { category: 'Livrets', name: 'Livret A', quantity: 1, purchase_price: 22950, current_value: 22950 },
      { category: 'Bourse', name: 'PEA - ETF S&P 500', quantity: 1, purchase_price: 25000, current_value: 35000 },
      { category: 'Bourse', name: "L'Oréal", quantity: 80, purchase_price: 28000, current_value: 32000 },
      { category: 'Bourse', name: 'Sanofi', quantity: 50, purchase_price: 4500, current_value: 4750 },
    ],
  },
];

export function seedDemoData() {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount > 0) {
    return; // Base déjà peuplée — on ne touche à rien.
  }

  console.log('🌱 Seeding demo accounts...');

  const categories = db.prepare('SELECT id, name FROM categories').all();
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const insertUser = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)');
  const insertAsset = db.prepare(
    'INSERT INTO assets (user_id, category_id, name, quantity, purchase_price, current_value) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const seedAll = db.transaction(() => {
    for (const user of demoUsers) {
      const result = insertUser.run(user.email, hash);
      const userId = result.lastInsertRowid;

      for (const asset of user.assets) {
        const categoryId = categoryByName[asset.category];
        if (!categoryId) {
          console.warn(`  ⚠️  Catégorie inconnue "${asset.category}" pour ${asset.name}`);
          continue;
        }
        insertAsset.run(
          userId,
          categoryId,
          asset.name,
          asset.quantity,
          asset.purchase_price,
          asset.current_value
        );
      }

      console.log(`  ✓ ${user.email} (${user.profile}) — ${user.assets.length} actifs`);
    }
  });

  seedAll();
  console.log(`🌱 Seed terminé. Mot de passe pour tous les comptes démo : ${DEMO_PASSWORD}`);
}
