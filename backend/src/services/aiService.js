const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export const isAiConfigured = () => {
  return Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 10);
};

export async function parseNaturalLanguagePreferences(text) {
  if (!text || typeof text !== 'string') {
    return {
      extractedInterests: ['Historical Monuments', 'Ancient Architecture'],
      travelStyle: 'balanced',
      transportPreference: 'cab',
      summary: 'Standard balanced cultural heritage preferences.'
    };
  }

  const lower = text.toLowerCase();
  const extractedInterests = [];

  // Deterministic Keyword Heuristic
  if (lower.includes('history') || lower.includes('monument') || lower.includes('fort') || lower.includes('palace')) {
    extractedInterests.push('Historical Monuments');
  }
  if (lower.includes('arch') || lower.includes('ancient') || lower.includes('tomb') || lower.includes('stone')) {
    extractedInterests.push('Ancient Architecture');
  }
  if (lower.includes('peace') || lower.includes('calm') || lower.includes('garden') || lower.includes('nature') || lower.includes('green')) {
    extractedInterests.push('Nature and Landscapes');
  }
  if (lower.includes('temple') || lower.includes('mosque') || lower.includes('spiritual') || lower.includes('relig')) {
    extractedInterests.push('Religious Heritage');
  }
  if (lower.includes('museum') || lower.includes('art') || lower.includes('gallery')) {
    extractedInterests.push('Museums');
  }
  if (lower.includes('food') || lower.includes('chaat') || lower.includes('eat') || lower.includes('bazaar') || lower.includes('market')) {
    extractedInterests.push('Food and Local Culture');
  }
  if (lower.includes('photo') || lower.includes('instagram') || lower.includes('camera') || lower.includes('view')) {
    extractedInterests.push('Photography');
  }
  if (lower.includes('hidden') || lower.includes('secret') || lower.includes('stepwell') || lower.includes('offbeat')) {
    extractedInterests.push('Hidden Gems');
  }

  if (extractedInterests.length === 0) {
    extractedInterests.push('Historical Monuments', 'Ancient Architecture');
  }

  // Travel Style
  let travelStyle = 'balanced';
  if (lower.includes('relax') || lower.includes('slow') || lower.includes('peaceful') || lower.includes('unhurried') || lower.includes('chill')) {
    travelStyle = 'relaxed';
  } else if (lower.includes('fast') || lower.includes('packed') || lower.includes('rush') || lower.includes('everything') || lower.includes('maximum')) {
    travelStyle = 'packed';
  }

  // Transport
  let transportPreference = 'cab';
  if (lower.includes('walk') || lower.includes('foot')) {
    transportPreference = 'walking';
  } else if (lower.includes('metro') || lower.includes('train') || lower.includes('bus') || lower.includes('public')) {
    transportPreference = 'public';
  } else if (lower.includes('cycle') || lower.includes('bike') || lower.includes('bicycle')) {
    transportPreference = 'bicycle';
  }

  // If Gemini API Key exists, enhance with LLM interpretation
  if (isAiConfigured()) {
    try {
      const prompt = `Analyze this travel wish: "${text}". Return JSON with keys: extractedInterests (array from: Historical Monuments, Ancient Architecture, Religious Heritage, Museums, Nature and Landscapes, Food and Local Culture, Adventure, Photography, Hidden Gems, Local Experiences), travelStyle (relaxed, balanced, or packed), transportPreference (walking, public, cab, bicycle), and a 1-sentence summary explanation.`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic parser:', err.message);
    }
  }

  return {
    extractedInterests,
    travelStyle,
    transportPreference,
    summary: `Interpreted preference for ${travelStyle} pace focusing on ${extractedInterests.join(', ')} via ${transportPreference}.`
  };
}
