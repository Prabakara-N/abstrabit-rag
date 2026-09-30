'use client'

import { Loader2, X, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ChatSession } from '@/types/chat'
import { cn } from '@/lib/utils'

interface SessionSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  loading: boolean
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void
  onClose: () => void
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  loading,
  onSelectSession,
  onDeleteSession,
  onClose,
}: SessionSidebarProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm">Chat History</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No chat history yet
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  'group flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors',
                  activeSessionId === session.id && 'bg-muted'
                )}
                onClick={() => onSelectSession(session.id)}
              >
                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{session.preview}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(session.created_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => onDeleteSession(session.id, e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
