import { query } from '../config/db.js';
import { createItemSchema } from '../validators/itemSchema.js';
import { analyzeItemWithGemini } from '../services/geminiService.js';
import { runCrossMatchingForItem } from '../services/matchingService.js';

/**
 * GET /api/items
 * Retrieve paginated items with query filters (type, category, status, location, search)
 */
export async function getItems(req, res) {
  try {
    const {
      type,
      category,
      status,
      location,
      search,
      page = 1,
      limit = 12
    } = req.query;

    const allItemsRes = await query('SELECT * FROM items JOIN users ON items.user_id = users.id ORDER BY items.created_at DESC');
    let items = allItemsRes.rows;

    // Apply filters
    if (type && type !== 'all') {
      items = items.filter(i => i.type.toLowerCase() === type.toLowerCase());
    }
    if (category && category !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== 'all') {
      items = items.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    if (location && location !== 'all') {
      items = items.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      items = items.filter(i => 
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        JSON.stringify(i.ai_tags || {}).toLowerCase().includes(q)
      );
    }

    const total = items.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const paginated = items.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    // Attach match count to each item
    const matchesRes = await query('SELECT * FROM item_matches');
    const allMatches = matchesRes.rows;

    const itemsWithMeta = paginated.map(item => {
      const matchesForItem = allMatches.filter(m => m.lost_item_id === item.id || m.found_item_id === item.id);
      const topMatch = matchesForItem.sort((a, b) => b.confidence_score - a.confidence_score)[0];
      return {
        ...item,
        matches_count: matchesForItem.length,
        top_match_score: topMatch ? topMatch.confidence_score : null
      };
    });

    return res.json({
      success: true,
      items: itemsWithMeta,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (err) {
    console.error('getItems error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve campus items' });
  }
}

/**
 * GET /api/items/:id
 * Retrieve item details including attached AI analysis and potential matches
 */
export async function getItemById(req, res) {
  try {
    const { id } = req.params;

    const itemRes = await query('SELECT * FROM items JOIN users ON items.user_id = users.id WHERE items.id = $1', [id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const item = itemRes.rows[0];

    // Fetch related matches
    const matchesRes = await query('SELECT * FROM item_matches WHERE lost_item_id = $1 OR found_item_id = $1', [id]);
    const matches = matchesRes.rows.sort((a, b) => b.confidence_score - a.confidence_score);

    // Fetch claims for these matches
    const claimsRes = await query('SELECT * FROM claims');
    const itemClaims = claimsRes.rows.filter(c => matches.some(m => m.id === c.match_id));

    return res.json({
      success: true,
      item,
      matches,
      claims: itemClaims
    });
  } catch (err) {
    console.error('getItemById error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve item details' });
  }
}

/**
 * POST /api/items
 * Create a new lost or found item report (triggers async AI matching)
 */
export async function createItem(req, res) {
  try {
    // 1. Zod input validation
    const parsedBody = createItemSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsedBody.error.format()
      });
    }

    const { type, title, description, category, location, incident_date } = parsedBody.data;

    // Handle image file or URL
    let imageUrl = parsedBody.data.image_url || null;
    let imageBuffer = null;
    let mimeType = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    }

    // Default image fallback if none provided
    if (!imageUrl) {
      if (category.toLowerCase().includes('electronic')) {
        imageUrl = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
      } else if (category.toLowerCase().includes('apparel')) {
        imageUrl = 'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80';
      } else if (category.toLowerCase().includes('id')) {
        imageUrl = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
      }
    }

    // 2. Call Gemini AI multimodal analysis to extract standardized tags
    console.log(`Analyzing item "${title}" with Gemini AI...`);
    const aiTags = await analyzeItemWithGemini(imageBuffer, mimeType, description, category);

    // 3. Insert record into database
    const userId = req.user?.id || '11111111-1111-1111-1111-111111111111';
    const insertRes = await query(
      `INSERT INTO items (user_id, type, title, description, category, location, incident_date, image_url, ai_tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        type,
        title,
        description,
        category,
        location,
        new Date(incident_date).toISOString(),
        imageUrl,
        aiTags,
        'active'
      ]
    );

    const createdItem = insertRes.rows[0];

    // 4. Trigger automated background cross-matching against opposite reports
    // We run it and also await top matches so user immediately sees matches if any exist!
    const matchesFound = await runCrossMatchingForItem(createdItem);

    return res.status(201).json({
      success: true,
      message: `Successfully filed ${type} item report`,
      item: createdItem,
      matches_found_count: matchesFound.length,
      matches: matchesFound
    });
  } catch (err) {
    console.error('createItem error:', err);
    return res.status(500).json({ success: false, error: 'Failed to file item report: ' + err.message });
  }
}

/**
 * DELETE /api/items/:id
 * Archive or delete an item report (Creator or Admin only per Section 11 RLS)
 */
export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const itemRes = await query('SELECT * FROM items WHERE id = $1', [id]);

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const item = itemRes.rows[0];

    // Section 11 RLS: Only the item creator or an admin can update or delete
    if (req.user.role !== 'admin' && req.user.id !== item.user_id) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only delete your own reports' });
    }

    await query('DELETE FROM items WHERE id = $1', [id]);

    return res.json({ success: true, message: 'Item report removed successfully' });
  } catch (err) {
    console.error('deleteItem error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete item' });
  }
}

/**
 * GET /api/items/:id/matches
 * Retrieve AI match recommendations for a specific item
 */
export async function getItemMatches(req, res) {
  try {
    const { id } = req.params;
    const matchesRes = await query('SELECT * FROM item_matches WHERE lost_item_id = $1 OR found_item_id = $1', [id]);
    const matches = matchesRes.rows;

    return res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (err) {
    console.error('getItemMatches error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve match recommendations' });
  }
}
