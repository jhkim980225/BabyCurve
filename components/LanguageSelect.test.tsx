import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelect } from './LanguageSelect';
import { LOCALES } from '@/lib/i18n';

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
}));

describe('LanguageSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders all 9 locale native names', () => {
    render(<LanguageSelect />);
    for (const { name } of LOCALES) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('renders buttons for each locale', () => {
    render(<LanguageSelect />);
    expect(screen.getAllByRole('button')).toHaveLength(LOCALES.length);
  });

  it('clicking a locale stores it in localStorage and navigates', async () => {
    render(<LanguageSelect />);
    const btn = screen.getByTestId('locale-btn-es-MX');
    await userEvent.click(btn);
    expect(localStorage.getItem('babycurve.locale')).toBe('es-MX');
    expect(mockReplace).toHaveBeenCalledWith('/es-MX');
  });

  it('clicking English stores "en" and navigates to /en', async () => {
    render(<LanguageSelect />);
    const btn = screen.getByTestId('locale-btn-en');
    await userEvent.click(btn);
    expect(localStorage.getItem('babycurve.locale')).toBe('en');
    expect(mockReplace).toHaveBeenCalledWith('/en');
  });
});
