import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Bookmark, BookmarkCheck, ExternalLink, Pencil, Check, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DifficultyBadge } from './DifficultyBadge';
import { TopicTag } from './TopicTag';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import type { DSAQuestion } from '../types';

interface Props {
  questions: DSAQuestion[];
  showCompany?: boolean;
}

function FrequencyBar({ value }: { value: number }) {
  const max = 100;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-slate-400">{value}</span>
    </div>
  );
}

function NoteCell({ question }: { question: DSAQuestion }) {
  const { updateNotes } = useStore();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(question.notes || '');

  const save = () => {
    updateNotes(question.id, val);
    setEditing(false);
  };

  return (
    <div>
      {editing ? (
        <div className="flex items-start gap-1">
          <textarea
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={save}
            className="text-[12px] border border-blue-300 rounded-lg p-1.5 resize-none w-36 h-16 outline-none focus:ring-1 focus:ring-blue-300"
            placeholder="Add note…"
          />
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
          title="Edit note"
        >
          <Pencil className="w-3.5 h-3.5" />
          {val ? (
            <span className="text-[11px] text-slate-500 max-w-[80px] truncate">{val}</span>
          ) : (
            <span className="text-[11px] text-slate-300">Note</span>
          )}
        </button>
      )}
    </div>
  );
}

function QuestionRow({ question, index, showCompany }: { question: DSAQuestion; index: number; showCompany?: boolean }) {
  const { toggleSolved, toggleBookmark } = useStore();

  const handleSolve = () => {
    toggleSolved(question.id);
    if (!question.solved) {
      toast.success(`✓ Marked "${question.title}" as solved!`, { duration: 2000 });
    }
  };

  const handleBookmark = () => {
    toggleBookmark(question.id);
    if (!question.bookmarked) {
      toast.success(`🔖 Bookmarked "${question.title}"`, { duration: 2000 });
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.4) }}
      className={cn(
        'border-b border-slate-100 hover:bg-slate-50/50 transition-colors group',
        question.solved && 'bg-emerald-50/40'
      )}
    >
      {/* Index */}
      <td className="px-4 py-3 text-[12px] text-slate-400 w-10">{index + 1}</td>

      {/* Title */}
      <td className="px-4 py-3 max-w-[220px]">
        <div className="flex flex-col gap-0.5">
          <span className={cn(
            'text-[13px] font-semibold text-[#0a1b33] leading-tight',
            question.solved && 'line-through text-slate-400'
          )}>
            {question.title}
          </span>
          {showCompany && (
            <span className="text-[11px] text-slate-400">{question.company}</span>
          )}
        </div>
      </td>

      {/* Difficulty */}
      <td className="px-4 py-3">
        <DifficultyBadge difficulty={question.difficulty} />
      </td>

      {/* Topics */}
      <td className="px-4 py-3 max-w-[180px]">
        <div className="flex flex-wrap gap-1">
          {question.topic.slice(0, 3).map(t => (
            <TopicTag key={t} topic={t} />
          ))}
          {question.topic.length > 3 && (
            <span className="text-[11px] text-slate-400">+{question.topic.length - 3}</span>
          )}
        </div>
      </td>

      {/* Frequency */}
      <td className="px-4 py-3">
        <FrequencyBar value={question.frequency} />
      </td>

      {/* Links */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {question.leetcode_url && (
            <a
              href={question.leetcode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              title="LeetCode"
            >
              LC <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {question.gfg_url && (
            <a
              href={question.gfg_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] font-semibold text-green-600 hover:text-green-700 transition-colors"
              title="GFG"
            >
              GFG <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </td>

      {/* Solved checkbox */}
      <td className="px-4 py-3">
        <button
          onClick={handleSolve}
          className={cn(
            'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
            question.solved
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
          )}
        >
          {question.solved ? <Check className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3 text-slate-300" />}
        </button>
      </td>

      {/* Bookmark */}
      <td className="px-4 py-3">
        <button
          onClick={handleBookmark}
          className={cn(
            'transition-all',
            question.bookmarked ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'
          )}
        >
          {question.bookmarked
            ? <BookmarkCheck className="w-4 h-4" />
            : <Bookmark className="w-4 h-4" />}
        </button>
      </td>

      {/* Notes */}
      <td className="px-4 py-3">
        <NoteCell question={question} />
      </td>
    </motion.tr>
  );
}

export function QuestionTable({ questions, showCompany = false }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = questions.length > 200;

  const rowVirtualizer = useVirtualizer({
    count: questions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    enabled: useVirtual,
  });

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-[15px] font-semibold text-slate-500">No questions match your filters</p>
        <p className="text-[13px] mt-1">Try adjusting the filters or search query</p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', useVirtual && 'max-h-[600px]')}
    >
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            {['#', 'Title', 'Difficulty', 'Topics', 'Frequency', 'Links', 'Solved', '★', 'Notes'].map(h => (
              <th key={h} className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {useVirtual ? (
            <>
              <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px` }} />
              {rowVirtualizer.getVirtualItems().map(vRow => (
                <QuestionRow
                  key={questions[vRow.index].id}
                  question={questions[vRow.index]}
                  index={vRow.index}
                  showCompany={showCompany}
                />
              ))}
              <tr style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end ?? 0)}px` }} />
            </>
          ) : (
            questions.map((q, i) => (
              <QuestionRow key={q.id} question={q} index={i} showCompany={showCompany} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
