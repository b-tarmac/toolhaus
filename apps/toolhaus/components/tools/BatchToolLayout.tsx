"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BatchProcessor } from "./BatchProcessor";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useUpgradePrompt } from "@/hooks/useUpgradePrompt";
import type { BatchToolSlug } from "@/lib/tools/batch/types";
import type { BatchOptions } from "@/lib/tools/batch/types";

interface BatchToolLayoutProps {
  toolSlug: BatchToolSlug;
  toolName: string;
  isPro: boolean;
  singleContent: React.ReactNode;
  batchOptions?: BatchOptions;
  batchOptionsForm?: React.ReactNode;
  batchPlaceholder?: string;
}

export function BatchToolLayout({
  toolSlug,
  toolName,
  isPro,
  singleContent,
  batchOptions = {},
  batchOptionsForm,
  batchPlaceholder,
}: BatchToolLayoutProps) {
  const [tab, setTab] = useState<"single" | "batch">("single");
  const { upgradePromptOpen, upgradePromptProps, openUpgradePrompt } = useUpgradePrompt();

  const handleBatchClick = () => {
    if (!isPro) {
      openUpgradePrompt("batch");
      return;
    }
    setTab("batch");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={tab === "single" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("single")}
        >
          Single
        </Button>
        <Button
          variant={tab === "batch" ? "default" : "outline"}
          size="sm"
          onClick={handleBatchClick}
        >
          Batch
        </Button>
      </div>

      {tab === "single" && singleContent}
      {tab === "batch" && isPro && (
        <BatchProcessor
          toolSlug={toolSlug}
          toolName={toolName}
          options={batchOptions}
          optionsForm={batchOptionsForm}
          placeholder={batchPlaceholder}
        />
      )}

      <UpgradePrompt {...upgradePromptProps} />
    </div>
  );
}
