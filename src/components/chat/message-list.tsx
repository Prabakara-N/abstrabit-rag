'use client'

import { useMemo } from 'react'
import { Bot, User, Loader2, Bug, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CitationCard } from './citation-card'
import type { Message, RetrievalDebugInfo } from '@/types/chat'
import type { Citation } from '@/types'
import { cn } from '@/lib/utils'
import { UI_CONFIG } from '@/lib/config/constants'

interface MessageListProps {
  messages: Message[]
  loading: boolean
  showDebug: boolean
  emptyStateContent?: React.ReactNode
}

// =============================================================================
// Sub-components
// =============================================================================

function ToolCallBadge({
  name,
  success
}: {
  name: string
  success: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs bg-muted rounded-full px-2.5 py-1">
      {success ? (
        <CheckCircle className="h-3 w-3 text-green-600" />
      ) : (
        <XCircle className="h-3 w-3 text-red-600" />
      )}
      <span className="font-medium">{name}</span>
    </div>
  )
}

function SimilarityBadge({ similarity }: { similarity: number }) {
  const { HIGH, MEDIUM } = UI_CONFIG.SIMILARITY_THRESHOLDS

  const colorClass =
    similarity >= HIGH ? 'bg-green-500/20 text-green-600' :
    similarity >= MEDIUM ? 'bg-yellow-500/20 text-yellow-600' :
    'bg-red-500/20 text-red-600'

  return (
    <span className={cn('font-mono px-1.5 py-0.5 rounded text-[10px]', colorClass)}>
      {(similarity * 100).toFixed(1)}%
    </span>
  )
}

function DebugPanel({ retrieval }: { retrieval: RetrievalDebugInfo[] }) {
  if (retrieval.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No chunks retrieved</p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Retrieved {retrieval.length} chunks:
      </p>
      <div className="space-y-1.5">
        {retrieval.map((chunk, i) => (
          <div
            key={chunk.chunk_id}
            className="text-xs bg-background/50 rounded p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium truncate flex-1">
                [{i + 1}] {chunk.document_name}
              </span>
              <SimilarityBadge similarity={chunk.similarity} />
            </div>
            <p className="text-muted-foreground truncate">
              {chunk.content_preview}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  showDebug
}: {
  message: Message
  showDebug: boolean
}) {
  const isUser = message.role === 'user'
  const isLoading = message.role === 'assistant' && !message.content

  // Deduplicate citations by document name
  const uniqueCitations = useMemo(() => {
    if (!message.citations?.length) return []

    const seen = new Set<string>()
    return message.citations.filter(citation => {
      if (seen.has(citation.document_name)) return false
      seen.add(citation.document_name)
      return true
    })
  }, [message.citations])

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Message content */}
      <div
        className={cn(
          'rounded-lg p-4 max-w-[80%]',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>

            {/* Tool calls */}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-2">
                  {message.toolCalls.map((tool, i) => (
                    <ToolCallBadge
                      key={i}
                      name={tool.name}
                      success={tool.result.success === true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Citations */}
            {uniqueCitations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Sources:
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueCitations.map((citation, i) => (
                    <CitationCard key={i} citation={citation} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Debug panel */}
            {showDebug && message.debug && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <Bug className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Debug Info
                  </span>
                </div>
                <DebugPanel retrieval={message.debug.retrieval} />
              </div>
            )}
          </>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function MessageList({
  messages,
  loading,
  showDebug,
  emptyStateContent,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        {emptyStateContent || (
          <>
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Start a conversation</h3>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              Ask questions about your documents.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-4">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} showDebug={showDebug} />
      ))}

      {/* Loading indicator for new assistant message */}
      {loading && messages[messages.length - 1]?.role !== 'assistant' && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  )
}
