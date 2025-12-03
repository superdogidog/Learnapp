import cedict from 'cc-cedict';

/**
 * Get translation for a Chinese character or word
 * @param {string} text - Chinese character(s) to translate
 * @returns {Object|null} Translation data or null if not found
 */
export function getTranslation(text) {
  if (!text || text.trim() === '') return null;
  
  try {
    const results = cedict.getBySimplified(text, null, { asObject: false, allowVariants: true });
    
    if (!results || results.length === 0) return null;
    
    // Get the first (most common) entry
    const primary = results[0];
    
    return {
      simplified: primary.simplified,
      traditional: primary.traditional,
      pinyin: primary.pinyin,
      definitions: primary.meanings || [],
      hasMultipleEntries: results.length > 1,
      allEntries: results,
    };
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

/**
 * Get extended translation info with all available definitions
 * @param {string} text - Chinese character(s) to translate
 * @returns {Object|null} Extended translation data
 */
export function getExtendedTranslation(text) {
  if (!text || text.trim() === '') return null;
  
  try {
    const results = cedict.getBySimplified(text, null, { asObject: false, allowVariants: true });
    
    if (!results || results.length === 0) return null;
    
    return {
      simplified: results[0].simplified,
      traditional: results[0].traditional,
      pinyin: results[0].pinyin,
      allDefinitions: results.flatMap(entry => entry.meanings || []),
      entries: results.map(entry => ({
        simplified: entry.simplified,
        traditional: entry.traditional,
        pinyin: entry.pinyin,
        definitions: entry.meanings || [],
      })),
      totalEntries: results.length,
    };
  } catch (error) {
    console.error('Extended translation error:', error);
    return null;
  }
}
