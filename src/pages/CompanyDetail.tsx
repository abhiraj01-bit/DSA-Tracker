import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import { FilterBar } from '../components/FilterBar';
import { QuestionTable } from '../components/QuestionTable';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { searchInList } from '../lib/search';
import { getCompanyLogo, getCompanyDomain } from '../lib/companyDomains';
import { slugify } from '../lib/utils';
import type { DSAQuestion, FilterState } from '../types';

const defaultFilters: FilterState = {
  difficulty: [], topics: [], status: 'all', companies: [], sort: 'frequency', search: '',
};

const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };

export function CompanyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { questions } = useStore();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [logoError, setLogoError] = useState(false);

  const companyQuestions = useMemo(
    () => questions.filter(q => slugify(q.company) === slug),
    [questions, slug]
  );

  const companyName = companyQuestions[0]?.company ?? slug ?? '';
  const domain = getCompanyDomain(companyName);
  const topics = useMemo(() => {
    const s = new Set<string>();
    companyQuestions.forEach(q => q.topic.forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [companyQuestions]);

  const filtered = useMemo(() => {
    let qs: DSAQuestion[] = [...companyQuestions];

    if (filters.search) qs = searchInList(filters.search, qs);
    if (filters.difficulty.length) qs = qs.filter(q => filters.difficulty.includes(q.difficulty));
    if (filters.topics.length) qs = qs.filter(q => filters.topics.some(t => q.topic.includes(t)));
    if (filters.status === 'solved') qs = qs.filter(q => q.solved);
    if (filters.status === 'unsolved') qs = qs.filter(q => !q.solved);
    if (filters.status === 'bookmarked') qs = qs.filter(q => q.bookmarked);

    qs.sort((a, b) => {
      if (filters.sort === 'frequency') return b.frequency - a.frequency;
      if (filters.sort === 'difficulty') return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      return a.title.localeCompare(b.title);
    });

    return qs;
  }, [companyQuestions, filters]);

  const total = companyQuestions.length;
  const solved = companyQuestions.filter(q => q.solved).length;
  const bookmarked = companyQuestions.filter(q => q.bookmarked).length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  if (total === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-32 text-center">
        <p className="text-slate-500">No questions found for this company.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-32">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </motion.button>

      {/* Company header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-slate-200/60 rounded-[32px] shadow-sm p-8 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl border border-slate-100 shadow bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
            {!logoError ? (
              <img
                src={getCompanyLogo(companyName)}
                alt={companyName}
                className="w-10 h-10 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-[18px] font-bold text-blue-600">
                {companyName.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[36px] font-display font-bold text-[#0a1b33] tracking-tight leading-none">
                {companyName}
              </h1>
              <a
                href={`https://${domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
              >
                {domain} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-4">
              {[
                { label: 'Total', value: total },
                { label: 'Solved', value: solved },
                { label: 'Bookmarked', value: bookmarked },
                { label: 'Completion', value: `${pct}%` },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-[20px] font-display font-bold text-[#0a1b33]">{s.value}</div>
                  <div className="text-[11px] text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Full-width progress bar */}
            <div className="mt-4 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>

            {/* Difficulty summary */}
            <div className="flex gap-2 mt-3">
              {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                <div key={d} className="flex items-center gap-1.5">
                  <DifficultyBadge difficulty={d} />
                  <span className="text-[12px] text-slate-400">
                    {companyQuestions.filter(q => q.difficulty === d).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <FilterBar topics={topics} filters={filters} onChange={setFilters} />
      </motion.div>

      {/* Result count */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[13px] text-slate-400">
          Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of {total} questions
        </span>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-slate-200/60 rounded-[24px] shadow-sm overflow-hidden"
      >
        <QuestionTable questions={filtered} />
      </motion.div>
    </div>
  );
}
