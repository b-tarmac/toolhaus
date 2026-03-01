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

export default function InvoiceParser(_props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("invoice-parser");
  const [result, setResult] = useState<ParsedInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

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
    a.download = "invoice-data.csv";
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
    const label =
      c >= 90 ? "High confidence" : c >= 70 ? "Review recommended" : "Low confidence";
    return (
      <span className={cn("rounded px-2 py-0.5 text-xs font-medium", cls)}>
        {label} ({c}%)
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <UpgradePrompt
        toolName="Invoice Parser"
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
          <p className="text-sm text-muted-foreground">Extracting text…</p>
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
            <CardContent className="space-y-1 text-sm">
              <p><strong>{result.vendor.name}</strong></p>
              {result.vendor.address && <p>{result.vendor.address}</p>}
              {result.vendor.email && <p>{result.vendor.email}</p>}
              {result.vendor.phone && <p>{result.vendor.phone}</p>}
              {result.vendor.taxId && <p>Tax ID: {result.vendor.taxId}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-sm font-medium">Invoice</h3>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p># {result.invoice.number}</p>
              <p>Date: {result.invoice.date}</p>
              <p>Due: {result.invoice.dueDate}</p>
              <p>Currency: {result.invoice.currency}</p>
            </CardContent>
          </Card>
          {result.lineItems.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-medium">Line Items</h3>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left">Description</th>
                      <th className="pb-2 text-right">Qty</th>
                      <th className="pb-2 text-right">Unit</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.lineItems.map((item, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-1">{item.description}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{item.unitPrice.toFixed(2)}</td>
                        <td className="text-right">{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-medium">Totals</h3>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>Subtotal: {result.totals.subtotal.toFixed(2)}</p>
              <p>Tax: {result.totals.tax.toFixed(2)}</p>
              <p><strong>Total: {result.totals.total.toFixed(2)}</strong></p>
            </CardContent>
          </Card>
          <div>
            <button
              type="button"
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm text-amber-600 hover:underline"
            >
              {showRaw ? "Hide" : "Show"} raw extracted text
            </button>
            {showRaw && (
              <pre className="mt-2 max-h-48 overflow-auto rounded border bg-muted/30 p-3 text-xs">
                {result.rawText}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
