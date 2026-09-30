import { GoogleGenAI } from '@google/genai'
import { AI_CONFIG, CHUNKING_CONFIG } from '@/lib/config/constants'

/**
 * Embedding generation using Google Gemini
 * Handles both single and batch embedding generation
 */

// =============================================================================
// Client Setup
// =============================================================================

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is not set')
}

const ai = new GoogleGenAI({ apiKey })

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract embedding values from Gemini response
 * Handles SDK type inconsistency (embeddings vs embedding)
 */
function extractEmbeddingValues(response: unknown): number[] {
  // Type the response for checking
  const typedResponse = response as {
    embeddings?: Array<{ values?: number[] }>
    embedding?: { values?: number[] }
  }

  // Check typed property first (SDK types)
  if (typedResponse.embeddings?.[0]?.values) {
    return typedResponse.embeddings[0].values
  }

  // Fallback for runtime variations
  if (typedResponse.embedding?.values) {
    return typedResponse.embedding.values
  }

  throw new Error(
    `Unexpected embedding response structure: ${JSON.stringify(response)}`
  )
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: AI_CONFIG.EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: AI_CONFIG.EMBEDDING_DIMENSIONS,
    },
  })

  return extractEmbeddingValues(response)
}

/**
 * Generate embeddings for multiple texts
 * Processes in batches to avoid rate limits
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []
  const batchSize = CHUNKING_CONFIG.EMBEDDING_BATCH_SIZE

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)

    const results = await Promise.all(
      batch.map(async (text) => {
        const response = await ai.models.embedContent({
          model: AI_CONFIG.EMBEDDING_MODEL,
          contents: text,
          config: {
            outputDimensionality: AI_CONFIG.EMBEDDING_DIMENSIONS,
          },
        })
        return extractEmbeddingValues(response)
      })
    )

    embeddings.push(...results)
  }

  return embeddings
}
