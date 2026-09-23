import { query, getDbStats } from '../config/db.js';
import { isGeminiConfigured } from '../services/geminiService.js';
import { updateClaimStatusSchema } from '../validators/itemSchema.js';

/**
 * GET /api/admin/reports
 * Retrieve moderation logs and system stats (Admin only)
 */
export async function getAdminReports(req, res) {
  try {
    const itemsRes = await query('SELECT * FROM items JOIN users ON items.user_id = users.id ORDER BY items.created_at DESC');
    const matchesRes = await query('SELECT * FROM item_matches ORDER BY confidence_score DESC');
    const claimsRes = await query('SELECT * FROM claims ORDER BY created_at DESC');
    const usersRes = await query('SELECT * FROM users');

    const items = itemsRes.rows;
    const matches = matchesRes.rows;
    const claims = claimsRes.rows;
    const users = usersRes.rows;

    const stats = {
      totalItems: items.length,
      lostItems: items.filter(i => i.type === 'lost').length,
      foundItems: items.filter(i => i.type === 'found').length,
      activeItems: items.filter(i => i.status === 'active').length,
      matchedItems: items.filter(i => i.status === 'matched').length,
      pendingVerification: items.filter(i => i.status === 'pending_verification').length,
      resolvedItems: items.filter(i => i.status === 'resolved').length,
      totalMatches: matches.length,
      highConfidenceMatches: matches.filter(m => m.confidence_score >= 85).length,
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => c.status === 'pending_review').length,
      totalUsers: users.length
    };

    // Enrich claims with item context
    const enrichedClaims = claims.map(claim => {
      const match = matches.find(m => m.id === claim.match_id) || {};
      const lostItem = items.find(i => i.id === match.lost_item_id);
      const foundItem = items.find(i => i.id === match.found_item_id);
      const claimant = users.find(u => u.id === claim.claimant_id);

      return {
        ...claim,
        confidence_score: match.confidence_score,
        claimant_name: claimant ? claimant.full_name : 'Unknown User',
        claimant_email: claimant ? claimant.email : 'unknown@campus.edu',
        lost_item_title: lostItem ? lostItem.title : 'Deleted Item',
        found_item_title: foundItem ? foundItem.title : 'Deleted Item',
        location: lostItem?.location || foundItem?.location || 'Campus'
      };
    });

    return res.json({
      success: true,
      stats,
      pendingClaims: enrichedClaims.filter(c => c.status === 'pending_review'),
      allClaims: enrichedClaims,
      recentItems: items.slice(0, 10),
      recentMatches: matches.slice(0, 10),
      geminiConfigured: isGeminiConfigured()
    });
  } catch (err) {
    console.error('getAdminReports error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate admin reports' });
  }
}

/**
 * PATCH /api/admin/claims/:id
 * Moderate claim: approve or reject
 */
export async function updateClaimStatus(req, res) {
  try {
    const { id } = req.params;
    const parsed = updateClaimStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const { status } = parsed.data;

    // Update claim
    const claimRes = await query('SELECT * FROM claims WHERE id = $1', [id]);
    if (claimRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Claim not found' });
    }

    const claim = claimRes.rows[0];
    await query('UPDATE claims SET status = $1 WHERE id = $2', [status, id]);

    // If approved, mark both lost & found items as resolved
    if (status === 'approved') {
      const matchRes = await query('SELECT * FROM item_matches WHERE id = $1', [claim.match_id]);
      if (matchRes.rows.length > 0) {
        const match = matchRes.rows[0];
        await query(`UPDATE items SET status = 'resolved' WHERE id = $1`, [match.lost_item_id]);
        await query(`UPDATE items SET status = 'resolved' WHERE id = $1`, [match.found_item_id]);
        await query(`UPDATE item_matches SET status = 'confirmed' WHERE id = $1`, [match.id]);
      }
    } else if (status === 'rejected') {
      // Revert items back to matched or active
      const matchRes = await query('SELECT * FROM item_matches WHERE id = $1', [claim.match_id]);
      if (matchRes.rows.length > 0) {
        const match = matchRes.rows[0];
        await query(`UPDATE items SET status = 'matched' WHERE id = $1`, [match.lost_item_id]);
        await query(`UPDATE items SET status = 'matched' WHERE id = $1`, [match.found_item_id]);
        await query(`UPDATE item_matches SET status = 'rejected' WHERE id = $1`, [match.id]);
      }
    }

    return res.json({
      success: true,
      message: `Claim status successfully updated to ${status}`,
      claimId: id,
      newStatus: status
    });
  } catch (err) {
    console.error('updateClaimStatus error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update claim status' });
  }
}
