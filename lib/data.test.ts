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

  it('loads the WHO standard with all five biometry metrics', () => {
    const who = getStandard('who');
    expect(who.id).toBe('who');
    expect(Object.keys(who.metrics).sort()).toEqual(['ac', 'bpd', 'efw', 'fl', 'hc']);
    expect(who.metrics.efw.percentiles).toContain(50);
    expect(who.metrics.bpd.unit).toBe('mm');
    expect(who.metrics.efw.weeks['37']['95']).toBe(3538);
  });

  it('throws for an unknown standard id', () => {
    expect(() => getStandard('nope')).toThrow();
  });
});
