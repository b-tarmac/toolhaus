"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { ToolConfig } from "@portfolio/tool-sdk";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PrivacyBadge } from "@/components/ui/PrivacyBadge";
import { RelatedTools } from "./RelatedTools";
import { FreeAccountNudge } from "@/components/billing/FreeAccountNudge";
import { WorkspaceProvider } from "@/components/workspaces/WorkspaceContext";
import { WorkspaceSaver } from "@/components/workspaces/WorkspaceSaver";
import { ToolSeoContent } from "./ToolSeoContent";
import { ToolSkeleton } from "./ToolSkeleton";
import { ShareLinkManager } from "@/components/share/ShareLinkManager";
import { Sparkles } from "lucide-react";

interface ToolShellProps {
  tool: ToolConfig;
  children: React.ReactNode;
  initialWorkspaceState?: Record<string, unknown> | null;
  readOnly?: boolean;
  shareLinkBanner?: React.ReactNode;
}

export function ToolShell({
  tool,
  children,
  initialWorkspaceState: propInitialState,
  readOnly = false,
  shareLinkBanner,
}: ToolShellProps) {
  const { user } = useAuth();
  const isPro = (user?.publicMetadata?.plan as string) === "pro";
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspace");
  const [initialWorkspaceState, setInitialWorkspaceState] = useState<
    Record<string, unknown> | null
  >(null);

  useEffect(() => {
    if (propInitialState) return;
    if (!workspaceId || !user) return;
    fetch(`/api/workspaces/${workspaceId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.stateJson) {
          try {
            setInitialWorkspaceState(JSON.parse(data.stateJson));
          } catch {
            // ignore parse errors
          }
        }
      })
      .catch(() => {});
  }, [workspaceId, user, propInitialState]);

  const effectiveInitialState = propInitialState ?? initialWorkspaceState;

  return (
    <div className={`min-h-screen gradient-bg ${isPro ? "is-pro" : ""}`}>
      <Navbar />
      <main id="main-content" className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">{tool.name}</h1>
                <PrivacyBadge />
                {tool.isAiEra && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#9333ea]/20 bg-purple-50 px-2 py-0.5 text-xs font-bold text-[#9333ea]">
                    <Sparkles className="h-3 w-3" />
                    AI Era
                  </span>
                )}
                {tool.isNew && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    New
                  </span>
                )}
              </div>
              <p className="text-slate-500">{tool.description}</p>
            </div>

            <WorkspaceProvider
              toolSlug={tool.slug}
              initialWorkspaceState={effectiveInitialState}
              readOnly={readOnly}
            >
              {shareLinkBanner}
              <Suspense fallback={<ToolSkeleton />}>{children}</Suspense>

              <WorkspaceSaver />
              <ShareLinkManager />

              <ToolSeoContent tool={tool} />
            </WorkspaceProvider>
          </div>

          <aside className="hidden w-72 shrink-0 lg:block">
            <RelatedTools slugs={tool.relatedTools} />
          </aside>
        </div>
      </main>
      {!isPro && <FreeAccountNudge />}
      <Footer />
    </div>
  );
}
