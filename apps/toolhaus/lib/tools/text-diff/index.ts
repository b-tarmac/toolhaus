import * as Diff from "diff";
import type { ToolResult } from "@portfolio/tool-sdk";

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export interface DiffHunk {
  type: "add" | "remove" | "unchanged";
  lines: string[];
}

export interface DiffResult extends ToolResult {
  metadata?: {
    stats: DiffStats;
    hunks: DiffHunk[];
    unified: string;
  };
}

export function computeDiff(oldText: string, newText: string): DiffResult {
  const hunks: DiffHunk[] = [];
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  const diffResult = Diff.diffLines(oldText || "\n", newText || "\n");

  for (const part of diffResult) {
    const raw = part.value.split("\n");
    const lines = raw[raw.length - 1] === "" ? raw.slice(0, -1) : raw;
    if (part.added) {
      hunks.push({ type: "add", lines });
      added += lines.length;
    } else if (part.removed) {
      hunks.push({ type: "remove", lines });
      removed += lines.length;
    } else {
      hunks.push({ type: "unchanged", lines });
      unchanged += lines.length;
    }
  }

  const unified = Diff.createTwoFilesPatch(
    "a",
    "b",
    oldText || "\n",
    newText || "\n",
    undefined,
    undefined,
    { context: 3 }
  );

  return {
    output: unified,
    isValid: true,
    metadata: {
      stats: { added, removed, unchanged },
      hunks,
      unified,
    },
  };
}
