import { useState, useEffect } from "react";
import { hashAll } from "@tools/hash";
import { OpenInBrowser } from "../OpenInBrowser";

export function MiniHashGenerator() {
  const [input, setInput] = useState("");
  const [sha256, setSha256] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setSha256(null);
      return;
    }
    let cancelled = false;
    hashAll(input).then((hashes) => {
      if (!cancelled) {
        setSha256(hashes["SHA-256"] ?? null);
      }
    }).catch(() => {
      if (!cancelled) setSha256(null);
    });
    return () => { cancelled = true; };
  }, [input]);

  const handleCopy = () => {
    if (sha256) {
      navigator.clipboard.writeText(sha256);
    }
  };

  return (
    <div className="mini-tool">
      <textarea
        className="mini-tool-input"
        placeholder="Text to hash (SHA-256)..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
      />
      <div className="mini-tool-output-wrap">
        <pre className="mini-tool-output">
          {sha256 ?? "—"}
        </pre>
      </div>
      <div className="mini-tool-actions">
        {sha256 && (
          <button type="button" onClick={handleCopy}>
            Copy
          </button>
        )}
        <OpenInBrowser toolSlug="hash-generator" input={input}>
          Open in Browser
        </OpenInBrowser>
      </div>
    </div>
  );
}
