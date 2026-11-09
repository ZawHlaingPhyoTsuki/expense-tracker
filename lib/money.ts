export const CURRENCY = "฿";

/** "12.5" -> 1250. Returns null for empty, zero, negative or invalid input. */
export function parseAmount(input: string): number | null {
  const n = Number(input.trim().replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

export function formatMoney(minor: number): string {
  const value = (minor / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY}${value}`;
}