import { describe, it, expect } from 'vitest';
import { getStandardIndex, getStandard } from './data';

describe('data loader', () => {
  it('lists available standards from the index', () => {
    const index = getStandardIndex();
    expect(index.standards.map((s) => s.id)).toContain('hadlock');
  });

  it('loads a standard by id with its metrics', () => {
    const hadlock = getStandard('hadlock');
    expect(hadlock.id).toBe('hadlock');
    expect(hadlock.metrics.efw.unit).toBe('g');
    expect(hadlock.metrics.efw.weeks['28']['50']).toBe(1209);
  });

  it('throws for an unknown standard id', () => {
    expect(() => getStandard('nope')).toThrow();
  });
});
