export * from './database'

// Custom application types

export interface Citation {
  chunk_id: string
  document_name: string
  snippet: string
}

export interface Workspace {
  id: string
  name: string
  user_id: string
  created_at: string
}

export interface Document {
  id: string
  workspace_id: string
  filename: string
  file_path?: string | null
  content_hash?: string
  created_at: string
}

export interface ToolCall {
  id: string
  workspace_id: string
  session_id?: string | null
  tool_name: string
  arguments: Record<string, unknown>
  result: Record<string, unknown>
  status: 'success' | 'error'
  created_at: string
}

export interface SharedMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
}
