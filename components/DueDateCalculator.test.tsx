import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DueDateCalculator } from './DueDateCalculator';

// Fixed reference dates for deterministic tests:
// LMP = 2025-09-19  →  EDD = 2026-06-26 (LMP + 280 days)
// today = 2026-06-20  →  GA = 39w 1d
const FIXED_LMP = '2025-09-19';
const FIXED_TODAY = '2026-06-20';
const EXPECTED_EDD = '2026-06-26';
// diffDays = (2026-06-20) - (2025-09-19) = 274 days  →  39w 1d
const EXPECTED_WEEKS = 39;
const EXPECTED_DAYS = 1;

async function openPanel() {
  await userEvent.click(screen.getByRole('button', { name: /due date & gestational age/i }));
}

describe('DueDateCalculator', () => {
  it('renders collapsed by default (LMP input not visible)', () => {
    render(<DueDateCalculator onApplyGA={vi.fn()} todayISO={FIXED_TODAY} />);
    expect(screen.queryByLabelText(/lmp/i)).not.toBeInTheDocument();
  });

  it('expands when the panel header is clicked', async () => {
    render(<DueDateCalculator onApplyGA={vi.fn()} todayISO={FIXED_TODAY} />);
    await openPanel();
    expect(screen.getByLabelText(/lmp/i)).toBeInTheDocument();
  });

  it('shows EDD and GA after entering LMP and clicking Calculate', async () => {
    render(<DueDateCalculator onApplyGA={vi.fn()} todayISO={FIXED_TODAY} />);
    await openPanel();

    await userEvent.type(screen.getByLabelText(/lmp/i), FIXED_LMP);
    await userEvent.click(screen.getByRole('button', { name: /^calculate$/i }));

    expect(screen.getByText(new RegExp(EXPECTED_EDD))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${EXPECTED_WEEKS}w ${EXPECTED_DAYS}d`)),
    ).toBeInTheDocument();
  });

  it('shows the "Use this gestational age" button after calculating', async () => {
    render(<DueDateCalculator onApplyGA={vi.fn()} todayISO={FIXED_TODAY} />);
    await openPanel();

    await userEvent.type(screen.getByLabelText(/lmp/i), FIXED_LMP);
    await userEvent.click(screen.getByRole('button', { name: /^calculate$/i }));

    expect(screen.getByRole('button', { name: /use this gestational age/i })).toBeInTheDocument();
  });

  it('fires onApplyGA with the correct weeks and days when "Use this" is clicked', async () => {
    const onApplyGA = vi.fn();
    render(<DueDateCalculator onApplyGA={onApplyGA} todayISO={FIXED_TODAY} />);
    await openPanel();

    await userEvent.type(screen.getByLabelText(/lmp/i), FIXED_LMP);
    await userEvent.click(screen.getByRole('button', { name: /^calculate$/i }));
    await userEvent.click(screen.getByRole('button', { name: /use this gestational age/i }));

    expect(onApplyGA).toHaveBeenCalledOnce();
    expect(onApplyGA).toHaveBeenCalledWith({ weeks: EXPECTED_WEEKS, days: EXPECTED_DAYS });
  });

  it('does not show EDD/GA or "Use this" before Calculate is clicked', async () => {
    render(<DueDateCalculator onApplyGA={vi.fn()} todayISO={FIXED_TODAY} />);
    await openPanel();

    expect(screen.queryByText(/estimated due date/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /use this gestational age/i })).not.toBeInTheDocument();
  });
});
