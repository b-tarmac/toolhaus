"use client";

import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import type { ToolConfig } from "@toolhaus/tool-sdk";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PrivacyBadge } from "@/components/ui/PrivacyBadge";
import { EthicalAdsUnit } from "./EthicalAdsUnit";
import { RelatedTools } from "./RelatedTools";
import { ProUpsellCard } from "./ProUpsellCard";
import { ToolSeoContent } from "./ToolSeoContent";
import { ToolSkeleton } from "./ToolSkeleton";
import { Sparkles } from "lucide-react";

interface ToolShellProps {
  tool: ToolConfig;
  children: React.ReactNode;
}

export function ToolShell({ tool, children }: ToolShellProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";

  return (
    <div className={`min-h-screen bg-background ${isPro ? "is-pro" : ""}`}>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{tool.name}</h1>
                <PrivacyBadge />
                {tool.isAiEra && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
                    <Sparkles className="h-3 w-3" />
                    AI Era
                  </span>
                )}
                {tool.isNew && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    New
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{tool.description}</p>
            </div>

            <Suspense fallback={<ToolSkeleton />}>{children}</Suspense>

            <ToolSeoContent tool={tool} />
          </div>

          <aside className="hidden w-72 shrink-0 lg:block">
            {!isPro && <EthicalAdsUnit />}
            <RelatedTools slugs={tool.relatedTools} />
            {!isPro && <ProUpsellCard />}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
