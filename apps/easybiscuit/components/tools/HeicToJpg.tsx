"use client";

import { useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import { convertHeicToJpeg } from "@/lib/tools/image/heic-converter";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Download } from "lucide-react";

export default function HeicToJpg(_props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("heic-to-jpg");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    if (!usage.allowed && !usage.isPro) {
      usage.setShowUpgradePrompt(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const blob = await convertHeicToJpeg(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.[^.]+$/i, ".jpg");
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
        toolName="HEIC to JPG"
        remaining={usage.remaining ?? 0}
        tier={usage.tier as "anonymous" | "free"}
        open={usage.showUpgradePrompt}
        onClose={() => usage.setShowUpgradePrompt(false)}
      />
      <FileDropzone
        accept={["image/heic", "image/heif"]}
        maxSize={isPro ? 100 * 1024 * 1024 : 15 * 1024 * 1024}
        onFiles={(f) => setFile(f[0] ?? null)}
        isPro={!!isPro}
      />
      {file && (
        <div className="flex items-center gap-4">
          <p className="text-sm">{file.name}</p>
          <Button onClick={handleConvert} disabled={loading}>
            <Download className="h-4 w-4" />
            {loading ? "Converting…" : "Convert to JPG"}
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
