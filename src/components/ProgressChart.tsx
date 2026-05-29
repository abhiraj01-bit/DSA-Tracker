import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface DonutProps {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
}

const COLORS = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export function DifficultyDonut({ easy, medium, hard }: DonutProps) {
  const data = [
    { name: 'Easy Solved', value: easy.solved, fill: '#22c55e' },
    { name: 'Easy Remaining', value: easy.total - easy.solved, fill: '#dcfce7' },
    { name: 'Medium Solved', value: medium.solved, fill: '#f59e0b' },
    { name: 'Medium Remaining', value: medium.total - medium.solved, fill: '#fef3c7' },
    { name: 'Hard Solved', value: hard.solved, fill: '#ef4444' },
    { name: 'Hard Remaining', value: hard.total - hard.solved, fill: '#fee2e2' },
  ].filter(d => d.value > 0);

  const total = easy.total + medium.total + hard.total;
  const totalSolved = easy.solved + medium.solved + hard.solved;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[28px] font-display font-bold text-[#0a1b33]">{totalSolved}</span>
        <span className="text-[12px] text-slate-400">of {total}</span>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-5 mt-2">
        {[
          { label: 'Easy', color: '#22c55e', solved: easy.solved, total: easy.total },
          { label: 'Medium', color: '#f59e0b', solved: medium.solved, total: medium.total },
          { label: 'Hard', color: '#ef4444', solved: hard.solved, total: hard.total },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-[12px] font-semibold text-slate-600">{item.label}</span>
            </div>
            <span className="text-[12px] text-slate-400">{item.solved}/{item.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CompanyBarProps {
  data: { company: string; pct: number; solved: number; total: number }[];
}

export function CompanyProgressBar({ data }: CompanyBarProps) {
  const top = data.slice(0, 15);

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, top.length * 28)}>
      <BarChart
        data={top}
        layout="vertical"
        margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
        barSize={12}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={v => `${v}%`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="company"
          width={110}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(v: number, _: string, props: { payload?: { solved?: number; total?: number } }) =>
            [`${v.toFixed(1)}% (${props.payload?.solved ?? 0}/${props.payload?.total ?? 0})`, 'Progress']
          }
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Bar dataKey="pct" fill="#3b82f6" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ActivityCalendarProps {
  data: Record<string, number>; // date string → count
}

function getColor(count: number): string {
  if (count === 0) return '#f1f5f9';
  if (count < 2) return '#bfdbfe';
  if (count < 5) return '#60a5fa';
  if (count < 10) return '#2563eb';
  return '#1e3a8a';
}

export function ActivityCalendar({ data }: ActivityCalendarProps) {
  const weeks: { date: string; count: number }[][] = [];
  const today = new Date();

  // Build 52 weeks (364 days)
  for (let w = 51; w >= 0; w--) {
    const week: { date: string; count: number }[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      const key = date.toISOString().split('T')[0];
      week.push({ date: key, count: data[key] || 0 });
    }
    weeks.push(week);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 pb-2 min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(({ date, count }) => (
              <div
                key={date}
                className="cal-cell w-3.5 h-3.5 rounded-[3px]"
                style={{ background: getColor(count) }}
                title={`${date}: ${count} solved`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[11px] text-slate-400">Less</span>
        {[0, 1, 4, 8, 12].map(n => (
          <div key={n} className="w-3.5 h-3.5 rounded-[3px]" style={{ background: getColor(n) }} />
        ))}
        <span className="text-[11px] text-slate-400">More</span>
      </div>
    </div>
  );
}
