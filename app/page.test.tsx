import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './page';

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
}));

// Mock LanguageSelect so we can detect it without rendering real router-dependant children
vi.mock('@/components/LanguageSelect', () => ({
  LanguageSelect: () => <div data-testid="language-select">Language Select</div>,
}));

describe('Root page — first-entry language selector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows the language selector when localStorage has no preference', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByTestId('language-select')).toBeInTheDocument();
    });
  });

  it('redirects to stored locale when localStorage has a preference', async () => {
    localStorage.setItem('babycurve.locale', 'ja');
    render(<Home />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/ja');
    });
    // Selector should NOT be shown during/after redirect
    expect(screen.queryByTestId('language-select')).not.toBeInTheDocument();
  });

  it('redirects to "en" if stored locale is "en"', async () => {
    localStorage.setItem('babycurve.locale', 'en');
    render(<Home />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/en');
    });
  });

  it('shows selector (not redirect) if stored value is an invalid locale', async () => {
    localStorage.setItem('babycurve.locale', 'fr-invalid');
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByTestId('language-select')).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
