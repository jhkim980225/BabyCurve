import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryPanel } from './HistoryPanel';
import type { Measurement } from '@/lib/storage';

const makeMeasurement = (overrides: Partial<Measurement> = {}): Measurement => ({
  id: 'test-id-1',
  standardId: 'who',
  metricId: 'efw',
  weeks: 30,
  days: 0,
  value: 1500,
  percentile: 45,
  ts: 1718000000000,
  ...overrides,
});

describe('HistoryPanel', () => {
  it('renders a Save to history button', () => {
    render(<HistoryPanel measurements={[]} onSave={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByRole('button', { name: /save to history/i })).toBeInTheDocument();
  });

  it('calls onSave when Save button is clicked', async () => {
    const onSave = vi.fn();
    render(<HistoryPanel measurements={[]} onSave={onSave} onClear={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /save to history/i }));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('renders each measurement in the list', () => {
    const m1 = makeMeasurement({ weeks: 30, days: 0, value: 1500, percentile: 45 });
    const m2 = makeMeasurement({ id: 'test-id-2', weeks: 28, days: 2, value: 1100, percentile: 30 });
    render(<HistoryPanel measurements={[m1, m2]} onSave={vi.fn()} onClear={vi.fn()} />);
    // Each measurement shows week + value + percentile
    expect(screen.getByText(/30w/)).toBeInTheDocument();
    expect(screen.getByText(/28w/)).toBeInTheDocument();
    expect(screen.getByText(/1500/)).toBeInTheDocument();
    expect(screen.getByText(/1100/)).toBeInTheDocument();
  });

  it('renders a Clear all button when measurements exist', () => {
    const m = makeMeasurement();
    render(<HistoryPanel measurements={[m]} onSave={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('does not render Clear all button when measurements is empty', () => {
    render(<HistoryPanel measurements={[]} onSave={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
  });

  it('calls onClear when Clear all button is clicked', async () => {
    const onClear = vi.fn();
    const m = makeMeasurement();
    render(<HistoryPanel measurements={[m]} onSave={vi.fn()} onClear={onClear} />);
    await userEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});
