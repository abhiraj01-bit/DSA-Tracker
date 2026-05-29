import { cn } from '../lib/utils';

interface Props {
  topic: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TopicTag({ topic, active, onClick, className }: Props) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all',
        active
          ? 'bg-blue-100 text-blue-700 border border-blue-300'
          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600',
        onClick && 'cursor-pointer',
        !onClick && 'cursor-default',
        className
      )}
      type="button"
    >
      {topic}
    </button>
  );
}
