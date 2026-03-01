"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function countSentences(text: string): number {
  return text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
}

export default function WordCounter(_props: EasyBiscuitToolProps) {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const chars = text.length;
    const words = countWords(text);
    const sentences = countSentences(text);
    const paragraphs = text
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 0).length;
    return { chars, words, sentences, paragraphs };
  }, [text]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here…"
          className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          spellCheck
        />
      </div>
      <Card>
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium">Counts</h3>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Words:</span>{" "}
              <span className="font-medium">{stats.words}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Characters:</span>{" "}
              <span className="font-medium">{stats.chars}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sentences:</span>{" "}
              <span className="font-medium">{stats.sentences}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Paragraphs:</span>{" "}
              <span className="font-medium">{stats.paragraphs}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
