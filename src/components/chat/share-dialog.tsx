'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { UI_CONFIG } from '@/lib/config/constants'

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: string
  shareUrl: string
}

export function ShareDialog({
  open,
  onOpenChange,
  content,
  shareUrl,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} copied to clipboard`)

      setTimeout(() => {
        setCopied(false)
      }, UI_CONFIG.COPY_FEEDBACK_DURATION)
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }

  const openInNewTab = () => {
    window.open(shareUrl, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Conversation</DialogTitle>
          <DialogDescription>
            Copy the content or share via URL
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Share URL section */}
          {shareUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Share URL</label>
              <div className="flex gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-xs truncate">
                  {shareUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(shareUrl, 'URL')}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={openInNewTab}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Content preview section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Preview</label>
            <div className="max-h-[200px] overflow-auto rounded border p-3 bg-muted/50">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {content}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(content, 'Content')}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Content
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// Utility to format messages for sharing
// =============================================================================

interface MessageForShare {
  role: 'user' | 'assistant'
  content: string
}

export function formatMessagesForShare(messages: MessageForShare[]): string {
  return messages
    .map((m) => {
      const prefix = m.role === 'user' ? 'You' : 'Assistant'
      return `${prefix}:\n${m.content}`
    })
    .join('\n\n---\n\n')
}
