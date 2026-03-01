import { PDFDocument } from "pdf-lib";

/** Re-saves the PDF which can reduce size for some documents. */
export async function compressPdf(file: File): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.save({ useObjectStreams: true });
}
