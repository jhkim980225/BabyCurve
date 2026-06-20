/** Parse an ISO "YYYY-MM-DD" string to a UTC midnight Date. */
function parseISO(iso: string): Date {
  return new Date(iso + 'T00:00:00Z');
}

/** Format a UTC Date to "YYYY-MM-DD". */
function formatISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const DAY_MS = 86_400_000;

/**
 * Naegele's rule: LMP + 280 days.
 * @param lmpISO  Last menstrual period as "YYYY-MM-DD"
 * @returns       Estimated due date as "YYYY-MM-DD"
 */
export function dueDateFromLMP(lmpISO: string): string {
  const lmp = parseISO(lmpISO);
  return formatISO(new Date(lmp.getTime() + 280 * DAY_MS));
}

/**
 * Gestational age in whole weeks and remainder days.
 * @param lmpISO   Last menstrual period as "YYYY-MM-DD"
 * @param todayISO Today's date as "YYYY-MM-DD"
 */
export function gestationalAgeFromLMP(
  lmpISO: string,
  todayISO: string,
): { weeks: number; days: number } {
  const lmp = parseISO(lmpISO);
  const today = parseISO(todayISO);
  const diffDays = Math.floor((today.getTime() - lmp.getTime()) / DAY_MS);
  return { weeks: Math.floor(diffDays / 7), days: diffDays % 7 };
}

/**
 * Gestational age derived from an estimated due date.
 * Equivalent to gestationalAgeFromLMP(EDD - 280 days, today).
 * @param eddISO   Estimated due date as "YYYY-MM-DD"
 * @param todayISO Today's date as "YYYY-MM-DD"
 */
export function gestationalAgeFromEDD(
  eddISO: string,
  todayISO: string,
): { weeks: number; days: number } {
  const edd = parseISO(eddISO);
  const lmpISO = formatISO(new Date(edd.getTime() - 280 * DAY_MS));
  return gestationalAgeFromLMP(lmpISO, todayISO);
}
