export function ordinalSuffix(n: number): string {
  const abs = Math.abs(n) % 100;
  if (abs >= 11 && abs <= 13) return 'th';
  switch (abs % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
