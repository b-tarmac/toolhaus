import type { ParsedInvoice } from "@portfolio/tool-sdk";

export function exportToCsv(invoice: ParsedInvoice): string {
  const rows = [
    ["Field", "Value"],
    ["Vendor", invoice.vendor.name],
    ["Invoice #", invoice.invoice.number],
    ["Date", invoice.invoice.date],
    ["Due Date", invoice.invoice.dueDate],
    [""],
    ["Description", "Quantity", "Unit Price", "Total"],
    ...invoice.lineItems.map((i) => [
      i.description,
      String(i.quantity),
      String(i.unitPrice),
      String(i.total),
    ]),
    [""],
    ["Subtotal", "", "", String(invoice.totals.subtotal)],
    ["Tax", "", "", String(invoice.totals.tax)],
    ["Total", "", "", String(invoice.totals.total)],
  ];
  return rows.map((r) => r.join(",")).join("\n");
}
