import { pinyin } from 'pinyin-pro';
import { pinyinAudioDB } from '../data/pinyinAudioDB';

const audioMap = pinyinAudioDB.reduce((acc, entry) => {
  acc.set(`${entry.syllable}${entry.tone}`, entry.audio);
  return acc;
}, new Map());

const vowelBase = ['a', 'e', 'i', 'o', 'u', 'ü'];
const toneMap = {
  1: ['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ'],
  2: ['á', 'é', 'í', 'ó', 'ú', 'ǘ'],
  3: ['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ'],
  4: ['à', 'è', 'ì', 'ò', 'ù', 'ǜ'],
};

export const applyToneMark = (syllable, tone) => {
  if (!tone || tone === 5 || !syllable) return syllable;
  const preferredIndex = syllable.search(/[aeo]/);
  const idx = preferredIndex >= 0 ? preferredIndex : syllable.search(/[iu]/);
  if (idx < 0) return syllable;
  const vowel = syllable[idx] === 'v' ? 'ü' : syllable[idx];
  const baseIdx = vowelBase.indexOf(vowel);
  if (baseIdx < 0) return syllable;
  const mark = toneMap[tone][baseIdx];
  return syllable.slice(0, idx) + mark + syllable.slice(idx + 1);
};

const normalizePlain = (value) => value.replace('v', 'ü');

const splitSyllable = (code) => {
  if (!code) return null;
  const toneMatch = code.match(/^(.*?)([0-5])$/i);
  const plain = toneMatch ? toneMatch[1].toLowerCase() : code.toLowerCase();
  const rawTone = toneMatch ? Number(toneMatch[2]) : 5;
  const tone = rawTone === 0 ? 5 : rawTone;
  const normalized = normalizePlain(plain);
  return {
    code: `${plain}${tone}`,
    plain,
    normalized,
    tone,
    display: applyToneMark(normalized, tone),
    audio: audioMap.get(`${plain}${tone}`),
  };
};

export const getPinyinForChars = (items) => {
  const words = Array.isArray(items) ? items : [];
  const result = [];
  for (const word of words) {
    if (!word) continue;
    const trimmed = word.trim();
    if (!trimmed) continue;
    const syllableCodes = pinyin(trimmed, { toneType: 'num', type: 'array', nonZh: 'spaced' });
    if (!Array.isArray(syllableCodes) || !syllableCodes.length) continue;
    const syllables = syllableCodes
      .map((code) => splitSyllable(code))
      .filter(Boolean);
    if (!syllables.length) continue;
    result.push({
      id: `${trimmed}-${syllables.map((s) => s.code).join('')}`,
      text: trimmed,
      syllables,
      display: syllables.map((s) => s.display).join(' '),
    });
  }
  return result;
};

export const getAudioByPinyin = (pinyinCode) => audioMap.get(pinyinCode);
