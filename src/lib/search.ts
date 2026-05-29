import Fuse, { IFuseOptions } from 'fuse.js';
import type { DSAQuestion } from '../types';

let fuseInstance: Fuse<DSAQuestion> | null = null;

const fuseOptions: IFuseOptions<DSAQuestion> = {
  keys: [
    { name: 'title', weight: 0.6 },
    { name: 'topic', weight: 0.3 },
    { name: 'company', weight: 0.1 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
};

export function buildSearchIndex(questions: DSAQuestion[]): void {
  fuseInstance = new Fuse(questions, fuseOptions);
}

export function fuzzySearch(query: string, questions: DSAQuestion[]): DSAQuestion[] {
  if (!query.trim()) return questions;
  if (!fuseInstance) {
    fuseInstance = new Fuse(questions, fuseOptions);
  }
  return fuseInstance.search(query).map(r => r.item);
}

export function searchInList(query: string, questions: DSAQuestion[]): DSAQuestion[] {
  if (!query.trim()) return questions;
  const fuse = new Fuse(questions, fuseOptions);
  return fuse.search(query).map(r => r.item);
}
