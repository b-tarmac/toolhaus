export const conversions: Record<string, (s: string) => string> = {
  camelCase: (s) =>
    s
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
  PascalCase: (s) =>
    s.replace(/(^\w|[^a-zA-Z0-9]\w)/g, (c) =>
      c.replace(/[^a-zA-Z0-9]/, "").toUpperCase()
    ),
  snake_case: (s) =>
    s
      .replace(/\s+/g, "_")
      .replace(/([A-Z])/g, "_$1")
      .replace(/^_/, "")
      .toLowerCase(),
  SCREAMING_SNAKE: (s) =>
    conversions["snake_case"](s).toUpperCase(),
  "kebab-case": (s) =>
    s
      .replace(/\s+/g, "-")
      .replace(/([A-Z])/g, "-$1")
      .replace(/^-/, "")
      .toLowerCase(),
  "Title Case": (s) =>
    s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  "Sentence case": (s) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  lowercase: (s) => s.toLowerCase(),
  UPPERCASE: (s) => s.toUpperCase(),
  "dot.case": (s) => conversions["snake_case"](s).replace(/_/g, "."),
  "path/case": (s) => conversions["snake_case"](s).replace(/_/g, "/"),
};
