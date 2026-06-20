/**
 * Hadlock 1985 four-parameter EFW formula.
 * Inputs in centimetres; output in grams (rounded to nearest gram).
 *
 * log10(EFW) = 1.3596
 *   - 0.00386 * ac * fl
 *   + 0.0064  * hc
 *   + 0.00061 * bpd * ac
 *   + 0.0424  * ac
 *   + 0.174   * fl
 */
export function estimateEFW(m: {
  bpd: number;
  hc: number;
  ac: number;
  fl: number;
}): number {
  const { bpd, hc, ac, fl } = m;
  const log10EFW =
    1.3596 -
    0.00386 * ac * fl +
    0.0064 * hc +
    0.00061 * bpd * ac +
    0.0424 * ac +
    0.174 * fl;
  return Math.round(10 ** log10EFW);
}

/**
 * Partial version: returns null if any of the four inputs is
 * missing (undefined) or NaN; otherwise delegates to estimateEFW.
 */
export function estimateEFWPartial(
  m: Partial<{ bpd: number; hc: number; ac: number; fl: number }>,
): number | null {
  const { bpd, hc, ac, fl } = m;
  if (
    bpd === undefined || isNaN(bpd) ||
    hc  === undefined || isNaN(hc)  ||
    ac  === undefined || isNaN(ac)  ||
    fl  === undefined || isNaN(fl)
  ) {
    return null;
  }
  return estimateEFW({ bpd, hc, ac, fl });
}
