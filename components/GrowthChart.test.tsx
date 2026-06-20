import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GrowthChart } from './GrowthChart';
import type { MetricData } from '@/lib/types';

const metric: MetricData = {
  unit: 'g',
  percentiles: [3, 10, 50, 90, 97],
  weeks: {
    '24': { '3': 480, '10': 540, '50': 640, '90': 740, '97': 810 },
    '32': { '3': 1450, '10': 1650, '50': 1900, '90': 2150, '97': 2300 },
    '40': { '3': 2700, '10': 3050, '50': 3450, '90': 3850, '97': 4100 },
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

  it('renders two extra-marker circles when extraMarkers has two items', () => {
    const { container } = render(
      <GrowthChart
        metric={metric}
        markerWeek={32}
        markerValue={2000}
        extraMarkers={[
          { week: 28, value: 1200 },
          { week: 36, value: 2600 },
        ]}
      />,
    );
    const extras = container.querySelectorAll('[data-testid="extra-marker"]');
    expect(extras).toHaveLength(2);
    extras.forEach((el) => {
      expect(Number.isFinite(Number(el.getAttribute('cx')))).toBe(true);
      expect(Number.isFinite(Number(el.getAttribute('cy')))).toBe(true);
    });
  });

  it('renders no extra-marker circles when extraMarkers is empty', () => {
    const { container } = render(
      <GrowthChart metric={metric} markerWeek={32} markerValue={2000} extraMarkers={[]} />,
    );
    expect(container.querySelectorAll('[data-testid="extra-marker"]')).toHaveLength(0);
  });

  it('renders no extra-marker circles when extraMarkers is omitted', () => {
    const { container } = render(
      <GrowthChart metric={metric} markerWeek={32} markerValue={2000} />,
    );
    expect(container.querySelectorAll('[data-testid="extra-marker"]')).toHaveLength(0);
  });
});

describe('GrowthChart flexibility: non-standard percentile sets', () => {
  it('renders correctly with percentiles [5,50,95] (1 band + median + marker, no NaN)', () => {
    const metricWho: MetricData = {
      unit: 'g',
      percentiles: [5, 50, 95],
      weeks: {
        '28': { '5': 900, '50': 1150, '95': 1380 },
        '32': { '5': 1500, '50': 1900, '95': 2280 },
      },
    };
    const { container } = render(
      <GrowthChart metric={metricWho} markerWeek={30} markerValue={1525} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    // 3 percentiles → 1 band only (outer), inner requires >=4
    expect(container.querySelectorAll('polygon')).toHaveLength(1);
    expect(container.querySelector('polyline')).toBeInTheDocument();
    const marker = container.querySelector('[data-testid="marker"]');
    expect(marker).toBeInTheDocument();
    expect(Number.isFinite(Number(marker?.getAttribute('cx')))).toBe(true);
    expect(Number.isFinite(Number(marker?.getAttribute('cy')))).toBe(true);
  });

  it('renders correctly with percentiles [10,50,90]', () => {
    const metricAlt: MetricData = {
      unit: 'g',
      percentiles: [10, 50, 90],
      weeks: {
        '28': { '10': 1000, '50': 1150, '90': 1300 },
        '32': { '10': 1650, '50': 1900, '90': 2150 },
      },
    };
    const { container } = render(
      <GrowthChart metric={metricAlt} markerWeek={30} markerValue={1525} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelectorAll('polygon')).toHaveLength(1);
    const marker = container.querySelector('[data-testid="marker"]');
    expect(Number.isFinite(Number(marker?.getAttribute('cx')))).toBe(true);
    expect(Number.isFinite(Number(marker?.getAttribute('cy')))).toBe(true);
  });
});
