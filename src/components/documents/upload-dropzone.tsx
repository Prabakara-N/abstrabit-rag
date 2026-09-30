'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useWorkspace } from '@/components/workspace/workspace-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface UploadStatus {
  filename: string
  status: 'uploading' | 'success' | 'error' | 'duplicate'
  message?: string
}

interface UploadDropzoneProps {
  onUploadComplete?: () => void
}

export function UploadDropzone({ onUploadComplete }: UploadDropzoneProps) {
  const { activeWorkspace } = useWorkspace()
  const [uploads, setUploads] = useState<UploadStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File) => {
    if (!activeWorkspace) {
      toast.error('Please select a workspace first')
      return
    }

    setUploads(prev => [...prev, { filename: file.name, status: 'uploading' }])

    const formData = new FormData()
    formData.append('file', file)
    formData.append('workspaceId', activeWorkspace.id)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        setUploads(prev =>
          prev.map(u =>
            u.filename === file.name
              ? { ...u, status: 'error', message: result.error }
              : u
          )
        )
        return
      }

      if (result.duplicate) {
        setUploads(prev =>
          prev.map(u =>
            u.filename === file.name
              ? { ...u, status: 'duplicate', message: 'Already exists' }
              : u
          )
        )
      } else {
        setUploads(prev =>
          prev.map(u =>
            u.filename === file.name
              ? { ...u, status: 'success', message: `${result.chunksCreated} chunks` }
              : u
          )
        )
      }
    } catch {
      setUploads(prev =>
        prev.map(u =>
          u.filename === file.name
            ? { ...u, status: 'error', message: 'Upload failed' }
            : u
        )
      )
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!activeWorkspace) {
      toast.error('Please select a workspace first')
      return
    }

    setIsUploading(true)

    for (const file of acceptedFiles) {
      await uploadFile(file)
    }

    setIsUploading(false)
    onUploadComplete?.()

    // Clear uploads after 5 seconds
    setTimeout(() => setUploads([]), 5000)
  }, [activeWorkspace, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: !activeWorkspace || isUploading,
  })

  if (!activeWorkspace) {
    return (
      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Select a workspace to upload documents</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
        {isDragActive ? (
          <p className="text-primary">Drop the files here...</p>
        ) : (
          <>
            <p className="font-medium">Drag & drop files here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to select files (.txt, .md, .pdf)
            </p>
          </>
        )}
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={`${upload.filename}-${index}`}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm truncate">{upload.filename}</span>
              {upload.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {upload.status === 'success' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">{upload.message}</span>
                </div>
              )}
              {upload.status === 'duplicate' && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">{upload.message}</span>
                </div>
              )}
              {upload.status === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs">{upload.message}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
