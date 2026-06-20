import { getDevelopmentInfo } from '@/lib/development';
import { useT } from '@/components/I18nProvider';

interface DevInfoProps {
  week: number;
  locale?: string;
}

export function DevInfo({ week, locale }: DevInfoProps) {
  const t = useT();
  const info = getDevelopmentInfo(week, locale);
  if (!info) return null;

  return (
    <div className="glass-card p-4">
      <h3 className="mb-2 text-sm font-semibold text-blue-900">
        {t('dev.heading', { week: Math.floor(week) })}
      </h3>
      <p className="text-sm text-slate-700">
        {t('dev.sizeComparison', { size: info.sizeComparison })}
      </p>
      <p className="mt-1 text-sm text-slate-600" data-testid="dev-milestone">
        {info.milestone}
      </p>
    </div>
  );
}
