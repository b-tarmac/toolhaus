import { useState, useMemo } from "react";
import { decodeJwt } from "@tools/jwt";
import { OpenInBrowser } from "../OpenInBrowser";

export function MiniJwtDecoder() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return decodeJwt(input);
  }, [input]);

  const handleCopy = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  const expired = result?.isValid && result?.metadata?.expired;

  return (
    <div className="mini-tool">
      <textarea
        className="mini-tool-input"
        placeholder="Paste JWT token..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
      />
      <div className="mini-tool-output-wrap">
        <pre
          className={`mini-tool-output ${result && !result.isValid ? "error" : ""} ${expired ? "expired" : ""}`}
        >
          {result
            ? result.isValid
              ? result.output
              : result.error?.message ?? "Invalid JWT"
            : "—"}
        </pre>
      </div>
      <div className="mini-tool-actions">
        {result?.output && (
          <button type="button" onClick={handleCopy}>
            Copy
          </button>
        )}
        <OpenInBrowser toolSlug="jwt-decoder" input={input}>
          Open in Browser
        </OpenInBrowser>
      </div>
    </div>
  );
}
