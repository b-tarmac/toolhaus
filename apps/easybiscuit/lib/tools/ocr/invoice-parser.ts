import type { ParsedInvoice } from "@portfolio/tool-sdk";

function extractPattern(text: string, regex: RegExp): string {
  const m = text.match(regex);
  return m ? m[0].trim() : "";
}

function extractAmount(text: string, labels: string[]): number {
  const pattern = new RegExp(
    `(?:${labels.join("|")})[\\s:]*[$€£]?\\s*([\\d,]+\\.?\\d*)`,
    "i"
  );
  const match = text.match(pattern);
  if (!match) return 0;
  return parseFloat(match[1].replace(/,/g, "")) || 0;
}

function extractDate(text: string, labels: string[]): string {
  const lower = text.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(label.toLowerCase());
    if (idx === -1) continue;
    const after = text.slice(idx + label.length);
    const dateMatch = after.match(
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/
    );
    if (dateMatch) return dateMatch[1];
  }
  const anyDate = text.match(
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/
  );
  return anyDate ? anyDate[1] : "";
}

function extractInvoiceNumber(text: string): string {
  const m = text.match(/(?:invoice|inv\.?|#)\s*[:#]?\s*([A-Z0-9\-]+)/i);
  return m ? m[1].trim() : "";
}

function extractTaxId(text: string): string {
  const m = text.match(
    /(?:vat|gst|ein|abn|tax\s*id)[\s:]*([A-Z0-9\-]+)/i
  );
  return m ? m[1].trim() : "";
}

function extractTaxRate(text: string): string {
  const m = text.match(/(\d+(?:\.\d+)?)\s*%\s*(?:vat|gst|tax)/i);
  return m ? `${m[1]}%` : "";
}

function extractVendorName(lines: string[]): string {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.length > 3 && line.length < 80 && !/^\d+$/.test(line)) {
      return line;
    }
  }
  return "";
}

function extractAddress(lines: string[]): string {
  const addr: string[] = [];
  for (let i = 1; i < Math.min(6, lines.length); i++) {
    const line = lines[i];
    if (line.length > 5 && line.length < 100) addr.push(line);
  }
  return addr.join(", ");
}

function extractLineItems(lines: string[]): ParsedInvoice["lineItems"] {
  const items: ParsedInvoice["lineItems"] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const numbers = line.match(/\d+(?:\.\d{2})?/g);
    if (numbers && numbers.length >= 2) {
      const total = parseFloat(numbers[numbers.length - 1]);
      const unitPrice = parseFloat(numbers[numbers.length - 2]);
      const qty = parseFloat(numbers[0]) || 1;
      const description = line.replace(/[\d.,]+/g, "").trim();
      if (total > 0 && description.length > 2) {
        items.push({ description, quantity: qty, unitPrice, total });
      }
    }
  }
  return items;
}

function detectCurrency(text: string): string {
  if (/\£|GBP|pound/i.test(text)) return "GBP";
  if (/\€|EUR|euro/i.test(text)) return "EUR";
  if (/\$|USD|dollar/i.test(text)) return "USD";
  return "GBP";
}

export function parseInvoiceText(text: string, confidence: number): ParsedInvoice {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    vendor: {
      name: extractVendorName(lines),
      email: extractPattern(text, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i),
      phone: extractPattern(
        text,
        /[\+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/
      ),
      address: extractAddress(lines),
      taxId: extractTaxId(text),
    },
    invoice: {
      number: extractInvoiceNumber(text),
      date: extractDate(text, ["invoice date", "date:", "issued", "date"]),
      dueDate: extractDate(text, ["due date", "payment due", "due by"]),
      terms: extractPattern(text, /net\s*\d+/i),
      currency: detectCurrency(text),
    },
    lineItems: extractLineItems(lines),
    totals: {
      subtotal: extractAmount(text, ["subtotal", "sub-total", "net amount"]),
      tax: extractAmount(text, ["tax", "vat", "gst", "hst"]),
      taxRate: extractTaxRate(text),
      discount: extractAmount(text, ["discount"]),
      total: extractAmount(text, ["total", "amount due", "balance due"]),
    },
    confidence,
    rawText: text,
  };
}
