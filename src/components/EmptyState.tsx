import { motion } from 'motion/react';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface Props {
  onImport: () => void;
}

export function EmptyState({ onImport }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md"
      >
        {/* SVG Illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mb-8 w-48 h-48 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="20" y="30" width="160" height="140" rx="16" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="2"/>
            <rect x="36" y="50" width="128" height="12" rx="4" fill="#DBEAFE"/>
            <rect x="36" y="70" width="80" height="8" rx="3" fill="#BFDBFE"/>
            <rect x="36" y="86" width="100" height="8" rx="3" fill="#BFDBFE"/>
            <rect x="36" y="102" width="60" height="8" rx="3" fill="#BFDBFE"/>
            <rect x="36" y="118" width="90" height="8" rx="3" fill="#BFDBFE"/>
            <rect x="36" y="134" width="70" height="8" rx="3" fill="#BFDBFE"/>
            <circle cx="152" cy="145" r="28" fill="#1E40AF"/>
            <path d="M152 133v24M140 145h24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <rect x="120" y="50" width="44" height="12" rx="4" fill="#93C5FD"/>
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[28px] font-display font-semibold text-[#0a1b33] tracking-tight mb-3"
        >
          Import your DSA Sheet to get started
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-500 text-[15px] leading-relaxed mb-8"
        >
          Upload a CSV with columns: <span className="font-medium text-slate-700">Company, Title, Topic, Difficulty, LeetCode URL, GFG URL, Frequency</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onImport}
            className="flex items-center gap-2 bg-[#0a152d] text-white rounded-full px-6 py-3 text-[14px] font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            href="https://github.com/liquidslr/leetcode-company-wise-problems"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-6 py-3 text-[14px] font-semibold text-slate-700 shadow-sm hover:border-slate-300 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            View Sample
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { label: 'Companies', value: '200+', color: 'text-blue-600' },
            { label: 'Questions', value: '5000+', color: 'text-emerald-600' },
            { label: 'Topics', value: '50+', color: 'text-purple-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-[20px] border border-slate-200/60 p-4 shadow-sm">
              <div className={`text-[22px] font-display font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-[12px] text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
