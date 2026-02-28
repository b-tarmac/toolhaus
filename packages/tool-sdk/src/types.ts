import type { ComponentType } from "react";

export interface ToolResult {
  output: string;
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  metadata?: Record<string, unknown>;
}

export interface HistoryEntry {
  id: string;
  toolSlug: string;
  input: string;
  createdAt: number;
}

export interface ToolProps {
  isPro?: boolean;
  onHistorySave?: (entry: HistoryEntry) => void;
}

export type ToolCategory =
  | "data-formats"
  | "encoding"
  | "generators"
  | "date-time"
  | "web"
  | "security"
  | "text"
  | "devops"
  | "design"
  | "ai-era"
  | "code"
  | "math";

export interface ToolConfig {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: ToolCategory;
  tags: string[];
  component: React.LazyExoticComponent<ComponentType<ToolProps>>;
  isNew?: boolean;
  isPro?: boolean;
  isAiEra?: boolean;
  schema: {
    faqs: Array<{ question: string; answer: string }>;
    appCategory: "DeveloperApplication" | "UtilitiesApplication";
  };
  relatedTools: string[];
  keywordsForSeo: string[];
  libraryCredits?: string[];
}
