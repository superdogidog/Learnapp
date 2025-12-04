// Lazy load cedict to improve initial page load performance
let cedict = null;
let cedictLoadPromise = null;

const loadCedict = async () => {
  if (cedict) return cedict;
  if (cedictLoadPromise) return cedictLoadPromise;
  
  cedictLoadPromise = import('cc-cedict').then(module => {
    cedict = module.default;
    return cedict;
  });
  
  return cedictLoadPromise;
};

// Cache for translations to avoid repeated API calls
const translationCache = new Map();

/**
 * Translate English text to Russian using MyMemory Translation API
 * @param {string} text - English text to translate
 * @returns {Promise<string>} Russian translation
 */
async function translateToRussian(text) {
  if (!text) return text;
  
  // Check cache first
  const cacheKey = text.toLowerCase();
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ru`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('Translation API request failed:', response.status);
      return text; // Return original text if translation fails
    }
    
    const data = await response.json();
    const translatedText = data.responseData?.translatedText || text;
    
    // Cache the result
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Translate an array of English definitions to Russian
 * @param {string[]} definitions - Array of English definitions
 * @returns {Promise<string[]>} Array of Russian translations
 */
async function translateDefinitions(definitions) {
  if (!definitions || definitions.length === 0) return [];
  
  try {
    // Translate each definition
    const translations = await Promise.all(
      definitions.slice(0, 5).map(def => translateToRussian(def))
    );
    
    return translations;
  } catch (error) {
    console.error('Error translating definitions:', error);
    return definitions; // Return original definitions on error
  }
}

/**
 * Get translation for a Chinese character or word
 * Returns English translations immediately and Russian translations via callback
 * @param {string} text - Chinese character(s) to translate
 * @param {Function} onRussianReady - Optional callback when Russian translations are ready
 * @returns {Object|null} Translation data with English definitions or null if not found
 */
export async function getTranslation(text, onRussianReady = null) {
  if (!text || text.trim() === '') return null;
  
  try {
    // Load cedict lazily
    const dict = await loadCedict();
    const results = dict.getBySimplified(text, null, { asObject: false, allowVariants: true });
    
    if (!results || results.length === 0) return null;
    
    // Get the first (most common) entry
    const primary = results[0];
    const englishDefs = primary.english || [];
    
    // Return English translations immediately
    const translationData = {
      simplified: primary.simplified,
      traditional: primary.traditional,
      pinyin: primary.pinyin,
      definitions: englishDefs,
      englishDefinitions: englishDefs,
      russianDefinitions: null,
      hasMultipleEntries: results.length > 1,
      allEntries: results,
    };
    
    // Start translating to Russian in the background
    if (onRussianReady) {
      translateDefinitions(englishDefs).then(russianDefs => {
        onRussianReady({
          ...translationData,
          definitions: russianDefs,
          russianDefinitions: russianDefs,
        });
      }).catch(err => {
        console.error('Failed to get Russian translations:', err);
      });
    }
    
    return translationData;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

/**
 * Get extended translation info with all available definitions
 * Returns English translations immediately and Russian translations via callback
 * @param {string} text - Chinese character(s) to translate
 * @param {Function} onRussianReady - Optional callback when Russian translations are ready
 * @returns {Object|null} Extended translation data with English definitions
 */
export async function getExtendedTranslation(text, onRussianReady = null) {
  if (!text || text.trim() === '') return null;
  
  try {
    // Load cedict lazily
    const dict = await loadCedict();
    const results = dict.getBySimplified(text, null, { asObject: false, allowVariants: true });
    
    if (!results || results.length === 0) return null;
    
    // Return English entries immediately
    const englishEntries = results.map(entry => ({
      simplified: entry.simplified,
      traditional: entry.traditional,
      pinyin: entry.pinyin,
      definitions: entry.english || [],
      englishDefinitions: entry.english || [],
      russianDefinitions: null,
    }));
    
    const translationData = {
      simplified: results[0].simplified,
      traditional: results[0].traditional,
      pinyin: results[0].pinyin,
      allDefinitions: englishEntries.flatMap(entry => entry.definitions),
      entries: englishEntries,
      totalEntries: results.length,
    };
    
    // Start translating to Russian in the background
    if (onRussianReady) {
      Promise.all(
        results.map(async (entry) => {
          const englishDefs = entry.english || [];
          const russianDefs = await translateDefinitions(englishDefs);
          
          return {
            simplified: entry.simplified,
            traditional: entry.traditional,
            pinyin: entry.pinyin,
            definitions: russianDefs,
            englishDefinitions: englishDefs,
            russianDefinitions: russianDefs,
          };
        })
      ).then(translatedEntries => {
        onRussianReady({
          simplified: results[0].simplified,
          traditional: results[0].traditional,
          pinyin: results[0].pinyin,
          allDefinitions: translatedEntries.flatMap(entry => entry.definitions),
          entries: translatedEntries,
          totalEntries: results.length,
        });
      }).catch(err => {
        console.error('Failed to get Russian translations:', err);
      });
    }
    
    return translationData;
  } catch (error) {
    console.error('Extended translation error:', error);
    return null;
  }
}
