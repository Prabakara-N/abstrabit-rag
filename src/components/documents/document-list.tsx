'use client'

import { useEffect, useState } from 'react'
import { FileText, Trash2, Loader2 } from 'lucide-react'
import { useWorkspace } from '@/components/workspace/workspace-context'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'
import type { Document } from '@/types'

interface DocumentListProps {
  refreshTrigger?: number
}

export function DocumentList({ refreshTrigger }: DocumentListProps) {
  const { activeWorkspace } = useWorkspace()
  const confirm = useConfirm()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchDocuments = async () => {
    if (!activeWorkspace) return

    setLoading(true)
    try {
      const response = await fetch(`/api/documents?workspaceId=${activeWorkspace.id}`)
      const data = await response.json()

      if (response.ok) {
        setDocuments(data.documents)
      } else {
        toast.error(data.error || 'Failed to load documents')
      }
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [activeWorkspace, refreshTrigger])

  const handleDelete = async (documentId: string) => {
    const confirmed = await confirm({
      title: 'Delete Document',
      description: 'Are you sure you want to delete this document? This will also delete all associated chunks and cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    })

    if (!confirmed) return

    setDeleting(documentId)
    try {
      const response = await fetch(`/api/documents?documentId=${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDocuments(prev => prev.filter(d => d.id !== documentId))
        toast.success('Document deleted')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete document')
      }
    } catch {
      toast.error('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  if (!activeWorkspace) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select a workspace to view documents
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents yet. Upload some files to get started.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
        >
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{doc.filename}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(doc.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleDelete(doc.id)}
            disabled={deleting === doc.id}
          >
            {deleting === doc.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}
