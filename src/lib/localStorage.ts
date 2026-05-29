import type { ProgressMap, UserProgress } from '../types';

const RAW_KEY = 'dsa_raw';
const PROGRESS_KEY = 'dsa_progress';
const THEME_KEY = 'dsa_theme';

export function getRawData(): string | null {
  try {
    return localStorage.getItem(RAW_KEY);
  } catch {
    return null;
  }
}

export function setRawData(data: string): void {
  try {
    localStorage.setItem(RAW_KEY, data);
  } catch {
    console.error('LocalStorage write failed');
  }
}

export function getProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setProgress(progress: ProgressMap): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    console.error('LocalStorage write failed');
  }
}

export function updateQuestionProgress(id: string, update: Partial<UserProgress>): ProgressMap {
  const current = getProgress();
  const existing = current[id] || { solved: false, bookmarked: false, notes: '' };
  const updated = { ...existing, ...update };
  const next = { ...current, [id]: updated };
  setProgress(next);
  return next;
}

export function getTheme(): 'light' | 'dark' {
  try {
    return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
  } catch {
    return 'light';
  }
}

export function setTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}
