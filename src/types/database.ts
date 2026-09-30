export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          workspace_id: string
          filename: string
          file_path: string | null
          content_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          filename: string
          file_path?: string | null
          content_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          filename?: string
          file_path?: string | null
          content_hash?: string | null
          created_at?: string
        }
        Relationships: []
      }
      chunks: {
        Row: {
          id: string
          document_id: string
          workspace_id: string
          content: string
          embedding: number[] | null
          chunk_index: number | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          workspace_id: string
          content: string
          embedding?: number[] | null
          chunk_index?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          workspace_id?: string
          content?: string
          embedding?: number[] | null
          chunk_index?: number | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          id: string
          workspace_id: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          citations: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          citations?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          citations?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      tool_calls: {
        Row: {
          id: string
          workspace_id: string
          session_id: string | null
          tool_name: string
          arguments: Json | null
          result: Json | null
          status: 'success' | 'error'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          session_id?: string | null
          tool_name: string
          arguments?: Json | null
          result?: Json | null
          status: 'success' | 'error'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          session_id?: string | null
          tool_name?: string
          arguments?: Json | null
          result?: Json | null
          status?: 'success' | 'error'
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[]
          p_workspace_id: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          document_id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Workspace = Tables<'workspaces'>
export type Document = Tables<'documents'>
export type Chunk = Tables<'chunks'>
export type ChatSession = Tables<'chat_sessions'>
export type Message = Tables<'messages'>
export type ToolCall = Tables<'tool_calls'>
export type Task = Tables<'tasks'>

export type Citation = {
  chunk_id: string
  document_name: string
  snippet: string
}
