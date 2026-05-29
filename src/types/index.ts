export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DSAQuestion {
  id: string;
  company: string;
  title: string;
  topic: string[];
  difficulty: Difficulty;
  leetcode_url: string;
  gfg_url: string;
  frequency: number;
  solved: boolean;
  bookmarked: boolean;
  notes: string;
  solvedAt?: number; // timestamp ms
}

export interface Company {
  name: string;
  slug: string;
  domain: string;
  questions: DSAQuestion[];
  totalSolved: number;
  totalBookmarked: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface UserProgress {
  solved: boolean;
  bookmarked: boolean;
  notes: string;
  solvedAt?: number;
}

export type ProgressMap = Record<string, UserProgress>;

export interface FilterState {
  difficulty: Difficulty[];
  topics: string[];
  status: 'all' | 'solved' | 'unsolved' | 'bookmarked';
  companies: string[];
  sort: 'frequency' | 'difficulty' | 'title';
  search: string;
}
