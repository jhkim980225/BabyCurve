import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

// Mock child components that rely on external data/DOM APIs so the page test
// stays focused on page-level layout concerns.
vi.mock('@/components/InputForm', () => ({
  InputForm: ({ onCalculate }: { onCalculate: (input: unknown) => void }) => (
    <button onClick={() => onCalculate({ standardId: 'who', metricId: 'efw', weeks: 30, days: 0, value: 1500 })}>
      Calculate
    </button>
  ),
}));

vi.mock('@/components/ResultCard', () => ({
  ResultCard: () => <div data-testid="result-card">ResultCard</div>,
}));

vi.mock('@/components/HistoryPanel', () => ({
  HistoryPanel: () => <div data-testid="history-panel">HistoryPanel</div>,
}));

vi.mock('@/lib/data', () => ({
  getStandard: () => ({
    name: 'WHO Fetal Growth',
    metrics: {
      efw: { unit: 'g', weeks: { '30': { p3: 900, p10: 1100, p50: 1300, p90: 1500, p97: 1600 } } },
    },
  }),
}));

vi.mock('@/lib/percentile', () => ({
  computePercentile: () => 50,
}));

vi.mock('@/lib/storage', () => ({
  addMeasurement: vi.fn(),
  clearMeasurements: vi.fn(),
  getMeasurements: () => [],
}));

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the disclaimer footer on initial render before any calculation', () => {
    render(<Home />);
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });

  it('renders the disclaimer footer containing the full disclaimer text', () => {
    render(<Home />);
    expect(screen.getByText(/consult your healthcare provider/i)).toBeInTheDocument();
  });
});
