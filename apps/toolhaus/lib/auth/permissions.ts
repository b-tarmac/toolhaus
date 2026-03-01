/**
 * Tier-based permissions for Toolhaus.
 * Used to gate features across anonymous, free, and pro tiers.
 */
export const TIER_PERMISSIONS = {
  anonymous: {
    tools: "all" as const,
    history: false,
    workspaces: false,
    batchProcessing: false,
    apiAccess: false,
    cliAccess: false,
    shareLinks: "url-only" as const,
    fileSizeLimit: 15 * 1024 * 1024, // 15MB
  },
  free: {
    tools: "all" as const,
    history: true,
    workspaces: true,
    batchProcessing: false,
    apiAccess: false,
    cliAccess: false,
    shareLinks: "url-only" as const,
    fileSizeLimit: 15 * 1024 * 1024,
  },
  pro: {
    tools: "all" as const,
    history: true,
    workspaces: true,
    batchProcessing: true,
    apiAccess: true,
    cliAccess: true,
    shareLinks: "persistent" as const,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
  },
} as const;
