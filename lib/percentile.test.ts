import { describe, it, expect } from 'vitest';
import { interpolateCutoffs, gestationalWeeksToDecimal, valueToPercentile, computePercentile } from './percentile';
import type { MetricData } from './types';

const metric: MetricData = {
  unit: 'g',
  percentiles: [3, 10, 50, 90, 97],
  weeks: {
    '28': { '3': 880, '10': 1000, '50': 1150, '90': 1300, '97': 1400 },
    '32': { '3': 1450, '10': 1650, '50': 1900, '90': 2150, '97': 2300 },
  },
};

describe('gestationalWeeksToDecimal', () => {
  it('converts weeks + days to a decimal week', () => {
    expect(gestationalWeeksToDecimal(30, 0)).toBe(30);
    expect(gestationalWeeksToDecimal(30, 7)).toBe(31);
    expect(gestationalWeeksToDecimal(28, 0)).toBe(28);
  });
});

describe('interpolateCutoffs', () => {
  it('returns exact cutoffs at a known week', () => {
    expect(interpolateCutoffs(metric, 28)).toEqual(metric.weeks['28']);
  });

  it('linearly interpolates the midpoint between two weeks', () => {
    const mid = interpolateCutoffs(metric, 30);
    expect(mid['50']).toBeCloseTo(1525, 5);
    expect(mid['3']).toBeCloseTo(1165, 5);
  });

  it('clamps below the lowest known week', () => {
    expect(interpolateCutoffs(metric, 20)).toEqual(metric.weeks['28']);
  });

  it('clamps above the highest known week', () => {
    expect(interpolateCutoffs(metric, 40)).toEqual(metric.weeks['32']);
  });

  it('clamping below returns an equal but distinct object (not same reference)', () => {
    const src = metric.weeks['28'];
    const result = interpolateCutoffs(metric, 20);
    expect(result).toEqual(src);
    expect(result).not.toBe(src);
  });

  it('mutating the clamped result does not affect source data', () => {
    const result = interpolateCutoffs(metric, 20);
    result['50'] = 9999;
    expect(metric.weeks['28']['50']).toBe(1150);
  });
});

describe('valueToPercentile', () => {
  const cutoffs = { '3': 880, '10': 1000, '50': 1150, '90': 1300, '97': 1400 };
  const percentiles = [3, 10, 50, 90, 97];

  it('returns 50 at the median value', () => {
    expect(valueToPercentile(1150, cutoffs, percentiles)).toBeCloseTo(50, 5);
  });

  it('interpolates between p50 and p90', () => {
    expect(valueToPercentile(1225, cutoffs, percentiles)).toBeCloseTo(70, 5);
  });

  it('clamps to 3 below the lowest cutoff', () => {
    expect(valueToPercentile(500, cutoffs, percentiles)).toBe(3);
  });

  it('clamps to 97 above the highest cutoff', () => {
    expect(valueToPercentile(2000, cutoffs, percentiles)).toBe(97);
  });

  it('returns the exact percentile for a middle cutoff value', () => {
    expect(valueToPercentile(1000, cutoffs, percentiles)).toBeCloseTo(10, 5);
  });

  it('does not return NaN when adjacent cutoffs are equal', () => {
    const flat = { '3': 880, '10': 1200, '50': 1200, '90': 1300, '97': 1400 };
    const result = valueToPercentile(1200, flat, percentiles);
    expect(Number.isNaN(result)).toBe(false);
    expect(result).toBeCloseTo(50, 5);
  });
});

describe('computePercentile', () => {
  it('combines week interpolation and value lookup', () => {
    const result = computePercentile(metric, 30, 0, 1525);
    expect(result).toBeCloseTo(50, 5);
  });
});

describe('flexibility: non-standard percentile sets', () => {
  const metricWho: MetricData = {
    unit: 'g',
    percentiles: [5, 50, 95],
    weeks: {
      '28': { '5': 900, '50': 1150, '95': 1380 },
      '32': { '5': 1500, '50': 1900, '95': 2280 },
    },
  };

  it('computePercentile works with percentiles [5,50,95]', () => {
    const result = computePercentile(metricWho, 30, 0, 1525);
    expect(Number.isNaN(result)).toBe(false);
    // At week 30 (midpoint), p50 interpolates to (1150+1900)/2 = 1525, so result ≈ 50
    expect(result).toBeCloseTo(50, 5);
  });

  const metricAlt: MetricData = {
    unit: 'g',
    percentiles: [10, 50, 90],
    weeks: {
      '28': { '10': 1000, '50': 1150, '90': 1300 },
      '32': { '10': 1650, '50': 1900, '90': 2150 },
    },
  };

  it('computePercentile works with percentiles [10,50,90]', () => {
    const result = computePercentile(metricAlt, 30, 0, 1525);
    expect(Number.isNaN(result)).toBe(false);
    // Midpoint p50 = (1150+1900)/2 = 1525
    expect(result).toBeCloseTo(50, 5);
  });
});
