import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocalePage from '@/app/[locale]/page';
import { I18nProvider } from '@/components/I18nProvider';
import { getMessages } from '@/lib/i18n';

// Mock next/navigation for LanguageSwitcher
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/en',
}));

// Wrap in I18nProvider for locale context
function renderLocale() {
  return render(
    <I18nProvider locale="en" messages={getMessages('en')}>
      <LocalePage params={Promise.resolve({ locale: 'en' })} />
    </I18nProvider>,
  );
}

describe('Calculator page', () => {
  it('shows a result card after entering values and calculating', async () => {
    renderLocale();
    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1525');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/percentile/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /growth chart/i })).toBeInTheDocument();
  });
});

describe('Calculator page — history', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows measurement in history list after saving', async () => {
    renderLocale();

    // Fill form and calculate
    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1525');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    // Should see the history panel with Save button
    expect(screen.getByRole('button', { name: /save to history/i })).toBeInTheDocument();

    // Save the measurement
    await userEvent.click(screen.getByRole('button', { name: /save to history/i }));

    // Measurement should appear in the history list (weeks=30)
    expect(screen.getByText(/30w/)).toBeInTheDocument();
    expect(screen.getByText(/1525/)).toBeInTheDocument();
  });

  it('clears history when Clear all is clicked', async () => {
    renderLocale();

    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1525');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));
    await userEvent.click(screen.getByRole('button', { name: /save to history/i }));

    // Measurement is in the list
    expect(screen.getByText(/1525/)).toBeInTheDocument();

    // Clear it
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));

    // History item is gone
    expect(screen.queryByText(/1525/)).not.toBeInTheDocument();
  });
});
