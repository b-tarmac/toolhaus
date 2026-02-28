import { useState, useMemo } from "react";
import { processJson } from "@tools/json";
import { OpenInBrowser } from "../OpenInBrowser";

type Mode = "format" | "minify" | "validate";

export function MiniJsonFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("format");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return processJson(input, { mode, indent: "2" });
  }, [input, mode]);

  const handleCopy = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  return (
    <div className="mini-tool">
      <div className="mini-tool-mode">
        {(["format", "minify", "validate"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? "active" : ""}
            onClick={() => setMode(m)}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      <textarea
        className="mini-tool-input"
        placeholder="Paste JSON..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
      />
      <div className="mini-tool-output-wrap">
        <pre
          className={`mini-tool-output ${result && !result.isValid ? "error" : ""}`}
        >
          {result
            ? result.isValid
              ? result.output || "✓ Valid JSON"
              : result.error?.message ?? "Invalid"
            : "—"}
        </pre>
      </div>
      <div className="mini-tool-actions">
        {result?.output && (
          <button type="button" onClick={handleCopy}>
            Copy
          </button>
        )}
        <OpenInBrowser toolSlug="json-formatter" input={input}>
          Open in Browser
        </OpenInBrowser>
      </div>
    </div>
  );
}
