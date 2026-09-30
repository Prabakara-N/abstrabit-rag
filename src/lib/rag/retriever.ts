import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding } from '@/lib/ai/embeddings'
import { RETRIEVAL_CONFIG } from '@/lib/config/constants'

export interface RetrievedChunk {
  id: string
  document_id: string
  content: string
  metadata: Record<string, unknown> | null
  similarity: number
  document_name?: string
  keyword_rank?: number
  combined_score?: number
}

interface MatchChunkResult {
  id: string
  document_id: string
  content: string
  metadata: Record<string, unknown> | null
  similarity: number
}

interface HybridChunkResult extends MatchChunkResult {
  keyword_rank: number
  combined_score: number
}

export type SearchMode = 'vector' | 'hybrid' | 'keyword'

export async function retrieveChunks(
  workspaceId: string,
  query: string,
  options?: {
    matchThreshold?: number
    matchCount?: number
    mode?: SearchMode
    keywordWeight?: number
  }
): Promise<RetrievedChunk[]> {
  const matchThreshold = options?.matchThreshold ?? RETRIEVAL_CONFIG.MATCH_THRESHOLD
  const matchCount = options?.matchCount ?? RETRIEVAL_CONFIG.MATCH_COUNT
  const mode = options?.mode ?? RETRIEVAL_CONFIG.DEFAULT_MODE
  const keywordWeight = options?.keywordWeight ?? RETRIEVAL_CONFIG.KEYWORD_WEIGHT

  const supabase = createAdminClient()

  let results: RetrievedChunk[] = []

  if (mode === 'keyword') {
    // Keyword-only search
    const { data, error } = await supabase.rpc('search_chunks_keyword', {
      query_text: query,
      p_workspace_id: workspaceId,
      match_count: matchCount,
    })

    if (error) {
      console.error('Error retrieving chunks (keyword):', error)
      return []
    }

    results = (data as Array<{
      id: string
      document_id: string
      content: string
      metadata: Record<string, unknown> | null
      rank: number
    }> | null)?.map(c => ({
      id: c.id,
      document_id: c.document_id,
      content: c.content,
      metadata: c.metadata,
      similarity: c.rank,
      keyword_rank: c.rank,
    })) || []
  } else if (mode === 'hybrid') {
    // Hybrid search (vector + keyword)
    const queryEmbedding = await generateEmbedding(query)

    const { data, error } = await supabase.rpc('match_chunks_hybrid', {
      query_embedding: queryEmbedding,
      query_text: query,
      p_workspace_id: workspaceId,
      match_threshold: matchThreshold,
      match_count: matchCount,
      keyword_weight: keywordWeight,
    })

    if (error) {
      // Fall back to vector-only search if hybrid fails (e.g., migration not run)
      console.warn('Hybrid search failed, falling back to vector search:', error.message)
      return retrieveChunks(workspaceId, query, { ...options, mode: 'vector' })
    }

    results = (data as HybridChunkResult[] | null)?.map(c => ({
      id: c.id,
      document_id: c.document_id,
      content: c.content,
      metadata: c.metadata,
      similarity: c.similarity,
      keyword_rank: c.keyword_rank,
      combined_score: c.combined_score,
    })) || []
  } else {
    // Vector-only search (original behavior)
    const queryEmbedding = await generateEmbedding(query)

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      p_workspace_id: workspaceId,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) {
      console.error('Error retrieving chunks:', error)
      return []
    }

    results = (data as MatchChunkResult[] | null)?.map(c => ({
      ...c,
    })) || []
  }

  if (results.length === 0) {
    return []
  }

  // Get document names for citations
  const documentIds = [...new Set(results.map((c) => c.document_id))]
  const { data: documents } = await supabase
    .from('documents')
    .select('id, filename')
    .in('id', documentIds)

  const documentMap = new Map(
    (documents as Array<{ id: string; filename: string }> | null)?.map(d => [d.id, d.filename]) || []
  )

  return results.map((chunk) => ({
    ...chunk,
    document_name: documentMap.get(chunk.document_id) || 'Unknown',
  }))
}
