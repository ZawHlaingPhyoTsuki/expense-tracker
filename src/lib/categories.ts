export const CATEGORIES = [
  { key: "Food", emoji: "🍜" },
  { key: "Transport", emoji: "🚇" },
  { key: "Shopping", emoji: "🛍️" },
  { key: "Bills", emoji: "💡" },
  { key: "Health", emoji: "💊" },
  { key: "Fun", emoji: "🎬" },
  { key: "Other", emoji: "📦" },
] as const;

export function emojiFor(category: string): string {
  return CATEGORIES.find((c) => c.key === category)?.emoji ?? "📦";
}