import { query } from '../config/db.js';
import { createClaimSchema } from '../validators/itemSchema.js';

/**
 * POST /api/claims
 * Submit a claim verification for an item match
 */
export async function createClaim(req, res) {
  try {
    const parsed = createClaimSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: parsed.error.format()
      });
    }

    const { match_id, proof_description } = parsed.data;
    const claimantId = req.user?.id || '11111111-1111-1111-1111-111111111111';

    // Verify match exists
    const matchRes = await query('SELECT * FROM item_matches WHERE id = $1', [match_id]);
    if (matchRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Target match not found' });
    }

    // Insert claim
    const claimRes = await query(
      `INSERT INTO claims (match_id, claimant_id, proof_description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [match_id, claimantId, proof_description, 'pending_review']
    );

    // Update item status to 'pending_verification'
    const match = matchRes.rows[0];
    await query(`UPDATE items SET status = 'pending_verification' WHERE id = $1`, [match.lost_item_id]);
    await query(`UPDATE items SET status = 'pending_verification' WHERE id = $1`, [match.found_item_id]);

    return res.status(201).json({
      success: true,
      message: 'Claim verification submitted successfully. Campus security will review your proof.',
      claim: claimRes.rows[0]
    });
  } catch (err) {
    console.error('createClaim error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit claim: ' + err.message });
  }
}

/**
 * GET /api/matches/:id
 * Retrieve single match details, side-by-side items, and claim history
 */
export async function getMatchById(req, res) {
  try {
    const { id } = req.params;
    const matchRes = await query('SELECT * FROM item_matches WHERE id = $1', [id]);

    if (matchRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Match record not found' });
    }

    const match = matchRes.rows[0];

    // Fetch Lost and Found items
    const lostRes = await query('SELECT * FROM items JOIN users ON items.user_id = users.id WHERE items.id = $1', [match.lost_item_id]);
    const foundRes = await query('SELECT * FROM items JOIN users ON items.user_id = users.id WHERE items.id = $1', [match.found_item_id]);

    // Fetch existing claims
    const claimsRes = await query('SELECT * FROM claims WHERE match_id = $1', [id]);

    return res.json({
      success: true,
      match: {
        ...match,
        lost_item: lostRes.rows[0] || null,
        found_item: foundRes.rows[0] || null,
        claims: claimsRes.rows
      }
    });
  } catch (err) {
    console.error('getMatchById error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve match details' });
  }
}
