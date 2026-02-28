"use client";

import { Button } from "@/components/ui/button";
import { Copy, Download, Share2, Trash2 } from "lucide-react";

interface ToolActionBarProps {
  onCopy?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function ToolActionBar({
  onCopy,
  onDownload,
  onShare,
  onClear,
  disabled = false,
}: ToolActionBarProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {onCopy && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={disabled}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      )}
      {onDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={disabled}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      )}
      {onShare && (
        <Button
          variant="outline"
          size="sm"
          onClick={onShare}
          disabled={disabled}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Link
        </Button>
      )}
      {onClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={disabled}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
