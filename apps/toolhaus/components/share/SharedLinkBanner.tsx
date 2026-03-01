"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface SharedLinkBannerProps {
  name: string;
  toolSlug: string;
}

export function SharedLinkBanner({ name, toolSlug }: SharedLinkBannerProps) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-[#4f46e5]/30 bg-[#4f46e5]/5 px-4 py-3">
      <p className="text-sm text-slate-600">
        <span className="font-medium text-slate-800">Viewing shared link:</span>{" "}
        {name}
      </p>
      <Button size="sm" variant="outline" asChild>
        <Link href={`/tools/${toolSlug}`}>
          Open in Toolhaus to edit
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
