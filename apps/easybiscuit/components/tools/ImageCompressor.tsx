"use client";

import { useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import { compressImage } from "@/lib/tools/image/compressor";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ImageCompressor(_props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("image-compressor");
  const [file, setFile] = useState<File | null>(null);
  const [maxSizeMB, setMaxSizeMB] = useState("1");
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
      const size = parseFloat(maxSizeMB) || 1;
      const blob = await compressImage(file, { maxSizeMB: size });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/i, "-compressed.jpg");
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
        toolName="Image Compressor"
        remaining={usage.remaining ?? 0}
        tier={usage.tier as "anonymous" | "free"}
        open={usage.showUpgradePrompt}
        onClose={() => usage.setShowUpgradePrompt(false)}
      />
      <FileDropzone
        accept={ACCEPT}
        maxSize={isPro ? 100 * 1024 * 1024 : 15 * 1024 * 1024}
        onFiles={(f) => setFile(f[0] ?? null)}
        isPro={!!isPro}
      />
      {file && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Max size (MB)</label>
            <Input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={maxSizeMB}
              onChange={(e) => setMaxSizeMB(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm">{file.name}</p>
            <Button onClick={handleCompress} disabled={loading}>
              <Download className="h-4 w-4" />
              {loading ? "Compressing…" : "Compress & Download"}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
