import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool = null;
let isPostgres = false;

import os from 'os';

// Embedded relational storage fallback if PostgreSQL is not available
const BUNDLED_DATA_FILE = path.join(__dirname, '..', 'data_store.json');
const DATA_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), 'data_store.json')
  : BUNDLED_DATA_FILE;

let inMemoryStore = {
  users: [],
  items: [],
  item_matches: [],
  claims: []
};

// Seed initial memory store
function seedDefaultStore() {
  const users = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'alex.chen@campus.edu',
      full_name: 'Alex Chen',
      role: 'student',
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'maya.patel@campus.edu',
      full_name: 'Maya Patel',
      role: 'student',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'prof.roberts@campus.edu',
      full_name: 'Dr. David Roberts',
      role: 'faculty',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      email: 'admin.security@campus.edu',
      full_name: 'Campus Public Safety Admin',
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const items = [
    {
      id: 'aaaa1111-1111-1111-1111-111111111111',
      user_id: '11111111-1111-1111-1111-111111111111',
      type: 'lost',
      title: 'Space Gray MacBook Air M2 13"',
      description: 'Left on 2nd floor silent study desk near the north window. Has a small NASA sticker on the top right corner of the lid and a slight scuff mark near the USB-C port.',
      category: 'Electronics',
      location: 'Main Library',
      incident_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      ai_tags: {
        extracted_color: 'Space Gray',
        brand: 'Apple',
        distinguishing_features: ['NASA sticker on lid top-right', 'scuff on USB-C port', 'M2 chip 13-inch model'],
        condition: 'good',
        summary_tags: ['laptop', 'apple', 'macbook', 'space gray', 'nasa sticker']
      },
      status: 'matched',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'bbbb2222-2222-2222-2222-222222222222',
      user_id: '22222222-2222-2222-2222-222222222222',
      type: 'found',
      title: 'Found Apple MacBook Laptop in Sleeve',
      description: 'Turned in by custodial staff from the 2nd floor library study carrels. Grey Apple laptop inside a grey padded neoprene sleeve with a sticker on the exterior lid.',
      category: 'Electronics',
      location: 'Main Library',
      incident_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      ai_tags: {
        extracted_color: 'Space Gray',
        brand: 'Apple',
        distinguishing_features: ['Decal/sticker on outer shell', 'padded grey sleeve', 'US keyboard layout'],
        condition: 'very good',
        summary_tags: ['laptop', 'apple', 'macbook', 'library found', 'space gray']
      },
      status: 'matched',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'cccc3333-3333-3333-3333-333333333333',
      user_id: '22222222-2222-2222-2222-222222222222',
      type: 'lost',
      title: 'Blue North Face Thermoball Jacket',
      description: 'Navy blue zip-up insulated jacket left on back of chair in Dining Hall booth. Size M with red lanyard in left zippered pocket.',
      category: 'Apparel & Accessories',
      location: 'Cafeteria',
      incident_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
      ai_tags: {
        extracted_color: 'Navy Blue',
        brand: 'The North Face',
        distinguishing_features: ['Size M', 'quilted pattern', 'red lanyard inside left pocket'],
        condition: 'excellent',
        summary_tags: ['jacket', 'north face', 'navy blue', 'apparel', 'cafeteria']
      },
      status: 'active',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'dddd4444-4444-4444-4444-444444444444',
      user_id: '33333333-3333-3333-3333-333333333333',
      type: 'lost',
      title: 'Student ID Card - Maya Patel',
      description: 'Campus ID card with badge holder and university seal clip. Lost somewhere between Engineering Block lecture hall 101 and the Student Center courtyard.',
      category: 'ID & Cards',
      location: 'Engineering Block',
      incident_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      ai_tags: {
        extracted_color: 'White/Blue',
        brand: 'University Campus ID',
        distinguishing_features: ['Clear plastic clip badge', 'Name: Maya Patel', 'Student ID 2024-8849'],
        condition: 'mint',
        summary_tags: ['student id', 'card', 'engineering', 'maya patel']
      },
      status: 'active',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'eeee5555-5555-5555-5555-555555555555',
      user_id: '44444444-4444-4444-4444-444444444444',
      type: 'found',
      title: 'Black Sony WH-1000XM5 Wireless Headphones',
      description: 'Found on bench outside Sports Complex gym entrance. In original hard-shell case with audio cable.',
      category: 'Electronics',
      location: 'Sports Complex',
      incident_date: new Date(Date.now() - 4 * 3600000).toISOString(),
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      ai_tags: {
        extracted_color: 'Matte Black',
        brand: 'Sony',
        distinguishing_features: ['WH-1000XM5 model', 'hard zipper carry case included', '3.5mm aux cable'],
        condition: 'excellent',
        summary_tags: ['headphones', 'sony', 'sports complex', 'wireless']
      },
      status: 'active',
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const item_matches = [
    {
      id: 'mmmm1111-1111-1111-1111-111111111111',
      lost_item_id: 'aaaa1111-1111-1111-1111-111111111111',
      found_item_id: 'bbbb2222-2222-2222-2222-222222222222',
      confidence_score: 94.50,
      match_reasoning: '### Match Evaluation Analysis\n- **Device Overlap:** Both items are Apple MacBook Air models with Space Gray finish.\n- **Distinctive Markings:** The lost item specifies a sticker on the lid, and the found item notes a sticker on the exterior shell.\n- **Location Correlation:** High correlation; both were reported in the **Main Library** on the 2nd floor study desk/carrel area.\n- **Temporal Alignment:** The found item report was filed ~24 hours after the loss occurred, fitting standard custodial pickup cycles.\n- **Conclusion:** Extremely high probability match (94.5% confidence).',
      status: 'pending',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  const claims = [
    {
      id: 'cccc1111-1111-1111-1111-111111111111',
      match_id: 'mmmm1111-1111-1111-1111-111111111111',
      claimant_id: '11111111-1111-1111-1111-111111111111',
      proof_description: 'I can unlock the MacBook with my student fingerprint/password (username: achen). The desktop wallpaper is the James Webb Carina Nebula. Serial number ends in -J84K. I have the original purchase invoice from the campus bookstore.',
      status: 'pending_review',
      created_at: new Date(Date.now() - 12 * 3600000).toISOString()
    }
  ];

  inMemoryStore = { users, items, item_matches, claims };
  saveStoreToFile();
}

function loadStoreFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      inMemoryStore = JSON.parse(raw);
    } else if (fs.existsSync(BUNDLED_DATA_FILE)) {
      const raw = fs.readFileSync(BUNDLED_DATA_FILE, 'utf8');
      inMemoryStore = JSON.parse(raw);
      saveStoreToFile();
    } else {
      seedDefaultStore();
    }
  } catch (err) {
    console.warn('Failed to load local data store, resetting to seed:', err.message);
    seedDefaultStore();
  }
}

function saveStoreToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist local data store:', err.message);
  }
}

