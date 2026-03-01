export function convertBase(
  value: string,
  fromBase: number
): { binary: string; octal: string; decimal: string; hex: string } | null {
  const decimal = parseInt(value, fromBase);
  if (isNaN(decimal)) return null;
  return {
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    decimal: decimal.toString(10),
    hex: decimal.toString(16).toUpperCase(),
  };
}
