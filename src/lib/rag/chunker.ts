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
 * Split text into chunks intelligently
 * Handles various text formats: paragraphs, single newlines, or continuous text
 */
export function chunkText(text: string, options?: ChunkOptions): Chunk[] {
  const maxChunkSize = options?.maxChunkSize ?? CHUNKING_CONFIG.MAX_CHUNK_SIZE
  const minChunkSize = options?.minChunkSize ?? CHUNKING_CONFIG.MIN_CHUNK_SIZE

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  if (normalized.length === 0) {
    return []
  }

  // Try splitting by double newlines first (paragraphs)
  let segments = normalized.split(/\n\n+/).filter(p => p.trim().length > 0)

  // If only 1 segment and it's large, try splitting by single newlines
  if (segments.length === 1 && segments[0].length > maxChunkSize) {
    segments = normalized.split(/\n/).filter(p => p.trim().length > 0)
  }

  // If still only 1 segment and it's large, split by sentences
  if (segments.length === 1 && segments[0].length > maxChunkSize) {
    segments = normalized.split(/(?<=[.!?])\s+/).filter(p => p.trim().length > 0)
  }

  // If still problematic, fall back to fixed-size splitting
  if (segments.length === 1 && segments[0].length > maxChunkSize) {
    return splitBySize(normalized, maxChunkSize, minChunkSize)
  }

  // Merge small segments into chunks
  const chunks: Chunk[] = []
  let currentChunk = ''
  let chunkIndex = 0

  for (const segment of segments) {
    const trimmedSegment = segment.trim()

    // If this segment alone is larger than max, split it
    if (trimmedSegment.length > maxChunkSize) {
      // Save current chunk first
      if (currentChunk.trim().length >= minChunkSize) {
        chunks.push({
          content: currentChunk.trim(),
          index: chunkIndex++,
        })
        currentChunk = ''
      }

      // Split the large segment
      const subChunks = splitBySize(trimmedSegment, maxChunkSize, minChunkSize)
      for (const subChunk of subChunks) {
        chunks.push({
          content: subChunk.content,
          index: chunkIndex++,
        })
      }
      continue
    }

    // If adding this segment would exceed max size, save current chunk
    if (currentChunk.length + trimmedSegment.length + 2 > maxChunkSize && currentChunk.length >= minChunkSize) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
      })
      currentChunk = ''
    }

    // Add segment to current chunk
    if (currentChunk.length > 0) {
      currentChunk += '\n\n'
    }
    currentChunk += trimmedSegment
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length >= minChunkSize) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex,
    })
  } else if (currentChunk.trim().length > 0 && chunks.length === 0) {
    // Keep small content if it's the only chunk
    chunks.push({
      content: currentChunk.trim(),
      index: 0,
    })
  }

  console.log(`[Chunker] Split ${normalized.length} chars into ${chunks.length} chunks`)

  return chunks
}

/**
 * Split text by fixed size with word boundary awareness
 */
function splitBySize(text: string, maxSize: number, minSize: number): Chunk[] {
  const chunks: Chunk[] = []
  let remaining = text
  let index = 0

  while (remaining.length > 0) {
    if (remaining.length <= maxSize) {
      if (remaining.trim().length >= minSize || chunks.length === 0) {
        chunks.push({ content: remaining.trim(), index: index++ })
      }
      break
    }

    // Find a good break point (space, newline) near maxSize
    let breakPoint = maxSize
    const searchStart = Math.max(0, maxSize - 100)

    for (let i = maxSize; i >= searchStart; i--) {
      if (remaining[i] === ' ' || remaining[i] === '\n') {
        breakPoint = i
        break
      }
    }

    const chunk = remaining.slice(0, breakPoint).trim()
    if (chunk.length >= minSize || chunks.length === 0) {
      chunks.push({ content: chunk, index: index++ })
    }

    remaining = remaining.slice(breakPoint).trim()
  }

  return chunks
}

/**
 * Generate a content hash for deduplication
 */
export function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}
