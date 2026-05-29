import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getCompanyLogo } from '../lib/companyDomains';
import { slugify } from '../lib/utils';
import { DifficultyBadge } from './DifficultyBadge';
import type { DSAQuestion } from '../types';

interface Props {
  company: string;
  questions: DSAQuestion[];
  index: number;
}

export function CompanyCard({ company, questions, index }: Props) {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);

  const total = questions.length;
  const solved = questions.filter(q => q.solved).length;
  const easy = questions.filter(q => q.difficulty === 'Easy').length;
  const medium = questions.filter(q => q.difficulty === 'Medium').length;
  const hard = questions.filter(q => q.difficulty === 'Hard').length;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  const logoUrl = getCompanyLogo(company);
  const initials = company.slice(0, 2).toUpperCase();

  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-indigo-100 text-indigo-700',
    'bg-orange-100 text-orange-700',
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.6) }}
      whileHover={{ y: -2 }}
      className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all rounded-[28px] p-6 flex flex-col gap-4 cursor-pointer group"
      onClick={() => navigate(`/company/${slugify(company)}`)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl border border-slate-100 shadow-sm bg-white flex items-center justify-center overflow-hidden">
          {!logoError ? (
            <img
              src={logoUrl}
              alt={company}
              className="w-8 h-8 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className={`text-[13px] font-bold rounded-xl w-full h-full flex items-center justify-center ${color}`}>
              {initials}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-[16px] font-semibold text-[#0a1b33] truncate leading-tight">
            {company}
          </h3>
          <p className="text-[12px] text-slate-400 mt-0.5">{total} questions</p>
        </div>
      </div>

      {/* Difficulty badges */}
      <div className="flex gap-1.5 flex-wrap">
        <DifficultyBadge difficulty="Easy" />
        <span className="text-[11px] text-slate-500 self-center">{easy}</span>
        <DifficultyBadge difficulty="Medium" />
        <span className="text-[11px] text-slate-500 self-center">{medium}</span>
        <DifficultyBadge difficulty="Hard" />
        <span className="text-[11px] text-slate-500 self-center">{hard}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-semibold text-slate-500">Progress</span>
          <span className="text-[11px] font-semibold text-blue-600">{solved}/{total} ({pct}%)</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: 0.2 + index * 0.03, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* CTA */}
      <button
        className="flex items-center gap-1.5 self-start px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-[12px] font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 group-hover:border-blue-200 transition-all"
        onClick={(e) => { e.stopPropagation(); navigate(`/company/${slugify(company)}`); }}
      >
        Practice
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </motion.div>
  );
}
