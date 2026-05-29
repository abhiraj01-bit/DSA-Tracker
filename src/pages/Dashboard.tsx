import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle, Bookmark, Building2, ArrowUpDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { HeroSection } from '../components/HeroSection';
import { CompanyCard } from '../components/CompanyCard';
import { MarqueeScroller } from '../components/MarqueeScroller';
import { slugify } from '../lib/utils';

type SortMode = 'most' | 'least' | 'alpha';

function StatPill({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white border border-slate-200/60 shadow-sm rounded-[20px] px-6 py-4"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <div className="text-[22px] font-display font-bold text-[#0a1b33] leading-none">{value}</div>
        <div className="text-[12px] text-slate-400 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const { questions } = useStore();
  const [sort, setSort] = useState<SortMode>('most');

  const companies = useMemo(() => {
    const map = new Map<string, typeof questions>();
    questions.forEach(q => {
      const key = q.company;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    });
    return Array.from(map.entries()).map(([name, qs]) => ({ name, questions: qs }));
  }, [questions]);

  const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => {
      if (sort === 'most') return b.questions.length - a.questions.length;
      if (sort === 'alpha') return a.name.localeCompare(b.name);
      // least solved
      const aPct = a.questions.filter(q => q.solved).length / a.questions.length;
      const bPct = b.questions.filter(q => q.solved).length / b.questions.length;
      return aPct - bPct;
    });
  }, [companies, sort]);

  const totalSolved = questions.filter(q => q.solved).length;
  const totalBookmarked = questions.filter(q => q.bookmarked).length;
  const uniqueCompanies = companies.length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 pt-10 pb-32 flex flex-col gap-10">
      {/* Premium Hero Section */}
      <HeroSection />

      {/* Performant Logo Marquee */}
      <MarqueeScroller />

      {/* Tracker content starts here */}
      <div className="flex flex-col gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-2"
        >
          <h2 className="text-[28px] font-display font-semibold text-[#0a1b33]">
            DSA Progress Dashboard
          </h2>
          <p className="text-slate-400 text-[14px]">
            Fully integrated database of LeetCode questions by top tech companies.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: 'Total Questions', value: questions.length, color: 'bg-blue-50 text-blue-600' },
            { icon: CheckCircle, label: 'Solved', value: totalSolved, color: 'bg-emerald-50 text-emerald-600' },
            { icon: Bookmark, label: 'Bookmarked', value: totalBookmarked, color: 'bg-amber-50 text-amber-600' },
            { icon: Building2, label: 'Companies', value: uniqueCompanies, color: 'bg-violet-50 text-violet-600' },
          ].map((s, i) => (
            <motion.div key={s.label} transition={{ delay: i * 0.08 }}>
              <StatPill {...s} />
            </motion.div>
          ))}
        </div>

        {/* Sorting Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <h3 className="text-[18px] font-display font-semibold text-[#0a1b33]">
            {sortedCompanies.length} Tech Companies
          </h3>
          <div className="flex items-center gap-2 self-start">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            {(['most', 'least', 'alpha'] as SortMode[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                  sort === s
                    ? 'bg-[#0a152d] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {s === 'most' ? 'Most Questions' : s === 'least' ? 'Least Solved' : 'Alphabetical'}
              </button>
            ))}
          </div>
        </div>

        {/* Company Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedCompanies.slice(0, 48).map(({ name, questions: qs }, i) => (
            <CompanyCard key={slugify(name)} company={name} questions={qs} index={i} />
          ))}
        </div>

        {sortedCompanies.length > 48 && (
          <div className="text-center py-6 text-[13px] text-slate-400 font-semibold bg-slate-50 rounded-2xl border border-slate-100">
            Showing top 48 companies. Search or check the Explore tab for all {sortedCompanies.length} companies.
          </div>
        )}
      </div>
    </div>
  );
}
