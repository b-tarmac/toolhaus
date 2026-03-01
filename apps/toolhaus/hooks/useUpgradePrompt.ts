"use client";

import { useState, useCallback } from "react";
import type { UpgradePromptFeature } from "@/components/billing/UpgradePrompt";

/**
 * Hook for programmatically opening the UpgradePrompt modal.
 * Returns open state, open/close handlers, and props to pass to UpgradePrompt.
 */
export function useUpgradePrompt() {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<UpgradePromptFeature>("cli");

  const openUpgradePrompt = useCallback((f: UpgradePromptFeature) => {
    setFeature(f);
    setOpen(true);
  }, []);

  const closeUpgradePrompt = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    upgradePromptOpen: open,
    upgradePromptFeature: feature,
    openUpgradePrompt,
    closeUpgradePrompt,
    upgradePromptProps: {
      feature,
      open,
      onClose: closeUpgradePrompt,
    },
  };
}
