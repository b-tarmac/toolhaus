declare module "@iarna/toml" {
  export function parse(str: string): Record<string, unknown>;
  export function stringify(obj: Record<string, unknown>): string;
}
