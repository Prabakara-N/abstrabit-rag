import { FileText } from 'lucide-react'
import type { Citation } from '@/types'

interface CitationCardProps {
  citation: Citation
  index: number
}

export function CitationCard({ citation, index }: CitationCardProps) {
  return (
    <div className="flex items-start gap-2 text-xs bg-background/50 rounded p-2">
      <span className="font-medium text-primary shrink-0">[{index}]</span>
      <div className="min-w-0">
        <div className="flex items-center gap-1 text-muted-foreground mb-1">
          <FileText className="h-3 w-3" />
          <span className="truncate">{citation.document_name}</span>
        </div>
        <p className="text-foreground/80 line-clamp-2">{citation.snippet}</p>
      </div>
    </div>
  )
}
