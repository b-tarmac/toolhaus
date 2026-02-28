"use client";

import { useState } from "react";
import { parseAsStringLiteral, parseAsString, parseAsInteger, useQueryState } from "nuqs";
import type { ToolProps } from "@toolhaus/tool-sdk";
import { toCss, toTailwind, toSvg, type ColorStop } from "@/lib/tools/css-gradient";

const typeParser = parseAsStringLiteral(["linear", "radial", "conic"]).withDefault("linear");
const angleParser = parseAsInteger.withDefault(90);
const stopsParser = parseAsString.withDefault(
  JSON.stringify([
    { color: "#3b82f6", position: 0 },
    { color: "#8b5cf6", position: 100 },
  ])
);

export default function CssGradientGenerator(_props: ToolProps) {
  const [type, setType] = useQueryState("type", typeParser);
  const [angle, setAngle] = useQueryState("angle", angleParser);
  const [stopsJson, setStopsJson] = useQueryState("stops", stopsParser);
  const [exportFormat, setExportFormat] = useState<"css" | "tailwind" | "svg">("css");

  let stops: ColorStop[];
  try {
    stops = JSON.parse(stopsJson) as ColorStop[];
    if (!Array.isArray(stops)) stops = [];
  } catch {
    stops = [{ color: "#3b82f6", position: 0 }, { color: "#8b5cf6", position: 100 }];
  }

  const config = {
    type: type as "linear" | "radial" | "conic",
    angle,
    stops,
  };

  const css = toCss(config);
  const tailwind = toTailwind(config);
  const svg = toSvg(config, 400, 200);

  const updateStop = (i: number, upd: Partial<ColorStop>) => {
    const next = [...stops];
    next[i] = { ...next[i], ...upd };
    setStopsJson(JSON.stringify(next));
  };

  const addStop = () => {
    const pos = stops.length > 0 ? stops[stops.length - 1].position + 10 : 50;
    setStopsJson(JSON.stringify([...stops, { color: "#6b7280", position: Math.min(100, pos) }]));
  };

  const removeStop = (i: number) => {
    if (stops.length <= 2) return;
    const next = stops.filter((_, j) => j !== i);
    setStopsJson(JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "linear" | "radial" | "conic")}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="conic">Conic</option>
          </select>
        </div>
        {type !== "radial" && (
          <div>
            <label className="mb-1 block text-sm font-medium">Angle (°)</label>
            <input
              type="number"
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-20 rounded-md border px-3 py-2 text-sm"
              min={0}
              max={360}
            />
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Color stops</label>
          <button
            type="button"
            onClick={addStop}
            className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {stops.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={s.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded border"
              />
              <input
                type="text"
                value={s.color}
                onChange={(e) => updateStop(i, { color: e.target.value })}
                className="w-24 rounded-md border px-2 py-1 font-mono text-sm"
              />
              <input
                type="number"
                value={s.position}
                onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
                className="w-16 rounded-md border px-2 py-1 text-sm"
                min={0}
                max={100}
              />
              <span className="text-muted-foreground">%</span>
              <button
                type="button"
                onClick={() => removeStop(i)}
                disabled={stops.length <= 2}
                className="text-destructive hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div
        className="h-32 w-full rounded-lg border"
        style={{ background: css }}
      />

      <div>
        <div className="mb-2 flex gap-2">
          {(["css", "tailwind", "svg"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setExportFormat(f)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                exportFormat === f ? "bg-primary text-primary-foreground" : "border"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <pre className="overflow-x-auto rounded-md border bg-muted/30 p-3 font-mono text-xs">
          {exportFormat === "css" && css}
          {exportFormat === "tailwind" && tailwind}
          {exportFormat === "svg" && svg}
        </pre>
      </div>
    </div>
  );
}
