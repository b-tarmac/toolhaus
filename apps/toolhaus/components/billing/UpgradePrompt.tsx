"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type UpgradePromptFeature =
  | "batch"
  | "cli"
  | "api"
  | "workspaces"
  | "share-links"
  | "history";

const FEATURE_COPY: Record<UpgradePromptFeature, string> = {
  batch: "Process thousands of items at once. Download results as CSV.",
  cli: "Run Toolhaus from your terminal. Pipe any tool into your workflow.",
  api: "Automate Toolhaus with the API. 1,000 requests/day included.",
  workspaces: "Free accounts can save 1 workspace per tool. Pro is unlimited.",
  "share-links": "Share persistent named links that never break.",
  history: "Unlimited history — every result, always available.",
};

interface UpgradePromptProps {
  feature: UpgradePromptFeature;
  open: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export function UpgradePrompt({
  feature,
  open,
  onClose,
  onUpgrade,
}: UpgradePromptProps) {
  const copy = FEATURE_COPY[feature];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pro feature</DialogTitle>
          <DialogDescription>{copy}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Maybe later
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/pricing" onClick={onUpgrade}>
              Upgrade to Pro — $7/month
            </Link>
          </Button>
        </DialogFooter>
        <p className="text-xs text-slate-500 text-center">
          or $49/year — save 42%
        </p>
        <Link
          href="/pricing"
          className="text-xs text-slate-500 hover:text-slate-700 underline text-center block"
        >
          View all Pro features →
        </Link>
      </DialogContent>
    </Dialog>
  );
}
