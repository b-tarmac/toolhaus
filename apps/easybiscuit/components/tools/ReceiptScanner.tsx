"use client";

import { useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import type { ParsedInvoice } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import { processDocument } from "@/lib/tools/ocr";
import { exportToCsv } from "@/lib/tools/ocr/export";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReceiptScanner(_props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("receipt-scanner");
  const [result, setResult] = useState<ParsedInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!usage.allowed && !usage.isPro) {
      usage.setShowUpgradePrompt(true);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    const onProgress = (e: CustomEvent<{ progress: number }>) =>
      setProgress(e.detail.progress);
    if (typeof window !== "undefined") {
      window.addEventListener("ocr-progress", onProgress as EventListener);
    }
    try {
      const parsed = await processDocument(file);
      setResult(parsed);
      if (!usage.isPro) await usage.recordUsage();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setProgress(0);
      if (typeof window !== "undefined") {
        window.removeEventListener("ocr-progress", onProgress as EventListener);
      }
    }
  };

  const downloadCsv = () => {
    if (!result) return;
    const csv = exportToCsv(result);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipt-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const confidenceBadge = (c: number) => {
    const cls =
      c >= 90
        ? "bg-green-100 text-green-800"
        : c >= 70
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800";
    return (
      <span className={cn("rounded px-2 py-0.5 text-xs font-medium", cls)}>
        {c}% confidence
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <UpgradePrompt
        toolName="Receipt Scanner"
        remaining={usage.remaining ?? 0}
        tier={usage.tier as "anonymous" | "free"}
        open={usage.showUpgradePrompt}
        onClose={() => usage.setShowUpgradePrompt(false)}
      />
      <FileDropzone
        accept={["application/pdf", "image/jpeg", "image/png", "image/heic"]}
        maxSize={isPro ? 100 * 1024 * 1024 : 15 * 1024 * 1024}
        onFiles={(f) => handleProcess(f)}
        isPro={!!isPro}
      />
      {loading && (
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full bg-amber-600 transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">Scanning receipt…</p>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {confidenceBadge(result.confidence)}
            <Button size="sm" onClick={downloadCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-medium">Vendor</h3>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{result.vendor.name}</p>
              {result.vendor.address && (
                <p className="text-sm text-muted-foreground">{result.vendor.address}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-medium">Expense Details</h3>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Date: {result.invoice.date}</p>
              <p>Total: {result.totals.total.toFixed(2)} {result.invoice.currency}</p>
            </CardContent>
          </Card>
          {result.lineItems.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Items</h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {result.lineItems.map((item, i) => (
                    <li key={i}>
                      {item.description} — {item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
