import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { TopicTag } from './TopicTag';
import type { Difficulty, FilterState } from '../types';

interface Props {
  topics: string[];
  companies?: string[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  showCompanyFilter?: boolean;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const statuses = [
  { value: 'all', label: 'All' },
  { value: 'solved', label: 'Solved' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'bookmarked', label: 'Bookmarked' },
] as const;

const sorts = [
  { value: 'frequency', label: 'Frequency ↓' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'title', label: 'Title A-Z' },
] as const;

export function FilterBar({ topics, companies = [], filters, onChange, showCompanyFilter = false }: Props) {
  const [topicOpen, setTopicOpen] = useState(false);

  const toggleDifficulty = (d: Difficulty) => {
    const next = filters.difficulty.includes(d)
      ? filters.difficulty.filter(x => x !== d)
      : [...filters.difficulty, d];
    onChange({ ...filters, difficulty: next });
  };

  const toggleTopic = (t: string) => {
    const next = filters.topics.includes(t)
      ? filters.topics.filter(x => x !== t)
      : [...filters.topics, t];
    onChange({ ...filters, topics: next });
  };

  const activeCount = filters.difficulty.length + filters.topics.length +
    (filters.status !== 'all' ? 1 : 0) + (filters.search ? 1 : 0);

  return (
    <div className="bg-white border border-slate-200/60 rounded-[24px] shadow-sm p-4 flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search questions… (/)"
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Difficulty pills */}
        <div className="flex gap-1.5">
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => toggleDifficulty(d)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all',
                filters.difficulty.includes(d)
                  ? d === 'Easy' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : d === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:border-slate-300'
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Status pills */}
        <div className="flex gap-1.5">
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => onChange({ ...filters, status: s.value as FilterState['status'] })}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all',
                filters.status === s.value
                  ? 'bg-[#0a152d] text-white'
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:border-slate-300'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Sort */}
        <select
          value={filters.sort}
          onChange={e => onChange({ ...filters, sort: e.target.value as FilterState['sort'] })}
          className="px-3 py-1.5 rounded-full text-[12px] font-semibold bg-slate-100 border border-slate-200 text-slate-600 outline-none cursor-pointer hover:border-slate-300 transition-all"
        >
          {sorts.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Topics dropdown */}
        <div className="relative">
          <button
            onClick={() => setTopicOpen(!topicOpen)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all',
              filters.topics.length > 0
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:border-slate-300'
            )}
          >
            Topics {filters.topics.length > 0 && `(${filters.topics.length})`}
            <ChevronDown className={cn('w-3 h-3 transition-transform', topicOpen && 'rotate-180')} />
          </button>

          <AnimatePresence>
            {topicOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 w-72 bg-white rounded-[20px] border border-slate-200 shadow-xl z-30 p-4"
              >
                <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto">
                  {topics.map(t => (
                    <TopicTag
                      key={t}
                      topic={t}
                      active={filters.topics.includes(t)}
                      onClick={() => toggleTopic(t)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear */}
        {activeCount > 0 && (
          <button
            onClick={() => onChange({ difficulty: [], topics: [], status: 'all', companies: [], sort: 'frequency', search: '' })}
            className="text-[12px] text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
