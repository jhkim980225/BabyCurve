import { describe, it, expect } from 'vitest';
import { ordinalSuffix } from './ordinal';

describe('ordinalSuffix', () => {
  it('handles 1/2/3', () => {
    expect(ordinalSuffix(1)).toBe('st');
    expect(ordinalSuffix(2)).toBe('nd');
    expect(ordinalSuffix(3)).toBe('rd');
  });
  it('handles the 11/12/13 exception', () => {
    expect(ordinalSuffix(11)).toBe('th');
    expect(ordinalSuffix(12)).toBe('th');
    expect(ordinalSuffix(13)).toBe('th');
  });
  it('handles 21/22/23 and default', () => {
    expect(ordinalSuffix(21)).toBe('st');
    expect(ordinalSuffix(22)).toBe('nd');
    expect(ordinalSuffix(50)).toBe('th');
  });
});
