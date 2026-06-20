import { describe, it, expect } from 'vitest';
import { dueDateFromLMP, gestationalAgeFromLMP, gestationalAgeFromEDD } from '@/lib/dueDate';

describe('dueDateFromLMP', () => {
  it('returns LMP + 280 days as ISO string', () => {
    expect(dueDateFromLMP('2026-01-01')).toBe('2026-10-08');
  });
});

describe('gestationalAgeFromLMP', () => {
  it('returns 12w 0d for LMP=2026-01-01 and today=2026-03-26', () => {
    expect(gestationalAgeFromLMP('2026-01-01', '2026-03-26')).toEqual({ weeks: 12, days: 0 });
  });

  it('returns 0w 0d when today equals LMP', () => {
    expect(gestationalAgeFromLMP('2026-01-01', '2026-01-01')).toEqual({ weeks: 0, days: 0 });
  });

  it('returns 0w 6d one day before a full week', () => {
    expect(gestationalAgeFromLMP('2026-01-01', '2026-01-07')).toEqual({ weeks: 0, days: 6 });
  });
});

describe('gestationalAgeFromEDD', () => {
  it('equals gestationalAgeFromLMP when EDD is derived from the same LMP', () => {
    const edd = dueDateFromLMP('2026-01-01');
    expect(gestationalAgeFromEDD(edd, '2026-03-26')).toEqual(
      gestationalAgeFromLMP('2026-01-01', '2026-03-26'),
    );
  });
});
