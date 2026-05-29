import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import type { DSAQuestion, Difficulty } from '../types';

type RawRow = Record<string, string>;

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, '_');
}

function findColumn(row: RawRow, candidates: string[]): string {
  const normalized = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
  );
  for (const c of candidates) {
    if (normalized[c] !== undefined) return normalized[c] ?? '';
  }
  return '';
}

function parseDifficulty(raw: string): Difficulty {
  const lower = raw.toLowerCase().trim();
  if (lower === 'easy') return 'Easy';
  if (lower === 'hard') return 'Hard';
  return 'Medium';
}

export function parseCSV(csvText: string): DSAQuestion[] {
  const result = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const questions: DSAQuestion[] = [];

  for (const row of result.data) {
    const company = findColumn(row, ['company', 'company_name']);
    const title = findColumn(row, ['title', 'question', 'problem']);
    if (!title) continue;

    const topicRaw = findColumn(row, ['topic', 'topics', 'tags', 'category']);
    const topics = topicRaw
      ? topicRaw.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const diffRaw = findColumn(row, ['difficulty', 'level']);
    const difficulty = parseDifficulty(diffRaw);

    const leetcode_url = findColumn(row, ['leetcode_url', 'leetcode url', 'leetcode', 'lc_url', 'link']);
    const gfg_url = findColumn(row, ['gfg_url', 'gfg url', 'gfg', 'geeksforgeeks']);

    const freqRaw = findColumn(row, ['frequency', 'freq', 'frequency_score']);
    const frequency = parseInt(freqRaw, 10) || 0;

    const notes = findColumn(row, ['notes', 'note', 'remarks']);

    questions.push({
      id: uuidv4(),
      company: company || 'Unknown',
      title,
      topic: topics,
      difficulty,
      leetcode_url,
      gfg_url,
      frequency,
      solved: false,
      bookmarked: false,
      notes,
    });
  }

  return questions;
}

export function parseCSVFile(file: File): Promise<DSAQuestion[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const questions = parseCSV(text);
        resolve(questions);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(file);
  });
}

export function getPreviewRows(csvText: string, count = 5): RawRow[] {
  const result = Papa.parse<RawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    preview: count,
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}
