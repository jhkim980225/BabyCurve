import { describe, it, expect } from 'vitest';
import { estimateEFW, estimateEFWPartial } from '@/lib/efw';

describe('estimateEFW', () => {
  it('returns 2331 g for the Hadlock reference case', () => {
    expect(estimateEFW({ bpd: 8.7, hc: 31, ac: 30, fl: 6.5 })).toBeCloseTo(2331, 0);
  });
});

describe('estimateEFWPartial', () => {
  it('returns null when fl is missing', () => {
    expect(estimateEFWPartial({ bpd: 8.7, hc: 31, ac: 30 })).toBeNull();
  });

  it('returns null when any value is undefined', () => {
    expect(estimateEFWPartial({ bpd: 8.7, hc: 31, ac: 30, fl: undefined })).toBeNull();
  });

  it('returns null when any value is NaN', () => {
    expect(estimateEFWPartial({ bpd: 8.7, hc: 31, ac: 30, fl: NaN })).toBeNull();
  });

  it('returns same result as estimateEFW when all values present', () => {
    const full = estimateEFW({ bpd: 8.7, hc: 31, ac: 30, fl: 6.5 });
    expect(estimateEFWPartial({ bpd: 8.7, hc: 31, ac: 30, fl: 6.5 })).toBe(full);
  });
});
