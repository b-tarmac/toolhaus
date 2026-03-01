import type { ComponentType } from "react";

// ─── Toolhaus types ──────────────────────────────────────────────────────────

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

// ─── Shared billing / plan types ─────────────────────────────────────────────

export type UserPlan = "free" | "pro";

export interface PlanMetadata {
  plan: UserPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planExpiresAt?: number;
}

// ─── EasyBiscuit types ────────────────────────────────────────────────────────

export type EasyBiscuitToolCategory =
  | "business"
  | "calculators"
  | "pdf"
  | "image"
  | "writing";

export interface ToolLimits {
  /** ops per limitPeriod. null = unlimited */
  anonymous: number | null;
  free: number | null;
  pro: number | null;
}

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface EasyBiscuitToolConfig {
  slug: string;
  name: string;
  description: string;
  /** 200–400 word SEO content shown below the tool interface */
  about: string;
  category: EasyBiscuitToolCategory;
  /** Lucide icon name */
  icon: string;
  tags: string[];
  limits: ToolLimits;
  limitPeriod: "day" | "month";
  component: React.LazyExoticComponent<ComponentType<EasyBiscuitToolProps>>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
    faqs: ToolFAQ[];
  };
}

export interface EasyBiscuitToolProps {
  isPro?: boolean;
}

// ─── EasyBiscuit domain types ─────────────────────────────────────────────────

export interface ParsedInvoice {
  vendor: {
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
  };
  invoice: {
    number: string;
    date: string;
    dueDate: string;
    terms: string;
    currency: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totals: {
    subtotal: number;
    tax: number;
    taxRate: string;
    discount: number;
    total: number;
  };
  /** OCR confidence score 0–100. 100 for digital PDF text extraction. */
  confidence: number;
  rawText: string;
}

export interface InvoiceData {
  business: {
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    logo?: string;
  };
  client: {
    name: string;
    email: string;
    address: string;
    taxId?: string;
  };
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  notes?: string;
  paymentTerms?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface SavedClient {
  id: string;
  name: string;
  email: string;
  address: string;
  taxId?: string;
  paymentTerms: string;
}
