-- Add full-text search capabilities for hybrid search

-- Create a generated column for tsvector
ALTER TABLE chunks ADD COLUMN IF NOT EXISTS content_fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS chunks_content_fts_idx ON chunks USING GIN (content_fts);

-- Hybrid search function using Reciprocal Rank Fusion (RRF)
-- Combines vector similarity and keyword matching for better results
CREATE OR REPLACE FUNCTION match_chunks_hybrid(
  query_embedding VECTOR(768),
  query_text TEXT,
  p_workspace_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  keyword_weight FLOAT DEFAULT 0.3,  -- Weight for keyword search (0-1)
  rrf_k INT DEFAULT 60  -- RRF constant (higher = smoother blending)
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  keyword_rank FLOAT,
  combined_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH
  -- Vector search results with ranking
  vector_results AS (
    SELECT
      c.id,
      c.document_id,
      c.content,
      c.metadata,
      1 - (c.embedding <=> query_embedding) AS similarity,
      ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) AS vector_rank
    FROM chunks c
    WHERE c.workspace_id = p_workspace_id
      AND 1 - (c.embedding <=> query_embedding) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count * 2  -- Get more candidates for fusion
  ),
  -- Full-text search results with ranking
  keyword_results AS (
    SELECT
      c.id,
      ts_rank_cd(c.content_fts, websearch_to_tsquery('english', query_text)) AS keyword_score,
      ROW_NUMBER() OVER (
        ORDER BY ts_rank_cd(c.content_fts, websearch_to_tsquery('english', query_text)) DESC
      ) AS keyword_rank
    FROM chunks c
    WHERE c.workspace_id = p_workspace_id
      AND c.content_fts @@ websearch_to_tsquery('english', query_text)
    ORDER BY keyword_score DESC
    LIMIT match_count * 2
  ),
  -- Combine using Reciprocal Rank Fusion
  combined AS (
    SELECT
      COALESCE(v.id, k_chunks.id) AS id,
      COALESCE(v.document_id, k_chunks.document_id) AS document_id,
      COALESCE(v.content, k_chunks.content) AS content,
      COALESCE(v.metadata, k_chunks.metadata) AS metadata,
      COALESCE(v.similarity, 0) AS similarity,
      COALESCE(k.keyword_score, 0) AS keyword_rank,
      -- RRF score: combines rankings from both methods
      (1.0 - keyword_weight) * COALESCE(1.0 / (rrf_k + v.vector_rank), 0) +
      keyword_weight * COALESCE(1.0 / (rrf_k + k.keyword_rank), 0) AS combined_score
    FROM vector_results v
    FULL OUTER JOIN keyword_results k ON v.id = k.id
    LEFT JOIN chunks k_chunks ON k.id = k_chunks.id
    WHERE v.id IS NOT NULL OR k.id IS NOT NULL
  )
  SELECT
    combined.id,
    combined.document_id,
    combined.content,
    combined.metadata,
    combined.similarity,
    combined.keyword_rank,
    combined.combined_score
  FROM combined
  ORDER BY combined.combined_score DESC
  LIMIT match_count;
END;
$$;

-- Simple keyword-only search (useful for exact term matching)
CREATE OR REPLACE FUNCTION search_chunks_keyword(
  query_text TEXT,
  p_workspace_id UUID,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  metadata JSONB,
  rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    c.content,
    c.metadata,
    ts_rank_cd(c.content_fts, websearch_to_tsquery('english', query_text)) AS rank
  FROM chunks c
  WHERE c.workspace_id = p_workspace_id
    AND c.content_fts @@ websearch_to_tsquery('english', query_text)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