export async function initDb() {
  loadStoreFromFile();

  if (process.env.DATABASE_URL) {
    try {
      pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 3000
      });

      const client = await pool.connect();
      console.log('Connected to PostgreSQL database successfully.');
      isPostgres = true;

      // Run schema initialization if needed
      try {
        const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf8');
          await client.query(sql);
          console.log('PostgreSQL schema applied successfully.');
        }
      } catch (schemaErr) {
        console.warn('PostgreSQL schema warning:', schemaErr.message);
      } finally {
        client.release();
      }
      return;
    } catch (pgErr) {
      console.warn(`PostgreSQL connection failed (${pgErr.message}). Operating with embedded relational store.`);
      isPostgres = false;
      pool = null;
    }
  } else {
    console.log('DATABASE_URL not set. Running with embedded persistent campus relational store.');
  }
}

// Relational query executor
export async function query(sqlText, params = []) {
  if (isPostgres && pool) {
    return pool.query(sqlText, params);
  }

  // Embedded storage query processor
  return executeInMemoryQuery(sqlText, params);
}

function executeInMemoryQuery(sqlText, params) {
  const normalized = sqlText.trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();

  // 1. SELECT queries
  if (lower.startsWith('select')) {
    // USERS lookup
    if (lower.includes('from users')) {
      if (lower.includes('where id = $1')) {
        const id = params[0];
        const rows = inMemoryStore.users.filter(u => u.id === id);
        return { rows, rowCount: rows.length };
      }
      if (lower.includes('where email = $1')) {
        const email = params[0];
        const rows = inMemoryStore.users.filter(u => u.email === email);
        return { rows, rowCount: rows.length };
      }
      return { rows: [...inMemoryStore.users], rowCount: inMemoryStore.users.length };
    }

    // ITEMS detailed with users join
    if (lower.includes('from items') && lower.includes('join users')) {
      let filtered = inMemoryStore.items.map(item => {
        const user = inMemoryStore.users.find(u => u.id === item.user_id) || {};
        return {
          ...item,
          user_full_name: user.full_name || 'Anonymous Student',
          user_email: user.email || 'user@campus.edu',
          user_role: user.role || 'student'
        };
      });

      if (lower.includes('where items.id = $1') || lower.includes('where i.id = $1')) {
        const id = params[0];
        filtered = filtered.filter(i => i.id === id);
        return { rows: filtered, rowCount: filtered.length };
      }

      if (lower.includes('where items.user_id = $1') || lower.includes('where i.user_id = $1')) {
        const userId = params[0];
        filtered = filtered.filter(i => i.user_id === userId);
        return { rows: filtered, rowCount: filtered.length };
      }

      return { rows: filtered, rowCount: filtered.length };
    }

    // ITEMS plain
    if (lower.includes('from items')) {
      let results = inMemoryStore.items.map(item => {
        const user = inMemoryStore.users.find(u => u.id === item.user_id) || {};
        return {
          ...item,
          user_full_name: user.full_name || 'Campus Member',
          user_email: user.email || 'user@campus.edu'
        };
      });

      if (lower.includes('where id = $1')) {
        const id = params[0];
        results = results.filter(i => i.id === id);
        return { rows: results, rowCount: results.length };
      }

      if (lower.includes('where user_id = $1')) {
        const userId = params[0];
        results = results.filter(i => i.user_id === userId);
        return { rows: results, rowCount: results.length };
      }

      if (lower.includes('where type = $1 and status = $2')) {
        results = results.filter(i => i.type === params[0] && i.status === params[1]);
        return { rows: results, rowCount: results.length };
      }

      if (lower.includes('where type != $1 and status =') || lower.includes('where type = $1 and id != $2')) {
        // used for finding candidates for matching
        const oppositeType = params[0];
        results = results.filter(i => i.type === oppositeType && (i.status === 'active' || i.status === 'matched'));
        return { rows: results, rowCount: results.length };
      }

      return { rows: results, rowCount: results.length };
    }

    // ITEM MATCHES
    if (lower.includes('from item_matches')) {
      let matches = inMemoryStore.item_matches.map(m => {
        const lost = inMemoryStore.items.find(i => i.id === m.lost_item_id) || {};
        const found = inMemoryStore.items.find(i => i.id === m.found_item_id) || {};
        const claim = inMemoryStore.claims.find(c => c.match_id === m.id) || null;
        return {
          ...m,
          lost_item: lost,
          found_item: found,
          claim
        };
      });

      if (lower.includes('where lost_item_id = $1 or found_item_id = $1') ||
          lower.includes('where m.lost_item_id = $1 or m.found_item_id = $1')) {
        const itemId = params[0];
        matches = matches.filter(m => m.lost_item_id === itemId || m.found_item_id === itemId);
        return { rows: matches, rowCount: matches.length };
      }

      if (lower.includes('where id = $1') || lower.includes('where m.id = $1')) {
        const id = params[0];
        matches = matches.filter(m => m.id === id);
        return { rows: matches, rowCount: matches.length };
      }

      if (lower.includes('where lost_item_id = $1 and found_item_id = $2')) {
        matches = matches.filter(m => m.lost_item_id === params[0] && m.found_item_id === params[1]);
        return { rows: matches, rowCount: matches.length };
      }

      return { rows: matches, rowCount: matches.length };
    }

    // CLAIMS
    if (lower.includes('from claims')) {
      let claims = inMemoryStore.claims.map(c => {
        const claimant = inMemoryStore.users.find(u => u.id === c.claimant_id) || {};
        const match = inMemoryStore.item_matches.find(m => m.id === c.match_id) || {};
        const lost = inMemoryStore.items.find(i => i.id === match.lost_item_id) || {};
        const found = inMemoryStore.items.find(i => i.id === match.found_item_id) || {};
        return {
          ...c,
          claimant_name: claimant.full_name,
          claimant_email: claimant.email,
          lost_item: lost,
          found_item: found,
          confidence_score: match.confidence_score
        };
      });

      if (lower.includes('where claimant_id = $1')) {
        claims = claims.filter(c => c.claimant_id === params[0]);
        return { rows: claims, rowCount: claims.length };
      }

      if (lower.includes('where match_id = $1')) {
        claims = claims.filter(c => c.match_id === params[0]);
        return { rows: claims, rowCount: claims.length };
      }

      if (lower.includes('where id = $1') || lower.includes('where c.id = $1')) {
        claims = claims.filter(c => c.id === params[0]);
        return { rows: claims, rowCount: claims.length };
      }

      return { rows: claims, rowCount: claims.length };
    }
  }

  // 2. INSERT queries
  if (lower.startsWith('insert into items')) {
    const newItem = {
      id: uuidv4(),
      user_id: params[0],
      type: params[1],
      title: params[2],
      description: params[3],
      category: params[4],
      location: params[5],
      incident_date: params[6],
      image_url: params[7],
      ai_tags: typeof params[8] === 'string' ? JSON.parse(params[8]) : (params[8] || {}),
      status: params[9] || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    inMemoryStore.items.unshift(newItem);
    saveStoreToFile();
    return { rows: [newItem], rowCount: 1 };
  }

  if (lower.startsWith('insert into item_matches')) {
    const newMatch = {
      id: uuidv4(),
      lost_item_id: params[0],
      found_item_id: params[1],
      confidence_score: Number(params[2]),
      match_reasoning: params[3],
      status: params[4] || 'pending',
      created_at: new Date().toISOString()
    };
    // remove existing duplicate if any
    inMemoryStore.item_matches = inMemoryStore.item_matches.filter(
      m => !(m.lost_item_id === newMatch.lost_item_id && m.found_item_id === newMatch.found_item_id)
    );
    inMemoryStore.item_matches.unshift(newMatch);
    saveStoreToFile();
    return { rows: [newMatch], rowCount: 1 };
  }

  if (lower.startsWith('insert into claims')) {
    const newClaim = {
      id: uuidv4(),
      match_id: params[0],
      claimant_id: params[1],
      proof_description: params[2],
      status: params[3] || 'pending_review',
      created_at: new Date().toISOString()
    };
    inMemoryStore.claims.unshift(newClaim);
    saveStoreToFile();
    return { rows: [newClaim], rowCount: 1 };
  }

  // 3. UPDATE queries
  if (lower.startsWith('update items')) {
    const id = params[params.length - 1];
    const item = inMemoryStore.items.find(i => i.id === id);
    if (item) {
      if (lower.includes('status = $1')) {
        item.status = params[0];
      }
      if (lower.includes('ai_tags = $1')) {
        item.ai_tags = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
      }
      item.updated_at = new Date().toISOString();
      saveStoreToFile();
      return { rows: [item], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.startsWith('update claims')) {
    const id = params[1];
    const claim = inMemoryStore.claims.find(c => c.id === id);
    if (claim) {
      claim.status = params[0];
      saveStoreToFile();
      return { rows: [claim], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (lower.startsWith('update item_matches')) {
    const id = params[1];
    const match = inMemoryStore.item_matches.find(m => m.id === id);
    if (match) {
      match.status = params[0];
      saveStoreToFile();
      return { rows: [match], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 4. DELETE queries
  if (lower.startsWith('delete from items')) {
    const id = params[0];
    const initialLen = inMemoryStore.items.length;
    inMemoryStore.items = inMemoryStore.items.filter(i => i.id !== id);
    saveStoreToFile();
    return { rows: [], rowCount: initialLen - inMemoryStore.items.length };
  }

  return { rows: [], rowCount: 0 };
}

export function getDbStats() {
  return {
    isPostgres,
    userCount: inMemoryStore.users.length,
    itemCount: inMemoryStore.items.length,
    matchCount: inMemoryStore.item_matches.length,
    claimCount: inMemoryStore.claims.length
  };
}
