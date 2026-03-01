"use client";

import { useState, useCallback } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import type { InvoiceData } from "@portfolio/tool-sdk";
import { useToolUsage } from "@/lib/use-tool-usage";
import { generateInvoicePdf } from "@/lib/tools/invoice/generator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/billing/UpgradePrompt";
import { useAuth } from "@/lib/auth-context";
import { Download, Plus, Trash2 } from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);
const nextMonth = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

export default function InvoiceGenerator(_props: EasyBiscuitToolProps) {
  const { user } = useAuth();
  const usage = useToolUsage("invoice-generator");
  const [business, setBusiness] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    logo: "",
  });
  const [client, setClient] = useState({
    name: "",
    email: "",
    address: "",
    taxId: "",
  });
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(nextMonth());
  const [currency, setCurrency] = useState("GBP");
  const [taxRate, setTaxRate] = useState("20");
  const [notes, setNotes] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [error, setError] = useState<string | null>(null);

  const addLine = () =>
    setLineItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeLine = (i: number) =>
    setLineItems((prev) => prev.filter((_, j) => j !== i));
  const updateLine = (i: number, f: Partial<(typeof lineItems)[0]>) =>
    setLineItems((prev) =>
      prev.map((item, j) => (j === i ? { ...item, ...f } : item))
    );

  const handleLogo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setBusiness((b) => ({ ...b, logo: r.result as string }));
    r.readAsDataURL(f);
  }, []);

  const handleGenerate = async () => {
    if (!usage.allowed && !usage.isPro) {
      usage.setShowUpgradePrompt(true);
      return;
    }
    setError(null);
    const data: InvoiceData = {
      business: {
        name: business.name || "Your Business",
        email: business.email || "",
        phone: business.phone || "",
        address: business.address || "",
        taxId: business.taxId || "",
        logo: business.logo || undefined,
      },
      client: {
        name: client.name || "Client",
        email: client.email || "",
        address: client.address || "",
        taxId: client.taxId || undefined,
      },
      invoiceNumber: invoiceNumber || "INV-001",
      issueDate: issueDate || today(),
      dueDate: dueDate || nextMonth(),
      currency,
      taxRate: parseFloat(taxRate) || 0,
      notes: notes || undefined,
      paymentTerms: paymentTerms || undefined,
      lineItems: lineItems
        .filter((i) => i.description.trim())
        .map((i) => ({
          description: i.description,
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || 0,
        })),
    };
    if (data.lineItems.length === 0) {
      setError("Add at least one line item.");
      return;
    }
    try {
      const pdf = await generateInvoicePdf(data);
      const blob = new Blob([new Uint8Array(pdf)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      if (!usage.isPro) await usage.recordUsage();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="space-y-6">
      <UpgradePrompt
        toolName="Invoice Generator"
        remaining={usage.remaining ?? 0}
        tier={usage.tier as "anonymous" | "free"}
        open={usage.showUpgradePrompt}
        onClose={() => usage.setShowUpgradePrompt(false)}
      />
      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium">Your Business</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Logo</label>
            <input type="file" accept="image/*" onChange={handleLogo} className="text-sm" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Business Name</label>
              <Input
                value={business.name}
                onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
                placeholder="Acme Ltd"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={business.email}
                onChange={(e) => setBusiness((b) => ({ ...b, email: e.target.value }))}
                placeholder="hello@acme.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phone</label>
              <Input
                value={business.phone}
                onChange={(e) => setBusiness((b) => ({ ...b, phone: e.target.value }))}
                placeholder="+44 20 1234 5678"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Input
                value={business.address}
                onChange={(e) => setBusiness((b) => ({ ...b, address: e.target.value }))}
                placeholder="123 High Street, London"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tax ID / VAT</label>
              <Input
                value={business.taxId}
                onChange={(e) => setBusiness((b) => ({ ...b, taxId: e.target.value }))}
                placeholder="GB123456789"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium">Client</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Client Name</label>
              <Input
                value={client.name}
                onChange={(e) => setClient((c) => ({ ...c, name: e.target.value }))}
                placeholder="Client Ltd"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={client.email}
                onChange={(e) => setClient((c) => ({ ...c, email: e.target.value }))}
                placeholder="billing@client.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Address</label>
              <Input
                value={client.address}
                onChange={(e) => setClient((c) => ({ ...c, address: e.target.value }))}
                placeholder="456 Client Road"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium">Invoice Details</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Invoice #</label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Issue Date</label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="GBP">GBP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tax Rate (%)</label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Payment Terms</label>
              <Input
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Net 30"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Optional notes"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-sm font-medium">Line Items</h3>
          <Button size="sm" variant="outline" onClick={addLine}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {lineItems.map((item, i) => (
            <div key={i} className="flex flex-wrap gap-2 rounded border p-3">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLine(i, { description: e.target.value })}
                className="flex-1 min-w-[150px]"
              />
              <Input
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity || ""}
                onChange={(e) => updateLine(i, { quantity: parseInt(e.target.value) || 0 })}
                className="w-20"
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Unit price"
                value={item.unitPrice || ""}
                onChange={(e) => updateLine(i, { unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-24"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeLine(i)}
                disabled={lineItems.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleGenerate}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
}
