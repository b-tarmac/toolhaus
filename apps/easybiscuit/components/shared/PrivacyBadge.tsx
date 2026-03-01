"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PrivacyBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/privacy"
            className="inline-flex cursor-help items-center gap-1 rounded-full border border-emerald-200 px-2 py-0.5 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors"
          >
            <ShieldCheck className="h-3 w-3" />
            Processed locally
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">
            All processing happens in your browser. No data is sent to EasyBiscuit
            servers. Your files never leave your device.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
