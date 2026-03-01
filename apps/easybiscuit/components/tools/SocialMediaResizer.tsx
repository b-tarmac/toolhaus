"use client";

import { useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import {
  resizeImage,
  SOCIAL_SIZES,
} from "@/lib/tools/image/resizer";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Download } from "lucide-react";

const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function SocialMediaResizer(_props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("social-media-resizer");
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<string>("instagram-post");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResize = async () => {
    if (!file) return;
    if (!usage.allowed && !usage.isPro) {
      usage.setShowUpgradePrompt(true);
      return;
    }
    const size = SOCIAL_SIZES[preset];
    if (!size) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await resizeImage(file, size.width, size.height);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${preset}-${file.name.replace(/\.[^.]+$/i, "")}.jpg`;
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
        toolName="Social Media Resizer"
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
            <label className="mb-1 block text-sm font-medium">Platform / Size</label>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {Object.entries(SOCIAL_SIZES).map(([key, { label, width, height }]) => (
                <option key={key} value={key}>
                  {label} ({width}×{height})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm">{file.name}</p>
            <Button onClick={handleResize} disabled={loading}>
              <Download className="h-4 w-4" />
              {loading ? "Resizing…" : "Resize & Download"}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
