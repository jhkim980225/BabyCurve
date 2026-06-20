import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard } from './ResultCard';
import type { MetricData } from '@/lib/types';

const metric: MetricData = {
  unit: 'g',
  percentiles: [3, 10, 50, 90, 97],
  weeks: {
    '28': { '3': 880, '10': 1000, '50': 1150, '90': 1300, '97': 1400 },
    '32': { '3': 1450, '10': 1650, '50': 1900, '90': 2150, '97': 2300 },
  },
};

describe('ResultCard', () => {
  it('shows the rounded percentile, the chart, and the medical disclaimer', () => {
    render(
      <ResultCard
        metric={metric}
        weeks={30}
        days={0}
        value={1525}
        percentile={50}
        standardName="WHO Fetal Growth"
      />,
    );
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/percentile/i)).toBeInTheDocument();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /growth chart/i })).toBeInTheDocument();
  });

  it('passes extraMarkers to GrowthChart when provided', () => {
    const { container } = render(
      <ResultCard
        metric={metric}
        weeks={30}
        days={0}
        value={1500}
        percentile={45}
        standardName="WHO Fetal Growth"
        extraMarkers={[{ week: 28, value: 1200 }]}
      />,
    );
    expect(container.querySelectorAll('[data-testid="extra-marker"]')).toHaveLength(1);
  });
});
