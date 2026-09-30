import type { Citation } from '@/types'

/**
 * Chat-related type definitions
 * Shared across chat components for consistency
 */

// =============================================================================
// Tool Call Types
// =============================================================================

export interface ToolCallResult {
  name: string
  args: Record<string, unknown>
  result: {
    success?: boolean
    error?: string
    [key: string]: unknown
  }
}

// =============================================================================
// Debug Information Types
// =============================================================================

export interface RetrievalDebugInfo {
  chunk_id: string
  document_id: string
  document_name: string
  similarity: number
  content_preview: string
}

export interface ChatMetrics {
  retrievalLatencyMs: number
  llmLatencyMs: number
  totalLatencyMs: number
  chunksRetrieved: number
  chunksUsed: number
}

export interface DebugInfo {
  retrieval: RetrievalDebugInfo[]
  metrics: ChatMetrics
}

// =============================================================================
// Message Types
// =============================================================================

export interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  toolCalls?: ToolCallResult[]
  debug?: DebugInfo
}

// =============================================================================
// Session Types
// =============================================================================

export interface ChatSession {
  id: string
  created_at: string
  preview: string
}

// =============================================================================
// SSE Event Types (for streaming)
// =============================================================================

export type SSEEventType = 'session' | 'token' | 'tool' | 'debug' | 'complete' | 'error'

export interface SSESessionEvent {
  type: 'session'
  sessionId: string
}

export interface SSETokenEvent {
  type: 'token'
  content: string
}

export interface SSEToolEvent {
  type: 'tool'
  name: string
  args: Record<string, unknown>
  result: Record<string, unknown>
}

export interface SSEDebugEvent {
  type: 'debug'
  retrieval: RetrievalDebugInfo[]
  metrics: ChatMetrics
}

export interface SSECompleteEvent {
  type: 'complete'
  citations?: Citation[]
}

export interface SSEErrorEvent {
  type: 'error'
  message: string
}

export type SSEEvent =
  | SSESessionEvent
  | SSETokenEvent
  | SSEToolEvent
  | SSEDebugEvent
  | SSECompleteEvent
  | SSEErrorEvent
