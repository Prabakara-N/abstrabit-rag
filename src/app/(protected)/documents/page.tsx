'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadDropzone } from '@/components/documents/upload-dropzone'
import { DocumentList } from '@/components/documents/document-list'
import { useWorkspace } from '@/components/workspace/workspace-context'

export default function DocumentsPage() {
  const { activeWorkspace } = useWorkspace()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-1">
          {activeWorkspace
            ? `Manage documents in ${activeWorkspace.name}`
            : 'Select a workspace to manage documents'}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload text files to add them to your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadDropzone onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Documents in this workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
