import { useState, useMemo } from "react";
import { encodeBase64, decodeBase64 } from "@tools/base64";
import { OpenInBrowser } from "../OpenInBrowser";

export function MiniBase64() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("decode");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return mode === "encode"
      ? encodeBase64(input, false)
      : decodeBase64(input, false);
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
          className={mode === "encode" ? "active" : ""}
          onClick={() => setMode("encode")}
        >
          Encode
        </button>
        <button
          type="button"
          className={mode === "decode" ? "active" : ""}
          onClick={() => setMode("decode")}
        >
          Decode
        </button>
      </div>
      <textarea
        className="mini-tool-input"
        placeholder={mode === "encode" ? "Text to encode..." : "Base64 to decode..."}
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
        <OpenInBrowser toolSlug="base64-tool" input={input}>
          Open in Browser
        </OpenInBrowser>
      </div>
    </div>
  );
}
