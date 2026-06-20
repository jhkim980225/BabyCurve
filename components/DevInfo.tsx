import { getDevelopmentInfo } from '@/lib/development';

interface DevInfoProps {
  week: number;
  locale?: string;
}

export function DevInfo({ week, locale }: DevInfoProps) {
  const info = getDevelopmentInfo(week, locale);
  if (!info) return null;

  return (
    <div className="glass-card p-4">
      <h3 className="mb-2 text-sm font-semibold text-blue-900">
        Week {Math.floor(week)} — Development
      </h3>
      <p className="text-sm text-slate-700">
        Your baby is about the size of {info.sizeComparison}.
      </p>
      <p className="mt-1 text-sm text-slate-600" data-testid="dev-milestone">
        {info.milestone}
      </p>
    </div>
  );
}
