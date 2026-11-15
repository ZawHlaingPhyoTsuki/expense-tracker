export const CURRENCY = "฿";

/**
 * "45+25" -> 7000, "12,5" -> 1250.
 * Every part must be a positive number, otherwise returns null.
 * Each part is rounded to minor units BEFORE summing (no float drift).
 */
export function parseAmount(input: string): number | null {
  let total = 0;
  for (const raw of input.split("+")) {
    const s = raw.trim().replace(",", ".");
    if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    const minor = Math.round(Number(s) * 100);
    if (!Number.isFinite(minor) || minor <= 0) return null;
    total += minor;
  }
  return total;
}

/** 7000 -> "฿70", 7050 -> "฿70.50" */
export function formatMoney(minor: number): string {
  const whole = minor % 100 === 0;
  const value = (minor / 100).toLocaleString("en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  });
  return `${CURRENCY}${value}`;
}