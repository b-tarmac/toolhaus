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

interface UpgradePromptProps {
  toolName: string;
  remaining: number;
  tier: "anonymous" | "free";
  onClose: () => void;
  open: boolean;
}

export function UpgradePrompt({
  toolName,
  remaining,
  tier,
  onClose,
  open,
}: UpgradePromptProps) {
  const isAnonymous = tier === "anonymous";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {remaining === 0 ? "Daily limit reached" : "Almost there"}
          </DialogTitle>
          <DialogDescription>
            {remaining === 0 ? (
              <>
                You&apos;ve used all your free {toolName} uses for today.
                {isAnonymous
                  ? " Create a free account for more daily uses, or upgrade to Pro for unlimited access."
                  : " Upgrade to Pro for unlimited access to all tools."}
              </>
            ) : (
              <>
                You have {remaining} free {toolName} use
                {remaining === 1 ? "" : "s"} left today.
                {isAnonymous
                  ? " Create a free account for more daily uses."
                  : " Upgrade to Pro for unlimited access."}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Maybe later
          </Button>
          <Button asChild>
            <Link href={isAnonymous && remaining === 0 ? "/sign-up" : "/pricing"}>
              {isAnonymous && remaining === 0
                ? "Create free account"
                : "Upgrade to Pro"}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
