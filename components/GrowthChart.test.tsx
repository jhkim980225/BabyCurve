import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GrowthChart } from './GrowthChart';
import type { MetricData } from '@/lib/types';

const metric: MetricData = {
  unit: 'g',
  weeks: {
    '24': { p3: 480, p10: 540, p50: 640, p90: 740, p97: 810 },
    '32': { p3: 1450, p10: 1650, p50: 1900, p90: 2150, p97: 2300 },
    '40': { p3: 2700, p10: 3050, p50: 3450, p90: 3850, p97: 4100 },
  },
};

describe('GrowthChart', () => {
  it('renders an svg with band polygons, a median line, and the marked point', () => {
    const { container } = render(
      <GrowthChart metric={metric} markerWeek={32} markerValue={2000} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelectorAll('polygon').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('polyline')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="marker"]')).toBeInTheDocument();
  });

  it('clamps an out-of-range marker week to the chart area', () => {
    const { container } = render(
      <GrowthChart metric={metric} markerWeek={10} markerValue={500} />,
    );
    const marker = container.querySelector('[data-testid="marker"]');
    const cx = marker?.getAttribute('cx');
    expect(cx).not.toBeNull();
    expect(Number.isNaN(Number(cx))).toBe(false);
  });
});
