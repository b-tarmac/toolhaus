"use client";

import { useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function EmailSignatureGenerator(_props: EasyBiscuitToolProps) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [copied, setCopied] = useState(false);

  const html = `
<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5;">
  <p style="margin: 0 0 4px 0; font-weight: bold;">${name || "Your Name"}</p>
  ${title ? `<p style="margin: 0 0 4px 0; color: #666;">${title}</p>` : ""}
  ${company ? `<p style="margin: 0 0 4px 0;">${company}</p>` : ""}
  ${email ? `<p style="margin: 0 0 4px 0;"><a href="mailto:${email}" style="color: #d97706;">${email}</a></p>` : ""}
  ${phone ? `<p style="margin: 0 0 4px 0;">${phone}</p>` : ""}
  ${website ? `<p style="margin: 0;"><a href="${website.startsWith("http") ? website : `https://${website}`}" style="color: #d97706;">${website}</a></p>` : ""}
</div>`.trim();

  const copy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Job Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Marketing Manager"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Company</label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Ltd"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@acme.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 20 1234 5678"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Website</label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="acme.com"
          />
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h3 className="text-sm font-medium">Preview</h3>
          <Button size="sm" onClick={copy}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? " Copied!" : " Copy HTML"}
          </Button>
        </CardHeader>
        <CardContent>
          <div
            className="rounded border bg-white p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Paste the copied HTML into your email client&apos;s signature settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
