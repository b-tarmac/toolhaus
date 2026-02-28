import * as culori from "culori";
import type { ToolResult } from "@toolhaus/tool-sdk";

export interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  p3?: string;
}

export interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
}

export interface ColorResult extends ToolResult {
  metadata?: {
    formats: ColorFormats;
    contrast?: ContrastResult;
  };
}

function toHex(c: culori.Color | undefined): string {
  if (!c) return "";
  const h = culori.formatHex(c);
  return h ?? "";
}

function toRgb(c: culori.Color | undefined): string {
  if (!c) return "";
  const r = culori.rgb(c);
  if (!r) return "";
  return `rgb(${Math.round(r.r * 255)}, ${Math.round(r.g * 255)}, ${Math.round(r.b * 255)})`;
}

function toHsl(c: culori.Color | undefined): string {
  if (!c) return "";
  const h = culori.hsl(c);
  if (!h) return "";
  return `hsl(${Math.round(h.h ?? 0)}°, ${Math.round((h.s ?? 0) * 100)}%, ${Math.round((h.l ?? 0) * 100)}%)`;
}

function toOklch(c: culori.Color | undefined): string {
  if (!c) return "";
  const o = culori.oklch(c);
  if (!o) return "";
  const l = (o.l * 100).toFixed(1);
  const cc = ((o.c ?? 0) * 100).toFixed(1);
  const h = (o.h ?? 0).toFixed(1);
  return `oklch(${l}% ${cc}% ${h})`;
}

function toP3(c: culori.Color | undefined): string {
  if (!c) return "";
  const p = culori.displayable(c) ? culori.formatCss(c) : "";
  if (p.startsWith("color(display-p3")) return p;
  const r = culori.rgb(c);
  if (!r) return "";
  const rn = r.r, gn = r.g, bn = r.b;
  return `color(display-p3 ${rn.toFixed(3)} ${gn.toFixed(3)} ${bn.toFixed(3)})`;
}

export function parseColor(input: string): ColorResult {
  if (!input.trim()) {
    return {
      output: "",
      isValid: true,
      metadata: { formats: { hex: "", rgb: "", hsl: "", oklch: "" } },
    };
  }

  const c = culori.parse(input);
  if (!c) {
    return {
      output: "",
      isValid: false,
      error: { message: "Invalid color" },
    };
  }

  const formats: ColorFormats = {
    hex: toHex(c),
    rgb: toRgb(c),
    hsl: toHsl(c),
    oklch: toOklch(c),
    p3: toP3(c),
  };

  return {
    output: formats.hex,
    isValid: true,
    metadata: { formats },
  };
}

export function wcagContrast(color1: string, color2: string): ContrastResult | null {
  const p1 = culori.parse(color1);
  const p2 = culori.parse(color2);
  if (!p1 || !p2) return null;
  const c1 = culori.rgb(p1);
  const c2 = culori.rgb(p2);
  if (!c1 || !c2) return null;
  const ratio = culori.wcagContrast(c1, c2);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
  };
}
