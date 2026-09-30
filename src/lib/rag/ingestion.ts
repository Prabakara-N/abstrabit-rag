import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbeddings } from '@/lib/ai/embeddings'
import { chunkText } from './chunker'
import crypto from 'crypto'
import type { Json } from '@/types/database'

export interface IngestionResult {
  success: boolean
  documentId?: string
  chunksCreated?: number
  error?: string
  duplicate?: boolean
}

export async function ingestDocument(
  workspaceId: string,
  filename: string,
  content: string
): Promise<IngestionResult> {
  const supabase = createAdminClient()

  // Generate content hash for deduplication
  const contentHash = crypto.createHash('sha256').update(content).digest('hex')

  // Check for existing document with same hash in this workspace
  const { data: existing } = await supabase
    .from('documents')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('content_hash', contentHash)
    .single()

  if (existing) {
    return {
      success: true,
      duplicate: true,
      documentId: existing.id,
      error: 'Document already exists in this workspace',
    }
  }

  // Create document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .insert({
      workspace_id: workspaceId,
      filename,
      content_hash: contentHash,
    } as {
      workspace_id: string
      filename: string
      content_hash: string
    })
    .select()
    .single()

  if (docError || !document) {
    return {
      success: false,
      error: docError?.message || 'Failed to create document',
    }
  }

  // Chunk the content
  console.log(`[Ingestion] Content length: ${content.length} chars`)
  const chunks = chunkText(content)
  console.log(`[Ingestion] Created ${chunks.length} chunks`)

  if (chunks.length === 0) {
    console.log(`[Ingestion] No chunks created - content may be too short or empty`)
    return {
      success: false,
      error: 'No content to process',
    }
  }

  // Generate embeddings for all chunks
  const embeddings = await generateEmbeddings(chunks.map(c => c.content))

  // Insert chunks with embeddings
  // Convert embedding array to string format for pgvector
  const chunkRecords = chunks.map((chunk, i) => ({
    document_id: document.id,
    workspace_id: workspaceId,
    content: chunk.content,
    embedding: `[${embeddings[i].join(',')}]`,
    chunk_index: chunk.index,
    metadata: (chunk.metadata || {}) as Json,
  }))

  const { error: chunksError } = await supabase
    .from('chunks')
    .insert(chunkRecords)

  if (chunksError) {
    // Rollback document creation
    await supabase.from('documents').delete().eq('id', document.id)
    return {
      success: false,
      error: chunksError.message,
    }
  }

  return {
    success: true,
    documentId: document.id,
    chunksCreated: chunks.length,
  }
}
