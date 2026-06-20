import { useT } from '@/components/I18nProvider';

export function Disclaimer() {
  const t = useT();
  return (
    <footer className="mt-4 px-4 pb-4 text-center text-[10px] text-slate-400">
      {t('disclaimer.text')}
    </footer>
  );
}
