"use client";

import type { ToolShellToolMeta } from "./ToolShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RelatedTools } from "./RelatedTools";
import Link from "next/link";

interface ToolSeoContentProps {
  tool: ToolShellToolMeta;
}

export function ToolSeoContent({ tool }: ToolSeoContentProps) {
  return (
    <div className="mt-12 space-y-8 border-t border-amber-100 pt-8">
      <section>
        <h2 className="mb-4 text-xl font-semibold">About {tool.name}</h2>
        <p className="text-muted-foreground leading-relaxed">{tool.about}</p>
      </section>

      {tool.seo.faqs.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            {tool.seo.faqs.map((faq, i) => (
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
        <RelatedTools
          category={tool.category}
          currentSlug={tool.slug}
          variant="grid"
        />
        <p className="mt-4">
          <Link
            href="/tools"
            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            Browse all tools →
          </Link>
        </p>
      </section>
    </div>
  );
}
