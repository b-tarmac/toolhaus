export interface ColorStop {
  color: string;
  position: number;
}

export interface GradientConfig {
  type: "linear" | "radial" | "conic";
  angle?: number;
  stops: ColorStop[];
}

export function toCss(config: GradientConfig): string {
  const stops = config.stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ");
  if (config.type === "linear") {
    const angle = config.angle ?? 90;
    return `linear-gradient(${angle}deg, ${stops})`;
  }
  if (config.type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  }
  return `conic-gradient(from ${config.angle ?? 0}deg, ${stops})`;
}

export function toTailwind(config: GradientConfig): string {
  const css = toCss(config);
  return `bg-[${css.replace(/"/g, "'")}]`;
}

export function toSvg(config: GradientConfig, width: number, height: number): string {
  const stops = config.stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `  <stop offset="${s.position}%" stop-color="${s.color}" />`)
    .join("\n");
  if (config.type === "linear") {
    const angle = (config.angle ?? 90) * (Math.PI / 180);
    const x1 = 50 - 50 * Math.cos(angle);
    const y1 = 50 + 50 * Math.sin(angle);
    const x2 = 50 + 50 * Math.cos(angle);
    const y2 = 50 - 50 * Math.sin(angle);
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
${stops}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
</svg>`;
  }
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
${stops}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
</svg>`;
}
