import { cn } from '../lib/utils';
import type { Difficulty } from '../types';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
  className?: string;
}

const styles: Record<Difficulty, string> = {
  Easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  Hard: 'bg-red-50 text-red-700 border border-red-200',
};

export function DifficultyBadge({ difficulty, size = 'sm', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-[13px]',
        styles[difficulty],
        className
      )}
    >
      {difficulty}
    </span>
  );
}
