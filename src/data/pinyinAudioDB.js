const pinyinModules = import.meta.glob('../../pinyin_audio/*.mp3', { eager: true });

const parseEntry = (path, moduleRef) => {
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
    audio: moduleRef.default,
  };
};

const db = Object.entries(pinyinModules)
  .map(([path, moduleRef]) => parseEntry(path, moduleRef))
  .filter(Boolean)
  .sort((a, b) => a.syllable.localeCompare(b.syllable) || a.tone - b.tone);

export const pinyinAudioDB = db;

