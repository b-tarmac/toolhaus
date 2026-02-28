import { useState, useMemo } from "react";
import { timestampToHuman, humanToTimestamp } from "@tools/timestamp";
import { OpenInBrowser } from "../OpenInBrowser";

export function MiniTimestamp() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"to-human" | "to-timestamp">("to-human");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    if (mode === "to-human") {
      const r = timestampToHuman(input, "seconds", "UTC");
      if (r.isValid && r.metadata) {
        return {
          output: r.metadata.local ?? r.metadata.iso8601 ?? "",
          isValid: true,
        };
      }
      return r;
    }
    const r = humanToTimestamp(input);
    if (r.isValid && r.metadata) {
      return {
        output: String(r.metadata.seconds ?? r.metadata.milliseconds ?? ""),
        isValid: true,
      };
    }
    return r;
  }, [input, mode]);

  const handleCopy = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  return (
    <div className="mini-tool">
      <div className="mini-tool-mode">
        <button
          type="button"
          className={mode === "to-human" ? "active" : ""}
          onClick={() => setMode("to-human")}
        >
          To Date
        </button>
        <button
          type="button"
          className={mode === "to-timestamp" ? "active" : ""}
          onClick={() => setMode("to-timestamp")}
        >
          To Unix
        </button>
      </div>
      <textarea
        className="mini-tool-input"
        placeholder={
          mode === "to-human"
            ? "Unix timestamp (seconds)..."
            : "Date string or ISO..."
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
      />
      <div className="mini-tool-output-wrap">
        <pre
          className={`mini-tool-output ${result && !result.isValid ? "error" : ""}`}
        >
          {result ? (result.isValid ? result.output : result.error?.message) : "—"}
        </pre>
      </div>
      <div className="mini-tool-actions">
        {result?.output && (
          <button type="button" onClick={handleCopy}>
            Copy
          </button>
        )}
        <OpenInBrowser toolSlug="timestamp-converter" input={input}>
          Open in Browser
        </OpenInBrowser>
      </div>
    </div>
  );
}
