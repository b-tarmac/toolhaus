"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Download, Type, Pen } from "lucide-react";

const SignatureCanvas = dynamic(
  () => import("react-signature-canvas").then((mod) => mod.default),
  { ssr: false }
);

export default function EsignPdf(_props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const usage = useToolUsage("esign-pdf");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sigRef = useRef<import("react-signature-canvas").default | null>(null);

  const handleSign = async () => {
    if (!file) return;
    if (!usage.allowed && !usage.isPro) {
      usage.setShowUpgradePrompt(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const page = doc.getPage(0);
      const { width, height } = page.getSize();

      let sigDataUrl: string;
      if (mode === "draw" && sigRef.current && !sigRef.current.isEmpty()) {
        sigDataUrl = sigRef.current.toDataURL("image/png");
      } else if (mode === "type" && typedText.trim()) {
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 80;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 300, 80);
        ctx.fillStyle = "black";
        ctx.font = "32px cursive";
        ctx.fillText(typedText, 10, 50);
        sigDataUrl = canvas.toDataURL("image/png");
      } else {
        setError("Draw a signature or enter your name.");
        setLoading(false);
        return;
      }

      const sigImg = await doc.embedPng(
        await fetch(sigDataUrl).then((r) => r.arrayBuffer())
      );
      const sigW = 120;
      const sigH = (sigImg.height / sigImg.width) * sigW;
      page.drawImage(sigImg, {
        x: width - sigW - 50,
        y: 50,
        width: sigW,
        height: sigH,
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, "-signed.pdf");
      a.click();
      URL.revokeObjectURL(url);
      if (!usage.isPro) await usage.recordUsage();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const clearSig = () => {
    sigRef.current?.clear();
    setTypedText("");
  };

  return (
    <div className="space-y-4">
      <UpgradePrompt
        toolName="eSign PDF"
        remaining={usage.remaining ?? 0}
        tier={usage.tier as "anonymous" | "free"}
        open={usage.showUpgradePrompt}
        onClose={() => usage.setShowUpgradePrompt(false)}
      />
      <FileDropzone
        accept={["application/pdf"]}
        maxSize={isPro ? 100 * 1024 * 1024 : 15 * 1024 * 1024}
        onFiles={(f) => {
          setFile(f[0] ?? null);
          clearSig();
        }}
        isPro={!!isPro}
      />
      {file && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "draw" ? "default" : "outline"}
              onClick={() => setMode("draw")}
            >
              <Pen className="h-4 w-4" />
              Draw
            </Button>
            <Button
              size="sm"
              variant={mode === "type" ? "default" : "outline"}
              onClick={() => setMode("type")}
            >
              <Type className="h-4 w-4" />
              Type
            </Button>
          </div>
          {mode === "draw" ? (
            <div className="rounded-lg border bg-white">
              <SignatureCanvas
                ref={sigRef as React.RefObject<import("react-signature-canvas").default>}
                canvasProps={{
                  className: "w-full h-40 rounded-lg",
                  style: { touchAction: "none" },
                }}
                backgroundColor="rgb(255,255,255)"
                penColor="black"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium">Your name</label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type your signature"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearSig}>
              Clear
            </Button>
            <Button onClick={handleSign} disabled={loading}>
              <Download className="h-4 w-4" />
              {loading ? "Signing…" : "Sign & Download"}
            </Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
