import { query } from '../config/db.js';
import { evaluateItemMatch } from './geminiService.js';

/**
 * Executes cross-matching for a newly submitted item against existing opposite items
 */
export async function runCrossMatchingForItem(newItem) {
  try {
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';

    // Retrieve active candidate opposite items
    const candidatesRes = await query(
      `SELECT * FROM items WHERE type = $1 AND (status = 'active' OR status = 'matched')`,
      [oppositeType]
    );

    const candidates = candidatesRes.rows;
    const recordedMatches = [];

    for (const candidate of candidates) {
      const lostItem = newItem.type === 'lost' ? newItem : candidate;
      const foundItem = newItem.type === 'found' ? newItem : candidate;

      // Evaluate match with Gemini
      const matchResult = await evaluateItemMatch(lostItem, foundItem);

      // Section 9: Matching Threshold: Minimum confidence score of 60%
      if (matchResult.confidence_score >= 60.0) {
        // Persist match into database
        const insertRes = await query(
          `INSERT INTO item_matches (lost_item_id, found_item_id, confidence_score, match_reasoning, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (lost_item_id, found_item_id)
           DO UPDATE SET confidence_score = EXCLUDED.confidence_score, match_reasoning = EXCLUDED.match_reasoning`,
          [
            lostItem.id,
            foundItem.id,
            matchResult.confidence_score,
            matchResult.match_reasoning,
            'pending'
          ]
        );

        // Update status of both items to 'matched' if currently 'active'
        await query(
          `UPDATE items SET status = 'matched' WHERE id = $1 AND status = 'active'`,
          [lostItem.id]
        );
        await query(
          `UPDATE items SET status = 'matched' WHERE id = $1 AND status = 'active'`,
          [foundItem.id]
        );

        recordedMatches.push({
          candidateId: candidate.id,
          candidateTitle: candidate.title,
          confidence_score: matchResult.confidence_score,
          match_reasoning: matchResult.match_reasoning
        });
      }
    }

    console.log(`Cross-matching completed for item "${newItem.title}". Found ${recordedMatches.length} matches >= 60%.`);
    return recordedMatches;
  } catch (err) {
    console.error('Error during cross-matching execution:', err);
    return [];
  }
}
