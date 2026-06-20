import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { ResultActions } from './ResultActions';

// Mock html-to-image
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,AAAA'),
}));

import { toPng } from 'html-to-image';

// Wrapper that provides a real ref to a div
function WithRef({ fileName, shareTitle }: { fileName?: string; shareTitle?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={ref} data-testid="card-target">card content</div>
      <ResultActions targetRef={ref} fileName={fileName} shareTitle={shareTitle} />
    </div>
  );
}

describe('ResultActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Remove any share-related globals so we start clean
    Object.defineProperty(navigator, 'share', { value: undefined, writable: true, configurable: true });
    Object.defineProperty(navigator, 'canShare', { value: undefined, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the "Save image" button', () => {
    render(<WithRef />);
    expect(screen.getByRole('button', { name: /save image/i })).toBeInTheDocument();
  });

  it('clicking Save image calls toPng with the target element', async () => {
    // Spy on anchor click to avoid actual download
    const anchorClick = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') {
        vi.spyOn(el as HTMLAnchorElement, 'click').mockImplementation(anchorClick);
      }
      return el;
    });

    render(<WithRef fileName="test.png" />);
    await userEvent.click(screen.getByRole('button', { name: /save image/i }));

    expect(toPng).toHaveBeenCalledOnce();
    expect(anchorClick).toHaveBeenCalledOnce();
  });

  it('does not render Share button when navigator.share is undefined', () => {
    render(<WithRef />);
    expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
  });

  it('renders Share button when navigator.share is defined', () => {
    Object.defineProperty(navigator, 'share', {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, 'canShare', {
      value: vi.fn().mockReturnValue(true),
      writable: true,
      configurable: true,
    });
    render(<WithRef shareTitle="My BabyCurve" />);
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });
});
