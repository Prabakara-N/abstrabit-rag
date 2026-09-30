import { extractText, getDocumentProxy } from 'unpdf'

export interface PDFParseResult {
  text: string
  numPages: number
}

/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file as Buffer or Uint8Array
 * @returns Parsed PDF content with metadata
 */
export async function parsePDF(buffer: Buffer | Uint8Array): Promise<PDFParseResult> {
  const data = buffer instanceof Buffer ? new Uint8Array(buffer) : buffer
  const pdf = await getDocumentProxy(data)
  const { totalPages, text } = await extractText(pdf, { mergePages: true })

  const extractedText = text as string
  console.log(`[PDF Parser] Extracted ${extractedText.length} chars from ${totalPages} pages`)
  console.log(`[PDF Parser] Preview: ${extractedText.slice(0, 500)}...`)

  return {
    text: extractedText,
    numPages: totalPages,
  }
}

/**
 * Check if a file is a PDF based on extension
 */
export function isPDF(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf')
}
