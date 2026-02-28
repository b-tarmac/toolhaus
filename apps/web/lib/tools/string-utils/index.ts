export const operations: Record<
  string,
  (s: string) => string | { words: number; chars: number; lines: number }
> = {
  "word-count": (s) => ({
    words: s.split(/\s+/).filter(Boolean).length,
    chars: s.length,
    lines: s.split("\n").length,
  }),
  reverse: (s) => [...s].reverse().join(""),
  slugify: (s) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-"),
  trim: (s) => s.trim(),
  "remove-duplicates": (s) => [...new Set(s.split("\n"))].join("\n"),
  "sort-lines": (s) => s.split("\n").sort().join("\n"),
  "byte-count": (s) =>
    new TextEncoder().encode(s).length.toString(),
  uppercase: (s) => s.toUpperCase(),
  lowercase: (s) => s.toLowerCase(),
};
