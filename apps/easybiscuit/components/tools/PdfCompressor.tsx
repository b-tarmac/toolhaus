"use client";

import { useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import { compressPdf } from "@/lib/tools/pdf/compressor";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Download } from "lucide-react";

export default function PdfCompressor(props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("pdf-compressor");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompress = async () => {
    if (!file) return;
    if (!usage.allowed && !usage.isPro) {
      usage.setShowUpgradePrompt(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const compressed = await compressPdf(file);
      const blob = new Blob([new Uint8Array(compressed)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "-compressed.pdf");
      a.click();
      URL.revokeObjectURL(url);
      if (!usage.isPro) await usage.recordUsage();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <UpgradePrompt
        toolName="PDF Compressor"
        remaining={usage.remaining ?? 0}
        tier={usage.tier as "anonymous" | "free"}
        open={usage.showUpgradePrompt}
        onClose={() => usage.setShowUpgradePrompt(false)}
      />
      <FileDropzone
        accept={["application/pdf"]}
        maxSize={isPro ? 100 * 1024 * 1024 : 15 * 1024 * 1024}
        onFiles={(f) => setFile(f[0] ?? null)}
        isPro={!!isPro}
      />
      {file && (
        <div className="flex items-center gap-4">
          <p className="text-sm">{file.name}</p>
          <Button onClick={handleCompress} disabled={loading}>
            <Download className="h-4 w-4" />
            {loading ? "Compressing…" : "Compress & Download"}
          </Button>
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
