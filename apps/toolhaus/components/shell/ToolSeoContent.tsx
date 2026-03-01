"use client";

import Link from "next/link";
import type { ToolConfig } from "@portfolio/tool-sdk";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RelatedTools } from "./RelatedTools";
import { TOOL_ABOUT_CONTENT } from "@/lib/tool-about-content";

interface ToolSeoContentProps {
  tool: ToolConfig;
}

const DEFAULT_ABOUT =
  "This tool processes your data entirely in your browser. No information is sent to Toolhaus servers. Common use cases include development workflows, debugging, and data transformation. All processing is client-side for maximum privacy and speed.";

export function ToolSeoContent({ tool }: ToolSeoContentProps) {
  const aboutText = TOOL_ABOUT_CONTENT[tool.slug] ?? DEFAULT_ABOUT;

  return (
    <div className="mt-12 space-y-8 border-t pt-8">
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          About {tool.name}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {aboutText}
        </p>
      </section>

      {tool.schema.faqs.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            {tool.schema.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold">Related Tools</h2>
        <RelatedTools slugs={tool.relatedTools} variant="grid" />
        <p className="mt-4">
          <Link
            href="/tools"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Browse all tools →
          </Link>
        </p>
      </section>

      {tool.libraryCredits && tool.libraryCredits.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Powered by {tool.libraryCredits.join(", ")}
        </p>
      )}
    </div>
  );
}
