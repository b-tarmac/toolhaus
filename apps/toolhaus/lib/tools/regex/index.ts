import type { ToolResult } from "@portfolio/tool-sdk";

export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexResult extends ToolResult {
  metadata?: {
    matches: RegexMatch[];
    valid: boolean;
    error?: string;
  };
}

export function testRegex(
  pattern: string,
  text: string,
  flags: string
): RegexResult {
  if (!pattern.trim()) {
    return {
      output: "",
      isValid: true,
      metadata: { matches: [], valid: true },
    };
  }

  try {
    const re = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];
    let m: RegExpExecArray | null;
    const re2 = new RegExp(re.source, flags + "g");
    while ((m = re2.exec(text)) !== null) {
      matches.push({
        match: m[0],
        index: m.index,
        groups: m.slice(1),
      });
    }

    return {
      output: JSON.stringify(
        matches.map((x) => ({ match: x.match, index: x.index, groups: x.groups })),
        null,
        2
      ),
      isValid: true,
      metadata: { matches, valid: true },
    };
  } catch (e) {
    const err = e as Error;
    return {
      output: "",
      isValid: false,
      error: { message: err.message },
      metadata: { matches: [], valid: false, error: err.message },
    };
  }
}

export const PATTERN_LIBRARY: Record<string, { pattern: string; name: string }> = {
  email: { pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", name: "Email" },
  url: {
    pattern: "https?://[^\\s]+",
    name: "URL",
  },
  ipv4: {
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    name: "IPv4",
  },
  hex: { pattern: "#[0-9a-fA-F]{6}", name: "Hex color" },
  date: {
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    name: "ISO date",
  },
  slug: { pattern: "[a-z0-9]+(?:-[a-z0-9]+)*", name: "URL slug" },
  phone: {
    pattern: "\\+?[\\d\\s()-]{10,}",
    name: "Phone",
  },
};
