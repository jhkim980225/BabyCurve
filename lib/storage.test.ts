import { beforeEach, describe, expect, it } from 'vitest';
import { addMeasurement, clearMeasurements, getMeasurements } from './storage';

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

describe('addMeasurement', () => {
  it('persists and returns a measurement with generated id and ts', () => {
    const saved = addMeasurement({
      standardId: 'who',
      metricId: 'efw',
      weeks: 30,
      days: 2,
      value: 1525,
      percentile: 45,
    });
    expect(typeof saved.id).toBe('string');
    expect(saved.id.length).toBeGreaterThan(0);
    expect(typeof saved.ts).toBe('number');
    expect(saved.ts).toBeGreaterThan(0);
    expect(saved.standardId).toBe('who');
    expect(saved.value).toBe(1525);
  });

  it('add then getMeasurements returns it as first element', () => {
    addMeasurement({
      standardId: 'who',
      metricId: 'efw',
      weeks: 30,
      days: 0,
      value: 1500,
      percentile: 42,
    });
    const list = getMeasurements();
    expect(list).toHaveLength(1);
    expect(list[0].value).toBe(1500);
  });

  it('prepends new measurements so newest is first', () => {
    addMeasurement({ standardId: 'who', metricId: 'efw', weeks: 28, days: 0, value: 1000, percentile: 30 });
    addMeasurement({ standardId: 'who', metricId: 'efw', weeks: 30, days: 0, value: 1500, percentile: 42 });
    const list = getMeasurements();
    expect(list[0].value).toBe(1500); // newest first
    expect(list[1].value).toBe(1000);
  });

  it('accepts optional id and ts overrides', () => {
    const saved = addMeasurement({
      id: 'fixed-id',
      ts: 12345,
      standardId: 'who',
      metricId: 'efw',
      weeks: 30,
      days: 0,
      value: 1500,
      percentile: 42,
    });
    expect(saved.id).toBe('fixed-id');
    expect(saved.ts).toBe(12345);
  });
});
