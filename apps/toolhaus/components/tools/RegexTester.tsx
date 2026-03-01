"use client";

import { useMemo, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import { testRegex, PATTERN_LIBRARY } from "@/lib/tools/regex";
import { Card, CardContent } from "@/components/ui/card";

const patternParser = parseAsString.withDefault("");
const textParser = parseAsString.withDefault("The quick brown fox jumps over the lazy dog.");
const flagsParser = parseAsString.withDefault("g");

const FLAGS = ["g", "i", "m", "s", "u", "y"] as const;

export default function RegexTester(_props: ToolProps) {
  const [pattern, setPattern] = useQueryState("pattern", patternParser);
  const [text, setText] = useQueryState("text", textParser);
  const [flags, setFlags] = useQueryState("flags", flagsParser);
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const result = useMemo(() => testRegex(pattern, text, flags), [pattern, text, flags]);

  const highlightedText = useMemo(() => {
    if (!pattern.trim() || !result.metadata?.valid) return <>{text}</>;
    try {
      const re = new RegExp(`(${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, flags + "g");
      const parts = text.split(re);
      return (
        <>
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">
                {part}
              </mark>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </>
      );
    } catch {
      return <>{text}</>;
    }
  }, [pattern, text, flags, result.metadata?.valid]);

  const toggleFlag = (f: string) => {
    const has = flags.includes(f);
    const arr = has ? flags.split("").filter((x) => x !== f) : [...flags.split(""), f];
    arr.sort((a, b) => FLAGS.indexOf(a as (typeof FLAGS)[number]) - FLAGS.indexOf(b as (typeof FLAGS)[number]));
    setFlags(arr.join(""));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Pattern</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm"
              placeholder="/regex/"
              spellCheck={false}
            />
            <span className="self-center text-muted-foreground font-mono text-sm">/{flags}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {FLAGS.map((f) => (
              <label key={f} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={flags.includes(f)}
                  onChange={() => toggleFlag(f)}
                  className="rounded"
                />
                <span className="font-mono">{f}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pattern library</label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            onChange={(e) => {
              const v = e.target.value;
              if (v) setPattern(PATTERN_LIBRARY[v]?.pattern ?? "");
            }}
          >
            <option value="">Select a pattern...</option>
            {Object.entries(PATTERN_LIBRARY).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Test string</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-32 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
          placeholder="Enter text to test..."
          spellCheck={false}
        />
      </div>

      {pattern && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">Matches (inline)</label>
            <div className="min-h-[4rem] rounded-md border bg-muted/30 p-3 font-mono text-sm">
              {result.error ? (
                <span className="text-destructive">{result.error.message}</span>
              ) : (
                highlightedText
              )}
            </div>
          </div>

          {result.metadata?.matches && result.metadata.matches.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-medium">
                  {result.metadata.matches.length} match(es)
                </h3>
                <div className="space-y-1 font-mono text-sm">
                  {result.metadata.matches.map((m, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-muted-foreground">#{i + 1}</span>
                      <span className="text-green-600 dark:text-green-400">&quot;{m.match}&quot;</span>
                      <span className="text-muted-foreground">@ {m.index}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowCheatsheet(!showCheatsheet)}
          className="text-sm text-muted-foreground hover:underline"
        >
          {showCheatsheet ? "Hide" : "Show"} regex cheatsheet
        </button>
        {showCheatsheet && (
          <Card className="mt-2">
            <CardContent className="pt-4">
              <pre className="overflow-x-auto text-xs font-mono">
                {`[abc]     character class
[^abc]    negated class
.         any char (except newline)
\\w        word char [a-zA-Z0-9_]
\\d        digit [0-9]
\\s        whitespace
^         start of string
$         end of string
*         zero or more
+         one or more
?         zero or one
{n,m}     n to m times
(?:x)     non-capturing group
(x)       capturing group
|         alternation`}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
