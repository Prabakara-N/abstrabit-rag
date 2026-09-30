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
    // Keyword-only search - fallback to vector search if RPC doesn't exist
    const queryEmbedding = await generateEmbedding(query)
    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      p_workspace_id: workspaceId,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) {
      console.error('Error retrieving chunks (keyword):', error)
      return []
    }

    results = (data as MatchChunkResult[] | null)?.map(c => ({
      ...c,
      keyword_rank: c.similarity,
    })) || []
  } else if (mode === 'hybrid') {
    // Hybrid search - fallback to vector-only if hybrid RPC doesn't exist
    const queryEmbedding = await generateEmbedding(query)

    // Try vector search (most reliable)
    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      p_workspace_id: workspaceId,
      match_threshold: matchThreshold,
      match_count: matchCount,
    })

    if (error) {
      console.error('Error retrieving chunks (hybrid fallback):', error)
      return []
    }

    results = (data as MatchChunkResult[] | null)?.map(c => ({
      ...c,
      combined_score: c.similarity,
    })) || []
  } else {
    // Vector-only search (original behavior)
    const queryEmbedding = await generateEmbedding(query)

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
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

  console.log(`[Retriever] Found ${results.length} chunks for query: "${query.slice(0, 50)}..."`)

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
