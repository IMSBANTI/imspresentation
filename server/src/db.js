import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInitialPresentation } from './mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const localDbPath = path.join(dataDir, 'local_db.json');

const { Pool } = pg;
const databaseUrl = process.env.DATABASE_URL;

let pool = null;
let isNeon = false;

// In-memory / local fallback store
let fallbackStore = {
  users: [],
  presentations: [],
};

// Load fallback store from disk if exists
try {
  if (fs.existsSync(localDbPath)) {
    fallbackStore = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
  }
} catch (e) {
  console.warn("Could not load local_db.json, starting fresh.");
}

function persistFallback() {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(fallbackStore, null, 2), 'utf8');
  } catch (e) {}
}

if (databaseUrl) {
  console.log("Connecting to Neon PostgreSQL...");
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  isNeon = true;
} else {
  console.log("No DATABASE_URL found. Using local persistent storage (Set DATABASE_URL to connect to Neon).");
}

export async function initDb() {
  if (isNeon && pool) {
    try {
      // Create tables in Neon PostgreSQL
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(120),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS presentations (
          id VARCHAR(64) PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          code VARCHAR(32) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(120),
          data JSONB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log("✓ Neon PostgreSQL tables initialized successfully.");
    } catch (err) {
      console.error("Neon database initialization error:", err.message);
    }
  } else {
    // Seed initial presentation in fallback if empty
    if (fallbackStore.presentations.length === 0) {
      const initial = createInitialPresentation();
      fallbackStore.presentations.push(initial);
      persistFallback();
    }
  }
}

// User methods
export async function createUser({ email, password, name }) {
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 10);

  if (isNeon && pool) {
    const res = await pool.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, name, created_at`,
      [normalizedEmail, passwordHash, name || normalizedEmail.split('@')[0]]
    );
    const user = res.rows[0];

    // Create a default presentation for the new user
    const defaultDeck = createInitialPresentation();
    defaultDeck.id = 'pres-' + Math.random().toString(36).substring(2, 8);
    defaultDeck.code = 'IMS-' + Math.floor(100 + Math.random() * 900);
    defaultDeck.author = user.name;
    await createPresentation({ userId: user.id, presentation: defaultDeck });

    return user;
  } else {
    const existing = fallbackStore.users.find(u => u.email === normalizedEmail);
    if (existing) {
      throw new Error("A user with this email already exists.");
    }
    const newUser = {
      id: fallbackStore.users.length + 1,
      email: normalizedEmail,
      password_hash: passwordHash,
      name: name || normalizedEmail.split('@')[0],
      created_at: new Date().toISOString()
    };
    fallbackStore.users.push(newUser);

    // Create default deck for user
    const defaultDeck = createInitialPresentation();
    defaultDeck.id = 'pres-' + Math.random().toString(36).substring(2, 8);
    defaultDeck.code = 'IMS-' + Math.floor(100 + Math.random() * 900);
    defaultDeck.author = newUser.name;
    defaultDeck.userId = newUser.id;
    fallbackStore.presentations.push(defaultDeck);
    persistFallback();

    return { id: newUser.id, email: newUser.email, name: newUser.name, created_at: newUser.created_at };
  }
}

export async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();
  if (isNeon && pool) {
    const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [normalizedEmail]);
    return res.rows[0] || null;
  } else {
    return fallbackStore.users.find(u => u.email === normalizedEmail) || null;
  }
}

export async function findUserById(id) {
  if (isNeon && pool) {
    const res = await pool.query(`SELECT id, email, name, created_at FROM users WHERE id = $1`, [id]);
    return res.rows[0] || null;
  } else {
    const u = fallbackStore.users.find(u => u.id === parseInt(id));
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, created_at: u.created_at };
  }
}

// Presentation methods
export async function getUserPresentations(userId) {
  if (isNeon && pool) {
    const res = await pool.query(
      `SELECT id, code, title, author, data, created_at, updated_at 
       FROM presentations 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [userId]
    );
    return res.rows.map(r => ({
      ...r.data,
      id: r.id,
      code: r.code,
      title: r.title,
      author: r.author,
      updated_at: r.updated_at
    }));
  } else {
    return fallbackStore.presentations.filter(p => p.userId === userId || !p.userId);
  }
}

export async function createPresentation({ userId, presentation }) {
  const id = presentation.id || ('pres-' + Math.random().toString(36).substring(2, 9));
  const code = (presentation.code || ('IMS-' + Math.floor(100 + Math.random() * 900))).toUpperCase();
  const title = presentation.title || 'Untitled Presentation';
  const author = presentation.author || 'Presenter';

  const fullData = {
    ...presentation,
    id,
    code,
    title,
    author,
    userId
  };

  if (isNeon && pool) {
    await pool.query(
      `INSERT INTO presentations (id, user_id, code, title, author, data) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET data = $6, updated_at = CURRENT_TIMESTAMP`,
      [id, userId, code, title, author, JSON.stringify(fullData)]
    );
  } else {
    const idx = fallbackStore.presentations.findIndex(p => p.id === id);
    if (idx >= 0) {
      fallbackStore.presentations[idx] = fullData;
    } else {
      fallbackStore.presentations.push(fullData);
    }
    persistFallback();
  }

  return fullData;
}

export async function getPresentationByIdOrCode(idOrCode) {
  const term = idOrCode.toLowerCase();
  if (isNeon && pool) {
    const res = await pool.query(
      `SELECT data FROM presentations 
       WHERE LOWER(id) = $1 OR LOWER(code) = $1`,
      [term]
    );
    if (res.rows.length > 0) {
      return res.rows[0].data;
    }
    return null;
  } else {
    return fallbackStore.presentations.find(
      p => p.id?.toLowerCase() === term || p.code?.toLowerCase() === term
    ) || null;
  }
}

export async function savePresentationState(id, fullState) {
  if (isNeon && pool) {
    try {
      await pool.query(
        `UPDATE presentations 
         SET data = $1, title = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [JSON.stringify(fullState), fullState.title || 'Untitled', id]
      );
    } catch (e) {
      console.error("Error saving presentation to Neon:", e.message);
    }
  } else {
    const idx = fallbackStore.presentations.findIndex(p => p.id === id);
    if (idx >= 0) {
      fallbackStore.presentations[idx] = fullState;
      persistFallback();
    }
  }
}
