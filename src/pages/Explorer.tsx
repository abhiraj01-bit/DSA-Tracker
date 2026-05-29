import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, List } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FilterBar } from '../components/FilterBar';
import { QuestionTable } from '../components/QuestionTable';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { TopicTag } from '../components/TopicTag';
import { EmptyState } from '../components/EmptyState';
import { searchInList } from '../lib/search';
import { getCompanyLogo } from '../lib/companyDomains';
import { slugify } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { DSAQuestion, FilterState } from '../types';

const defaultFilters: FilterState = {
  difficulty: [], topics: [], status: 'all', companies: [], sort: 'frequency', search: '',
};

const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };

function QuestionCard({ q }: { q: DSAQuestion }) {
  const { toggleSolved, toggleBookmark } = useStore();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-white border border-slate-200/60 shadow-sm rounded-[20px] p-5 flex flex-col gap-3 hover:border-slate-300 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[14px] font-semibold text-[#0a1b33] leading-snug flex-1">{q.title}</h3>
        <DifficultyBadge difficulty={q.difficulty} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {q.company}
        </span>
        {q.topic.slice(0, 2).map(t => <TopicTag key={t} topic={t} />)}
        {q.topic.length > 2 && <span className="text-[11px] text-slate-400">+{q.topic.length - 2}</span>}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {q.leetcode_url && (
            <a href={q.leetcode_url} target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-semibold text-orange-500 hover:text-orange-600">LC ↗</a>
          )}
          {q.gfg_url && (
            <a href={q.gfg_url} target="_blank" rel="noopener noreferrer"
              className="text-[11px] font-semibold text-green-600 hover:text-green-700">GFG ↗</a>
          )}
          <span className="text-[11px] text-slate-300">freq: {q.frequency}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { toggleSolved(q.id); if (!q.solved) toast.success('Marked solved!', { duration: 1500 }); }}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-[10px] transition-all ${
              q.solved ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'
            }`}
          >
            {q.solved ? '✓' : ''}
          </button>
          <button
            onClick={() => { toggleBookmark(q.id); if (!q.bookmarked) toast.success('Bookmarked!', { duration: 1500 }); }}
            className={q.bookmarked ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}
          >
            ★
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function Explorer() {
  const { questions, hasData, openImportModal, getAllTopics, getAllCompanies } = useStore();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sidebarCompanies, setSidebarCompanies] = useState<string[]>([]);

  const topics = getAllTopics();
  const companies = getAllCompanies();

  const filtered = useMemo(() => {
    let qs: DSAQuestion[] = [...questions];

    if (filters.search) qs = searchInList(filters.search, qs);
    if (filters.difficulty.length) qs = qs.filter(q => filters.difficulty.includes(q.difficulty));
    if (filters.topics.length) qs = qs.filter(q => filters.topics.some(t => q.topic.includes(t)));
    if (filters.status === 'solved') qs = qs.filter(q => q.solved);
    if (filters.status === 'unsolved') qs = qs.filter(q => !q.solved);
    if (filters.status === 'bookmarked') qs = qs.filter(q => q.bookmarked);
    if (sidebarCompanies.length) qs = qs.filter(q => sidebarCompanies.includes(q.company));

    qs.sort((a, b) => {
      if (filters.sort === 'frequency') return b.frequency - a.frequency;
      if (filters.sort === 'difficulty') return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      return a.title.localeCompare(b.title);
    });

    return qs;
  }, [questions, filters, sidebarCompanies]);

  const toggleCompany = (c: string) =>
    setSidebarCompanies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  if (!hasData) return <EmptyState onImport={openImportModal} />;

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-32 flex gap-6">
      {/* Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-72 flex-shrink-0 hidden lg:block"
      >
        <div className="sticky top-8 bg-white border border-slate-200/60 rounded-[28px] shadow-sm p-5 flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          <h3 className="text-[14px] font-display font-semibold text-[#0a1b33]">Filter by Company</h3>

          <div className="flex flex-col gap-1.5">
            {companies.slice(0, 40).map(c => (
              <button
                key={c}
                onClick={() => toggleCompany(c)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all text-left ${
                  sidebarCompanies.includes(c)
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <img
                  src={getCompanyLogo(c)}
                  alt={c}
                  className="w-4 h-4 object-contain flex-shrink-0"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="truncate">{c}</span>
                <span className="ml-auto text-slate-300 text-[11px]">
                  {questions.filter(q => q.company === c).length}
                </span>
              </button>
            ))}
          </div>

          {sidebarCompanies.length > 0 && (
            <button
              onClick={() => setSidebarCompanies([])}
              className="text-[12px] text-slate-400 hover:text-slate-600 underline text-left"
            >
              Clear companies
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-[28px] font-display font-bold text-[#0a1b33]">Question Explorer</h1>
          <p className="text-slate-400 text-[14px] mt-1">Browse, filter, and solve questions across all companies</p>
        </motion.div>

        {/* Filter bar */}
        <div className="mb-4">
          <FilterBar topics={topics} filters={filters} onChange={setFilters} />
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] text-slate-400">
            Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of {questions.length} questions
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-200 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {viewMode === 'card' ? (
            <motion.div
              key="card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {filtered.slice(0, 200).map(q => (
                <QuestionCard key={q.id} q={q} />
              ))}
              {filtered.length > 200 && (
                <div className="col-span-2 text-center text-[13px] text-slate-400 py-4">
                  Showing first 200 results. Refine filters to see more.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden"
            >
              <QuestionTable questions={filtered} showCompany />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
