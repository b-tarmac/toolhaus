"use client";

import { useCallback, useEffect, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function QrCodeGenerator(_props: EasyBiscuitToolProps) {
  const [content, setContent] = useState("https://easybiscuit.co");
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("qrcode")
      .then((qr) => qr.toString(content, { type: "svg" }))
      .then(setSvg)
      .catch((e) => {
        setError(String(e));
        setSvg("");
      });
  }, [content]);

  const downloadPng = useCallback(async () => {
    try {
      const qr = await import("qrcode");
      const url = await qr.toDataURL(content, { width: 512 });
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
    } catch (e) {
      setError(String(e));
    }
  }, [content]);

  const downloadSvg = useCallback(() => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [svg]);

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          URL, text, or contact info
        </label>
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="https://example.com"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {svg && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">QR Code</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={downloadPng}>
                <Download className="h-4 w-4" />
                PNG
              </Button>
              <Button size="sm" variant="outline" onClick={downloadSvg}>
                <Download className="h-4 w-4" />
                SVG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="flex justify-center rounded border bg-white p-4 [&>svg]:max-w-[256px] [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
