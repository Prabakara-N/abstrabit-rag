import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ingestDocument } from '@/lib/rag/ingestion'
import { parsePDF, isPDF } from '@/lib/utils/pdf-parser'
import { API_CONFIG } from '@/lib/config/constants'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const workspaceId = formData.get('workspaceId') as string | null

  if (!file || !workspaceId) {
    return NextResponse.json(
      { error: 'Missing file or workspaceId' },
      { status: 400 }
    )
  }

  // Validate file size
  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    const maxSizeMB = API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)
    return NextResponse.json(
      { error: `File too large. Maximum size is ${maxSizeMB}MB` },
      { status: 400 }
    )
  }

  // Validate file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!API_CONFIG.ALLOWED_EXTENSIONS.includes(extension as typeof API_CONFIG.ALLOWED_EXTENSIONS[number])) {
    return NextResponse.json(
      { error: `Invalid file type. Allowed: ${API_CONFIG.ALLOWED_EXTENSIONS.join(', ')}` },
      { status: 400 }
    )
  }

  // Verify workspace belongs to user
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!workspace) {
    return NextResponse.json(
      { error: 'Workspace not found or access denied' },
      { status: 403 }
    )
  }

  // Extract text content based on file type
  let content: string

  try {
    if (isPDF(file.name)) {
      // Parse PDF
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const pdfResult = await parsePDF(buffer)
      content = pdfResult.text
    } else {
      // Plain text files (.txt, .md)
      content = await file.text()
    }
  } catch (error) {
    console.error('File parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse file content' },
      { status: 400 }
    )
  }

  if (!content.trim()) {
    return NextResponse.json(
      { error: 'File is empty or contains no extractable text' },
      { status: 400 }
    )
  }

  // Ingest the document
  let result
  try {
    result = await ingestDocument(workspaceId, file.name, content)
  } catch (error) {
    console.error('Ingestion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process document' },
      { status: 500 }
    )
  }

  if (!result.success && !result.duplicate) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    )
  }

  if (result.duplicate) {
    return NextResponse.json({
      success: true,
      duplicate: true,
      message: 'Document already exists',
      documentId: result.documentId,
    })
  }

  return NextResponse.json({
    success: true,
    documentId: result.documentId,
    chunksCreated: result.chunksCreated,
  })
}
