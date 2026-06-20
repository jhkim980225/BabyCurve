import { beforeEach, describe, expect, it } from 'vitest';
import { clearMeasurements, getMeasurements } from './storage';

const KEY = 'babycurve.measurements';

beforeEach(() => {
  localStorage.clear();
});

describe('getMeasurements', () => {
  it('returns [] when localStorage has no entry', () => {
    expect(getMeasurements()).toEqual([]);
  });

  it('returns [] when localStorage contains corrupt JSON', () => {
    localStorage.setItem(KEY, 'not-json{{{');
    expect(getMeasurements()).toEqual([]);
  });
});

describe('clearMeasurements', () => {
  it('removes all measurements from localStorage', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([{ id: '1', standardId: 'who', metricId: 'efw', weeks: 30, days: 0, value: 1500, percentile: 50, ts: 1 }]),
    );
    clearMeasurements();
    expect(getMeasurements()).toEqual([]);
  });
});
