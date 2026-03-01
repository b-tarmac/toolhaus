declare module "culori" {
  export interface Color {
    mode: string;
  }
  export function parse(color: string): Color | undefined;
  export function formatHex(color: Color): string | undefined;
  export function rgb(color: Color): { r: number; g: number; b: number } | undefined;
  export function hsl(color: Color): { h?: number; s?: number; l?: number } | undefined;
  export function oklch(color: Color): { l: number; c?: number; h?: number } | undefined;
  export function displayable(color: Color): boolean;
  export function formatCss(color: Color): string;
  export function wcagContrast(
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number }
  ): number;
}
