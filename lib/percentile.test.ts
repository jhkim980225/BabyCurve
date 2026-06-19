import { describe, it, expect } from 'vitest';
import { interpolateCutoffs, gestationalWeeksToDecimal, valueToPercentile, computePercentile } from './percentile';
import type { MetricData } from './types';

const metric: MetricData = {
  unit: 'g',
  weeks: {
    '28': { p3: 880, p10: 1000, p50: 1150, p90: 1300, p97: 1400 },
    '32': { p3: 1450, p10: 1650, p50: 1900, p90: 2150, p97: 2300 },
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
    expect(mid.p50).toBeCloseTo(1525, 5);
    expect(mid.p3).toBeCloseTo(1165, 5);
  });

  it('clamps below the lowest known week', () => {
    expect(interpolateCutoffs(metric, 20)).toEqual(metric.weeks['28']);
  });

  it('clamps above the highest known week', () => {
    expect(interpolateCutoffs(metric, 40)).toEqual(metric.weeks['32']);
  });
});

describe('valueToPercentile', () => {
  const cutoffs = { p3: 880, p10: 1000, p50: 1150, p90: 1300, p97: 1400 };

  it('returns 50 at the median value', () => {
    expect(valueToPercentile(1150, cutoffs)).toBeCloseTo(50, 5);
  });

  it('interpolates between p50 and p90', () => {
    expect(valueToPercentile(1225, cutoffs)).toBeCloseTo(70, 5);
  });

  it('clamps to 3 below the lowest cutoff', () => {
    expect(valueToPercentile(500, cutoffs)).toBe(3);
  });

  it('clamps to 97 above the highest cutoff', () => {
    expect(valueToPercentile(2000, cutoffs)).toBe(97);
  });

  it('returns the exact percentile for a middle cutoff value', () => {
    expect(valueToPercentile(1000, cutoffs)).toBeCloseTo(10, 5);
  });

  it('does not return NaN when adjacent cutoffs are equal', () => {
    const flat = { p3: 880, p10: 1200, p50: 1200, p90: 1300, p97: 1400 };
    const result = valueToPercentile(1200, flat);
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
