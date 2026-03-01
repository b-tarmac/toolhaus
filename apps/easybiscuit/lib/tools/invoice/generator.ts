import type { InvoiceData } from "@portfolio/tool-sdk";
import { jsPDF } from "jspdf";

export type DocumentType = "invoice" | "quote";

export async function generateInvoicePdf(
  data: InvoiceData,
  type: DocumentType = "invoice"
): Promise<Uint8Array> {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  // Business (sender)
  if (data.business.logo) {
    try {
      const fmt = data.business.logo.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
      doc.addImage(data.business.logo, fmt, margin, y, 40, 20);
      y += 25;
    } catch {
      y += 5;
    }
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.business.name, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (data.business.address) doc.text(data.business.address, margin, y), (y += 5);
  if (data.business.email) doc.text(data.business.email, margin, y), (y += 5);
  if (data.business.phone) doc.text(data.business.phone, margin, y), (y += 5);
  if (data.business.taxId) doc.text(`Tax ID: ${data.business.taxId}`, margin, y), (y += 8);

  // Document title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(type === "quote" ? "QUOTE" : "INVOICE", 150, y);
  y += 15;

  // Client
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Bill To:", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(data.client.name, margin, y);
  y += 5;
  if (data.client.address) doc.text(data.client.address, margin, y), (y += 5);
  if (data.client.email) doc.text(data.client.email, margin, y), (y += 10);

  // Invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 150, y);
  y += 5;
  doc.text(`Date: ${data.issueDate}`, 150, y);
  y += 5;
  doc.text(`Due: ${data.dueDate}`, 150, y);
  y += 5;
  doc.text(`Currency: ${data.currency}`, 150, y);
  y += 15;

  // Line items table
  const colW = [90, 20, 25, 25, 30];
  doc.setFont("helvetica", "bold");
  doc.text("Description", margin, y);
  doc.text("Qty", margin + colW[0], y);
  doc.text("Unit Price", margin + colW[0] + colW[1], y);
  doc.text("Total", margin + colW[0] + colW[1] + colW[2], y);
  y += 7;
  doc.setFont("helvetica", "normal");

  let subtotal = 0;
  for (const item of data.lineItems) {
    const total = item.quantity * item.unitPrice;
    subtotal += total;
    doc.text(item.description.slice(0, 40), margin, y);
    doc.text(String(item.quantity), margin + colW[0], y);
    doc.text(formatMoney(item.unitPrice, data.currency), margin + colW[0] + colW[1], y);
    doc.text(formatMoney(total, data.currency), margin + colW[0] + colW[1] + colW[2], y);
    y += 6;
  }
  y += 5;

  const taxAmount = subtotal * (data.taxRate / 100);
  const total = subtotal + taxAmount;

  doc.text(`Subtotal:`, margin + colW[0] + colW[1], y);
  doc.text(formatMoney(subtotal, data.currency), margin + colW[0] + colW[1] + colW[2], y);
  y += 6;
  doc.text(`Tax (${data.taxRate}%):`, margin + colW[0] + colW[1], y);
  doc.text(formatMoney(taxAmount, data.currency), margin + colW[0] + colW[1] + colW[2], y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text(`Total:`, margin + colW[0] + colW[1], y);
  doc.text(formatMoney(total, data.currency), margin + colW[0] + colW[1] + colW[2], y);
  y += 15;

  if (data.notes) {
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", margin, y);
    y += 5;
    doc.text(data.notes, margin, y);
    y += 10;
  }
  if (data.paymentTerms) {
    doc.text(`Payment terms: ${data.paymentTerms}`, margin, y);
  }

  return doc.output("arraybuffer") as unknown as Uint8Array;
}

function formatMoney(n: number, currency: string): string {
  const sym = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  return `${sym}${n.toFixed(2)}`;
}
