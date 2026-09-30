/**
 * Application-wide constants
 * Centralized configuration to avoid magic numbers and hardcoded values
 */

// =============================================================================
// AI Model Configuration
// =============================================================================

export const AI_CONFIG = {
  /** Gemini model for chat/reasoning */
  CHAT_MODEL: 'gemini-2.0-flash',
  /** Gemini model for embeddings */
  EMBEDDING_MODEL: 'gemini-embedding-2',
  /** Embedding vector dimensions (must match database schema) */
  EMBEDDING_DIMENSIONS: 768,
  /** Max tokens for response generation */
  MAX_OUTPUT_TOKENS: 2048,
} as const

// =============================================================================
// RAG Retrieval Configuration
// =============================================================================

export const RETRIEVAL_CONFIG = {
  /** Minimum similarity score to include a chunk (0-1) */
  MATCH_THRESHOLD: 0.5,
  /** Maximum number of chunks to retrieve */
  MATCH_COUNT: 5,
  /** Default search mode: 'vector' | 'hybrid' | 'keyword' */
  DEFAULT_MODE: 'hybrid' as const,
  /** Weight for keyword search in hybrid mode (0-1) */
  KEYWORD_WEIGHT: 0.3,
  /** RRF constant for rank fusion (higher = smoother blending) */
  RRF_K: 60,
} as const

// =============================================================================
// Document Processing Configuration
// =============================================================================

export const CHUNKING_CONFIG = {
  /** Maximum characters per chunk */
  MAX_CHUNK_SIZE: 1000,
  /** Minimum characters for a valid chunk */
  MIN_CHUNK_SIZE: 100,
  /** Number of chunks to process in parallel for embeddings */
  EMBEDDING_BATCH_SIZE: 10,
} as const

// =============================================================================
// UI Configuration
// =============================================================================

export const UI_CONFIG = {
  /** Scroll threshold (px) to show scroll-to-top button */
  SCROLL_TOP_THRESHOLD: 300,
  /** Duration (ms) to show copy feedback */
  COPY_FEEDBACK_DURATION: 2000,
  /** Duration (ms) to show upload status */
  UPLOAD_STATUS_DURATION: 5000,
  /** Similarity score thresholds for color coding */
  SIMILARITY_THRESHOLDS: {
    HIGH: 0.8,    // Green
    MEDIUM: 0.6,  // Yellow
    // Below MEDIUM: Red
  },
} as const

// =============================================================================
// API Configuration
// =============================================================================

export const API_CONFIG = {
  /** Maximum file size for uploads (bytes) */
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  /** Allowed file extensions */
  ALLOWED_EXTENSIONS: ['.txt', '.md', '.pdf'] as const,
  /** Rate limit: requests per minute per user */
  RATE_LIMIT_RPM: 60,
} as const
