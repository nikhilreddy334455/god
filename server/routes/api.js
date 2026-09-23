import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getItems,
  getItemById,
  createItem,
  deleteItem,
  getItemMatches
} from '../controllers/itemsController.js';
import {
  createClaim,
  getMatchById
} from '../controllers/claimsController.js';
import {
  getAdminReports,
  updateClaimStatus
} from '../controllers/adminController.js';
import {
  authMiddleware,
  requireRole,
  DEMO_USERS
} from '../middleware/auth.js';
import { isGeminiConfigured } from '../services/geminiService.js';
import { query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage and file filter (Section 9: max 5MB, JPEG, PNG, WEBP)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Allowed formats: JPEG, PNG, WEBP'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Middleware to load file into memory buffer if needed for Gemini
const populateBufferMiddleware = (req, res, next) => {
  if (req.file) {
    try {
      req.file.buffer = fs.readFileSync(req.file.path);
    } catch (err) {
      console.warn('Could not read file buffer:', err.message);
    }
  }
  next();
};

// Rate limiter helper (Section 9: max 5 report submissions per user per hour)
const submissionTracker = new Map();
function reportRateLimiter(req, res, next) {
  const userId = req.user?.id || req.ip;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  const userSubmissions = submissionTracker.get(userId) || [];
  const validSubmissions = userSubmissions.filter(time => now - time < windowMs);

  if (validSubmissions.length >= 5) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded: You can submit a maximum of 5 reports per hour.'
    });
  }

  validSubmissions.push(now);
  submissionTracker.set(userId, validSubmissions);
  next();
}

// Apply authentication to API
router.use(authMiddleware);

// --- 1. Health Endpoint ---
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Campus Lost & Found System',
    gemini_ai: isGeminiConfigured() ? 'live_api_active' : 'simulated_heuristics_active',
    model: 'gemini-2.5-flash',
    user: req.user
  });
});

// --- 2. User & Demo Role Switcher ---
router.get('/users/me', (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

router.get('/users/demo-list', (req, res) => {
  res.json({
    success: true,
    demoUsers: DEMO_USERS
  });
});

// --- 3. Items Endpoints ---
router.get('/items', getItems);
router.post('/items', reportRateLimiter, upload.single('image'), populateBufferMiddleware, createItem);
router.get('/items/:id', getItemById);
router.delete('/items/:id', deleteItem);
router.get('/items/:id/matches', getItemMatches);

// --- 4. Matches & Claims Endpoints ---
router.get('/matches/:id', getMatchById);
router.post('/claims', createClaim);

// --- 5. User Personal Submissions Dashboard ---
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;

    const lostRes = await query(`SELECT * FROM items WHERE user_id = $1 AND type = 'lost' ORDER BY created_at DESC`, [userId]);
    const foundRes = await query(`SELECT * FROM items WHERE user_id = $1 AND type = 'found' ORDER BY created_at DESC`, [userId]);
    const claimsRes = await query(`SELECT * FROM claims WHERE claimant_id = $1 ORDER BY created_at DESC`, [userId]);

    // Matches involving user's items
    const userItemIds = [...lostRes.rows, ...foundRes.rows].map(i => i.id);
    const matchesRes = await query('SELECT * FROM item_matches ORDER BY confidence_score DESC');
    const userMatches = matchesRes.rows.filter(m => userItemIds.includes(m.lost_item_id) || userItemIds.includes(m.found_item_id));

    res.json({
      success: true,
      user: req.user,
      lostItems: lostRes.rows,
      foundItems: foundRes.rows,
      claims: claimsRes.rows,
      matches: userMatches
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard profile data' });
  }
});

// --- 6. Admin Endpoints (Protected by requireRole(['admin'])) ---
router.get('/admin/reports', requireRole(['admin']), getAdminReports);
router.patch('/admin/claims/:id', requireRole(['admin']), updateClaimStatus);

export default router;
