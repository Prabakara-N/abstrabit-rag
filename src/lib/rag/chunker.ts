import { CHUNKING_CONFIG } from '@/lib/config/constants'

export interface Chunk {
  content: string
  index: number
  metadata?: Record<string, unknown>
}

export interface ChunkOptions {
  maxChunkSize?: number
  minChunkSize?: number
  overlap?: number
}

/**
 * Split text into chunks by paragraphs
 * Simple approach: split by double newlines, then merge small chunks
 */
export function chunkText(text: string, options?: ChunkOptions): Chunk[] {
  const maxChunkSize = options?.maxChunkSize ?? CHUNKING_CONFIG.MAX_CHUNK_SIZE
  const minChunkSize = options?.minChunkSize ?? CHUNKING_CONFIG.MIN_CHUNK_SIZE

  // Normalize line endings and split by paragraphs
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const paragraphs = normalized.split(/\n\n+/).filter(p => p.trim().length > 0)

  const chunks: Chunk[] = []
  let currentChunk = ''
  let chunkIndex = 0

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim()

    // If adding this paragraph would exceed max size, save current chunk
    if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length >= minChunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
      })
      currentChunk = ''
    }

    // Add paragraph to current chunk
    if (currentChunk.length > 0) {
      currentChunk += '\n\n'
    }
    currentChunk += trimmedParagraph

    // If current chunk is at max size, save it
    if (currentChunk.length >= maxChunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
      })
      currentChunk = ''
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
    })
  }

  return chunks
}

/**
 * Generate a content hash for deduplication
 */
export function hashContent(content: string): string {
  // Simple hash function for the browser/Node
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}
