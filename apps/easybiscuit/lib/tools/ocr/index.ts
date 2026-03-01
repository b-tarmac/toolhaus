import type { ParsedInvoice } from "@portfolio/tool-sdk";
import { extractTextFromPdf } from "./pdf-extractor";
import { parseInvoiceText } from "./invoice-parser";

async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  return new File([blob], file.name.replace(/\.[^.]+$/i, ".jpg"), {
    type: "image/jpeg",
  });
}

async function runTesseract(
  file: File | Blob
): Promise<{ text: string; confidence: number }> {
  const Tesseract = await import("tesseract.js");
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("ocr-progress", { detail: { progress: m.progress } })
        );
      }
    },
  });
  return { text: data.text, confidence: data.confidence };
}

export async function processDocument(file: File): Promise<ParsedInvoice> {
  if (file.type === "application/pdf") {
    const text = await extractTextFromPdf(file);
    return parseInvoiceText(text, 100);
  }

  let imageFile: File | Blob = file;
  if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
    imageFile = await convertHeicToJpeg(file);
  }

  const { text, confidence } = await runTesseract(imageFile);
  return parseInvoiceText(text, confidence);
}
