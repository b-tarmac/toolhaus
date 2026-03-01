"use client";

import { useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import { mergePdfs } from "@/lib/tools/pdf/merger";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Download, X } from "lucide-react";

export default function PdfMerger(props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("pdf-merger");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Add at least 2 PDF files to merge.");
      return;
    }
    if (!usage.allowed && !usage.isPro) {
      usage.setShowUpgradePrompt(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const merged = await mergePdfs(files);
      const blob = new Blob([new Uint8Array(merged)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(url);
      if (!usage.isPro) await usage.recordUsage();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, j) => j !== i));
  };

  return (
    <div className="space-y-4">
      <UpgradePrompt
        toolName="PDF Merger"
        remaining={usage.remaining ?? 0}
        tier={usage.tier as "anonymous" | "free"}
        open={usage.showUpgradePrompt}
        onClose={() => usage.setShowUpgradePrompt(false)}
      />
      <FileDropzone
        accept={["application/pdf"]}
        maxSize={isPro ? 100 * 1024 * 1024 : 15 * 1024 * 1024}
        multiple
        onFiles={(f) => setFiles((prev) => [...prev, ...f])}
        isPro={!!isPro}
      />
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Files ({files.length})</p>
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded border bg-muted/30 px-3 py-2 text-sm"
              >
                {f.name}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <Button onClick={handleMerge} disabled={loading}>
            <Download className="h-4 w-4" />
            {loading ? "Merging…" : "Merge & Download"}
          </Button>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
