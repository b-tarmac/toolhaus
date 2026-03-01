function formatRelative(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  if (abs < 60_000) return rtf.format(Math.round(diff / 1000), "second");
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), "hour");
  if (abs < 2_592_000_000)
    return rtf.format(Math.round(diff / 86_400_000), "day");
  return rtf.format(Math.round(diff / 2_592_000_000), "month");
}

export function timestampToHuman(
  timestamp: string,
  unit: "seconds" | "milliseconds",
  timezone: string
) {
  const ms =
    unit === "seconds" ? Number(timestamp) * 1000 : Number(timestamp);
  const date = new Date(ms);
  if (isNaN(date.getTime()))
    return { isValid: false, error: { message: "Invalid timestamp" } };
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { ...opts, timeZone: timezone }).format(
      date
    );
  return {
    isValid: true,
    output: "",
    metadata: {
      iso8601: date.toISOString(),
      utc: date.toUTCString(),
      local: fmt({ dateStyle: "full", timeStyle: "long" }),
      relative: formatRelative(date),
      dayOfWeek: fmt({ weekday: "long" }),
      unix: Math.floor(ms / 1000),
      unixMs: ms,
    },
  };
}

export function humanToTimestamp(input: string) {
  const date = new Date(input);
  if (isNaN(date.getTime()))
    return { isValid: false, error: { message: "Could not parse date" } };
  return {
    isValid: true,
    output: "",
    metadata: {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
      iso8601: date.toISOString(),
    },
  };
}
