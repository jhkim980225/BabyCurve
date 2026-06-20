'use client';

import { toPng } from 'html-to-image';
import { useT } from '@/components/I18nProvider';

interface ResultActionsProps {
  targetRef: React.RefObject<HTMLElement | null>;
  fileName?: string;
  shareTitle?: string;
}

export function ResultActions({ targetRef, fileName = 'babycurve.png', shareTitle = 'BabyCurve' }: ResultActionsProps) {
  const t = useT();
  const hasShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleSave = async () => {
    if (!targetRef.current) return;
    try {
      const dataUrl = await toPng(targetRef.current);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!targetRef.current) return;
    try {
      const dataUrl = await toPng(targetRef.current);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] }) || navigator.share) {
        await navigator.share({ files: [file], title: shareTitle });
      } else {
        // fallback to download
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-2 flex justify-center gap-2">
      <button
        onClick={handleSave}
        className="rounded-xl bg-blue-700 px-3 py-1.5 text-xs text-white"
      >
        {t('actions.saveImage')}
      </button>
      {hasShare && (
        <button
          onClick={handleShare}
          className="rounded-xl bg-blue-700 px-3 py-1.5 text-xs text-white"
        >
          {t('actions.share')}
        </button>
      )}
    </div>
  );
}
