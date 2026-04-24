import "server-only";

import { parseOffice } from "officeparser";

const MAX_CHARS = 120_000;

function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return buffer.subarray(0, 4).toString("latin1") === "%PDF";
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.replace(/\s+/g, " ").trim();
  } finally {
    await parser.destroy();
  }
}

/**
 * Extracts plain text from a document buffer, supporting PDF and Office formats.
 *
 * @param buffer - Raw file buffer of the uploaded document
 * @returns Normalised plain-text content, truncated to 120 000 characters
 * @throws {Error} With message `"NO_TEXT"` when no readable text can be extracted
 */
export async function extractPlainTextFromDocumentBuffer(buffer: Buffer): Promise<string> {
  const text = isPdfBuffer(buffer)
    ? await extractPdfText(buffer)
    : (await parseOffice(buffer)).toText().replace(/\s+/g, " ").trim();

  if (!text.length) {
    throw new Error("NO_TEXT");
  }
  return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
}
