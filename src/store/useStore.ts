import { create } from 'zustand';
import type { DSAQuestion, ProgressMap } from '../types';
import {
  getProgress, setProgress,
  getTheme, setTheme,
} from '../lib/localStorage';
import { buildSearchIndex } from '../lib/search';
import { slugify } from '../lib/utils';
import preloadedQuestions from '../data/questions.json';

interface StoreState {
  questions: DSAQuestion[];
  progressMap: ProgressMap;
  theme: 'light' | 'dark';
  importModalOpen: boolean;
  hasData: boolean;

  // Actions
  loadFromStorage: () => void;
  importQuestions: (rawCsv: string) => void;
  toggleSolved: (id: string) => void;
  toggleBookmark: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
  setThemeMode: (theme: 'light' | 'dark') => void;
  openImportModal: () => void;
  closeImportModal: () => void;

  // Derived helpers
  getCompanyQuestions: (slug: string) => DSAQuestion[];
  getAllTopics: () => string[];
  getAllCompanies: () => string[];
}

export const useStore = create<StoreState>((set, get) => ({
  questions: [],
  progressMap: {},
  theme: 'light',
  importModalOpen: false,
  hasData: true, // Always true now since questions are preloaded!

  loadFromStorage: () => {
    const progress = getProgress();
    const theme = getTheme();

    // Map preloaded questions with their current user progress
    const merged = (preloadedQuestions as any[]).map(q => {
      const prog = progress[q.id] || {};
      return {
        ...q,
        solved: prog.solved || false,
        bookmarked: prog.bookmarked || false,
        notes: prog.notes || '',
        solvedAt: prog.solvedAt,
      };
    });

    buildSearchIndex(merged);
    set({ questions: merged, progressMap: progress, theme, hasData: true });

    // Apply theme to DOM
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  importQuestions: (rawCsv: string) => {
    // Left for backward compatibility if user wants to import additional sheets
    get().loadFromStorage();
  },

  toggleSolved: (id: string) => {
    const { questions, progressMap } = get();
    const q = questions.find(q => q.id === id);
    if (!q) return;
    const nowSolved = !q.solved;
    const existing = progressMap[id] || { solved: false, bookmarked: false, notes: '' };
    const updated: ProgressMap = {
      ...progressMap,
      [id]: { ...existing, solved: nowSolved, solvedAt: nowSolved ? Date.now() : undefined },
    };
    setProgress(updated);
    set({
      progressMap: updated,
      questions: questions.map(question =>
        question.id === id ? { ...question, solved: nowSolved, solvedAt: nowSolved ? Date.now() : undefined } : question
      ),
    });
  },

  toggleBookmark: (id: string) => {
    const { questions, progressMap } = get();
    const q = questions.find(q => q.id === id);
    if (!q) return;
    const nowBookmarked = !q.bookmarked;
    const existing = progressMap[id] || { solved: false, bookmarked: false, notes: '' };
    const updated: ProgressMap = {
      ...progressMap,
      [id]: { ...existing, bookmarked: nowBookmarked },
    };
    setProgress(updated);
    set({
      progressMap: updated,
      questions: questions.map(question =>
        question.id === id ? { ...question, bookmarked: nowBookmarked } : question
      ),
    });
  },

  updateNotes: (id: string, notes: string) => {
    const { questions, progressMap } = get();
    const existing = progressMap[id] || { solved: false, bookmarked: false, notes: '' };
    const updated: ProgressMap = {
      ...progressMap,
      [id]: { ...existing, notes },
    };
    setProgress(updated);
    set({
      progressMap: updated,
      questions: questions.map(q => q.id === id ? { ...q, notes } : q),
    });
  },

  setThemeMode: (theme: 'light' | 'dark') => {
    setTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  openImportModal: () => set({ importModalOpen: true }),
  closeImportModal: () => set({ importModalOpen: false }),

  getCompanyQuestions: (slug: string) => {
    return get().questions.filter(q => slugify(q.company) === slug);
  },

  getAllTopics: () => {
    const topics = new Set<string>();
    get().questions.forEach(q => q.topic.forEach(t => topics.add(t)));
    return Array.from(topics).sort();
  },

  getAllCompanies: () => {
    const companies = new Set<string>();
    get().questions.forEach(q => companies.add(q.company));
    return Array.from(companies).sort();
  },
}));
