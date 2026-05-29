import { useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Bookmark, Percent, Flame, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EmptyState } from '../components/EmptyState';
import { DifficultyDonut, CompanyProgressBar, ActivityCalendar } from '../components/ProgressChart';

import { slugify } from '../lib/utils';

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/60 shadow-sm rounded-[20px] px-6 py-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[26px] font-display font-bold text-[#0a1b33] leading-none">{value}</div>
        <div className="text-[12px] text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-slate-300 mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

function SectionCard({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white border border-slate-200/60 shadow-sm rounded-[28px] p-6"
    >
      <h2 className="text-[16px] font-display font-semibold text-[#0a1b33] mb-5">{title}</h2>
      {children}
    </motion.div>
  );
}

export function Progress() {
  const { questions, hasData, openImportModal } = useStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const solved = questions.filter(q => q.solved);
    const bookmarked = questions.filter(q => q.bookmarked);
    const pct = questions.length > 0 ? Math.round((solved.length / questions.length) * 100) : 0;

    // Streak: consecutive days solved
    const daySet = new Set<string>();
    solved.forEach(q => {
      if (q.solvedAt) {
        daySet.add(new Date(q.solvedAt).toISOString().split('T')[0]);
      }
    });
    const sortedDays = Array.from(daySet).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < sortedDays.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      if (sortedDays[i] === expected.toISOString().split('T')[0]) streak++;
      else break;
    }

    return { solved: solved.length, bookmarked: bookmarked.length, pct, streak };
  }, [questions]);

  const difficulty = useMemo(() => {
    const qs = (d: 'Easy' | 'Medium' | 'Hard') => questions.filter(q => q.difficulty === d);
    return {
      easy: { total: qs('Easy').length, solved: qs('Easy').filter(q => q.solved).length },
      medium: { total: qs('Medium').length, solved: qs('Medium').filter(q => q.solved).length },
      hard: { total: qs('Hard').length, solved: qs('Hard').filter(q => q.solved).length },
    };
  }, [questions]);

  const companyProgress = useMemo(() => {
    const map = new Map<string, { solved: number; total: number }>();
    questions.forEach(q => {
      if (!map.has(q.company)) map.set(q.company, { solved: 0, total: 0 });
      const s = map.get(q.company)!;
      s.total++;
      if (q.solved) s.solved++;
    });
    return Array.from(map.entries())
      .map(([company, { solved, total }]) => ({
        company,
        solved,
        total,
        pct: total > 0 ? Math.round((solved / total) * 100) : 0,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [questions]);

  const topicStats = useMemo(() => {
    const map = new Map<string, { solved: number; total: number }>();
    questions.forEach(q => {
      q.topic.forEach(t => {
        if (!map.has(t)) map.set(t, { solved: 0, total: 0 });
        const s = map.get(t)!;
        s.total++;
        if (q.solved) s.solved++;
      });
    });
    return Array.from(map.entries())
      .map(([topic, { solved, total }]) => ({
        topic,
        solved,
        total,
        pct: total > 0 ? Math.round((solved / total) * 100) : 0,
      }))
      .sort((a, b) => a.pct - b.pct);
  }, [questions]);



  const activityData = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach(q => {
      if (q.solved && q.solvedAt) {
        const day = new Date(q.solvedAt).toISOString().split('T')[0];
        map[day] = (map[day] || 0) + 1;
      }
    });
    return map;
  }, [questions]);

  const weakTopics = topicStats.filter(t => t.pct < 40 && t.total >= 3);

  if (!hasData) return <EmptyState onImport={openImportModal} />;

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-32">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-[36px] font-display font-bold text-[#0a1b33] tracking-tight">Progress Tracker</h1>
        <p className="text-slate-400 text-[15px] mt-1">Your DSA journey at a glance</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: CheckCircle2, label: 'Total Solved', value: stats.solved, color: 'bg-emerald-50 text-emerald-600' },
          { icon: Bookmark, label: 'Bookmarked', value: stats.bookmarked, color: 'bg-amber-50 text-amber-600' },
          { icon: Percent, label: 'Completion', value: `${stats.pct}%`, color: 'bg-blue-50 text-blue-600' },
          { icon: Flame, label: 'Day Streak', value: stats.streak, color: 'bg-rose-50 text-rose-500', sub: 'consecutive days' },
        ].map((s, i) => (
          <motion.div key={s.label} transition={{ delay: i * 0.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Donut */}
        <SectionCard title="Difficulty Breakdown" delay={0.1}>
          {difficulty.easy.total + difficulty.medium.total + difficulty.hard.total > 0 ? (
            <DifficultyDonut {...difficulty} />
          ) : (
            <p className="text-slate-400 text-[13px]">No data yet</p>
          )}
        </SectionCard>

        {/* Topic heatmap */}
        <SectionCard title="Topic Solve Rate" delay={0.2}>
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            {topicStats.map(({ topic, pct, solved, total }) => (
              <div
                key={topic}
                title={`${solved}/${total} solved`}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold border cursor-default transition-all ${pct >= 70
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : pct >= 40
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
              >
                {topic}
                <span className="ml-1.5 opacity-60 font-normal">{pct}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Company progress */}
      <SectionCard title="Company Progress" delay={0.3}>
        <CompanyProgressBar data={companyProgress} />
      </SectionCard>

      {/* Activity Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-slate-200/60 shadow-sm rounded-[28px] p-6 mt-5"
      >
        <h2 className="text-[16px] font-display font-semibold text-[#0a1b33] mb-5">Activity Calendar</h2>
        <ActivityCalendar data={activityData} />
      </motion.div>

      {/* Weak areas */}
      {weakTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-red-100 shadow-sm rounded-[28px] p-6 mt-5"
        >
          <h2 className="text-[16px] font-display font-semibold text-[#0a1b33] mb-1">Weak Areas</h2>
          <p className="text-[13px] text-slate-400 mb-5">Topics with less than 40% solve rate (min 3 questions)</p>
          <div className="flex flex-col gap-3">
            {weakTopics.slice(0, 8).map(({ topic, pct, solved, total }) => (
              <div key={topic} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[13px] font-semibold text-slate-700">{topic}</span>
                    <span className="text-[12px] text-red-500 font-semibold">{pct}% ({solved}/{total})</span>
                  </div>
                  <div className="h-1.5 bg-red-50 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/explore`)}
                  className="flex items-center gap-1 text-[12px] text-blue-600 font-semibold hover:text-blue-700 flex-shrink-0"
                >
                  Practice <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
