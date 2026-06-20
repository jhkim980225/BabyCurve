import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard } from './ResultCard';
import type { MetricData } from '@/lib/types';

const metric: MetricData = {
  unit: 'g',
  weeks: {
    '28': { p3: 880, p10: 1000, p50: 1150, p90: 1300, p97: 1400 },
    '32': { p3: 1450, p10: 1650, p50: 1900, p90: 2150, p97: 2300 },
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
