import { describe, it, expect } from 'vitest';
import { getStandardIndex, getStandard } from './data';

describe('data loader', () => {
  it('lists available standards from the index', () => {
    const index = getStandardIndex();
    expect(index.standards.map((s) => s.id)).toContain('who');
  });

  it('loads a standard by id with its metrics', () => {
    const who = getStandard('who');
    expect(who.id).toBe('who');
    expect(who.metrics.efw.unit).toBe('g');
    expect(who.metrics.efw.weeks['28'].p50).toBe(1150);
  });

  it('throws for an unknown standard id', () => {
    expect(() => getStandard('nope')).toThrow();
  });
});
