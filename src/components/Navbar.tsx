import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Code2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function Navbar() {
  const navigate = useNavigate();
  const { theme, setThemeMode, openImportModal } = useStore();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white/90 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-slate-200/40 select-none"
    >
      {/* Circular Logo */}
      <button
        onClick={() => navigate('/')}
        className="w-9 h-9 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center text-blue-600 hover:scale-105 transition-transform cursor-pointer"
        title="Dashboard"
      >
        <Code2 className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* Nav Text Links */}
      <div className="flex items-center gap-4 px-4">
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            cn(
              'text-[12px] font-semibold transition-colors cursor-pointer',
              isActive ? 'text-[#0a1b33]' : 'text-slate-500 hover:text-[#0a1b33]'
            )
          }
        >
          Explore
        </NavLink>
        <NavLink
          to="/progress"
          className={({ isActive }) =>
            cn(
              'text-[12px] font-semibold transition-colors cursor-pointer',
              isActive ? 'text-[#0a1b33]' : 'text-slate-500 hover:text-[#0a1b33]'
            )
          }
        >
          Progress
        </NavLink>
      </div>

      {/* Import CTA */}
      <button
        onClick={openImportModal}
        className="flex items-center gap-1 bg-white px-5 py-2 rounded-full text-[12px] font-semibold text-[#0a1b33] border border-slate-200/60 shadow-sm hover:border-slate-300 transition-all cursor-pointer"
      >
        Import Data
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
      </button>
    </motion.nav>
  );
}
