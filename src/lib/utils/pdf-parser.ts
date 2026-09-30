import pdf from 'pdf-parse'

export interface PDFParseResult {
  text: string
  numPages: number
  info: {
    title?: string
    author?: string
    subject?: string
    keywords?: string
  }
}

/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file as Buffer
 * @returns Parsed PDF content with metadata
 */
export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  const data = await pdf(buffer)

  return {
    text: data.text,
    numPages: data.numpages,
    info: {
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      keywords: data.info?.Keywords,
    },
  }
}

/**
 * Check if a file is a PDF based on extension
 */
export function isPDF(filename: string): boolean {
  return filename.toLowerCase().endsWith('.pdf')
}
