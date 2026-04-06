import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './database.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'patrimonia-dev-secret-change-in-production';

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Auth ---

app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hash);

  const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: result.lastInsertRowid, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// --- JWT middleware ---

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// --- Categories ---

app.get('/api/categories', authenticate, (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

// --- Assets CRUD ---

app.get('/api/assets', authenticate, (req, res) => {
  const assets = db.prepare(`
    SELECT a.*, c.name AS category_name, c.color AS category_color
    FROM assets a
    JOIN categories c ON a.category_id = c.id
    WHERE a.user_id = ?
    ORDER BY a.id DESC
  `).all(req.user.id);
  res.json(assets);
});

app.post('/api/assets', authenticate, (req, res) => {
  const { name, category_id, quantity, purchase_price, current_value } = req.body;
  if (!name || !category_id || current_value == null) {
    return res.status(400).json({ error: 'name, category_id and current_value are required' });
  }
  const result = db.prepare(
    'INSERT INTO assets (user_id, category_id, name, quantity, purchase_price, current_value) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, category_id, name, quantity ?? 1, purchase_price ?? 0, current_value);

  const asset = db.prepare(`
    SELECT a.*, c.name AS category_name, c.color AS category_color
    FROM assets a
    JOIN categories c ON a.category_id = c.id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(asset);
});

app.put('/api/assets/:id', authenticate, (req, res) => {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });

  const { name, category_id, quantity, purchase_price, current_value } = req.body;
  db.prepare(
    'UPDATE assets SET name = ?, category_id = ?, quantity = ?, purchase_price = ?, current_value = ? WHERE id = ?'
  ).run(
    name ?? asset.name, category_id ?? asset.category_id, quantity ?? asset.quantity,
    purchase_price ?? asset.purchase_price, current_value ?? asset.current_value, asset.id
  );
  const updated = db.prepare(`
    SELECT a.*, c.name AS category_name, c.color AS category_color
    FROM assets a
    JOIN categories c ON a.category_id = c.id
    WHERE a.id = ?
  `).get(asset.id);
  res.json(updated);
});

app.delete('/api/assets/:id', authenticate, (req, res) => {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  db.prepare('DELETE FROM assets WHERE id = ?').run(asset.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Patrimonia API running on http://localhost:${PORT}`);
});
