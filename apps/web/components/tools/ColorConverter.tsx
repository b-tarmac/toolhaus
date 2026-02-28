"use client";

import { useMemo } from "react";
import { parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { parseColor, wcagContrast } from "@/lib/tools/color";
import { Card, CardContent } from "@/components/ui/card";

const colorParser = parseAsString.withDefault("#3b82f6");
const bgParser = parseAsString.withDefault("#ffffff");

export default function ColorConverter(_props: ToolProps) {
  const [color, setColor] = useQueryState("color", colorParser);
  const [bgColor, setBgColor] = useQueryState("bg", bgParser);

  const result = useMemo(() => parseColor(color), [color]);
  const contrast = useMemo(
    () => (result.isValid && color ? wcagContrast(color, bgColor) : null),
    [color, bgColor, result.isValid]
  );

  const formats = result.metadata?.formats;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={formats?.hex || "#000000"}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="flex-1 rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm"
              placeholder="#hex or rgb(...)"
              spellCheck={false}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Background (for contrast)</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {result.error && (
        <p className="text-sm text-destructive">{result.error.message}</p>
      )}

      {formats && (
        <>
          <div
            className="h-24 w-full rounded-lg border"
            style={{ backgroundColor: formats.hex || color }}
          />
          <Card>
            <CardContent className="pt-4">
              <h3 className="mb-2 text-sm font-medium">Formats</h3>
              <div className="grid gap-2 text-sm font-mono">
                <div><span className="text-muted-foreground">HEX:</span> {formats.hex}</div>
                <div><span className="text-muted-foreground">RGB:</span> {formats.rgb}</div>
                <div><span className="text-muted-foreground">HSL:</span> {formats.hsl}</div>
                <div><span className="text-muted-foreground">OKLCH:</span> {formats.oklch}</div>
                {formats.p3 && (
                  <div><span className="text-muted-foreground">P3:</span> {formats.p3}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {contrast && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-sm font-medium">WCAG contrast</h3>
                <div className="space-y-1 text-sm">
                  <p>Ratio: <strong>{contrast.ratio}:1</strong></p>
                  <p>AA (4.5:1): {contrast.aa ? "✓ Pass" : "✗ Fail"}</p>
                  <p>AAA (7:1): {contrast.aaa ? "✓ Pass" : "✗ Fail"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
