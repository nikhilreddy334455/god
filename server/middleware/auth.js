import { query } from '../config/db.js';

// Predefined demo users for quick role switching and testing
export const DEMO_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'alex.chen@campus.edu',
    full_name: 'Alex Chen',
    role: 'student'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'maya.patel@campus.edu',
    full_name: 'Maya Patel',
    role: 'student'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'prof.roberts@campus.edu',
    full_name: 'Dr. David Roberts',
    role: 'faculty'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'admin.security@campus.edu',
    full_name: 'Campus Public Safety Admin',
    role: 'admin'
  }
];

export async function authMiddleware(req, res, next) {
  try {
    // Check headers for user ID or default to Alex Chen (student)
    const headerUserId = req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');
    const userId = headerUserId || DEMO_USERS[0].id;

    // Lookup user in database
    const userRes = await query('SELECT * FROM users WHERE id = $1', [userId]);

    if (userRes.rows.length > 0) {
      req.user = userRes.rows[0];
    } else {
      // Find matching demo user or fallback
      const demo = DEMO_USERS.find(u => u.id === userId) || DEMO_USERS[0];
      req.user = demo;
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    req.user = DEMO_USERS[0];
    next();
  }
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role`
      });
    }

    next();
  };
}
