'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Plus, Bot, User, History, MessageSquare, X, Trash2, Share2, Copy, Check, ArrowUp, Bug, Link2, ExternalLink } from 'lucide-react'
import { useWorkspace } from '@/components/workspace/workspace-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CitationCard } from './citation-card'
import { useConfirm } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Citation } from '@/types'
import { cn } from '@/lib/utils'

interface ToolCallResult {
  name: string
  args: Record<string, unknown>
  result: {
    success?: boolean
    error?: string
    [key: string]: unknown
  }
}

interface RetrievalDebugInfo {
  chunk_id: string
  document_id: string
  document_name: string
  similarity: number
  content_preview: string
}

interface ChatMetrics {
  retrievalLatencyMs: number
  llmLatencyMs: number
  totalLatencyMs: number
  chunksRetrieved: number
  chunksUsed: number
}

interface DebugInfo {
  retrieval: RetrievalDebugInfo[]
  metrics: ChatMetrics
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  toolCalls?: ToolCallResult[]
  debug?: DebugInfo
}

interface ChatSession {
  id: string
  created_at: string
  preview: string
}

export function ChatWindow() {
  const { activeWorkspace } = useWorkspace()
  const confirm = useConfirm()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [showHistory, setShowHistory] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareContent, setShareContent] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [sharingUrl, setSharingUrl] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (!scrollElement) return

    const handleScroll = () => {
      setShowScrollTop(scrollElement.scrollTop > 300)
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollElement) {
      scrollElement.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Fetch chat sessions
  const fetchSessions = async () => {
    if (!activeWorkspace) return
    setLoadingSessions(true)
    try {
      const res = await fetch(`/api/chat/sessions?workspaceId=${activeWorkspace.id}`)
      const data = await res.json()
      if (res.ok) {
        setSessions(data.sessions || [])
      }
    } catch {
      console.error('Failed to fetch sessions')
    } finally {
      setLoadingSessions(false)
    }
  }

  // Load session messages
  const loadSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${id}`)
      const data = await res.json()
      if (res.ok) {
        setSessionId(id)
        setMessages(data.messages || [])
        setShowHistory(false)
      }
    } catch {
      toast.error('Failed to load session')
    }
  }

  // Delete session
  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const confirmed = await confirm({
      title: 'Delete Chat',
      description: 'Are you sure you want to delete this chat? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id))
        if (sessionId === id) {
          setSessionId(null)
          setMessages([])
        }
        toast.success('Chat deleted')
      } else {
        toast.error('Failed to delete chat')
      }
    } catch {
      toast.error('Failed to delete chat')
    }
  }

  // Share current chat
  const shareChat = () => {
    if (messages.length === 0) {
      toast.error('No messages to share')
      return
    }

    const content = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Assistant'
      return `**${role}:**\n${msg.content}`
    }).join('\n\n---\n\n')

    setShareContent(content)
    setShareUrl('')
    setShareDialogOpen(true)
  }

  const createShareUrl = async () => {
    if (!sessionId) {
      toast.error('Save your chat first by sending a message')
      return
    }

    setSharingUrl(true)
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create share link')
      }

      const data = await response.json()
      setShareUrl(data.shareUrl)
      toast.success('Share link created!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create share link')
    } finally {
      setSharingUrl(false)
    }
  }

  const copyToClipboard = async (text?: string) => {
    try {
      await navigator.clipboard.writeText(text || shareContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  useEffect(() => {
    if (activeWorkspace && showHistory) {
      fetchSessions()
    }
  }, [activeWorkspace, showHistory])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async () => {
    if (!input.trim() || !activeWorkspace || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    // Add placeholder for streaming response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: activeWorkspace.id,
          sessionId,
          message: userMessage,
          history: messages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let streamedContent = ''
      let finalData: {
        citations?: Citation[]
        toolCalls?: ToolCallResult[]
        debug?: DebugInfo
      } = {}

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let eventType = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7)
          } else if (line.startsWith('data: ') && eventType) {
            try {
              const data = JSON.parse(line.slice(6))

              if (eventType === 'session') {
                setSessionId(data.sessionId)
              } else if (eventType === 'token') {
                streamedContent += data.token
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = streamedContent
                  }
                  return newMessages
                })
              } else if (eventType === 'tool') {
                if (!finalData.toolCalls) finalData.toolCalls = []
                finalData.toolCalls.push(data)
              } else if (eventType === 'complete') {
                finalData = {
                  ...finalData,
                  citations: data.citations,
                  debug: data.debug,
                }
                // Update final message with all data
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = data.content || streamedContent
                    lastMsg.citations = data.citations
                    lastMsg.toolCalls = finalData.toolCalls
                    lastMsg.debug = data.debug
                  }
                  return newMessages
                })
              } else if (eventType === 'error') {
                throw new Error(data.message)
              }
            } catch (parseError) {
              // Skip malformed JSON
              console.error('Failed to parse SSE data:', parseError)
            }
            eventType = ''
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message')
      // Remove both user message and empty assistant message
      setMessages(prev => prev.slice(0, -2))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setSessionId(null)
    setShowHistory(false)
    textareaRef.current?.focus()
  }

  // Format message content with basic markdown-like styling
  const formatContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lines = part.slice(3, -3).split('\n')
        const lang = lines[0] || ''
        const code = lines.slice(1).join('\n') || lines[0]
        return (
          <pre key={i} className="bg-background/80 rounded-md p-3 my-2 overflow-x-auto text-sm border">
            {lang && <div className="text-xs text-muted-foreground mb-2 font-medium">{lang}</div>}
            <code className="text-sm">{code}</code>
          </pre>
        )
      }

      return (
        <div key={i}>
          {part.split('\n').map((line, j) => {
            if (line.startsWith('### ')) {
              return <h4 key={j} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h4>
            }
            if (line.startsWith('## ')) {
              return <h3 key={j} className="font-semibold text-lg mt-4 mb-2">{line.slice(3)}</h3>
            }
            if (line.startsWith('# ')) {
              return <h2 key={j} className="font-bold text-xl mt-4 mb-2">{line.slice(2)}</h2>
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={j} className="flex gap-2 ml-2 my-0.5">
                  <span className="text-muted-foreground">•</span>
                  <span>{formatInline(line.slice(2))}</span>
                </div>
              )
            }
            const numMatch = line.match(/^(\d+)\.\s/)
            if (numMatch) {
              return (
                <div key={j} className="flex gap-2 ml-2 my-0.5">
                  <span className="text-muted-foreground min-w-[1.5rem]">{numMatch[1]}.</span>
                  <span>{formatInline(line.slice(numMatch[0].length))}</span>
                </div>
              )
            }
            if (!line.trim()) {
              return <div key={j} className="h-2" />
            }
            return <p key={j} className="my-1 leading-relaxed">{formatInline(line)}</p>
          })}
        </div>
      )
    })
  }

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/)
      if (linkMatch) {
        return <a key={i} href={linkMatch[2]} className="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">{linkMatch[1]}</a>
      }
      return part
    })
  }

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Bot className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Workspace Selected</h2>
        <p className="text-muted-foreground">
          Select a workspace to start chatting with your documents
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant={showHistory ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              title="Chat History"
              className="h-8 w-8 p-0"
            >
              <History className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold text-sm">Chat</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={showDebug ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              title="Toggle Debug View"
              className="h-8 w-8 p-0"
            >
              <Bug className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={shareChat} title="Share Chat" className="h-8 w-8 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={startNewChat} className="h-8">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Chat History Sidebar */}
          {showHistory && (
            <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
              <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-sm">Chat History</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowHistory(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground px-4">
                    No chat history yet
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          'group relative rounded-md hover:bg-muted transition-colors',
                          sessionId === session.id && 'bg-muted'
                        )}
                      >
                        <button
                          onClick={() => loadSession(session.id)}
                          className="w-full text-left p-2"
                        >
                          <div className="flex items-center gap-2 pr-8">
                            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate flex-1 text-xs">{session.preview}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 ml-6">
                            {new Date(session.created_at).toLocaleDateString()}
                          </div>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => deleteSession(session.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex flex-col flex-1 min-w-0 relative">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    Ask questions about documents in {activeWorkspace.name}.
                    I can also save tasks and send notifications for you.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto pb-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-3',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'rounded-lg',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground p-3 max-w-[80%]'
                            : 'bg-muted p-4 max-w-[90%]'
                        )}
                      >
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : !msg.content && loading && index === messages.length - 1 ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Thinking...</span>
                          </div>
                        ) : (
                          <div className="text-sm">
                            {formatContent(msg.content)}
                          </div>
                        )}

                        {/* Tool calls */}
                        {msg.toolCalls && msg.toolCalls.length > 0 && (
                          <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
                            <p className="text-xs font-medium text-muted-foreground">Actions:</p>
                            {msg.toolCalls.map((tool, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "text-xs rounded-md p-2 flex items-center gap-2",
                                  tool.result.success
                                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                    : "bg-red-500/10 text-red-700 dark:text-red-400"
                                )}
                              >
                                <span className="font-medium">{tool.name.replace('_', ' ')}</span>
                                <span>→</span>
                                {tool.result.success ? (
                                  <span>✓ Success</span>
                                ) : (
                                  <span>✗ {String(tool.result.error)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Citations - Deduplicated by document */}
                        {msg.citations && msg.citations.length > 0 && (() => {
                          // Deduplicate citations by document name
                          const uniqueCitations = msg.citations.reduce((acc, citation) => {
                            if (!acc.find(c => c.document_name === citation.document_name)) {
                              acc.push(citation)
                            }
                            return acc
                          }, [] as Citation[])

                          return (
                            <div className="mt-3 pt-2 border-t border-border/50">
                              <p className="text-xs text-muted-foreground mb-1">
                                Sources: {uniqueCitations.map((c, i) => (
                                  <span key={i} className="font-medium">
                                    [{i + 1}] {c.document_name}
                                    {i < uniqueCitations.length - 1 && ', '}
                                  </span>
                                ))}
                              </p>
                            </div>
                          )
                        })()}

                        {/* Debug Panel */}
                        {showDebug && msg.debug && (
                          <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                              <Bug className="h-3 w-3" />
                              Retrieval Debug ({activeWorkspace?.name})
                            </p>

                            {/* Metrics */}
                            <div className="flex gap-4 text-xs bg-background/50 rounded p-2">
                              <span>
                                <span className="text-muted-foreground">Retrieval:</span>{' '}
                                <span className="font-mono">{msg.debug.metrics.retrievalLatencyMs}ms</span>
                              </span>
                              <span>
                                <span className="text-muted-foreground">LLM:</span>{' '}
                                <span className="font-mono">{msg.debug.metrics.llmLatencyMs}ms</span>
                              </span>
                              <span>
                                <span className="text-muted-foreground">Total:</span>{' '}
                                <span className="font-mono">{msg.debug.metrics.totalLatencyMs}ms</span>
                              </span>
                              <span>
                                <span className="text-muted-foreground">Chunks:</span>{' '}
                                <span className="font-mono">{msg.debug.metrics.chunksRetrieved}</span>
                              </span>
                            </div>

                            {/* Retrieved Chunks with Similarity */}
                            <div className="space-y-1">
                              {msg.debug.retrieval.map((chunk, i) => (
                                <div key={chunk.chunk_id} className="text-xs bg-background/50 rounded p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium truncate flex-1">[{i + 1}] {chunk.document_name}</span>
                                    <span className={cn(
                                      "font-mono px-1.5 py-0.5 rounded text-[10px]",
                                      chunk.similarity >= 0.8 ? "bg-green-500/20 text-green-600" :
                                      chunk.similarity >= 0.6 ? "bg-yellow-500/20 text-yellow-600" :
                                      "bg-red-500/20 text-red-600"
                                    )}>
                                      {(chunk.similarity * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground truncate">{chunk.content_preview}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
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
              )}
            </ScrollArea>

            {/* Scroll to top button */}
            {showScrollTop && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-24 right-6 h-10 w-10 rounded-full shadow-lg z-10"
                onClick={scrollToTop}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}

            {/* Input - Fixed at bottom */}
            <div className="p-3 border-t bg-background shrink-0">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="min-h-[44px] max-h-[120px] resize-none text-sm"
                  disabled={loading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!input.trim() || loading}
                  className="self-end h-[44px] px-4"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Chat</DialogTitle>
            <DialogDescription>
              Share this conversation via link or copy the text
            </DialogDescription>
          </DialogHeader>

          {/* Share Link Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Share via Link</span>
            </div>

            {shareUrl ? (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border"
                />
                <Button size="sm" onClick={() => copyToClipboard(shareUrl)}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            ) : (
              <Button
                onClick={createShareUrl}
                disabled={sharingUrl || !sessionId}
                className="w-full"
                variant="outline"
              >
                {sharingUrl ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating link...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Create Share Link
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Copy Text Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Copy as Text</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard()}>
                Copy All
              </Button>
            </div>
            <ScrollArea className="h-[200px] border rounded-md p-3">
              <pre className="text-xs whitespace-pre-wrap font-mono">{shareContent}</pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
