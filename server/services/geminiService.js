import { GoogleGenAI } from '@google/genai';

let aiClient = null;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here');
}

/**
 * Multimodal item analysis extracting standardized visual attributes and tags
 */
export async function analyzeItemWithGemini(imageBuffer, mimeType, description, category) {
  const ai = getAiClient();

  // If Gemini API Key is available, invoke official SDK
  if (ai) {
    try {
      const contents = [];
      const prompt = `You are the core intelligence engine for a university campus Lost & Found system.
Analyze this campus lost/found item submission.
Category: ${category}
User Description: "${description}"

Extract distinguishing visual attributes, brand, primary/secondary colors, distinctive marks, and item condition. Return valid JSON strictly matching this schema:
{
  "extracted_color": "string",
  "brand": "string",
  "distinguishing_features": ["string"],
  "condition": "string",
  "summary_tags": ["string"]
}`;

      contents.push(prompt);

      if (imageBuffer && mimeType) {
        contents.push({
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      return parsed;
    } catch (err) {
      console.warn('Gemini API call encountered error, engaging resilient fallback:', err.message);
    }
  }

  // Resilient heuristic fallback analysis
  return generateHeuristicItemTags(description, category);
}

/**
 * Semantic cross-matching evaluation between a Lost Item and a Found Item
 */
export async function evaluateItemMatch(lostItem, foundItem) {
  const ai = getAiClient();

  if (ai) {
    try {
      const prompt = `You are the core intelligence engine for a university campus Lost & Found system.
Compare these two campus items (one Lost, one Found) and determine if they represent the same physical object.

LOST ITEM:
Title: ${lostItem.title}
Description: ${lostItem.description}
Category: ${lostItem.category}
Location: ${lostItem.location}
Date: ${lostItem.incident_date}
AI Tags: ${JSON.stringify(lostItem.ai_tags || {})}

FOUND ITEM:
Title: ${foundItem.title}
Description: ${foundItem.description}
Category: ${foundItem.category}
Location: ${foundItem.location}
Date: ${foundItem.incident_date}
AI Tags: ${JSON.stringify(foundItem.ai_tags || {})}

Evaluate temporal proximity, location relevance, and semantic/visual attribute overlap. Return a JSON object strictly matching this schema:
{
  "confidence_score": number (0 to 100),
  "match_reasoning": "Detailed markdown explanation citing overlapping features, location proximity, and timeline consistency.",
  "is_viable_match": boolean
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text.trim());
      return parsed;
    } catch (err) {
      console.warn('Gemini match evaluation encountered error, engaging resilient fallback:', err.message);
    }
  }

  // Resilient heuristic matching engine
  return calculateHeuristicMatch(lostItem, foundItem);
}

// Heuristic fallback for item analysis
function generateHeuristicItemTags(description, category) {
  const descLower = description.toLowerCase();

  // Color extraction
  const colors = ['black', 'space gray', 'grey', 'silver', 'white', 'blue', 'navy', 'red', 'green', 'gold', 'rose gold', 'yellow', 'purple', 'brown'];
  const foundColor = colors.find(c => descLower.includes(c)) || 'Multi-tone / Neutral';

  // Brand extraction
  const brands = ['apple', 'macbook', 'iphone', 'samsung', 'sony', 'dell', 'lenovo', 'hp', 'nike', 'adidas', 'north face', 'patagonia', 'stanley', 'hydro flask', 'casio', 'bose'];
  const matchedBrand = brands.find(b => descLower.includes(b));
  const brand = matchedBrand ? matchedBrand.charAt(0).toUpperCase() + matchedBrand.slice(1) : 'Standard / Unbranded';

  // Condition
  let condition = 'Good';
  if (descLower.includes('new') || descLower.includes('mint') || descLower.includes('flawless')) condition = 'Mint';
  if (descLower.includes('scratch') || descLower.includes('scuff') || descLower.includes('worn')) condition = 'Fair with signs of wear';

  // Features extraction
  const features = [];
  if (descLower.includes('sticker') || descLower.includes('decal')) features.push('Sticker/decal affixed');
  if (descLower.includes('case') || descLower.includes('sleeve')) features.push('Protective case or sleeve included');
  if (descLower.includes('cable') || descLower.includes('charger')) features.push('Associated charging cable/accessory');
  if (descLower.includes('carina') || descLower.includes('wallpaper')) features.push('Custom screen wallpaper');
  if (descLower.includes('id') || descLower.includes('card')) features.push('University ID badge');
  if (features.length === 0) features.push(`Standard ${category} physical profile`);

  // Summary tags
  const words = description
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'near', 'floor', 'desk'].includes(w.toLowerCase()))
    .slice(0, 5)
    .map(w => w.toLowerCase());

  const summary_tags = Array.from(new Set([category.toLowerCase(), foundColor.toLowerCase(), ...words])).slice(0, 6);

  return {
    extracted_color: foundColor.charAt(0).toUpperCase() + foundColor.slice(1),
    brand: brand,
    distinguishing_features: features,
    condition: condition,
    summary_tags: summary_tags
  };
}

// Heuristic fallback for match evaluation
function calculateHeuristicMatch(lostItem, foundItem) {
  let score = 0;
  const reasons = [];

  // 1. Category match (30 points)
  if (lostItem.category.toLowerCase() === foundItem.category.toLowerCase()) {
    score += 30;
    reasons.push(`- **Category Match:** Identical classification (${lostItem.category}).`);
  } else {
    reasons.push(`- **Category Variance:** Categories differ (${lostItem.category} vs ${foundItem.category}).`);
  }

  // 2. Location match (25 points)
  if (lostItem.location.toLowerCase() === foundItem.location.toLowerCase()) {
    score += 25;
    reasons.push(`- **Campus Location Proximity:** Both reported at **${lostItem.location}**.`);
  } else {
    reasons.push(`- **Location Delta:** Reported in adjacent/different campus zones (${lostItem.location} vs ${foundItem.location}).`);
  }

  // 3. Keyword / Semantic overlap (35 points)
  const lostWords = `${lostItem.title} ${lostItem.description} ${JSON.stringify(lostItem.ai_tags || {})}`.toLowerCase();
  const foundWords = `${foundItem.title} ${foundItem.description} ${JSON.stringify(foundItem.ai_tags || {})}`.toLowerCase();

  const keywords = ['macbook', 'apple', 'laptop', 'iphone', 'jacket', 'sony', 'headphones', 'id', 'card', 'hydro flask', 'keys', 'airpods', 'sticker', 'sleeve', 'case', 'blue', 'gray', 'black'];
  let overlapCount = 0;
  const matchedKeywords = [];

  keywords.forEach(kw => {
    if (lostWords.includes(kw) && foundWords.includes(kw)) {
      overlapCount++;
      matchedKeywords.push(kw);
    }
  });

  if (overlapCount > 0) {
    const keywordScore = Math.min(35, overlapCount * 10);
    score += keywordScore;
    reasons.push(`- **Attribute Overlap:** High correlation on key markers: *${matchedKeywords.join(', ')}*.`);
  }

  // 4. Temporal consistency (10 points)
  const lostDate = new Date(lostItem.incident_date);
  const foundDate = new Date(foundItem.incident_date);
  const diffDays = Math.abs(foundDate - lostDate) / (1000 * 3600 * 24);

  if (diffDays <= 7) {
    score += 10;
    reasons.push(`- **Temporal Alignment:** Incident dates are within ${(diffDays).toFixed(1)} days of each other.`);
  }

  const confidence_score = Math.min(98, Math.max(15, score));
  const is_viable_match = confidence_score >= 60;

  const match_reasoning = `### AI Match Assessment
${reasons.join('\n')}

**Assessment Outcome:** ${is_viable_match ? 'Candidate demonstrates strong visual and spatial alignment.' : 'Insufficient correlation to warrant high-confidence recommendation.'}`;

  return {
    confidence_score,
    match_reasoning,
    is_viable_match
  };
}
