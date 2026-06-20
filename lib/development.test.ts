import { describe, it, expect } from 'vitest';
import { getDevelopmentInfo } from './development';

describe('getDevelopmentInfo', () => {
  it('returns an object with non-empty sizeComparison and milestone for week 12', () => {
    const info = getDevelopmentInfo(12);
    expect(info).not.toBeNull();
    expect(info!.sizeComparison).toBeTruthy();
    expect(info!.milestone).toBeTruthy();
  });

  it('returns null for week 3 (below range)', () => {
    const result = getDevelopmentInfo(3);
    expect(result).toBeNull();
  });

  it('returns an entry for week 40', () => {
    const info = getDevelopmentInfo(40);
    expect(info).not.toBeNull();
    expect(info!.sizeComparison).toBeTruthy();
    expect(info!.milestone).toBeTruthy();
  });

  it('returns null for week 41 (above range)', () => {
    const result = getDevelopmentInfo(41);
    expect(result).toBeNull();
  });

  it('uses Math.floor for fractional weeks', () => {
    const info = getDevelopmentInfo(12.9);
    const infoWhole = getDevelopmentInfo(12);
    expect(info).toEqual(infoWhole);
  });

  it('falls back to en for an unknown locale', () => {
    const infoDefault = getDevelopmentInfo(12);
    const infoUnknown = getDevelopmentInfo(12, 'xx');
    expect(infoUnknown).toEqual(infoDefault);
  });

  it('returns the same result for explicit en locale as default', () => {
    const infoDefault = getDevelopmentInfo(20);
    const infoEn = getDevelopmentInfo(20, 'en');
    expect(infoEn).toEqual(infoDefault);
  });
});
