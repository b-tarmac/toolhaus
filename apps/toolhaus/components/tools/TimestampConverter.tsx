"use client";

import { useEffect, useState } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import {
  timestampToHuman,
  humanToTimestamp,
} from "@/lib/tools/timestamp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const modeParser = parseAsStringLiteral(["to-human", "to-timestamp"]).withDefault("to-human");
const unitParser = parseAsStringLiteral(["seconds", "milliseconds"]).withDefault("seconds");
const inputParser = parseAsString.withDefault("");
const timezoneParser = parseAsString.withDefault("UTC");

const TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : ["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"];

export default function TimestampConverter(_props: ToolProps) {
  const [input, setInput] = useQueryState("input", inputParser);
  const [mode, setMode] = useQueryState("mode", modeParser);
  const [unit, setUnit] = useQueryState("unit", unitParser);
  const [timezone, setTimezone] = useQueryState("tz", timezoneParser);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentTs =
    unit === "seconds"
      ? Math.floor(now / 1000)
      : now;

  const result =
    mode === "to-human" && input
      ? timestampToHuman(input, unit, timezone)
      : mode === "to-timestamp" && input
        ? humanToTimestamp(input)
        : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Current timestamp</p>
          <p className="font-mono text-lg">
            {unit === "seconds" ? Math.floor(now / 1000) : now}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() =>
              setInput(
                (unit === "seconds" ? Math.floor(Date.now() / 1000) : Date.now()).toString()
              )
            }
          >
            Use now
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === "to-human" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("to-human")}
        >
          Timestamp → Date
        </Button>
        <Button
          variant={mode === "to-timestamp" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("to-timestamp")}
        >
          Date → Timestamp
        </Button>
        {mode === "to-human" && (
          <>
            <Button
              variant={unit === "seconds" ? "default" : "outline"}
              size="sm"
              onClick={() => setUnit("seconds")}
            >
              Seconds
            </Button>
            <Button
              variant={unit === "milliseconds" ? "default" : "outline"}
              size="sm"
              onClick={() => setUnit("milliseconds")}
            >
              Milliseconds
            </Button>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="rounded-md border px-2 py-1 text-sm"
            >
              {TIMEZONES.slice(0, 50).map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          {mode === "to-human" ? "Timestamp" : "Date string"}
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded-md border px-3 py-2 font-mono"
          placeholder={
            mode === "to-human"
              ? unit === "seconds"
                ? "1699000000"
                : "1699000000000"
              : "2024-01-15 or Jan 15, 2024"
          }
        />
      </div>

      {result && (
        <Card>
          <CardContent className="pt-4">
            {result.isValid && "metadata" in result && result.metadata && (
              <div className="space-y-1 text-sm">
                {"iso8601" in result.metadata && (
                  <>
                    <p>
                      <span className="text-muted-foreground">ISO 8601:</span>{" "}
                      {String(result.metadata.iso8601)}
                    </p>
                    {"local" in result.metadata && (
                      <p>
                        <span className="text-muted-foreground">Local:</span>{" "}
                        {String(result.metadata.local)}
                      </p>
                    )}
                    {"relative" in result.metadata && (
                      <p>
                        <span className="text-muted-foreground">Relative:</span>{" "}
                        {String(result.metadata.relative)}
                      </p>
                    )}
                  </>
                )}
                {"seconds" in result.metadata && (
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-muted-foreground">Unix:</span>{" "}
                      {Number(result.metadata.seconds)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Unix ms:</span>{" "}
                      {Number(result.metadata.milliseconds)}
                    </p>
                  </div>
                )}
              </div>
            )}
            {!result.isValid && "error" in result && (
              <p className="text-destructive">
                {(result.error as { message: string }).message}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
