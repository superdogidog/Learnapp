const pinyinModules = import.meta.glob('../../pinyin_audio/*.mp3', { eager: false, import: 'default' });

const parseEntry = (path, importFn) => {
  const segments = path.split('/');
  const file = segments[segments.length - 1]?.replace('.mp3', '');
  if (!file) return null;
  const tone = Number(file.at(-1));
  const syllable = file.slice(0, -1);
  if (!syllable || Number.isNaN(tone)) return null;
  return {
    key: `${syllable}${tone}`,
    syllable,
    tone,
    importAudio: importFn,
    audio: null, // Will be loaded lazily
  };
};

const db = Object.entries(pinyinModules)
  .map(([path, importFn]) => parseEntry(path, importFn))
  .filter(Boolean)
  .sort((a, b) => a.syllable.localeCompare(b.syllable) || a.tone - b.tone);

// Helper function to load audio URL lazily
export const loadAudio = async (entry) => {
  if (!entry.audio && entry.importAudio) {
    entry.audio = await entry.importAudio();
  }
  return entry.audio;
};

export const pinyinAudioDB = db;

