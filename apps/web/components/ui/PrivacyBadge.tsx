"use client";

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
          <span className="inline-flex cursor-help items-center gap-1 rounded-full border border-emerald-200 px-2 py-0.5 text-xs text-emerald-600">
            <ShieldCheck className="h-3 w-3" />
            Processed locally
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">
            All processing happens in your browser. No data is sent to Toolhaus
            servers.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
